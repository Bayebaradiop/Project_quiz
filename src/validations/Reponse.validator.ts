import { z } from 'zod';

export const REPONSE_VALIDATION_MESSAGES = {
  TEXT_REQUIRED: 'Le texte de la réponse est requis',
  TEXT_MIN_LENGTH: 'Le texte doit contenir au moins 1 caractère',
  TEXT_MAX_LENGTH: 'Le texte ne peut pas dépasser 500 caractères',
  EST_CORRECTE_INVALID: 'La valeur doit être un booléen',
  ORDRE_INVALID: 'L\'ordre doit être un nombre entier positif',
} as const;

export const createReponseSchema = z.object({
  texte_reponse: z
    .string({ message: REPONSE_VALIDATION_MESSAGES.TEXT_REQUIRED })
    .min(1, REPONSE_VALIDATION_MESSAGES.TEXT_MIN_LENGTH)
    .max(500, REPONSE_VALIDATION_MESSAGES.TEXT_MAX_LENGTH),
  
  est_correcte: z
    .boolean({ message: REPONSE_VALIDATION_MESSAGES.EST_CORRECTE_INVALID })
    .optional()
    .default(false),
  
  ordre: z
    .number()
    .int()
    .positive({ message: REPONSE_VALIDATION_MESSAGES.ORDRE_INVALID })
    .optional()
    .nullable(),
});

export const updateReponseSchema = z.object({
  texte_reponse: z
    .string()
    .min(1, REPONSE_VALIDATION_MESSAGES.TEXT_MIN_LENGTH)
    .max(500, REPONSE_VALIDATION_MESSAGES.TEXT_MAX_LENGTH)
    .optional(),
  
  est_correcte: z
    .boolean({ message: REPONSE_VALIDATION_MESSAGES.EST_CORRECTE_INVALID })
    .optional(),
  
  ordre: z
    .number()
    .int()
    .positive({ message: REPONSE_VALIDATION_MESSAGES.ORDRE_INVALID })
    .optional()
    .nullable(),
});

export type CreateReponseInput = z.infer<typeof createReponseSchema>;
export type UpdateReponseInput = z.infer<typeof updateReponseSchema>;
