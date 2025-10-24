import { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { UtilisateurService } from '../services/Utilisateur.Service';
import { registerSchema, loginSchema } from '../validations/Utilisateur.validator';
import { JWT_CONFIG } from '../config/jwt.config';
import { ZodError } from 'zod';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../validations/erreurs_messages/Message.error';

export class UtilisateurController {
  private utilisateurService: UtilisateurService;

  constructor() {
    this.utilisateurService = new UtilisateurService();
  }

  private formatZodErrors(error: ZodError) {
    return {
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }

  /**
   * POST /api/v1/utilisateurs/register
   * Créer un compte (inscription)
   */
  async register(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = registerSchema.parse(body);

      const result = await this.utilisateurService.register({
        prenom: validatedData.prenom,
        nom: validatedData.nom,
        email: validatedData.email,
        password: validatedData.password,
      });

      setCookie(c, JWT_CONFIG.accessTokenCookieName, result.token, {
        ...JWT_CONFIG.cookieOptions,
        maxAge: JWT_CONFIG.accessTokenCookieMaxAge,
      });

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.USER_CREATED,
        utilisateur: result.user,
      }, 201);
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(this.formatZodErrors(error), 400);
      }

      const message = error instanceof Error ? error.message : ERROR_MESSAGES.REGISTRATION_ERROR;

      return c.json({
        success: false,
        error: message,
      }, message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS ? 409 : 400);
    }
  }

  /**
   * POST /api/v1/utilisateurs/login
   * Connexion
   */
  async login(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = loginSchema.parse(body);

      const result = await this.utilisateurService.login(
        validatedData.email,
        validatedData.password
      );

      setCookie(c, JWT_CONFIG.accessTokenCookieName, result.token, {
        ...JWT_CONFIG.cookieOptions,
        maxAge: JWT_CONFIG.accessTokenCookieMaxAge,
      });

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        utilisateur: result.user,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(this.formatZodErrors(error), 400);
      }

      const message = error instanceof Error ? error.message : ERROR_MESSAGES.INVALID_CREDENTIALS;

      const details: { field: string; message: string }[] = [];
      
      if (message === ERROR_MESSAGES.EMAIL_NOT_FOUND) {
        details.push({ field: 'email', message: ERROR_MESSAGES.EMAIL_NOT_FOUND });
      } else if (message === ERROR_MESSAGES.INVALID_PASSWORD) {
        details.push({ field: 'password', message: ERROR_MESSAGES.INVALID_PASSWORD });
      } else if (message === ERROR_MESSAGES.EMAIL_AND_PASSWORD_INVALID) {
        details.push(
          { field: 'email', message: ERROR_MESSAGES.EMAIL_NOT_FOUND },
          { field: 'password', message: ERROR_MESSAGES.INVALID_PASSWORD }
        );
      }

      return c.json({
        success: false,
        error: message,
        ...(details.length > 0 && { details }),
      }, 401);
    }
  }

  /**
   * GET /api/v1/utilisateurs/{id}
   * Profil utilisateur
   */
  async getUtilisateurById(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({
          success: false,
          error: ERROR_MESSAGES.INVALID_ID,
        }, 400);
      }

      const utilisateur = await this.utilisateurService.getUtilisateurById(id);

      return c.json({
        success: true,
        utilisateur,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_USER_ERROR;

      return c.json({
        success: false,
        error: message,
      }, message === ERROR_MESSAGES.USER_NOT_FOUND ? 404 : 500);
    }
  }

  /**
   * GET /api/v1/utilisateurs/roles
   * Liste des rôles
   */
  async getAllRoles(c: Context) {
    try {
      const roles = await this.utilisateurService.getAllRoles();

      return c.json({
        success: true,
        roles,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: ERROR_MESSAGES.FETCH_ROLES_ERROR,
      }, 500);
    }
  }

  async logout(c: Context) {
    try {
      deleteCookie(c, JWT_CONFIG.accessTokenCookieName, {
        ...JWT_CONFIG.cookieOptions,
        path: '/',
      });

      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: ERROR_MESSAGES.LOGOUT_ERROR,
      }, 500);
    }
  }
}