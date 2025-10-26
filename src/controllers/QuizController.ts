import { Context } from 'hono';
import { QuizService } from '../services/Quiz.Service';
import { createQuizSchema, updateQuizSchema } from '../validations/Quiz.validator';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { getUserFromContext } from '../middleware/Auth';
import { ZodError } from 'zod';

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      const utilisateur = getUserFromContext(c);

      const validatedData = createQuizSchema.parse(body);

      const quiz = await this.quizService.createQuiz(validatedData, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUIZ_CREATED,
        data: quiz,
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

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la création du quiz',
      }, 500);
    }
  };

  getAll = async (c: Context) => {
    try {
      const quizzes = await this.quizService.getQuizzes();

      return c.json({
        success: true,
        data: quizzes,
      }, 200);
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des quiz',
      }, 500);
    }
  };

  getAllByCreateur = async (c: Context) => {
    try {
      const utilisateur = getUserFromContext(c);
      const quizzes = await this.quizService.getQuizzesByCreateur(utilisateur.userId);

      return c.json({
        success: true,
        data: quizzes,
      }, 200);
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des quiz',
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

      const quiz = await this.quizService.getQuizById(id);

      return c.json({
        success: true,
        data: quiz,
      }, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du quiz',
      }, 500);
    }
  };

  getByLienPartage = async (c: Context) => {
    try {
      const lien_partage = c.req.param('lien');

      const quiz = await this.quizService.getQuizByLienPartage(lien_partage);

      return c.json({
        success: true,
        data: quiz,
      }, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du quiz',
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

      const validatedData = updateQuizSchema.parse(body);

      const quiz = await this.quizService.updateQuiz(id, validatedData, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUIZ_UPDATED,
        data: quiz,
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
        message: error.message || 'Erreur lors de la mise à jour du quiz',
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

      await this.quizService.deleteQuiz(id, utilisateur.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUIZ_DELETED,
      }, 200);
    } catch (error: any) {
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
        message: error.message || 'Erreur lors de la suppression du quiz',
      }, 500);
    }
  };

  getWithQuestions = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({
          success: false,
          message: 'ID invalide',
        }, 400);
      }

      const quiz = await this.quizService.getQuizWithQuestions(id);

      return c.json({
        success: true,
        data: quiz,
      }, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
        return c.json({
          success: false,
          message: error.message,
        }, 404);
      }

      return c.json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du quiz',
      }, 500);
    }
  };
}
