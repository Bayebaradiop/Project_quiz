import { config } from 'dotenv';

config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined, // undefined = domaine actuel seulement
  // COOKIE_SECURE: false si explicitement défini à 'false', sinon true uniquement si COOKIE_SAME_SITE='none'
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'false' ? false : 
    (process.env.COOKIE_SECURE === 'true' || (process.env.COOKIE_SAME_SITE === 'none')),
  // COOKIE_SAME_SITE: 'lax' par défaut (compatible HTTP), 'none' uniquement si explicitement défini
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
} as const;

// Validation des variables d'environnement requises
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (varName) => !ENV[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(', ')}`
    );
  }
}
