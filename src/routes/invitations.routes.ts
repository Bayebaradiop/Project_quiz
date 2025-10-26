import { Hono } from 'hono';
import { InvitationController } from '../controllers/InvitationController';
import { authMiddleware } from '../middleware/Auth';

const invitationRoutes = new Hono();
const invitationController = new InvitationController();

// Routes protégées (nécessitent une authentification)
invitationRoutes.use('/*', authMiddleware);

// Créer une invitation pour un quiz
invitationRoutes.post('/quizzes/:quizId/invitations', (c) =>
  invitationController.create(c)
);

// Lister toutes les invitations (admin uniquement)
invitationRoutes.get('/', (c) => invitationController.getAll(c));

// Lister les invitations d'un quiz
invitationRoutes.get('/quizzes/:quizId/invitations', (c) =>
  invitationController.getAllByQuizId(c)
);

// Récupérer une invitation par ID
invitationRoutes.get('/:id', (c) => invitationController.getById(c));

// Valider un code d'accès
invitationRoutes.post('/validate', (c) => invitationController.validate(c));

// Envoyer un rappel
invitationRoutes.post('/:id/reminder', (c) => invitationController.sendReminder(c));

// Modifier une invitation
invitationRoutes.put('/:id', (c) => invitationController.update(c));

// Supprimer une invitation
invitationRoutes.delete('/:id', (c) => invitationController.delete(c));

export { invitationRoutes };
