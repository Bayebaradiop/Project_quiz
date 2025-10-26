import { z } from 'zod';

export const QUESTION_VALIDATION_MESSAGES = {
  TEXT_REQUIRED: 'Le texte de la question est requis',
  TEXT_MIN_LENGTH: 'Le texte doit contenir au moins 10 caractères',
  TEXT_MAX_LENGTH: 'Le texte ne peut pas dépasser 500 caractères',
  DUREE_REQUIRED: 'La durée est requise',
  DUREE_INVALID: 'La durée doit être un nombre positif en secondes',
  ORDRE_REQUIRED: 'L\'ordre de la question est requis',
  ORDRE_INVALID: 'L\'ordre doit être un nombre entier positif',
  CHOIX_REQUIRED: 'Au moins 2 choix de réponses sont requis',
  CHOIX_MIN: 'Il faut au moins 2 choix de réponses',
  CHOIX_TEXTE_REQUIRED: 'Le texte du choix est requis',
  BONNE_REPONSE_REQUIRED: 'Au moins un choix doit être marqué comme correct',
} as const;

const choixReponseSchema = z.object({
  texte: z
    .string({ message: QUESTION_VALIDATION_MESSAGES.CHOIX_TEXTE_REQUIRED })
    .min(1, 'Le texte du choix ne peut pas être vide'),
  
  est_correcte: z.boolean(),
  
  ordre: z
    .number()
    .int()
    .positive(),
});

export const createQuestionSchema = z.object({
  texte: z
    .string({ message: QUESTION_VALIDATION_MESSAGES.TEXT_REQUIRED })
    .min(10, QUESTION_VALIDATION_MESSAGES.TEXT_MIN_LENGTH)
    .max(500, QUESTION_VALIDATION_MESSAGES.TEXT_MAX_LENGTH),
  
  duree: z
    .number({ message: QUESTION_VALIDATION_MESSAGES.DUREE_REQUIRED })
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.DUREE_INVALID }),
  
  ordre: z
    .number({ message: QUESTION_VALIDATION_MESSAGES.ORDRE_REQUIRED })
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.ORDRE_INVALID }),
  
  choix_reponses: z
    .array(choixReponseSchema, { message: QUESTION_VALIDATION_MESSAGES.CHOIX_REQUIRED })
    .min(2, QUESTION_VALIDATION_MESSAGES.CHOIX_MIN)
    .refine(
      (choix) => choix.some((c) => c.est_correcte),
      { message: QUESTION_VALIDATION_MESSAGES.BONNE_REPONSE_REQUIRED }
    ),
});

export const updateQuestionSchema = z.object({
  texte: z
    .string()
    .min(10, QUESTION_VALIDATION_MESSAGES.TEXT_MIN_LENGTH)
    .max(500, QUESTION_VALIDATION_MESSAGES.TEXT_MAX_LENGTH)
    .optional(),
  
  duree: z
    .number()
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.DUREE_INVALID })
    .optional(),
  
  ordre: z
    .number()
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.ORDRE_INVALID })
    .optional(),
});
