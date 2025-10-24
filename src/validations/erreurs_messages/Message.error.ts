export const AUTH_VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'L\'adresse email est requise',
  EMAIL_INVALID: 'L\'adresse email n\'est pas valide',
  EMAIL_MAX_LENGTH: 'L\'adresse email ne peut pas dépasser 255 caractères',
  
  PASSWORD_REQUIRED: 'Le mot de passe est requis',
  PASSWORD_MIN_LENGTH: 'Le mot de passe doit contenir au moins 8 caractères',
  PASSWORD_MAX_LENGTH: 'Le mot de passe ne peut pas dépasser 100 caractères',
  PASSWORD_MUST_CONTAIN_UPPERCASE: 'Le mot de passe doit contenir au moins une lettre majuscule',
  PASSWORD_MUST_CONTAIN_LOWERCASE: 'Le mot de passe doit contenir au moins une lettre minuscule',
  PASSWORD_MUST_CONTAIN_NUMBER: 'Le mot de passe doit contenir au moins un chiffre',
  PASSWORD_MUST_CONTAIN_SPECIAL: 'Le mot de passe doit contenir au moins un caractère spécial',
  
  PRENOM_REQUIRED: 'Le prénom est requis',
  PRENOM_MIN_LENGTH: 'Le prénom doit contenir au moins 2 caractères',
  PRENOM_MAX_LENGTH: 'Le prénom ne peut pas dépasser 50 caractères',
  
  NOM_REQUIRED: 'Le nom est requis',
  NOM_MIN_LENGTH: 'Le nom doit contenir au moins 2 caractères',
  NOM_MAX_LENGTH: 'Le nom ne peut pas dépasser 50 caractères',
  
  ROLE_ID_REQUIRED: 'L\'identifiant du rôle est requis',
  ROLE_ID_INVALID: 'L\'identifiant du rôle doit être un nombre positif',
} as const;

export const UTILISATEUR_VALIDATION_MESSAGES = {
  ...AUTH_VALIDATION_MESSAGES,
  STATUT_INVALID: 'Le statut doit être "actif" ou "inactif"',
} as const;

export const ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Un utilisateur avec cet email existe déjà',
  INVALID_CREDENTIALS: 'Identifiants incorrects',
  EMAIL_NOT_FOUND: 'L\'email est incorrect',
  INVALID_PASSWORD: 'Le mot de passe est incorrect',
  EMAIL_AND_PASSWORD_INVALID: 'L\'email et le mot de passe sont incorrects',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  INVALID_ID: 'ID invalide',
  VALIDATION_ERROR: 'Erreur de validation',
  INTERNAL_ERROR: 'Erreur interne',
  FETCH_ROLES_ERROR: 'Erreur lors de la récupération des rôles',
  FETCH_USER_ERROR: 'Erreur lors de la récupération de l\'utilisateur',
  LOGOUT_ERROR: 'Erreur lors de la déconnexion',
  REGISTRATION_ERROR: 'Erreur lors de l\'inscription',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Utilisateur créé avec succès',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  USER_UPDATED: 'Utilisateur mis à jour avec succès',
  USER_DELETED: 'Utilisateur supprimé avec succès',
} as const;

