import { z } from 'zod';
import { ERROR_MESSAGES } from './erreurs_messages/Message.error';

export const QUESTION_VALIDATION_MESSAGES = {
  TEXT_REQUIRED: 'Le texte de la question est requis',
  TEXT_MIN_LENGTH: 'Le texte doit contenir au moins 10 caractères',
  TEXT_MAX_LENGTH: 'Le texte ne peut pas dépasser 500 caractères',
  TYPE_INVALID: 'Le type de question doit être "choix_unique", "choix_multiple", "vrai_faux" ou "texte_court"',
  POINTS_INVALID: 'Le nombre de points doit être un entier positif',
  TEMPS_LIMITE_INVALID: 'Le temps limite doit être un nombre positif en secondes',
  ORDRE_REQUIRED: 'L\'ordre de la question est requis',
  ORDRE_INVALID: 'L\'ordre doit être un nombre entier positif',
} as const;

export const createQuestionSchema = z.object({
  texte_question: z
    .string({ message: QUESTION_VALIDATION_MESSAGES.TEXT_REQUIRED })
    .min(10, QUESTION_VALIDATION_MESSAGES.TEXT_MIN_LENGTH)
    .max(500, QUESTION_VALIDATION_MESSAGES.TEXT_MAX_LENGTH),
  
  type_question: z
    .enum(['choix_unique', 'choix_multiple', 'vrai_faux', 'texte_court'], {
      message: QUESTION_VALIDATION_MESSAGES.TYPE_INVALID,
    }),
  
  points: z
    .number({ message: QUESTION_VALIDATION_MESSAGES.POINTS_INVALID })
    .int()
    .positive()
    .optional()
    .default(1),
  
  temps_limite: z
    .number()
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.TEMPS_LIMITE_INVALID })
    .optional()
    .nullable(),
  
  ordre: z
    .number({ message: QUESTION_VALIDATION_MESSAGES.ORDRE_REQUIRED })
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.ORDRE_INVALID }),
});

export const updateQuestionSchema = z.object({
  texte_question: z
    .string()
    .min(10, QUESTION_VALIDATION_MESSAGES.TEXT_MIN_LENGTH)
    .max(500, QUESTION_VALIDATION_MESSAGES.TEXT_MAX_LENGTH)
    .optional(),
  
  type_question: z
    .enum(['choix_unique', 'choix_multiple', 'vrai_faux', 'texte_court'], {
      message: QUESTION_VALIDATION_MESSAGES.TYPE_INVALID,
    })
    .optional(),
  
  points: z
    .number()
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.POINTS_INVALID })
    .optional(),
  
  temps_limite: z
    .number()
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.TEMPS_LIMITE_INVALID })
    .optional()
    .nullable(),
  
  ordre: z
    .number()
    .int()
    .positive({ message: QUESTION_VALIDATION_MESSAGES.ORDRE_INVALID })
    .optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
