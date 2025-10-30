
export interface Reponse {
  id: number;
  question_id: number;
  utilisateur_id: number;
  reponse_donnee: string;
  est_correcte: boolean;
  temps_reponse: number | null;
  createdAt: Date;
}


export interface CreateReponseInput {
  question_id: number;
  utilisateur_id: number;
  reponse_donnee: string;
  est_correcte?: boolean;
  temps_reponse?: number | null;
}


export interface UpdateReponseInput {
  reponse_donnee?: string | null;
  est_correcte?: boolean | null;
  temps_reponse?: number | null;
}
