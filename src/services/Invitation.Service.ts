import { randomBytes } from 'crypto';
import { StatutInvitation } from '@prisma/client';
import {
  CreateInvitationInput,
  Invitation,
  UpdateInvitationInput,
} from '../interfaces/InvitationInterface';
import { InvitationRepository } from '../repositories/InvitationRepository';
import { QuizRepository } from '../repositories/QuizRepository';
import { UtilisateurRepository } from '../repositories/UtilisateurRepository';
import { EmailService } from './Email.Service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../validations/erreurs_messages/Message.error';

const invitationRepository = new InvitationRepository();
const quizRepository = new QuizRepository();
const utilisateurRepository = new UtilisateurRepository();
const emailService = new EmailService();

export class InvitationService {
  /**
   * Génère un code d'accès unique
   */
  private generateCodeAcces(): string {
    return randomBytes(16).toString('hex'); // 32 caractères
  }

  /**
   * Vérifie si un code d'accès existe déjà
   */
  private async isCodeUnique(code: string): Promise<boolean> {
    const existing = await invitationRepository.findByCodeAcces(code);
    return existing === null;
  }

  /**
   * Génère un code d'accès unique garanti
   */
  private async generateUniqueCodeAcces(): Promise<string> {
    let code = this.generateCodeAcces();
    let attempts = 0;
    const maxAttempts = 10;

    while (!(await this.isCodeUnique(code)) && attempts < maxAttempts) {
      code = this.generateCodeAcces();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Impossible de générer un code unique après plusieurs tentatives');
    }

    return code;
  }

