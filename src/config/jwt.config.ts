import { ENV } from './env.config';

export const JWT_CONFIG = {
  // Secret pour l'access token
  accessTokenSecret: ENV.JWT_SECRET,
  accessTokenExpiresIn: ENV.JWT_EXPIRES_IN as string | number,
  
  // Secret pour le refresh token
  refreshTokenSecret: ENV.JWT_REFRESH_SECRET,
  refreshTokenExpiresIn: ENV.JWT_REFRESH_EXPIRES_IN as string | number,
  
  // Configuration des cookies HTTP-only
  cookieOptions: {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE, // true en production (HTTPS)
    sameSite: ENV.COOKIE_SAME_SITE,
    domain: ENV.COOKIE_DOMAIN,
    path: '/',
  },
  
  // Noms des cookies
  accessTokenCookieName: 'access_token',
  refreshTokenCookieName: 'refresh_token',
  
  // Options pour les cookies
  accessTokenCookieMaxAge: 60 * 60, // 1 heure en secondes
  refreshTokenCookieMaxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
} as const;
