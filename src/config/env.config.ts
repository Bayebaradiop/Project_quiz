import { config } from 'dotenv';

config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Cookies - Configuration adaptée au déploiement cross-site
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined, // undefined = domaine actuel seulement
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production', // true en prod
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 
    (process.env.NODE_ENV === 'production' ? 'none' : 'lax'), // 'none' en prod pour cross-site
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
