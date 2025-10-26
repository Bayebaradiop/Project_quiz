import { PrismaClient } from '@prisma/client';
import { Question, TypeQuestion } from '../interfaces/QuestionInterface';

const prisma = new PrismaClient();

export class QuestionRepository {
  async create(data: {
    quiz_id: number;
    texte_question: string;
    type_question: TypeQuestion;
    points?: number;
    temps_limite?: number | null;
    ordre: number;
  }): Promise<Question> {
    return await prisma.question.create({
      data: {
        ...data,
        points: data.points ?? 1,
        temps_limite: data.temps_limite ?? null,
      },
    });
  }

  async findAll(): Promise<Question[]> {
    return await prisma.question.findMany({
      orderBy: { ordre: 'asc' },
    });
  }

  async findById(id: number): Promise<Question | null> {
    return await prisma.question.findUnique({
      where: { id },
    });
  }

  async findByQuizId(quiz_id: number): Promise<Question[]> {
    return await prisma.question.findMany({
      where: { quiz_id },
      orderBy: { ordre: 'asc' },
    });
  }

  async update(
    id: number,
    data: {
      texte_question?: string | null;
      type_question?: TypeQuestion;
      points?: number | null;
      temps_limite?: number | null;
      ordre?: number | null;
    }
  ): Promise<Question> {
    const updateData: any = {};
    if (data.texte_question !== undefined) updateData.texte_question = data.texte_question;
    if (data.type_question !== undefined) updateData.type_question = data.type_question;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.temps_limite !== undefined) updateData.temps_limite = data.temps_limite ?? null;
    if (data.ordre !== undefined) updateData.ordre = data.ordre;

    return await prisma.question.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<Question> {
    return await prisma.question.delete({
      where: { id },
    });
  }

  async findWithReponses(id: number) {
    return await prisma.question.findUnique({
      where: { id },
      include: {
        reponses: {
          orderBy: { ordre: 'asc' },
        },
      },
    });
  }

  async getMaxOrdre(quiz_id: number): Promise<number> {
    const result = await prisma.question.aggregate({
      where: { quiz_id },
      _max: { ordre: true },
    });
    return result._max.ordre ?? 0;
  }
}
