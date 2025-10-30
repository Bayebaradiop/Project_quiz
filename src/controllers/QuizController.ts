import { Context } from 'hono';
import { QuizService } from '../services/Quiz.Service';
import { createQuizSchema, updateQuizSchema } from '../validations/Quiz.validator';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { getUserFromContext } from '../middleware/Auth';
import { getNumericId } from '../middleware/HashId';
import { ZodError } from 'zod';
import { ApiResponse, ERROR_CODES } from '../dto/ApiResponse.dto';
import { QuizMapper, QuizListDTO, QuizDetailDTO, QuizSummaryDTO } from '../dto/Quiz.dto';
import { PaginationHelper } from '../utils/pagination.utils';

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

      // Formater avec DTO (isCreator = true car c'est le créateur qui vient de créer)
      const quizDTO = QuizMapper.toDetailDTO(quiz, true);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUIZ_CREATED,
        data: quizDTO,
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

  /**
   * GET /quizzes (PUBLIC - sans authentification requise)
   * Retourne UNIQUEMENT les quiz publics publiés
   * SANS informations sensibles (pas d'invitations, participations, bonnes réponses)
   */
  getAll = async (c: Context) => {
    try {
      // Extraire les paramètres de pagination
      const searchParams = new URL(c.req.url).searchParams;
      const paginationParams = PaginationHelper.extractParams(searchParams);
      const { skip, take } = PaginationHelper.calculatePrismaParams(paginationParams);

      // Récupérer UNIQUEMENT les quiz publics publiés (pour les participants)
      const { quizzes, total } = await this.quizService.getQuizzesPublicWithQuestions(skip, take);

      // Créer les métadonnées de pagination
      const pagination = PaginationHelper.createMeta(
        paginationParams.page || 1,
        paginationParams.limit || 10,
        total
      );

      const response = ApiResponse.success({
        quizzes,
        message: 'Liste publique des quiz disponibles'
      }, pagination);
      return c.json(response, 200);
    } catch (error: any) {
      const response = ApiResponse.error(
        ERROR_CODES.INTERNAL_ERROR,
        error.message || 'Erreur lors de la récupération des quiz'
      );
      return c.json(response, 500);
    }
  };

    /**
   * GET /mes-quiz (PROTÉGÉ - authentification requise)
   * Retourne TOUS les quiz du créateur connecté
   * AVEC toutes les informations (invitations, participations, bonnes réponses)
   */
  getAllByCreateur = async (c: Context) => {
    try {
      const utilisateur = getUserFromContext(c);
      const quizzes = await this.quizService.getQuizzesByCreateur(utilisateur.userId);

      // Retourner TOUTES les informations (y compris invitations, participations, bonnes réponses)
      const response = ApiResponse.success({
        mes_quiz: quizzes,
        total: quizzes.length,
        message: 'Liste de vos quiz avec toutes les informations'
      });
      
      return c.json(response, 200);
    } catch (error: any) {
      const response = ApiResponse.error(
        ERROR_CODES.INTERNAL_ERROR,
        error.message || 'Erreur lors de la récupération des quiz'
      );
      return c.json(response, 500);
    }
  };

  getById = async (c: Context) => {
    try {
      const id = getNumericId(c, 'id');

      if (!id) {
        const response = ApiResponse.error(ERROR_CODES.VALIDATION_ERROR, 'ID invalide');
        return c.json(response, 400);
      }

      const quiz = await this.quizService.getQuizById(id);
      
      // Vérifier si l'utilisateur est connecté
      const user = c.get('user') as any || null;
      const isCreator = user && user.userId === quiz.createur_id;
      
      // Utiliser le DTO approprié
      const quizDTO = QuizMapper.toDetailDTO(quiz, isCreator);
      
      const response = ApiResponse.success(quizDTO);
      return c.json(response, 200);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.QUIZ_NOT_FOUND) {
        const response = ApiResponse.error(ERROR_CODES.QUIZ_NOT_FOUND, error.message);
        return c.json(response, 404);
      }
      const response = ApiResponse.error(ERROR_CODES.INTERNAL_ERROR, error.message);
      return c.json(response, 500);
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
      const id = getNumericId(c, 'id');
      const body = await c.req.json();
      const utilisateur = getUserFromContext(c);

      if (!id) {
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
      const id = getNumericId(c, 'id');
      const utilisateur = getUserFromContext(c);

      if (!id) {
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
      const id = getNumericId(c, 'id');

      if (!id) {
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

  publier = async (c: Context) => {
    try {
      const id = getNumericId(c, 'id');
      const utilisateur = getUserFromContext(c);

      if (!id) {
        return c.json({
          success: false,
          message: 'ID invalide',
        }, 400);
      }

      const quiz = await this.quizService.publierQuiz(id, utilisateur.userId);

      return c.json({
        success: true,
        message: 'Quiz publié avec succès',
        data: quiz,
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
        message: error.message || 'Erreur lors de la publication du quiz',
      }, 500);
    }
  };
}
