import { ParticipationRepository } from '../repositories/ParticipationRepository';
import { QuizRepository } from '../repositories/QuizRepository';
import { InvitationRepository } from '../repositories/InvitationRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import {
  Participation,
  DemarrerParticipationInput,
  SoumettreReponseInput,
  ResultatParticipation,
} from '../interfaces/ParticipationInterface';
import { ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';

const participationRepository = new ParticipationRepository();
const quizRepository = new QuizRepository();
const invitationRepository = new InvitationRepository();
const questionRepository = new QuestionRepository();

export class ParticipationService {
  /**
   * Démarrer une participation à un quiz
   */
  async demarrerParticipation(
    data: DemarrerParticipationInput,
    utilisateur_id?: number
  ): Promise<Participation> {
    // Vérifier que le quiz existe
    const quiz = await quizRepository.findById(data.quiz_id);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    // Si le quiz n'est pas publié, vérifier les permissions
    if (quiz.statut !== 'publie') {
      // Si code d'accès fourni, vérifier l'invitation
      if (data.code_acces) {
        const invitation = await invitationRepository.findByCodeAcces(data.code_acces);
        if (!invitation) {
          throw new Error(ERROR_MESSAGES.INVALID_CODE);
        }
        if (invitation.quiz_id !== data.quiz_id) {
          throw new Error('Code d\'accès invalide pour ce quiz');
        }
        if (invitation.statut !== 'en_attente') {
          throw new Error('Cette invitation n\'est plus valide');
        }
        if (new Date() > invitation.date_expiration) {
          throw new Error(ERROR_MESSAGES.INVITATION_EXPIRED);
        }
      } else {
        // Quiz non publié sans code d'accès
        throw new Error('Ce quiz nécessite un code d\'accès');
      }
    }

    // Vérifier si l'utilisateur a déjà participé
    if (utilisateur_id) {
      const hasParticipated = await participationRepository.hasUserParticipated(
        data.quiz_id,
        utilisateur_id
      );
      if (hasParticipated) {
        throw new Error('Vous avez déjà participé à ce quiz');
      }
    } else if (data.email_participant) {
      const hasParticipated = await participationRepository.hasAnonymousParticipated(
        data.quiz_id,
        data.email_participant
      );
      if (hasParticipated) {
        throw new Error('Cet email a déjà participé à ce quiz');
      }
    }

    // Créer la participation
    const participation = await participationRepository.create({
      ...data,
      utilisateur_id,
    });

    return participation;
  }

  /**
   * Accéder à un quiz public via lien de partage
   */
  async accederQuizPublic(
    lien_partage: string,
    email_participant?: string,
    nom_participant?: string,
    utilisateur_id?: number
  ): Promise<{ quiz: any; participation: Participation }> {
    // Trouver le quiz par lien de partage
    const quiz = await quizRepository.findByLienPartage(lien_partage);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    // Vérifier que le quiz est publié
    if (quiz.statut !== 'publie') {
      throw new Error('Ce quiz n\'est pas encore disponible');
    }

    // Démarrer la participation
    const participation = await this.demarrerParticipation(
      {
        quiz_id: quiz.id,
        email_participant,
        nom_participant,
      },
      utilisateur_id
    );

    return { quiz, participation };
  }

  /**
   * Soumettre une réponse
   */
  async soumettreReponse(data: SoumettreReponseInput): Promise<void> {
    // Vérifier que la participation existe
    const participation = await participationRepository.findById(data.participation_id);
    if (!participation) {
      throw new Error('Participation introuvable');
    }

    // Vérifier que la participation est en cours
    if (participation.statut !== 'en_cours') {
      throw new Error('Cette participation est déjà terminée');
    }

    // Vérifier que la question n'a pas déjà été répondue
    const hasAnswered = await participationRepository.hasAnsweredQuestion(
      data.participation_id,
      data.question_id
    );
    if (hasAnswered) {
      throw new Error('Vous avez déjà répondu à cette question');
    }

    // Récupérer la question avec les choix de réponses
    const question = await questionRepository.findById(data.question_id);
    if (!question) {
      throw new Error('Question introuvable');
    }

    // Vérifier la réponse et calculer les points
    let est_correcte = false;
    let points_obtenus = 0;

    if (data.choix_reponse_id) {
      // Réponse à choix multiple - vérifier si le choix est correct
      const choixSelectionne = question.choix_reponses?.find(
        (c: any) => c.id === data.choix_reponse_id
      );
      
      if (!choixSelectionne) {
        throw new Error('Choix de réponse invalide');
      }
      
      est_correcte = choixSelectionne.est_correcte;
    } else if (data.texte_reponse && typeof data.texte_reponse === 'string') {
      // Réponse textuelle - vérifier contre tous les choix corrects
      const reponseNormalisee = data.texte_reponse.toUpperCase().trim();
      est_correcte = question.choix_reponses?.some((c: any) => 
        c.est_correcte && c.texte.toUpperCase().trim() === reponseNormalisee
      ) || false;
    }

    if (est_correcte) {
      points_obtenus = 1; // 1 point par bonne réponse
    }

    // Enregistrer la réponse
    await participationRepository.createReponse({
      ...data,
      est_correcte,
      points_obtenus,
    });
  }

  /**
   * Terminer une participation et calculer le score
   */
  async terminerParticipation(participation_id: number): Promise<ResultatParticipation> {
    // Vérifier que la participation existe
    const participation = await participationRepository.findById(participation_id);
    if (!participation) {
      throw new Error('Participation introuvable');
    }

    // Vérifier que la participation est en cours
    if (participation.statut !== 'en_cours') {
      throw new Error('Cette participation est déjà terminée');
    }

    // Récupérer toutes les réponses
    const reponses = await participationRepository.findReponsesByParticipationId(participation_id);

    // Calculer le score
    const score = reponses.reduce((total: number, r: any) => total + r.points_obtenus, 0);
    const quiz = participation.quiz as any;
    const score_max = quiz.questions.reduce((total: number, q: any) => total + (q.points || 1), 0);
    const pourcentage = score_max > 0 ? (score / score_max) * 100 : 0;

    // Calculer le temps total
    const temps_total = Math.floor(
      (new Date().getTime() - new Date(participation.date_debut).getTime()) / 1000
    );

    // Mettre à jour la participation
    const participationTerminee = await participationRepository.terminer(
      participation_id,
      score,
      score_max,
      pourcentage,
      temps_total
    );

    // Préparer le résultat SIMPLIFIÉ pour le participant
    // Il doit voir uniquement: ses choix, si c'est correct ou pas, et le score
    const reponsesSimplifiees = reponses.map((r: any) => ({
      question_id: r.question_id,
      texte_question: r.question?.texte || '',
      votre_reponse: r.texte_reponse || (r.reponse ? r.reponse.texte : null),
      est_correcte: r.est_correcte,
      points_obtenus: r.points_obtenus,
    }));

    const resultat: ResultatParticipation = {
      participation: {
        id: participationTerminee.id,
        score: participationTerminee.score,
        score_max: participationTerminee.score_max,
        pourcentage: participationTerminee.pourcentage,
        temps_total: participationTerminee.temps_total,
        statut: participationTerminee.statut,
      } as any,
      reponses: reponsesSimplifiees as any,
      quiz: {
        id: quiz.id,
        titre: quiz.titre,
        description: quiz.description,
      },
      statistiques: {
        score,
        score_max,
        pourcentage: Math.round(pourcentage * 100) / 100,
        temps_total,
        questions_repondues: reponses.length,
        questions_correctes: reponses.filter((r: any) => r.est_correcte).length,
      },
    };

    return resultat;
  }

  /**
   * Récupérer une participation avec ses détails
   */
  async getParticipation(participation_id: number, utilisateur_id?: number): Promise<Participation> {
    const participation = await participationRepository.findById(participation_id);
    if (!participation) {
      throw new Error('Participation introuvable');
    }

    // Vérifier les permissions si utilisateur connecté
    if (utilisateur_id && participation.utilisateur_id !== utilisateur_id) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return participation;
  }

  /**
   * Récupérer les participations d'un utilisateur
   */
  async getParticipationsByUtilisateur(utilisateur_id: number): Promise<Participation[]> {
    return await participationRepository.findByUtilisateurId(utilisateur_id);
  }

  /**
   * Récupérer les participations d'un quiz (pour le créateur)
   */
  async getParticipationsByQuiz(quiz_id: number, utilisateur_id: number): Promise<Participation[]> {
    // Vérifier que le quiz existe et que l'utilisateur en est le créateur
    const quiz = await quizRepository.findById(quiz_id);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }
    if (quiz.createur_id !== utilisateur_id) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return await participationRepository.findByQuizId(quiz_id);
  }

  /**
   * Obtenir les statistiques d'un quiz
   */
  async getQuizStatistics(quiz_id: number, utilisateur_id: number) {
    // Vérifier que le quiz existe et que l'utilisateur en est le créateur
    const quiz = await quizRepository.findById(quiz_id);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }
    if (quiz.createur_id !== utilisateur_id) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return await participationRepository.getQuizStatistics(quiz_id);
  }

  /**
   * Abandonner une participation
   */
  async abandonnerParticipation(participation_id: number, utilisateur_id?: number): Promise<void> {
    const participation = await participationRepository.findById(participation_id);
    if (!participation) {
      throw new Error('Participation introuvable');
    }

    // Vérifier les permissions
    if (utilisateur_id && participation.utilisateur_id !== utilisateur_id) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (participation.statut !== 'en_cours') {
      throw new Error('Cette participation est déjà terminée');
    }

    await participationRepository.abandonner(participation_id);
  }
}
