import Hashids = require('hashids');
import { ENV } from '../config/env.config';

// Créer une instance HashIds avec un salt secret
const hashids = new Hashids(
  ENV.JWT_SECRET || 'votre-secret-par-defaut', // Salt secret
  8 // Longueur minimale de l'ID crypté
);

/**
 * Encoder un ID numérique en string crypté
 * @param id - ID numérique à encoder
 * @returns String crypté (ex: "aBc8DeF1")
 */
export const encodeId = (id: number): string => {
  return hashids.encode(id);
};

/**
 * Décoder un string crypté en ID numérique
 * @param hash - String crypté
 * @returns ID numérique original ou null si invalide
 */
export const decodeId = (hash: string): number | null => {
  const decoded = hashids.decode(hash);
  return decoded.length > 0 ? Number(decoded[0]) : null;
};

/**
 * Vérifier si un hash est valide
 * @param hash - String à vérifier
 * @returns true si valide, false sinon
 */
export const isValidHash = (hash: string): boolean => {
  const decoded = hashids.decode(hash);
  return decoded.length > 0;
};
