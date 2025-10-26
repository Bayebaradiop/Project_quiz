import { Context } from 'hono';
import { ParticipationService } from '../services/Participation.Service';
import {
  demarrerParticipationSchema,
  soumettreReponseSchema,
  terminerParticipationSchema,
  accederQuizPublicSchema,
} from '../validations/Participation.validator';
import { getUserFromContext } from '../middleware/Auth';
import { ZodError } from 'zod';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../validations/erreurs_messages/Message.error';

const participationService = new ParticipationService();

export class ParticipationController {
  /**
   * Démarrer une participation à un quiz (avec authentification ou anonyme)
   */
  async demarrer(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = demarrerParticipationSchema.parse(body);

      // Récupérer l'utilisateur s'il est connecté (optionnel)
      const user = c.get('user') as any || null;

      const participation = await participationService.demarrerParticipation(
        validatedData,
        user?.userId
      );

      return c.json(
        {
          success: true,
          message: 'Participation démarrée avec succès',
          data: participation,
        },
        201
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            errors: error.issues.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors du démarrage de la participation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Accéder à un quiz public via lien de partage
   */
  async accederQuizPublic(c: Context) {
    try {
      const lien_partage = c.req.param('lien_partage');
      const body = await c.req.json().catch(() => ({}));

      const validatedData = accederQuizPublicSchema.parse({
        lien_partage,
        ...body,
      });

      // Récupérer l'utilisateur s'il est connecté (optionnel)
      const user = c.get('user') as any || null;

      const result = await participationService.accederQuizPublic(
        validatedData.lien_partage,
        validatedData.email_participant,
        validatedData.nom_participant,
        user?.userId
      );

      return c.json(
        {
          success: true,
          message: 'Accès au quiz réussi',
          data: result,
        },
        200
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            errors: error.issues.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        );
      }

      if (error instanceof Error) {
        if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors de l\'accès au quiz public:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Soumettre une réponse à une question
   */
  async soumettreReponse(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = soumettreReponseSchema.parse(body);

      await participationService.soumettreReponse(validatedData);

      return c.json({
        success: true,
        message: 'Réponse enregistrée avec succès',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            errors: error.issues.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors de la soumission de la réponse:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Terminer une participation et obtenir les résultats
   */
  async terminer(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = terminerParticipationSchema.parse(body);

      const resultat = await participationService.terminerParticipation(
        validatedData.participation_id
      );

      return c.json({
        success: true,
        message: 'Participation terminée avec succès',
        data: resultat,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            errors: error.issues.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors de la fin de la participation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Récupérer une participation
   */
  async getParticipation(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      const user = getUserFromContext(c);

      const participation = await participationService.getParticipation(id, user?.userId);

      return c.json({
        success: true,
        data: participation,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Participation introuvable') {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors de la récupération de la participation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Récupérer les participations d'un utilisateur (authentifié)
   */
  async getMesParticipations(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const participations = await participationService.getParticipationsByUtilisateur(user.userId);

      return c.json({
        success: true,
        data: participations,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des participations:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Récupérer les participations d'un quiz (pour le créateur)
   */
  async getParticipationsByQuiz(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const quiz_id = Number(c.req.param('quizId'));

      const participations = await participationService.getParticipationsByQuiz(quiz_id, user.userId);

      return c.json({
        success: true,
        data: participations,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
      }

      console.error('Erreur lors de la récupération des participations du quiz:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Obtenir les statistiques d'un quiz (pour le créateur)
   */
  async getQuizStatistics(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const quiz_id = Number(c.req.param('quizId'));

      const statistics = await participationService.getQuizStatistics(quiz_id, user.userId);

      return c.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
      }

      console.error('Erreur lors de la récupération des statistiques:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Abandonner une participation
   */
  async abandonner(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      const user = getUserFromContext(c);

      await participationService.abandonnerParticipation(id, user?.userId);

      return c.json({
        success: true,
        message: 'Participation abandonnée',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Participation introuvable') {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors de l\'abandon de la participation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }
}
