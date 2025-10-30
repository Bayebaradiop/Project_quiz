
import { PrismaClient } from '@prisma/client';
import { Reponse } from '../interfaces/ReponseInterface';

const prisma = new PrismaClient();

export class ReponseRepository {
  async create(data: {
    question_id: number;
    utilisateur_id: number;
    reponse_donnee: string;
    est_correcte?: boolean;
    temps_reponse?: number | null;
  }): Promise<Reponse> {
    return await prisma.reponse.create({
      data: {
        ...data,
        est_correcte: data.est_correcte ?? false,
        temps_reponse: data.temps_reponse ?? null,
      },
    });
  }

  async findAll(): Promise<Reponse[]> {
    return await prisma.reponse.findMany();
  }

  async findById(id: number): Promise<Reponse | null> {
    return await prisma.reponse.findUnique({
      where: { id },
    });
  }

  async findByQuestionId(question_id: number): Promise<Reponse[]> {
    return await prisma.reponse.findMany({
      where: { question_id },
    });
  }

  async update(
    id: number,
    data: {
      reponse_donnee?: string | null;
      est_correcte?: boolean | null;
      temps_reponse?: number | null;
    }
  ): Promise<Reponse> {
    const updateData: any = {};
    if (data.reponse_donnee !== undefined) updateData.reponse_donnee = data.reponse_donnee;
    if (data.est_correcte !== undefined) updateData.est_correcte = data.est_correcte;
    if (data.temps_reponse !== undefined) updateData.temps_reponse = data.temps_reponse;

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
}
