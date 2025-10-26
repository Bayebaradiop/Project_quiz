import { z } from 'zod';

export const demarrerParticipationSchema = z.object({
  quiz_id: z.number().int().positive('L\'ID du quiz doit être positif'),
  code_acces: z.string().optional(),
  email_participant: z.string().email('Email invalide').optional(),
  nom_participant: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
});

export const soumettreReponseSchema = z.object({
  participation_id: z.number().int().positive('L\'ID de participation doit être positif'),
  question_id: z.number().int().positive('L\'ID de la question doit être positif'),
  choix_reponse_id: z.number().int().positive('L\'ID du choix de réponse doit être positif').optional(),
  texte_reponse: z.string().optional(),
  temps_reponse: z.number().int().nonnegative('Le temps de réponse doit être positif').optional(),
}).refine(
  (data) => data.choix_reponse_id !== undefined || data.texte_reponse !== undefined,
  {
    message: 'Vous devez fournir soit choix_reponse_id soit texte_reponse',
  }
);

export const terminerParticipationSchema = z.object({
  participation_id: z.number().int().positive('L\'ID de participation doit être positif'),
});

export const accederQuizPublicSchema = z.object({
  lien_partage: z.string().min(1, 'Le lien de partage est requis'),
  email_participant: z.string().email('Email invalide').optional(),
  nom_participant: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
});
