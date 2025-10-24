import bcrypt from 'bcrypt';

/**
 * Hash un mot de passe avec bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Nombre de rounds pour le sel
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Vérifie si un mot de passe correspond à son hash
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};