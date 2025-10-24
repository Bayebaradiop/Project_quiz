import { UtilisateurRepository } from '../repositories/UtilisateurRepository';
import { hashPassword, verifyPassword } from '../utils/password.utils';
import { generateAccessToken } from '../utils/jwt.utils';
import { CreateUtilisateurInput, UtilisateurProfile } from '../interfaces/UtilisateurInterface';
import { ERROR_MESSAGES } from '../validations/erreurs_messages/Message.error';

export class UtilisateurService {
  private utilisateurRepository: UtilisateurRepository;

  constructor() {
    this.utilisateurRepository = new UtilisateurRepository();
  }

  async register(data: CreateUtilisateurInput): Promise<{ user: any; token: string }> {
    const existingUser = await this.utilisateurRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.utilisateurRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const user = await this.utilisateurRepository.findByEmail(email);
    
    const emailExists = !!user;
    const passwordValid = user ? await verifyPassword(password, user.password) : false;

    if (!emailExists && !passwordValid) {
      throw new Error(ERROR_MESSAGES.EMAIL_AND_PASSWORD_INVALID);
    }
    
    if (!emailExists) {
      throw new Error(ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    if (!passwordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_PASSWORD);
    }

    const token = generateAccessToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role,
    });

    return {
      user: {
        id: user!.id,
        prenom: user!.prenom,
        nom: user!.nom,
        email: user!.email,
      },
      token,
    };
  }

  async getUtilisateurById(id: number): Promise<UtilisateurProfile> {
    const user = await this.utilisateurRepository.findById(id);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      statut: user.statut,
      role: user.role,
    };
  }

  async getAllRoles() {
    return [
      { id: 1, libelle: 'admin' },
      { id: 2, libelle: 'user' }
    ];
  }
}