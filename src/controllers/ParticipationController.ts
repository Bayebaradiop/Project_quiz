import { Context } from 'hono';
import { ParticipationService } from '../services/Participation.Service';
import {
  demarrerParticipationSchema,
  soumettreReponseSchema,
  terminerParticipationSchema,
  accederQuizPublicSchema,
} from '../validations/Participation.validator';
import { getUserFromContext } from '../middleware/Auth';
import { getNumericId, encodeResponse, getDecodedBody } from '../middleware/HashId';
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

      // S'assurer que quiz_id est bien un nombre pour DemarrerParticipationInput
      const demarrerInput: any = {
        ...validatedData,
        quiz_id: validatedData.quiz_id ?? 0 // valeur par défaut si non fourni
      };

      // Récupérer l'utilisateur s'il est connecté (optionnel)
      const user = c.get('user') as any || null;

      const participation = await participationService.demarrerParticipation(
        demarrerInput,
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
   * Participer à un quiz public depuis la liste (par ID)
   */
  async participerQuizPublic(c: Context) {
    try {
      // Récupérer l'ID numérique décodé par le middleware
      const quiz_id = getNumericId(c, 'quiz_id');
      const body = await c.req.json().catch(() => ({}));

      // Récupérer l'utilisateur s'il est connecté (optionnel)
      const user = c.get('user') as any || null;

      const result = await participationService.participerQuizPublic(
        quiz_id,
        body.email_participant,
        body.nom_participant,
        user?.userId
      );

      // Encoder les IDs dans la réponse
      const encodedResult = encodeResponse(result, ['id', 'quiz_id']);

      return c.json(
        {
          success: true,
          message: 'Participation démarrée avec succès',
          data: encodedResult,
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
        if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors de la participation au quiz public:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Soumettre une réponse à une question
   */
  async soumettreReponse(c: Context) {
    try {
      // Récupérer les IDs numériques décodés par le middleware
      const participation_id = getNumericId(c, 'id');
      const question_id = getNumericId(c, 'question_id');
      const body = await getDecodedBody(c); // Utilise le body décodé par hashIdBodyMiddleware
      
      const validatedData = soumettreReponseSchema.parse({
        participation_id,
        question_id,
        ...body,
      });

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
      // Récupérer l'ID numérique décodé par le middleware
      const participation_id = getNumericId(c, 'id');

      const resultat = await participationService.terminerParticipation(
        participation_id
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
      // Récupérer l'ID numérique décodé par le middleware
      const id = getNumericId(c, 'id');
      // Utilisateur optionnel (peut être anonyme)
      const user = c.get('user') as any || null;

      const participation = await participationService.getParticipation(id, user?.userId);

      // Encoder les IDs dans la réponse
      const encodedParticipation = encodeResponse(participation, ['id', 'quiz_id', 'utilisateur_id']);

      return c.json({
        success: true,
        data: encodedParticipation,
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
