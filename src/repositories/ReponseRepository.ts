import { PrismaClient } from '@prisma/client';
import { Reponse } from '../interfaces/ReponseInterface';

const prisma = new PrismaClient();

export class ReponseRepository {
  async create(data: {
    question_id: number;
    texte_reponse: string;
    est_correcte?: boolean;
    ordre?: number | null;
  }): Promise<Reponse> {
    return await prisma.reponse.create({
      data: {
        ...data,
        est_correcte: data.est_correcte ?? false,
        ordre: data.ordre ?? null,
      },
    });
  }

  async findAll(): Promise<Reponse[]> {
    return await prisma.reponse.findMany({
      orderBy: { ordre: 'asc' },
    });
  }

  async findById(id: number): Promise<Reponse | null> {
    return await prisma.reponse.findUnique({
      where: { id },
    });
  }

  async findByQuestionId(question_id: number): Promise<Reponse[]> {
    return await prisma.reponse.findMany({
      where: { question_id },
      orderBy: { ordre: 'asc' },
    });
  }

  async update(
    id: number,
    data: {
      texte_reponse?: string | null;
      est_correcte?: boolean | null;
      ordre?: number | null;
    }
  ): Promise<Reponse> {
    const updateData: any = {};
    if (data.texte_reponse !== undefined) updateData.texte_reponse = data.texte_reponse;
    if (data.est_correcte !== undefined) updateData.est_correcte = data.est_correcte;
    if (data.ordre !== undefined) updateData.ordre = data.ordre ?? null;

    return await prisma.reponse.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<Reponse> {
    return await prisma.reponse.delete({
      where: { id },
    });
  }

  async countCorrectAnswers(question_id: number): Promise<number> {
    return await prisma.reponse.count({
      where: {
        question_id,
        est_correcte: true,
      },
    });
  }

  async getMaxOrdre(question_id: number): Promise<number> {
    const result = await prisma.reponse.aggregate({
      where: { question_id },
      _max: { ordre: true },
    });
    return result._max.ordre ?? 0;
  }
}
