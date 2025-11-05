import { Hono } from 'hono';
import { QuizController } from '../controllers/QuizController';
import { QuestionController } from '../controllers/QuestionController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/Auth';
import { hashIdMiddleware } from '../middleware/HashId';
import { generateQuestionsHandler } from '../controllers/QuizAIController';
import { generateFromDocument } from '../controllers/DocumentQuizController';

const quizzesRoutes = new Hono();
const quizController = new QuizController();
const questionController = new QuestionController();

// ==================== ENDPOINTS PROTÉGÉS (authentification requise) ====================
//  IMPORTANT: Routes spécifiques AVANT les routes dynamiques /:id
quizzesRoutes.get('/mes-quiz', authMiddleware, quizController.getAllByCreateur); // Mes quiz avec TOUTES les infos
quizzesRoutes.post('/mes-quiz', authMiddleware, quizController.create); //  Créer quiz

// � Création manuelle de questions (disponible en parallèle de l'IA)
quizzesRoutes.post('/:quizId/questions', authMiddleware, hashIdMiddleware('quizId'), questionController.create); // 🔒 Ajouter question manuellement

quizzesRoutes.get('/:quizId/questions/next-ordre', authMiddleware, hashIdMiddleware('quizId'), questionController.getNextOrdre); // 🔒 Ordre suivant
quizzesRoutes.put('/:id', authMiddleware, hashIdMiddleware('id'), quizController.update); // 🔒 Modifier quiz
quizzesRoutes.patch('/:id/publier', authMiddleware, hashIdMiddleware('id'), quizController.publier); // 🔒 Publier quiz
quizzesRoutes.delete('/:id', authMiddleware, hashIdMiddleware('id'), quizController.delete); // 🔒 Supprimer quiz

// ==================== ENDPOINTS PUBLICS (sans authentification) ====================
quizzesRoutes.get('/', quizController.getAll); // ✅ PUBLIC: Liste quiz publiés (SANS bonnes réponses, invitations, participations)
quizzesRoutes.get('/partage/:lien', quizController.getByLienPartage); // ✅ PUBLIC: Quiz par lien
quizzesRoutes.get('/:id', hashIdMiddleware('id'), quizController.getById); // ✅ PUBLIC: Détails d'un quiz
quizzesRoutes.get('/:id/questions', hashIdMiddleware('id'), quizController.getWithQuestions); // ✅ PUBLIC: Quiz avec questions
quizzesRoutes.get('/:quizId/questions', hashIdMiddleware('quizId'), questionController.getAllByQuizId); // ✅ PUBLIC: Questions d'un quiz
quizzesRoutes.post('/:quizId/generate-questions', authMiddleware, hashIdMiddleware('quizId'), generateQuestionsHandler); // 🔒 Générer questions d'un quiz
quizzesRoutes.post('/:quizId/generate-from-document', authMiddleware, hashIdMiddleware('quizId'), generateFromDocument); // 🔒 Générer questions depuis un document

export default quizzesRoutes;
