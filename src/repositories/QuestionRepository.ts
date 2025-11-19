import { PrismaClient } from '@prisma/client';
import { Question, CreateQuestionInput, UpdateQuestionInput } from '../interfaces/QuestionInterface';

const prisma = new PrismaClient();

export class QuestionRepository {
  async create(data: {
    quiz_id: number;
    texte: string;
    duree: number;
    ordre: number;
    choix_reponses: Array<{
      texte: string;
      est_correcte: boolean;
      ordre: number;
    }>;
  }): Promise<Question> {
    return await prisma.question.create({
      data: {
        quiz_id: data.quiz_id,
        texte: data.texte,
        duree: data.duree,
        ordre: data.ordre,
        choix_reponses: {
          create: data.choix_reponses,
        },
      },
      include: {
        choix_reponses: {
          orderBy: { ordre: 'asc' },
        },
      },
    }) as Question;
  }

  async findAll(): Promise<Question[]> {
    return await prisma.question.findMany({
      orderBy: { ordre: 'asc' },
      include: {
        choix_reponses: {
          orderBy: { ordre: 'asc' },
        },
      },
    }) as Question[];
  }

  async findById(id: number): Promise<Question | null> {
    return await prisma.question.findUnique({
      where: { id },
      include: {
        choix_reponses: {
          orderBy: { ordre: 'asc' },
        },
      },
    }) as Question | null;
  }

  async findByQuizId(quiz_id: number): Promise<Question[]> {
    return await prisma.question.findMany({
      where: { quiz_id },
      orderBy: { ordre: 'asc' },
      include: {
        choix_reponses: {
          orderBy: { ordre: 'asc' },
        },
      },
    }) as Question[];
  }

  async update(
    id: number,
    data: UpdateQuestionInput
  ): Promise<Question> {
    return await prisma.question.update({
      where: { id },
      data,
      include: {
        choix_reponses: {
          orderBy: { ordre: 'asc' },
        },
      },
    }) as Question;
  }

  async delete(id: number): Promise<Question> {
    return await prisma.question.delete({
      where: { id },
    }) as Question;
  }

  async getNextOrdre(quiz_id: number): Promise<number> {
    const lastQuestion = await prisma.question.findFirst({
      where: { quiz_id },
      orderBy: { ordre: 'desc' },
    });
    return (lastQuestion?.ordre || 0) + 1;
  }
}
