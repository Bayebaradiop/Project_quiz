import { PrismaClient, StatutInvitation } from '@prisma/client';
import {
  CreateInvitationInput,
  Invitation,
  UpdateInvitationInput,
} from '../interfaces/InvitationInterface';

const prisma = new PrismaClient();

export class InvitationRepository {
  async create(data: CreateInvitationInput & { code_acces: string }): Promise<Invitation> {
    // Date d'expiration par défaut: 30 jours
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 30);

    return await prisma.invitation.create({
      data: {
        quiz_id: data.quiz_id,
        email: data.email,
        nom: data.nom ?? null,
        prenom: data.prenom ?? null,
        code_acces: data.code_acces,
        date_envoi: new Date(),
        date_expiration: data.date_expiration || defaultExpiration,
        statut: StatutInvitation.en_attente,
      },
    }) as Invitation;
  }

  async findAll(): Promise<Invitation[]> {
    return (await prisma.invitation.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })) as Invitation[];
  }

  async findById(id: number): Promise<Invitation | null> {
    return (await prisma.invitation.findFirst({
      where: { id, deletedAt: null },
    })) as Invitation | null;
  }

  async findByQuizId(quiz_id: number): Promise<Invitation[]> {
    return (await prisma.invitation.findMany({
      where: { quiz_id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })) as Invitation[];
  }

  async findByCodeAcces(code_acces: string): Promise<Invitation | null> {
    return (await prisma.invitation.findFirst({
      where: { code_acces, deletedAt: null },
    })) as Invitation | null;
  }

  async findByEmail(email: string): Promise<Invitation[]> {
    return (await prisma.invitation.findMany({
      where: { email, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })) as Invitation[];
  }

  async update(id: number, data: UpdateInvitationInput): Promise<Invitation> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.email !== undefined) updateData.email = data.email;
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.statut !== undefined) updateData.statut = data.statut as StatutInvitation;
    if (data.date_expiration !== undefined) updateData.date_expiration = data.date_expiration;

    return (await prisma.invitation.update({
      where: { id },
      data: updateData,
    })) as Invitation;
  }

  async delete(id: number): Promise<Invitation> {
    return (await prisma.invitation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })) as Invitation;
  }

  async updateStatut(id: number, statut: StatutInvitation): Promise<Invitation> {
    return (await prisma.invitation.update({
      where: { id },
      data: {
        statut,
        updatedAt: new Date(),
      },
    })) as Invitation;
  }

  async countByQuizId(quiz_id: number): Promise<number> {
    return await prisma.invitation.count({
      where: { quiz_id, deletedAt: null },
    });
  }

  async findExpiredInvitations(): Promise<Invitation[]> {
    return (await prisma.invitation.findMany({
      where: {
        deletedAt: null,
        date_expiration: { lt: new Date() },
        statut: StatutInvitation.en_attente,
      },
    })) as Invitation[];
  }
}
