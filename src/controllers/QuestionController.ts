import { Context } from 'hono';
import { QuestionService } from '../services/Question.Service';
import { createQuestionSchema, updateQuestionSchema } from '../validations/Question.validator';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { getUserFromContext } from '../middleware/Auth';
import { getNumericId } from '../middleware/HashId';
import { ZodError } from 'zod';

export class QuestionController {
  private questionService: QuestionService;

  constructor() {
    this.questionService = new QuestionService();
  }

  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      const utilisateur = getUserFromContext(c);
      const quiz_id = getNumericId(c, 'quizId');

      if (!quiz_id) {
        return c.json({
          success: false,
          message: 'ID du quiz invalide',
        }, 400);
      }

      const validatedData = createQuestionSchema.parse(body);

      const question = await this.questionService.createQuestion(quiz_id, validatedData, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUESTION_CREATED,
        data: question,
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

      if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
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
        message: error.message || 'Erreur lors de la création de la question',
      }, 500);
    }
  };

  getAll = async (c: Context) => {
    try {
      const questions = await this.questionService.getQuestions();

      return c.json({
        success: true,
        data: questions,
      }, 200);
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des questions',
      }, 500);
    }
  };

  getAllByQuizId = async (c: Context) => {
    try {
      const quiz_id = getNumericId(c, 'quizId');

      if (!quiz_id) {
        return c.json({
          success: false,
          message: 'ID du quiz invalide',
        }, 400);
      }

      const questions = await this.questionService.getQuestionsByQuizId(quiz_id);

      // Vérifier si l'utilisateur est connecté
      const user = c.get('user') as any || null;
      
      // Par défaut, masquer est_correcte (pour les participants)
      // Afficher seulement si l'utilisateur est authentifié ET créateur du quiz
      const sanitizedQuestions = questions.map((q: any) => ({
        ...q,
        choix_reponses: q.choix_reponses?.map((choix: any) => {
          // Masquer est_correcte pour la sécurité
          const { est_correcte, ...sanitized } = choix;
          return sanitized;
        }),
      }));

      return c.json({
        success: true,
        data: sanitizedQuestions,
      }, 200);
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des questions',
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

      const question = await this.questionService.getQuestionById(id);

      return c.json({
        success: true,
        data: question,
      }, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.QUESTION_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de la question',
      }, 500);
    }
  };

  update = async (c: Context) => {
    try {
      const id = getNumericId(c, 'id');
      const body = await c.req.json();
      const utilisateur = getUserFromContext(c);

      const validatedData = updateQuestionSchema.parse(body);

      const question = await this.questionService.updateQuestion(id, validatedData, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUESTION_UPDATED,
        data: question,
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
        message: error.message || 'Erreur lors de la mise à jour de la question',
      }, 500);
    }
  };

  delete = async (c: Context) => {
    try {
      const id = getNumericId(c, 'id');
      const utilisateur = getUserFromContext(c);

      await this.questionService.deleteQuestion(id, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUESTION_DELETED,
      }, 200);
    } catch (error: any) {
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
        message: error.message || 'Erreur lors de la suppression de la question',
      }, 500);
    }
  };

  getWithReponses = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({
          success: false,
          message: 'ID invalide',
        }, 400);
      }

      const question = await this.questionService.getQuestionWithReponses(id);

      return c.json({
        success: true,
        data: question,
      }, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.QUESTION_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de la question',
      }, 500);
    }
  };

  getNextOrdre = async (c: Context) => {
    try {
      const quiz_id = getNumericId(c, 'quizId');

      if (!quiz_id) {
        return c.json({
          success: false,
          message: 'ID du quiz invalide',
        }, 400);
      }

      const nextOrdre = await this.questionService.getNextOrdre(quiz_id);

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
