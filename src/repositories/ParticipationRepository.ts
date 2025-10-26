import { PrismaClient } from '@prisma/client';
import { Participation, ReponseParticipant, DemarrerParticipationInput, SoumettreReponseInput } from '../interfaces/ParticipationInterface';

const prisma = new PrismaClient();

export class ParticipationRepository {
  /**
   * Créer une nouvelle participation
   */
  async create(data: DemarrerParticipationInput & { utilisateur_id?: number }): Promise<Participation> {
    return await prisma.participation.create({
      data: {
        quiz_id: data.quiz_id,
        utilisateur_id: data.utilisateur_id ?? null,
        email_participant: data.email_participant ?? null,
        nom_participant: data.nom_participant ?? null,
        code_acces: data.code_acces ?? null,
        statut: 'en_cours',
      },
    }) as Participation;
  }

  /**
   * Trouver une participation par ID
   */
  async findById(id: number): Promise<Participation | null> {
    return await prisma.participation.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            id: true,
            titre: true,
            description: true,
            questions: {
              select: {
                id: true,
                texte: true,
                ordre: true,
                duree: true,
                choix_reponses: {
                  select: {
                    id: true,
                    texte: true,
                    ordre: true,
                  },
                  orderBy: { ordre: 'asc' },
                },
              },
              orderBy: { ordre: 'asc' },
            },
          },
        },
        reponses: true,
      },
    }) as Participation | null;
  }

  /**
   * Trouver les participations d'un utilisateur
   */
  async findByUtilisateurId(utilisateur_id: number): Promise<Participation[]> {
    return await prisma.participation.findMany({
      where: { utilisateur_id },
      include: {
        quiz: {
          select: {
            id: true,
            titre: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as Participation[];
  }

  /**
   * Trouver les participations d'un quiz
   */
  async findByQuizId(quiz_id: number): Promise<Participation[]> {
    return await prisma.participation.findMany({
      where: { quiz_id },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as Participation[];
  }

  /**
   * Vérifier si un utilisateur a déjà participé à un quiz
   */
  async hasUserParticipated(quiz_id: number, utilisateur_id: number): Promise<boolean> {
    const count = await prisma.participation.count({
      where: {
        quiz_id,
        utilisateur_id,
        statut: 'termine',
      },
    });
    return count > 0;
  }

  /**
   * Vérifier si un email anonyme a déjà participé
   */
  async hasAnonymousParticipated(quiz_id: number, email: string): Promise<boolean> {
    const count = await prisma.participation.count({
      where: {
        quiz_id,
        email_participant: email,
        statut: 'termine',
      },
    });
    return count > 0;
  }

  /**
   * Mettre à jour une participation
   */
  async update(id: number, data: Partial<Participation>): Promise<Participation> {
    return await prisma.participation.update({
      where: { id },
      data,
    }) as Participation;
  }

  /**
   * Terminer une participation avec calcul du score
   */
  async terminer(id: number, score: number, score_max: number, pourcentage: number, temps_total: number): Promise<Participation> {
    return await prisma.participation.update({
      where: { id },
      data: {
        statut: 'termine',
        score,
        score_max,
        pourcentage,
        temps_total,
        date_fin: new Date(),
      },
    }) as Participation;
  }

  /**
   * Abandonner une participation
   */
  async abandonner(id: number): Promise<Participation> {
    return await prisma.participation.update({
      where: { id },
      data: {
        statut: 'abandonne',
        date_fin: new Date(),
      },
    }) as Participation;
  }

  /**
   * Créer une réponse de participant
   */
  async createReponse(data: SoumettreReponseInput & { est_correcte: boolean; points_obtenus: number }): Promise<ReponseParticipant> {
    return await prisma.reponseParticipant.create({
      data: {
        participation_id: data.participation_id,
        question_id: data.question_id,
        choix_reponse_id: data.choix_reponse_id ?? null,
        texte_reponse: data.texte_reponse ?? null,
        est_correcte: data.est_correcte,
        points_obtenus: data.points_obtenus,
        temps_reponse: data.temps_reponse ?? null,
      },
    }) as ReponseParticipant;
  }

  /**
   * Trouver les réponses d'une participation
   */
  async findReponsesByParticipationId(participation_id: number): Promise<ReponseParticipant[]> {
    return await prisma.reponseParticipant.findMany({
      where: { participation_id },
      include: {
        question: {
          select: {
            id: true,
            texte: true,
            choix_reponses: {
              select: {
                id: true,
                texte: true,
                est_correcte: true,
                ordre: true,
              },
              orderBy: { ordre: 'asc' },
            },
          },
        },
        choix_reponse: {
          select: {
            id: true,
            texte: true,
            est_correcte: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }) as ReponseParticipant[];
  }

  /**
   * Vérifier si une question a déjà été répondue dans une participation
   */
  async hasAnsweredQuestion(participation_id: number, question_id: number): Promise<boolean> {
    const count = await prisma.reponseParticipant.count({
      where: {
        participation_id,
        question_id,
      },
    });
    return count > 0;
  }

  /**
   * Compter le nombre de participations pour un quiz
   */
  async countByQuizId(quiz_id: number): Promise<number> {
    return await prisma.participation.count({
      where: { quiz_id },
    });
  }

  /**
   * Obtenir les statistiques d'un quiz
   */
  async getQuizStatistics(quiz_id: number) {
    const participations = await prisma.participation.findMany({
      where: {
        quiz_id,
        statut: 'termine',
      },
      select: {
        score: true,
        score_max: true,
        pourcentage: true,
        temps_total: true,
      },
    });

    if (participations.length === 0) {
      return {
        total_participations: 0,
        score_moyen: 0,
        pourcentage_moyen: 0,
        temps_moyen: 0,
      };
    }

    const total = participations.length;
    const score_total = participations.reduce((sum, p) => sum + (p.score || 0), 0);
    const pourcentage_total = participations.reduce((sum, p) => sum + (p.pourcentage || 0), 0);
    const temps_total = participations.reduce((sum, p) => sum + (p.temps_total || 0), 0);

    return {
      total_participations: total,
      score_moyen: Math.round((score_total / total) * 100) / 100,
      pourcentage_moyen: Math.round((pourcentage_total / total) * 100) / 100,
      temps_moyen: Math.round(temps_total / total),
    };
  }
}
