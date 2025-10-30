import { QuizRepository } from '../repositories/QuizRepository';
import { Quiz } from '../interfaces/QuizInterface';
import { CreateQuizInput, UpdateQuizInput } from '../validations/Quiz.validator';
import { ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { randomBytes } from 'crypto';

export class QuizService {
  private quizRepository: QuizRepository;

  constructor() {
    this.quizRepository = new QuizRepository();
  }

  private generateLienPartage(): string {
    return randomBytes(16).toString('hex');
  }

  async createQuiz(data: CreateQuizInput, createur_id: number): Promise<Quiz> {
    const lien_partage = this.generateLienPartage();

    return await this.quizRepository.create({
      titre: data.titre,
      description: data.description ?? null,
      type_quiz: data.type_quiz,
      lien_partage,
      createur_id,
      statut: data.statut || 'brouillon',
    });
  }

  async getQuizzes(): Promise<Quiz[]> {
    return await this.quizRepository.findAll();
  }

  async getQuizzesWithPagination(skip: number, take: number): Promise<{ quizzes: Quiz[]; total: number }> {
    const [quizzes, total] = await Promise.all([
      this.quizRepository.findAllPaginated(skip, take),
      this.quizRepository.count(),
    ]);
    return { quizzes, total };
  }

  async getQuizzesByCreateur(createur_id: number): Promise<Quiz[]> {
    return await this.quizRepository.findByCreateur(createur_id);
  }

  async getQuizById(id: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }
    return quiz;
  }

  async getQuizByLienPartage(lien_partage: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findByLienPartage(lien_partage);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }
    return quiz;
  }

  async updateQuiz(id: number, data: UpdateQuizInput, createur_id: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(id);
    
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    if (quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    const updateData: any = {};
    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.type_quiz !== undefined) updateData.type_quiz = data.type_quiz;
    if (data.statut !== undefined) updateData.statut = data.statut;

    return await this.quizRepository.update(id, updateData);
  }

  async deleteQuiz(id: number, createur_id: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(id);
    
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    if (quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return await this.quizRepository.delete(id);
  }

  async getQuizWithQuestions(id: number) {
    const quiz = await this.quizRepository.findWithQuestions(id);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }
    return quiz;
  }

  /**
   * Récupère tous les quiz publics avec leurs questions et créateur
   * (pour les participants non connectés)
   */
  async getQuizzesPublicWithQuestions(skip: number, take: number) {
    const [quizzes, total] = await Promise.all([
      this.quizRepository.findAllPublicWithQuestions(skip, take),
      this.quizRepository.countPublic(),
    ]);
    return { quizzes, total };
  }

  async publierQuiz(id: number, createur_id: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findById(id);

    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    if (quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    if (quiz.statut !== 'brouillon') {
      throw new Error('Le quiz doit être en statut "brouillon" pour être publié');
    }

    // Vérifier qu'il y a au moins une question
    const questionsCount = await this.quizRepository.countQuestions(id);
    if (questionsCount === 0) {
      throw new Error('Le quiz doit contenir au moins une question');
    }

    return await this.quizRepository.update(id, { statut: 'publie' });
  }
}
