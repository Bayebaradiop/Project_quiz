import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Génère un token JWT d'accès
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.accessTokenSecret as string, {
    expiresIn: '1h',
  });
};

/**
 * Vérifie et décode un token JWT d'accès
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.accessTokenSecret as string) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

/**
 * Génère un token JWT de rafraîchissement
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.refreshTokenSecret as string, {
    expiresIn: '7d',
  });
};

/**
 * Vérifie et décode un token JWT de rafraîchissement
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.refreshTokenSecret as string) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token de rafraîchissement invalide ou expiré');
  }
};