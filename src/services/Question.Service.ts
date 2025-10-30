import { QuestionRepository } from '../repositories/QuestionRepository';
import { Question } from '../interfaces/QuestionInterface';
import { CreateQuestionInput, UpdateQuestionInput } from '../validations/Question.validator';
import { ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { QuizRepository } from '../repositories/QuizRepository';

export class QuestionService {
  private questionRepository: QuestionRepository;
  private quizRepository: QuizRepository;

  constructor() {
    this.questionRepository = new QuestionRepository();
    this.quizRepository = new QuizRepository();
  }

  async createQuestion(quiz_id: number, data: CreateQuestionInput, createur_id: number): Promise<Question> {
    const quiz = await this.quizRepository.findById(quiz_id);
    
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    if (quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return await this.questionRepository.create({
      quiz_id,
      texte: data.texte,
      duree: data.duree,
      ordre: data.ordre,
      choix_reponses: data.choix_reponses,
    });
  }

  async getQuestions(): Promise<Question[]> {
    return await this.questionRepository.findAll();
  }

  async getQuestionsByQuizId(quiz_id: number): Promise<Question[]> {
    return await this.questionRepository.findByQuizId(quiz_id);
  }

  async getQuestionById(id: number): Promise<Question> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }
    return question;
  }

  async updateQuestion(id: number, data: UpdateQuestionInput, createur_id: number): Promise<Question> {
    const question = await this.questionRepository.findById(id);
    
    if (!question) {
      throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    const quiz = await this.quizRepository.findById(question.quiz_id);
    
    if (!quiz || quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    const updateData: any = {};
    if (data.texte !== undefined) updateData.texte = data.texte;
    if (data.duree !== undefined) updateData.duree = data.duree;
    if (data.ordre !== undefined) updateData.ordre = data.ordre;

    return await this.questionRepository.update(id, updateData);
  }

  async deleteQuestion(id: number, createur_id: number): Promise<Question> {
    const question = await this.questionRepository.findById(id);
    
    if (!question) {
      throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    const quiz = await this.quizRepository.findById(question.quiz_id);
    
    if (!quiz || quiz.createur_id !== createur_id) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN);
    }

    return await this.questionRepository.delete(id);
  }

  async getQuestionWithReponses(id: number) {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }
    return question;
  }

  async getNextOrdre(quiz_id: number): Promise<number> {
    return await this.questionRepository.getNextOrdre(quiz_id);
  }
}
