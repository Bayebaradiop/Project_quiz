import { ReponseRepository } from '../repositories/ReponseRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { QuizRepository } from '../repositories/QuizRepository';
import { Reponse } from '../interfaces/ReponseInterface';
import { CreateReponseInput, UpdateReponseInput } from '../validations/Reponse.validator';
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
      texte_reponse: data.texte_reponse,
      est_correcte: data.est_correcte,
      ordre: data.ordre ?? null,
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
    if (data.texte_reponse !== undefined) updateData.texte_reponse = data.texte_reponse;
    if (data.est_correcte !== undefined) updateData.est_correcte = data.est_correcte;
    if (data.ordre !== undefined) updateData.ordre = data.ordre ?? null;

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
    const maxOrdre = await this.reponseRepository.getMaxOrdre(question_id);
    return maxOrdre + 1;
  }

  async countCorrectAnswers(question_id: number): Promise<number> {
    return await this.reponseRepository.countCorrectAnswers(question_id);
  }
}
