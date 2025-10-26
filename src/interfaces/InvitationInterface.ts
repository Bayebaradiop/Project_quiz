export interface Invitation {
  id: number;
  quiz_id: number;
  email: string;
  nom: string | null;
  prenom: string | null;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'expire';
  code_acces: string;
  date_envoi: Date;
  date_expiration: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateInvitationInput {
  quiz_id: number;
  email: string;
  nom?: string | null | undefined;
  prenom?: string | null | undefined;
  date_expiration?: Date | undefined;
}

export interface UpdateInvitationInput {
  email?: string | undefined;
  nom?: string | null | undefined;
  prenom?: string | null | undefined;
  statut?: 'en_attente' | 'accepte' | 'refuse' | 'expire' | undefined;
  date_expiration?: Date | undefined;
}

export interface ValidateInvitationInput {
  code_acces: string;
}