  /**
   * Crée une ou plusieurs invitations pour un quiz
   * @param data - Données de l'invitation (email unique ou emails multiples)
   * @param userId - ID de l'utilisateur qui crée l'invitation
   */
  async createInvitation(
    data: CreateInvitationInput | { quiz_id: number; emails: string[]; date_expiration?: Date },
    userId: number
  ): Promise<Invitation | { invitations: Invitation[]; summary: { total: number; success: number; failed: number; errors: any[] } }> {
    // Vérifier que le quiz existe
    const quiz = await quizRepository.findById(data.quiz_id);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est le créateur du quiz
    if (quiz.createur_id !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Récupérer les informations de l'utilisateur créateur
    const utilisateur = await utilisateurRepository.findById(userId);
    const invitedBy = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : 'Un utilisateur';

    // CAS 1: Invitation unique (email)
    if ('email' in data && data.email) {
      const code_acces = await this.generateUniqueCodeAcces();

      const invitation = await invitationRepository.create({
        quiz_id: data.quiz_id,
        email: data.email,
        nom: 'nom' in data ? data.nom : null,
        prenom: 'prenom' in data ? data.prenom : null,
        date_expiration: data.date_expiration,
        code_acces,
      });

      // Envoyer l'email d'invitation
      try {
        await emailService.sendInvitationEmail(
          data.email,
          code_acces,
          quiz.titre,
          invitedBy
        );
      } catch (emailError) {
        console.error(`Erreur lors de l'envoi de l'email à ${data.email}:`, emailError);
      }

      return invitation;
    }

    // CAS 2: Invitations multiples (emails[])
    if ('emails' in data && Array.isArray(data.emails)) {
      const invitations: Invitation[] = [];
      const errors: any[] = [];
      let successCount = 0;

      for (const email of data.emails) {
        try {
          const code_acces = await this.generateUniqueCodeAcces();

          const invitation = await invitationRepository.create({
            quiz_id: data.quiz_id,
            email,
            nom: null,
            prenom: null,
            date_expiration: data.date_expiration,
            code_acces,
          });

          invitations.push(invitation);

          // Envoyer l'email d'invitation (sans bloquer le processus)
          emailService.sendInvitationEmail(
            email,
            code_acces,
            quiz.titre,
            invitedBy
          ).catch((emailError) => {
            console.error(`Erreur lors de l'envoi de l'email à ${email}:`, emailError);
          });

          successCount++;
        } catch (error) {
          errors.push({
            email,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          });
        }
      }

      return {
        invitations,
        summary: {
          total: data.emails.length,
          success: successCount,
          failed: errors.length,
          errors,
        },
      };
    }

    throw new Error('Données d\'invitation invalides');
  }

  /**
   * Récupère toutes les invitations (admin)
   */
  async getInvitations(): Promise<Invitation[]> {
    return await invitationRepository.findAll();
  }

  /**
   * Récupère les invitations d'un quiz spécifique
   * @param quiz_id - ID du quiz
   * @param userId - ID de l'utilisateur
   */
  async getInvitationsByQuizId(quiz_id: number, userId: number): Promise<Invitation[]> {
    // Vérifier que le quiz existe
    const quiz = await quizRepository.findById(quiz_id);
    if (!quiz) {
      throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est le créateur du quiz
    if (quiz.createur_id !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return await invitationRepository.findByQuizId(quiz_id);
  }

  /**
   * Récupère une invitation par son ID
   */
  async getInvitationById(id: number, userId: number): Promise<Invitation> {
    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new Error(ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est le créateur du quiz
    const quiz = await quizRepository.findById(invitation.quiz_id);
    if (!quiz || quiz.createur_id !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return invitation;
  }

  /**
   * Valide un code d'accès (endpoint public)
   * @param code_acces - Code d'accès à valider
   */
  async validateInvitation(code_acces: string): Promise<{
    valid: boolean;
    invitation?: Invitation;
    message: string;
  }> {
    const code = (code_acces || '').trim();
    const invitation = await invitationRepository.findByCodeAcces(code);

    if (!invitation) {
      return {
        valid: false,
        message: ERROR_MESSAGES.INVALID_ACCESS_CODE,
      };
    }

    // Vérifier l'expiration
    if (new Date() > invitation.date_expiration) {
      // Mettre à jour le statut si pas déjà expiré
      if (invitation.statut !== StatutInvitation.expire) {
        await invitationRepository.updateStatut(invitation.id, StatutInvitation.expire);
      }
      return {
        valid: false,
        message: ERROR_MESSAGES.INVITATION_EXPIRED,
      };
    }

    // Vérifier le statut
    if (invitation.statut === StatutInvitation.refuse) {
      return {
        valid: false,
        message: ERROR_MESSAGES.INVITATION_REFUSED,
      };
    }

    // Mettre à jour le statut à "accepté" si c'était "en attente"
    if (invitation.statut === StatutInvitation.en_attente) {
      await invitationRepository.updateStatut(invitation.id, StatutInvitation.accepte);
      invitation.statut = StatutInvitation.accepte;
    }

    return {
      valid: true,
      invitation,
      message: SUCCESS_MESSAGES.INVITATION_VALID,
    };
  }

  /**
   * Met à jour une invitation
   */
  async updateInvitation(
    id: number,
    data: UpdateInvitationInput,
    userId: number
  ): Promise<Invitation> {
    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new Error(ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est le créateur du quiz
    const quiz = await quizRepository.findById(invitation.quiz_id);
    if (!quiz || quiz.createur_id !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    return await invitationRepository.update(id, data);
  }

  /**
   * Supprime une invitation (soft delete)
   */
  async deleteInvitation(id: number, userId: number): Promise<void> {
    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new Error(ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est le créateur du quiz
    const quiz = await quizRepository.findById(invitation.quiz_id);
    if (!quiz || quiz.createur_id !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    await invitationRepository.delete(id);
  }

  /**
   * Compte le nombre d'invitations pour un quiz
   */
  async countInvitationsByQuizId(quiz_id: number): Promise<number> {
    return await invitationRepository.countByQuizId(quiz_id);
  }

  /**
   * Marque les invitations expirées
   */
  async markExpiredInvitations(): Promise<number> {
    const expiredInvitations = await invitationRepository.findExpiredInvitations();

    for (const invitation of expiredInvitations) {
      await invitationRepository.updateStatut(invitation.id, StatutInvitation.expire);
    }

    return expiredInvitations.length;
  }

  /**
   * Envoie un rappel pour une invitation
   * @param id - ID de l'invitation
   * @param userId - ID de l'utilisateur
   */
  async sendReminder(id: number, userId: number): Promise<void> {
    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      throw new Error(ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    // Vérifier que l'utilisateur est le créateur du quiz
    const quiz = await quizRepository.findById(invitation.quiz_id);
    if (!quiz || quiz.createur_id !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Vérifier que l'invitation est toujours en attente
    if (invitation.statut !== StatutInvitation.en_attente) {
      throw new Error('Impossible d\'envoyer un rappel pour une invitation qui n\'est pas en attente');
    }

    // Vérifier que l'invitation n'est pas expirée
    if (new Date() > invitation.date_expiration) {
      throw new Error(ERROR_MESSAGES.INVITATION_EXPIRED);
    }

    // Envoyer le rappel par email
    await emailService.sendReminderEmail(
      invitation.email,
      invitation.code_acces,
      quiz.titre
    );
  }
}
