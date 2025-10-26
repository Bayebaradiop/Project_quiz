export type TypeQuiz = 'instantane' | 'programme';
export type StatutQuiz = 'brouillon' | 'publie';

export interface Quiz {
  id: number;
  titre: string;
  description: string | null;
  type_quiz: TypeQuiz;
  lien_partage: string;
  statut: StatutQuiz;
  createur_id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateQuizInput {
  titre: string;
  description?: string | null;
  type_quiz: TypeQuiz;
  statut?: StatutQuiz;
}

export interface UpdateQuizInput {
  titre?: string | null;
  description?: string | null;
  type_quiz?: TypeQuiz;
  statut?: StatutQuiz;
}

export interface QuizWithQuestions extends Quiz {
  questions: Array<{
    id: number;
    texte: string;
    duree: number;
    ordre: number;
  }>;
}
