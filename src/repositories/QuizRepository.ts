import { PrismaClient } from '@prisma/client';
import { Quiz, StatutQuiz, TypeQuiz } from '../interfaces/QuizInterface';

const prisma = new PrismaClient();

export class QuizRepository {
  async create(data: {
    titre: string;
    description?: string | null;
    type_quiz: TypeQuiz;
    lien_partage: string;
    statut?: StatutQuiz;
    createur_id: number;
  }): Promise<Quiz> {
    return await prisma.quiz.create({
      data: {
        ...data,
        description: data.description ?? null,
      },
      include: {
        questions: true,
        invitations: true,
        participations: true,
      },
    });
  }

  async findAll(): Promise<Quiz[]> {
    return await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Quiz | null> {
    return await prisma.quiz.findUnique({
      where: { id },
    });
  }

  async findByCreateur(createur_id: number): Promise<Quiz[]> {
    return await prisma.quiz.findMany({
      where: { createur_id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLienPartage(lien_partage: string): Promise<Quiz | null> {
    return await prisma.quiz.findUnique({
      where: { lien_partage },
    });
  }

  async update(
    id: number,
    data: {
      titre?: string | null;
      description?: string | null;
      type_quiz?: TypeQuiz;
      statut?: StatutQuiz;
    }
  ): Promise<Quiz> {
    const updateData: any = {};
    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.type_quiz !== undefined) updateData.type_quiz = data.type_quiz;
    if (data.statut !== undefined) updateData.statut = data.statut;

    return await prisma.quiz.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<Quiz> {
    return await prisma.quiz.delete({
      where: { id },
    });
  }

  async findWithQuestions(id: number) {
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
        },
      },
    });
  }
}
