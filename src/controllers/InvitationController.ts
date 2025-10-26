import { Context } from 'hono';
import { ZodError } from 'zod';
import { InvitationService } from '../services/Invitation.Service';
import {
  createInvitationSchema,
  updateInvitationSchema,
  validateInvitationSchema,
} from '../validations/Invitation.validator';
import { getUserFromContext } from '../middleware/Auth';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../validations/erreurs_messages/Message.error';

const invitationService = new InvitationService();

export class InvitationController {
  /**
   * Crée une invitation pour un quiz
   * POST /api/v1/quizzes/:quizId/invitations
   */
  async create(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const quizId = Number(c.req.param('quizId'));
      const body = await c.req.json();

      // Validation
      const validatedData = createInvitationSchema.parse({
        ...body,
        quiz_id: quizId,
      });

      const invitation = await invitationService.createInvitation(validatedData, user.userId);

      return c.json(
        {
          success: true,
          message: SUCCESS_MESSAGES.INVITATION_CREATED,
          data: invitation,
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
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
        return c.json({ success: false, message: error.message }, 400);
      }

      console.error('Erreur lors de la création de l\'invitation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Récupère toutes les invitations (admin)
   * GET /api/v1/invitations
   */
  async getAll(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const invitations = await invitationService.getInvitations();

      return c.json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Récupère toutes les invitations d'un quiz
   * GET /api/v1/quizzes/:quizId/invitations
   */
  async getAllByQuizId(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const quizId = Number(c.req.param('quizId'));
      const invitations = await invitationService.getInvitationsByQuizId(quizId, user.userId);

      return c.json({
        success: true,
        data: invitations,
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

      console.error('Erreur lors de la récupération des invitations:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Récupère une invitation par son ID
   * GET /api/v1/invitations/:id
   */
  async getById(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const id = Number(c.req.param('id'));
      const invitation = await invitationService.getInvitationById(id, user.userId);

      return c.json({
        success: true,
        data: invitation,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERROR_MESSAGES.INVITATION_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
      }

      console.error('Erreur lors de la récupération de l\'invitation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Valide un code d'accès (PUBLIC)
   * POST /api/v1/invitations/validate
   */
  async validate(c: Context) {
    try {
      const body = await c.req.json();

      // Validation
      const validatedData = validateInvitationSchema.parse(body);

      const result = await invitationService.validateInvitation(validatedData.code_acces);

      if (!result.valid) {
        return c.json(
          {
            success: false,
            message: result.message,
          },
          400
        );
      }

      return c.json({
        success: true,
        message: result.message,
        data: {
          quiz_id: result.invitation?.quiz_id,
          email: result.invitation?.email,
          nom: result.invitation?.nom,
          prenom: result.invitation?.prenom,
        },
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

      console.error('Erreur lors de la validation de l\'invitation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Met à jour une invitation
   * PUT /api/v1/invitations/:id
   */
  async update(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const id = Number(c.req.param('id'));
      const body = await c.req.json();

      // Validation
      const validatedData = updateInvitationSchema.parse(body);

      const invitation = await invitationService.updateInvitation(id, validatedData, user.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.INVITATION_UPDATED,
        data: invitation,
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
        if (error.message === ERROR_MESSAGES.INVITATION_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
      }

      console.error('Erreur lors de la mise à jour de l\'invitation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Supprime une invitation
   * DELETE /api/v1/invitations/:id
   */
  async delete(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const id = Number(c.req.param('id'));
      await invitationService.deleteInvitation(id, user.userId);

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.INVITATION_DELETED,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERROR_MESSAGES.INVITATION_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
      }

      console.error('Erreur lors de la suppression de l\'invitation:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }

  /**
   * Envoie un rappel par email pour une invitation
   */
  async sendReminder(c: Context) {
    try {
      const user = getUserFromContext(c);
      if (!user) {
        return c.json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const id = Number(c.req.param('id'));
      await invitationService.sendReminder(id, user.userId);

      return c.json({
        success: true,
        message: 'Rappel envoyé avec succès',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERROR_MESSAGES.INVITATION_NOT_FOUND) {
          return c.json({ success: false, message: error.message }, 404);
        }
        if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
          return c.json({ success: false, message: error.message }, 403);
        }
        if (error.message === ERROR_MESSAGES.INVITATION_EXPIRED) {
          return c.json({ success: false, message: error.message }, 400);
        }
      }

      console.error('Erreur lors de l\'envoi du rappel:', error);
      return c.json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR }, 500);
    }
  }
}
