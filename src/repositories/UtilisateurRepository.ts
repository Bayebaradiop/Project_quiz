import { PrismaClient } from '@prisma/client';
import { Utilisateur, CreateUtilisateurInput, UpdateUtilisateurInput } from '../interfaces/UtilisateurInterface';

const prisma = new PrismaClient();

export class UtilisateurRepository {
  async create(data: CreateUtilisateurInput): Promise<Utilisateur> {
    return await prisma.utilisateur.create({
      data: {
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        password: data.password,
        role: data.role || 'user',
      },
    });
  }

  async findByEmail(email: string): Promise<Utilisateur | null> {
    return await prisma.utilisateur.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<Utilisateur | null> {
    return await prisma.utilisateur.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateUtilisateurInput): Promise<Utilisateur> {
    return await prisma.utilisateur.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Utilisateur> {
    return await prisma.utilisateur.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findAll(): Promise<Utilisateur[]> {
    return await prisma.utilisateur.findMany({
      where: {
        deletedAt: null,
      },
    });
  }
}