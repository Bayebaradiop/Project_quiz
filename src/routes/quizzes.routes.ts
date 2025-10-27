import { Hono } from 'hono';
import { QuizController } from '../controllers/QuizController';
import { QuestionController } from '../controllers/QuestionController';
import { authMiddleware } from '../middleware/Auth';

const quizzesRoutes = new Hono();
const quizController = new QuizController();
const questionController = new QuestionController();

quizzesRoutes.post('/', authMiddleware, quizController.create);
quizzesRoutes.get('/', authMiddleware, quizController.getAll);
quizzesRoutes.get('/mes-quiz', authMiddleware, quizController.getAllByCreateur);
quizzesRoutes.get('/partage/:lien', quizController.getByLienPartage);

quizzesRoutes.post('/:quizId/questions', authMiddleware, questionController.create);
quizzesRoutes.get('/:quizId/questions', questionController.getAllByQuizId);
quizzesRoutes.get('/:quizId/questions/next-ordre', authMiddleware, questionController.getNextOrdre);

quizzesRoutes.get('/:id', quizController.getById); // Public mais avec restrictions
quizzesRoutes.get('/:id/questions', quizController.getWithQuestions);
quizzesRoutes.put('/:id', authMiddleware, quizController.update);
quizzesRoutes.delete('/:id', authMiddleware, quizController.delete);

export default quizzesRoutes;
