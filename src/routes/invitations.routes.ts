import { Hono } from 'hono';
import { InvitationController } from '../controllers/InvitationController';
import { authMiddleware } from '../middleware/Auth';
import { hashIdMiddleware } from '../middleware/HashId';

const invitationRoutes = new Hono();
const invitationController = new InvitationController();

// Route publique - Valider un code d'accès (pas d'auth requise)
// Le participant reçoit un code par email et le valide pour accéder au quiz
invitationRoutes.post('/validate', (c) => invitationController.validate(c));

// Routes protégées (nécessitent une authentification)
invitationRoutes.use('/*', authMiddleware);

// Créer une invitation pour un quiz
invitationRoutes.post('/quizzes/:quizId/invitations', hashIdMiddleware('quizId'), (c) =>
  invitationController.create(c)
);

// Lister toutes les invitations (admin uniquement)
invitationRoutes.get('/', (c) => invitationController.getAll(c));

// Lister les invitations d'un quiz
invitationRoutes.get('/quizzes/:quizId/invitations', hashIdMiddleware('quizId'), (c) =>
  invitationController.getAllByQuizId(c)
);

// Récupérer une invitation par ID
invitationRoutes.get('/:id', hashIdMiddleware('id'), (c) => invitationController.getById(c));

// Envoyer un rappel
invitationRoutes.post('/:id/reminder', hashIdMiddleware('id'), (c) => invitationController.sendReminder(c));

// Modifier une invitation
invitationRoutes.put('/:id', hashIdMiddleware('id'), (c) => invitationController.update(c));

// Supprimer une invitation
invitationRoutes.delete('/:id', hashIdMiddleware('id'), (c) => invitationController.delete(c));

export { invitationRoutes };
