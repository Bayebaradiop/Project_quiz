export interface Reponse {
  id: number;
  question_id: number;
  texte_reponse: string;
  est_correcte: boolean;
  ordre: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateReponseInput {
  texte_reponse: string;
  est_correcte?: boolean;
  ordre?: number | null;
}

export interface UpdateReponseInput {
  texte_reponse?: string | null;
  est_correcte?: boolean | null;
  ordre?: number | null;
}
