export type TypeQuestion = 'choix_unique' | 'choix_multiple' | 'vrai_faux' | 'texte_court';

export interface Question {
  id: number;
  quiz_id: number;
  texte_question: string;
  type_question: TypeQuestion;
  points: number;
  temps_limite: number | null;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateQuestionInput {
  texte_question: string;
  type_question: TypeQuestion;
  points?: number;
  temps_limite?: number | null;
  ordre: number;
}

export interface UpdateQuestionInput {
  texte_question?: string | null;
  type_question?: TypeQuestion;
  points?: number | null;
  temps_limite?: number | null;
  ordre?: number | null;
}

export interface QuestionWithReponses extends Question {
  reponses: any[];
}
