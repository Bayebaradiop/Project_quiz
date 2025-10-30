import { ReponseRepository } from '../repositories/ReponseRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { QuizRepository } from '../repositories/QuizRepository';
import { Reponse } from '../interfaces/ReponseInterface';
import { CreateReponseInput, UpdateReponseInput } from '../interfaces/ReponseInterface';
import { ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';

export class ReponseService {
  private reponseRepository: ReponseRepository;
  private questionRepository: QuestionRepository;
  private quizRepository: QuizRepository;

  constructor() {
    this.reponseRepository = new ReponseRepository();
    this.questionRepository = new QuestionRepository();
    this.quizRepository = new QuizRepository();
  }

  async createReponse(question_id: number, data: CreateReponseInput, createur_id: number): Promise<Reponse> {
    const question = await this.questionRepository.findById(question_id);
    
    if (!question) {
      throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    const quiz = await this.quizRepository.findById(question.quiz_id);
    
    if (!quiz || quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return await this.reponseRepository.create({
      question_id,
      utilisateur_id: data.utilisateur_id,
      reponse_donnee: data.reponse_donnee,
      est_correcte: data.est_correcte ?? false,
      temps_reponse: data.temps_reponse ?? null,
    });
  }

  async getReponses(): Promise<Reponse[]> {
    return await this.reponseRepository.findAll();
  }

  async getReponsesByQuestionId(question_id: number): Promise<Reponse[]> {
    return await this.reponseRepository.findByQuestionId(question_id);
  }

  async getReponseById(id: number): Promise<Reponse> {
    const reponse = await this.reponseRepository.findById(id);
    if (!reponse) {
      throw new Error(ERROR_MESSAGES.REPONSE_NOT_FOUND);
    }
    return reponse;
  }

  async updateReponse(id: number, data: UpdateReponseInput, createur_id: number): Promise<Reponse> {
    const reponse = await this.reponseRepository.findById(id);
    
    if (!reponse) {
      throw new Error(ERROR_MESSAGES.REPONSE_NOT_FOUND);
    }

    const question = await this.questionRepository.findById(reponse.question_id);
    
    if (!question) {
      throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    const quiz = await this.quizRepository.findById(question.quiz_id);
    
    if (!quiz || quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

  const updateData: any = {};
  if (data.reponse_donnee !== undefined) updateData.reponse_donnee = data.reponse_donnee;
  if (data.est_correcte !== undefined) updateData.est_correcte = data.est_correcte;
  if (data.temps_reponse !== undefined) updateData.temps_reponse = data.temps_reponse;

  return await this.reponseRepository.update(id, updateData);
  }

  async deleteReponse(id: number, createur_id: number): Promise<Reponse> {
    const reponse = await this.reponseRepository.findById(id);
    
    if (!reponse) {
      throw new Error(ERROR_MESSAGES.REPONSE_NOT_FOUND);
    }

    const question = await this.questionRepository.findById(reponse.question_id);
    
    if (!question) {
      throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    const quiz = await this.quizRepository.findById(question.quiz_id);
    
    if (!quiz || quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return await this.reponseRepository.delete(id);
  }

  async getNextOrdre(question_id: number): Promise<number> {
  // La gestion de l'ordre n'est plus utilisée dans le modèle actuel
  return 1;
  }

  async countCorrectAnswers(question_id: number): Promise<number> {
    return await this.reponseRepository.countCorrectAnswers(question_id);
  }
}
