import { Context } from 'hono';
import { ReponseService } from '../services/Reponse.Service';
import { createReponseSchema, updateReponseSchema } from '../validations/Reponse.validator';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { getUserFromContext } from '../middleware/Auth';
import { ZodError } from 'zod';

export class ReponseController {
  private reponseService: ReponseService;

  constructor() {
    this.reponseService = new ReponseService();
  }

  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      const utilisateur = getUserFromContext(c);
      const question_id = parseInt(c.req.param('questionId'));

      if (isNaN(question_id)) {
        return c.json({
          success: false,
          message: 'ID de la question invalide',
        }, 400);
      }


      const validatedData = createReponseSchema.parse(body);

      // Transformation pour compatibilité avec le service
      const reponseInput = {
        question_id,
        utilisateur_id: utilisateur.userId,
        reponse_donnee: validatedData.texte_reponse,
        est_correcte: validatedData.est_correcte ?? false,
        temps_reponse: null,
      };

      const reponse = await this.reponseService.createReponse(question_id, reponseInput, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.REPONSE_CREATED,
        data: reponse,
      }, 201);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return c.json({
          success: false,
          message: 'Erreur de validation',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }, 400);
      }

      if (error.message === ERROR_MESSAGES.QUESTION_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      if (error.message === ERROR_MESSAGES.FORBIDDEN) {
        return c.json({
          success: false,
          message: error.message,
        }, 403);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la création de la réponse',
      }, 500);
    }
  };

  getAll = async (c: Context) => {
    try {
      const reponses = await this.reponseService.getReponses();

      return c.json({
        success: true,
        data: reponses,
      }, 200);
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des réponses',
      }, 500);
    }
  };

  getAllByQuestionId = async (c: Context) => {
    try {
      const question_id = parseInt(c.req.param('questionId'));

      if (isNaN(question_id)) {
        return c.json({
          success: false,
          message: 'ID de la question invalide',
        }, 400);
      }

      const reponses = await this.reponseService.getReponsesByQuestionId(question_id);

      return c.json({
        success: true,
        data: reponses,
      }, 200);
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des réponses',
      }, 500);
    }
  };

  getById = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({
          success: false,
          message: 'ID invalide',
        }, 400);
      }

      const reponse = await this.reponseService.getReponseById(id);

      return c.json({
        success: true,
        data: reponse,
      }, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.REPONSE_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de la réponse',
      }, 500);
    }
  };

  update = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));
      const body = await c.req.json();
      const utilisateur = getUserFromContext(c);

      if (isNaN(id)) {
        return c.json({
          success: false,
          message: 'ID invalide',
        }, 400);
      }

      const validatedData = updateReponseSchema.parse(body);

      const reponse = await this.reponseService.updateReponse(id, validatedData, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.REPONSE_UPDATED,
        data: reponse,
      }, 200);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return c.json({
          success: false,
          message: 'Erreur de validation',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }, 400);
      }

      if (error.message === ERROR_MESSAGES.REPONSE_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      if (error.message === ERROR_MESSAGES.FORBIDDEN) {
        return c.json({
          success: false,
          message: error.message,
        }, 403);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de la réponse',
      }, 500);
    }
  };

  delete = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));
      const utilisateur = getUserFromContext(c);

      if (isNaN(id)) {
        return c.json({
          success: false,
          message: 'ID invalide',
        }, 400);
      }

      await this.reponseService.deleteReponse(id, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.REPONSE_DELETED,
      }, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.REPONSE_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      if (error.message === ERROR_MESSAGES.FORBIDDEN) {
        return c.json({
          success: false,
          message: error.message,
        }, 403);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de la réponse',
      }, 500);
    }
  };

  getNextOrdre = async (c: Context) => {
    try {
      const question_id = parseInt(c.req.param('questionId'));

      if (isNaN(question_id)) {
        return c.json({
          success: false,
          message: 'ID de la question invalide',
        }, 400);
      }

      const nextOrdre = await this.reponseService.getNextOrdre(question_id);

      return c.json({
        success: true,
        data: { next_ordre: nextOrdre },
      }, 200);
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du prochain ordre',
      }, 500);
    }
  };
}
