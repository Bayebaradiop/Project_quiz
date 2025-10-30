import { Hono } from 'hono';
import { ParticipationController } from '../controllers/ParticipationController';
import { authMiddleware } from '../middleware/Auth';
import { hashIdMiddleware, hashIdBodyMiddleware } from '../middleware/HashId';

const participationRoutes = new Hono();
const participationController = new ParticipationController();

// Routes publiques (pas d'authentification requise)
// Participer à un quiz public depuis la liste (par ID crypté)
participationRoutes.post(
  '/quiz/:quiz_id', 
  hashIdMiddleware('quiz_id'),
  (c) => participationController.participerQuizPublic(c)
);

// Accéder à un quiz public via lien de partage
participationRoutes.post('/public/:lien_partage', (c) =>
  participationController.accederQuizPublic(c)
);

// Démarrer une participation avec code d'invitation
participationRoutes.post('/', (c) => participationController.demarrer(c));

// Récupérer une participation (ID crypté)
participationRoutes.get(
  '/:id',
  hashIdMiddleware('id'),
  (c) => participationController.getParticipation(c)
);

// Soumettre une réponse (IDs cryptés dans URL et body)
participationRoutes.post(
  '/:id/questions/:question_id/reponse',
  hashIdMiddleware('id', 'question_id'),
  hashIdBodyMiddleware('reponse_id'),
  (c) => participationController.soumettreReponse(c)
);

// Terminer une participation (ID crypté)
participationRoutes.post(
  '/:id/terminer',
  hashIdMiddleware('id'),
  (c) => participationController.terminer(c)
);

// Abandonner une participation
participationRoutes.post('/:id/abandonner', (c) => participationController.abandonner(c));

// Routes protégées (authentification requise)
participationRoutes.use('/mes-participations', authMiddleware);
participationRoutes.use('/quiz/*', authMiddleware);

// Mes participations (utilisateur authentifié)
participationRoutes.get('/mes-participations', (c) =>
  participationController.getMesParticipations(c)
);

// Participations d'un quiz (pour le créateur)
participationRoutes.get('/quiz/:quizId/participations', (c) =>
  participationController.getParticipationsByQuiz(c)
);

// Statistiques d'un quiz (pour le créateur)
participationRoutes.get('/quiz/:quizId/statistics', (c) =>
  participationController.getQuizStatistics(c)
);

export { participationRoutes };
