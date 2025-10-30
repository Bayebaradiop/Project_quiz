import { PrismaClient } from '@prisma/client';
import { Quiz, StatutQuiz, TypeQuiz } from '../interfaces/QuizInterface';

const prisma = new PrismaClient();

export class QuizRepository {
  async create(data: {
    titre: string;
    description?: string | null;
    type_quiz: TypeQuiz;
    lien_partage: string;
    statut?: StatutQuiz;
    createur_id: number;
  }): Promise<Quiz> {
    return await prisma.quiz.create({
      data: {
        ...data,
        description: data.description ?? null,
      },
      include: {
        createur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        questions: {
          orderBy: { ordre: 'asc' },
          include: {
            choix_reponses: {
              orderBy: { ordre: 'asc' },
            },
          },
        },
        invitations: true,
        participations: true,
      },
    });
  }

  async findAll(): Promise<Quiz[]> {
    return await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
          include: {
            choix_reponses: {
              orderBy: { ordre: 'asc' },
            },
          },
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
        },
        participations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findAllPaginated(skip: number, take: number): Promise<Quiz[]> {
    return await prisma.quiz.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createur: { // ✨ Inclure le créateur
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        questions: {
          orderBy: { ordre: 'asc' },
          include: {
            choix_reponses: {
              orderBy: { ordre: 'asc' },
            },
          },
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
        },
        participations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async count(): Promise<number> {
    return await prisma.quiz.count();
  }

  async findById(id: number): Promise<Quiz | null> {
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        createur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        questions: {
          orderBy: { ordre: 'asc' },
          include: {
            choix_reponses: {
              orderBy: { ordre: 'asc' },
            },
          },
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
        },
        participations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByCreateur(createur_id: number): Promise<Quiz[]> {
    return await prisma.quiz.findMany({
      where: { createur_id },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
          include: {
            choix_reponses: {
              orderBy: { ordre: 'asc' },
            },
          },
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
        },
        participations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByLienPartage(lien_partage: string): Promise<Quiz | null> {
    return await prisma.quiz.findUnique({
      where: { lien_partage },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
          include: {
            choix_reponses: {
              orderBy: { ordre: 'asc' },
            },
          },
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
        },
        participations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(
    id: number,
    data: {
      titre?: string | null;
      description?: string | null;
      type_quiz?: TypeQuiz;
      statut?: StatutQuiz;
    }
  ): Promise<Quiz> {
    const updateData: any = {};
    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.type_quiz !== undefined) updateData.type_quiz = data.type_quiz;
    if (data.statut !== undefined) updateData.statut = data.statut;

    return await prisma.quiz.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<Quiz> {
    return await prisma.quiz.delete({
      where: { id },
    });
  }

  async findWithQuestions(id: number) {
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
        },
      },
    });
  }

  /**
   * Récupère les quiz du créateur avec toutes les statistiques
   * (participations, questions, réponses, pourcentages)
   */
  async findByCreateurWithStats(createur_id: number) {
    const quizzes = await prisma.quiz.findMany({
      where: { createur_id },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
          include: {
            choix_reponses: {
              orderBy: { ordre: 'asc' },
              include: {
                reponses_participants: true, // Pour calculer les statistiques
              },
            },
          },
        },
        participations: {
          orderBy: { createdAt: 'desc' },
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
            reponses: {
              include: {
                question: true,
                choix_reponse: true,
              },
            },
          },
        },
      },
    });

    // Calculer les statistiques pour chaque quiz
    return quizzes.map((quiz: any) => {
      const totalParticipations = quiz.participations.length;
      const totalQuestions = quiz.questions.length;

      // Calculer le pourcentage de réponses correctes par question
      const questionsAvecStats = quiz.questions.map((question: any) => {
        const choixCorrect = question.choix_reponses.find((c: any) => c.est_correcte);
        const totalReponses = question.choix_reponses.reduce(
          (sum: number, choix: any) => sum + choix.reponses_participants.length,
          0
        );
        const reponsesCorrectes = choixCorrect
          ? choixCorrect.reponses_participants.length
          : 0;

        const pourcentageCorrect =
          totalReponses > 0 ? (reponsesCorrectes / totalReponses) * 100 : 0;

        return {
          id: question.id,
          texte: question.texte,
          duree: question.duree,
          ordre: question.ordre,
          total_reponses: totalReponses,
          reponses_correctes: reponsesCorrectes,
          pourcentage_correct: Math.round(pourcentageCorrect * 100) / 100,
          choix: question.choix_reponses.map((choix: any) => ({
            id: choix.id,
            texte: choix.texte,
            est_correct: choix.est_correcte,
            ordre: choix.ordre,
            nb_selections: choix.reponses_participants.length,
          })),
        };
      });

      // Calculer le score moyen des participations
      const scoreMoyen =
        totalParticipations > 0
          ? quiz.participations.reduce(
              (sum: number, p: any) => sum + (p.score || 0),
              0
            ) / totalParticipations
          : 0;

      return {
        id: quiz.id,
        titre: quiz.titre,
        description: quiz.description,
        type_quiz: quiz.type_quiz,
        statut: quiz.statut,
        lien_partage: quiz.lien_partage,
        nb_questions: totalQuestions,
        nb_participations: totalParticipations,
        score_moyen: Math.round(scoreMoyen * 100) / 100,
        questions: questionsAvecStats,
        participations: quiz.participations.map((p: any) => ({
          id: p.id,
          participant: p.utilisateur || {
            nom: p.nom_participant,
            prenom: null,
            email: p.email_participant,
          },
          score: p.score,
          temps_total: p.temps_total,
          statut: p.statut,
          createdAt: p.createdAt,
        })),
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      };
    });
  }

  /**
   * Récupère tous les quiz publics avec questions et créateur
   * (pour les participants non connectés)
   */
  async findAllPublicWithQuestions(skip: number, take: number) {
    return await prisma.quiz.findMany({
      skip,
      take,
      where: {
        statut: 'publie', // Seulement les quiz publiés
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        titre: true,
        description: true,
        type_quiz: true,
        statut: true,
        lien_partage: true,
        createdAt: true,
        updatedAt: true,
        // Informations du créateur (limitées)
        createur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            // ❌ NE PAS inclure l'email du créateur
          },
        },
        // Questions SANS les bonnes réponses
        questions: {
          orderBy: { ordre: 'asc' },
          select: {
            id: true,
            texte: true,
            duree: true,
            ordre: true,
            // Choix de réponses SANS est_correcte
            choix_reponses: {
              orderBy: { ordre: 'asc' },
              select: {
                id: true,
                texte: true,
                ordre: true,
                // ❌ NE PAS inclure est_correcte pour les participants
              },
            },
          },
        },
        // ❌ NE PAS inclure invitations (données privées)
        // ❌ NE PAS inclure participations (données privées)
      },
    });
  }

  /**
   * Compte le nombre de quiz publics
   */
  async countPublic(): Promise<number> {
    return await prisma.quiz.count({
      where: {
        statut: 'publie',
      },
    });
  }

  /**
   * Compte le nombre de questions dans un quiz
   */
  async countQuestions(quizId: number): Promise<number> {
    return await prisma.question.count({
      where: {
        quiz_id: quizId,
      },
    });
  }
}

