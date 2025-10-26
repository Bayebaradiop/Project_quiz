export interface Question {
  id: number;
  quiz_id: number;
  texte: string;
  duree: number;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  choix_reponses?: ChoixReponse[];
}

export interface ChoixReponse {
  id: number;
  question_id: number;
  texte: string;
  est_correcte: boolean;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionInput {
  texte: string;
  duree: number;
  ordre: number;
  choix_reponses: CreateChoixReponseInput[];
}

export interface CreateChoixReponseInput {
  texte: string;
  est_correcte: boolean;
  ordre: number;
}

export interface UpdateQuestionInput {
  texte?: string;
  duree?: number;
  ordre?: number;
}

export interface QuestionWithReponses extends Question {
  choix_reponses: ChoixReponse[];
}
