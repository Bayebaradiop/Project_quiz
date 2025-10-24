import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken, JWTPayload } from '../utils/jwt.utils';
import { JWT_CONFIG } from '../config/jwt.config';

/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT dans le cookie HTTP-only
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Récupérer le token depuis le cookie
    const token = getCookie(c, JWT_CONFIG.accessTokenCookieName);

    if (!token) {
      return c.json({
        error: 'Token d\'authentification manquant',
      }, 401);
    }

    // Vérifier et décoder le token
    const decoded = verifyAccessToken(token);

    // Ajouter les informations utilisateur au contexte
    c.set('user', decoded);

    await next();
    return;
  } catch (error) {
    return c.json({
      error: 'Token d\'authentification invalide',
    }, 401);
  }
};

/**
 * Récupère les informations utilisateur depuis le contexte
 */
export const getUserFromContext = (c: Context): JWTPayload => {
  const user = c.get('user') as JWTPayload;
  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }
  return user;
};