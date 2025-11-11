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
    // Récupérer le token depuis le cookie OU le header Authorization
    let token = getCookie(c, JWT_CONFIG.accessTokenCookieName);
    
    // Si pas de cookie, vérifier le header Authorization
    if (!token) {
      const authHeader = c.req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

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

/**
 * Middleware d'authentification OPTIONNEL
 * Vérifie le token JWT mais ne bloque pas si absent
 * Utile pour les routes qui ont un comportement différent selon l'authentification
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    // Récupérer le token depuis le cookie OU le header Authorization
    let token = getCookie(c, JWT_CONFIG.accessTokenCookieName);
    
    // Si pas de cookie, vérifier le header Authorization
    if (!token) {
      const authHeader = c.req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      // Si token présent, le vérifier et l'ajouter au contexte
      const decoded = verifyAccessToken(token);
      c.set('user', decoded);
    }
    // Sinon, continuer sans utilisateur (user sera undefined)
  } catch (error) {
    // En cas d'erreur de vérification, ignorer et continuer
    // (le token est invalide mais on ne bloque pas)
  }

  await next();
  return;
};
