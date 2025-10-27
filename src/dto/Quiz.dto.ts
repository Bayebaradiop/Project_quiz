/**
 * DTOs pour les Quiz
 */

export interface CreateurDTO {
  id: number;
  prenom: string;
  nom: string;
  email: string;
}

export interface QuizListDTO {
  id: number;
  titre: string;
  description: string | null;
  type_quiz: string;
  statut: string;
  lien_partage: string;
  nb_questions: number;
  duree_totale: number; // en secondes
  nb_participations: number;
  createur: CreateurDTO; // Informations du créateur
  questions: QuestionDTO[]; // Liste des questions
  createdAt: string;
  updatedAt: string;
}

export interface CreateurDTO {
  id: number;
  prenom: string;
  nom: string;
  email: string;
}

export interface QuizDetailDTO {
  id: number;
  titre: string;
  description: string | null;
  type_quiz: string;
  statut: string;
  lien_partage: string;
  nb_questions: number;
  duree_totale: number;
  createur: CreateurDTO; // Informations du créateur
  questions: QuestionDTO[];
  createdAt: string;
  updatedAt: string;
  // Statistiques (uniquement pour le créateur)
  statistiques?: {
    nb_participations: number;
    nb_invitations: number;
    taux_reussite: number;
    temps_moyen: number;
  };
}

export interface QuizSummaryDTO {
  id: number;
  titre: string;
  description: string | null;
  statut: string;
  nb_questions: number;
  duree_totale: number;
  lien_partage: string;
}

export interface QuestionDTO {
  id: number;
  texte: string;
  duree: number;
  ordre: number;
  choix: ChoixReponseDTO[];
}

export interface ChoixReponseDTO {
  id: number;
  texte: string;
  ordre: number;
  // est_correcte n'est jamais exposé aux participants
}

/**
 * Mapper pour convertir les données Prisma en DTOs
 */
export class QuizMapper {
  /**
   * Convertir un quiz en QuizListDTO
   */
  static toListDTO(quiz: any): QuizListDTO {
    const nb_questions = Array.isArray(quiz.questions) ? quiz.questions.length : quiz._count?.questions || 0;
    const duree_totale = Array.isArray(quiz.questions) 
      ? quiz.questions.reduce((sum: number, q: any) => sum + (q.duree || 0), 0)
      : 0;
    const nb_participations = Array.isArray(quiz.participations) 
      ? quiz.participations.length 
      : quiz._count?.participations || 0;

    // Mapper les questions pour la liste
    const questions = Array.isArray(quiz.questions)
      ? quiz.questions.map((q: any) => this.toQuestionDTO(q))
      : [];

    // Mapper le créateur
    const createur: CreateurDTO = quiz.createur ? {
      id: quiz.createur.id,
      prenom: quiz.createur.prenom,
      nom: quiz.createur.nom,
      email: quiz.createur.email,
    } : {
      id: quiz.createur_id,
      prenom: 'Inconnu',
      nom: '',
      email: '',
    };

    return {
      id: quiz.id,
      titre: quiz.titre,
      description: quiz.description,
      type_quiz: quiz.type_quiz,
      statut: quiz.statut,
      lien_partage: quiz.lien_partage,
      nb_questions,
      duree_totale,
      nb_participations,
      createur, // ✨ Infos du créateur
      questions, // ✨ Liste des questions avec choix
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    };
  }

  /**
   * Convertir un quiz en QuizDetailDTO
   */
  static toDetailDTO(quiz: any, isCreator: boolean = false): QuizDetailDTO {
    const questions = Array.isArray(quiz.questions)
      ? quiz.questions.map((q: any) => this.toQuestionDTO(q))
      : [];
    
    const nb_questions = questions.length;
    const duree_totale = questions.reduce((sum: number, q: QuestionDTO) => sum + q.duree, 0);

    // Mapper le créateur
    const createur: CreateurDTO = quiz.createur ? {
      id: quiz.createur.id,
      prenom: quiz.createur.prenom,
      nom: quiz.createur.nom,
      email: quiz.createur.email,
    } : {
      id: quiz.createur_id,
      prenom: 'Inconnu',
      nom: '',
      email: '',
    };

    const dto: QuizDetailDTO = {
      id: quiz.id,
      titre: quiz.titre,
      description: quiz.description,
      type_quiz: quiz.type_quiz,
      statut: quiz.statut,
      lien_partage: quiz.lien_partage,
      nb_questions,
      duree_totale,
      createur, // ✨ Infos du créateur
      questions,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    };

    // Ajouter les statistiques uniquement pour le créateur
    if (isCreator) {
      const participations = Array.isArray(quiz.participations) ? quiz.participations : [];
      const participationsTerminees = participations.filter((p: any) => p.statut === 'termine');
      
      const taux_reussite = participationsTerminees.length > 0
        ? participationsTerminees.reduce((sum: number, p: any) => sum + (p.pourcentage || 0), 0) / participationsTerminees.length
        : 0;
      
      const temps_moyen = participationsTerminees.length > 0
        ? participationsTerminees.reduce((sum: number, p: any) => sum + (p.temps_total || 0), 0) / participationsTerminees.length
        : 0;

      dto.statistiques = {
        nb_participations: participations.length,
        nb_invitations: Array.isArray(quiz.invitations) ? quiz.invitations.length : 0,
        taux_reussite: Math.round(taux_reussite * 100) / 100,
        temps_moyen: Math.round(temps_moyen),
      };
    }

    return dto;
  }

  /**
   * Convertir en QuizSummaryDTO
   */
  static toSummaryDTO(quiz: any): QuizSummaryDTO {
    const nb_questions = Array.isArray(quiz.questions) ? quiz.questions.length : quiz._count?.questions || 0;
    const duree_totale = Array.isArray(quiz.questions)
      ? quiz.questions.reduce((sum: number, q: any) => sum + (q.duree || 0), 0)
      : 0;

    return {
      id: quiz.id,
      titre: quiz.titre,
      description: quiz.description,
      statut: quiz.statut,
      nb_questions,
      duree_totale,
      lien_partage: quiz.lien_partage,
    };
  }

  /**
   * Convertir une question en QuestionDTO (sans est_correcte)
   */
  static toQuestionDTO(question: any): QuestionDTO {
    return {
      id: question.id,
      texte: question.texte,
      duree: question.duree,
      ordre: question.ordre,
      choix: Array.isArray(question.choix_reponses)
        ? question.choix_reponses.map((c: any) => ({
            id: c.id,
            texte: c.texte,
            ordre: c.ordre,
            // On n'expose JAMAIS est_correcte aux participants
          }))
        : [],
    };
  }
}
