import { z } from 'zod';
import { ERROR_MESSAGES } from './erreurs_messages/Message.error';

export const QUIZ_VALIDATION_MESSAGES = {
  TITRE_REQUIRED: 'Le titre du quiz est requis',
  TITRE_MIN_LENGTH: 'Le titre doit contenir au moins 3 caractères',
  TITRE_MAX_LENGTH: 'Le titre ne peut pas dépasser 200 caractères',
  DESCRIPTION_MAX_LENGTH: 'La description ne peut pas dépasser 1000 caractères',
  TYPE_QUIZ_INVALID: 'Le type de quiz doit être "instantane" ou "programme"',
  STATUT_INVALID: 'Le statut doit être "brouillon" ou "publie"',
  CREATEUR_ID_REQUIRED: 'L\'identifiant du créateur est requis',
  CREATEUR_ID_INVALID: 'L\'identifiant du créateur doit être un nombre positif',
} as const;

export const createQuizSchema = z.object({
  titre: z
    .string({ message: QUIZ_VALIDATION_MESSAGES.TITRE_REQUIRED })
    .min(3, QUIZ_VALIDATION_MESSAGES.TITRE_MIN_LENGTH)
    .max(200, QUIZ_VALIDATION_MESSAGES.TITRE_MAX_LENGTH),
  
  description: z
    .string()
    .max(1000, QUIZ_VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH)
    .optional(),
  
  type_quiz: z
    .enum(['instantane', 'programme'], {
      message: QUIZ_VALIDATION_MESSAGES.TYPE_QUIZ_INVALID,
    }),
  
  statut: z
    .enum(['brouillon', 'publie'], {
      message: QUIZ_VALIDATION_MESSAGES.STATUT_INVALID,
    })
    .optional()
    .default('brouillon'),
});

export const updateQuizSchema = z.object({
  titre: z
    .string()
    .min(3, QUIZ_VALIDATION_MESSAGES.TITRE_MIN_LENGTH)
    .max(200, QUIZ_VALIDATION_MESSAGES.TITRE_MAX_LENGTH)
    .optional(),
  
  description: z
    .string()
    .max(1000, QUIZ_VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH)
    .optional(),
  
  type_quiz: z
    .enum(['instantane', 'programme'], {
      message: QUIZ_VALIDATION_MESSAGES.TYPE_QUIZ_INVALID,
    })
    .optional(),
  
  statut: z
    .enum(['brouillon', 'publie'], {
      message: QUIZ_VALIDATION_MESSAGES.STATUT_INVALID,
    })
    .optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
