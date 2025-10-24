export type StatutUtilisateur = 'actif' | 'inactif';
export type Role = 'user' | 'admin';

export interface Utilisateur {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  password: string;
  statut: StatutUtilisateur;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUtilisateurInput {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUtilisateurInput {
  prenom?: string;
  nom?: string;
  email?: string;
  password?: string;
  role?: Role;
  statut?: StatutUtilisateur;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  utilisateur: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: Role;
  };
  token: string;
}

export interface UtilisateurProfile {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  statut: StatutUtilisateur;
  role: Role;
}