import { Hono } from 'hono';
import { ParticipationController } from '../controllers/ParticipationController';
import { authMiddleware } from '../middleware/Auth';

const participationRoutes = new Hono();
const participationController = new ParticipationController();

// Routes publiques (pas d'authentification requise)
// Accéder à un quiz public via lien de partage
participationRoutes.post('/public/:lien_partage', (c) =>
  participationController.accederQuizPublic(c)
);

// Démarrer une participation (authentifié ou anonyme)
participationRoutes.post('/', (c) => participationController.demarrer(c));

// Soumettre une réponse
participationRoutes.post('/reponses', (c) => participationController.soumettreReponse(c));

// Terminer une participation
participationRoutes.post('/terminer', (c) => participationController.terminer(c));

// Abandonner une participation
participationRoutes.post('/:id/abandonner', (c) => participationController.abandonner(c));

// Récupérer une participation
participationRoutes.get('/:id', (c) => participationController.getParticipation(c));

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
