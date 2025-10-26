export interface Participation {
  id: number;
  quiz_id: number;
  utilisateur_id: number | null;
  email_participant: string | null;
  nom_participant: string | null;
  code_acces: string | null;
  score: number | null;
  score_max: number | null;
  pourcentage: number | null;
  temps_total: number | null;
  statut: 'en_cours' | 'termine' | 'abandonne';
  date_debut: Date;
  date_fin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReponseParticipant {
  id: number;
  participation_id: number;
  question_id: number;
  choix_reponse_id: number | null;
  texte_reponse: string | null;
  est_correcte: boolean;
  points_obtenus: number;
  temps_reponse: number | null;
  createdAt: Date;
}

export interface DemarrerParticipationInput {
  quiz_id: number;
  code_acces?: string | undefined; // Pour quiz privé avec invitation
  email_participant?: string | undefined; // Pour anonyme
  nom_participant?: string | undefined; // Pour anonyme
}

export interface SoumettreReponseInput {
  participation_id: number;
  question_id: number;
  choix_reponse_id?: number; // ID du choix sélectionné
  texte_reponse?: string; // Pour texte libre (optionnel)
  temps_reponse?: number;
}

export interface TerminerParticipationInput {
  participation_id: number;
}

export interface ResultatParticipation {
  participation: Participation;
  reponses: ReponseParticipant[];
  quiz: {
    id: number;
    titre: string;
    description: string | null;
  };
  statistiques: {
    score: number;
    score_max: number;
    pourcentage: number;
    temps_total: number;
    questions_repondues: number;
    questions_correctes: number;
  };
}
