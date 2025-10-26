import { z } from 'zod';

export const INVITATION_VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'L\'email est requis',
  EMAIL_INVALID: 'L\'email n\'est pas valide',
  EMAIL_MAX: 'L\'email ne peut pas dépasser 255 caractères',
  NOM_MAX: 'Le nom ne peut pas dépasser 100 caractères',
  PRENOM_MAX: 'Le prénom ne peut pas dépasser 100 caractères',
  DATE_EXPIRATION_INVALID: 'La date d\'expiration doit être dans le futur',
  STATUT_INVALID: 'Le statut doit être: en_attente, accepte, refuse ou expire',
  CODE_ACCES_REQUIRED: 'Le code d\'accès est requis',
  CODE_ACCES_INVALID: 'Le code d\'accès n\'est pas valide',
};

export const createInvitationSchema = z.object({
  quiz_id: z.number().int().positive(),
  email: z
    .string({ message: INVITATION_VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .email(INVITATION_VALIDATION_MESSAGES.EMAIL_INVALID)
    .max(255, INVITATION_VALIDATION_MESSAGES.EMAIL_MAX),
  nom: z.string().max(100, INVITATION_VALIDATION_MESSAGES.NOM_MAX).nullable().optional(),
  prenom: z.string().max(100, INVITATION_VALIDATION_MESSAGES.PRENOM_MAX).nullable().optional(),
  date_expiration: z
    .date()
    .refine(
      (date) => date > new Date(),
      INVITATION_VALIDATION_MESSAGES.DATE_EXPIRATION_INVALID
    )
    .optional(),
});

export const updateInvitationSchema = z.object({
  email: z
    .string()
    .email(INVITATION_VALIDATION_MESSAGES.EMAIL_INVALID)
    .max(255, INVITATION_VALIDATION_MESSAGES.EMAIL_MAX)
    .optional(),
  nom: z.string().max(100, INVITATION_VALIDATION_MESSAGES.NOM_MAX).nullable().optional(),
  prenom: z.string().max(100, INVITATION_VALIDATION_MESSAGES.PRENOM_MAX).nullable().optional(),
  statut: z
    .enum(['en_attente', 'accepte', 'refuse', 'expire'], {
      message: INVITATION_VALIDATION_MESSAGES.STATUT_INVALID,
    })
    .optional(),
  date_expiration: z
    .date()
    .refine(
      (date) => date > new Date(),
      INVITATION_VALIDATION_MESSAGES.DATE_EXPIRATION_INVALID
    )
    .optional(),
});

export const validateInvitationSchema = z.object({
  code_acces: z
    .string({ message: INVITATION_VALIDATION_MESSAGES.CODE_ACCES_REQUIRED })
    .min(8, INVITATION_VALIDATION_MESSAGES.CODE_ACCES_INVALID)
    .max(64, INVITATION_VALIDATION_MESSAGES.CODE_ACCES_INVALID),
});
