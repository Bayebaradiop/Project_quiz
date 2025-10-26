import { Hono } from 'hono';
import { QuizController } from '../controllers/QuizController';
import { authMiddleware } from '../middleware/Auth';

const quizzesRoutes = new Hono();
const quizController = new QuizController();

quizzesRoutes.post('/', authMiddleware, quizController.create);
quizzesRoutes.get('/', authMiddleware, quizController.getAll);
quizzesRoutes.get('/mes-quiz', authMiddleware, quizController.getAllByCreateur);
quizzesRoutes.get('/partage/:lien', quizController.getByLienPartage);
quizzesRoutes.get('/:id', authMiddleware, quizController.getById);
quizzesRoutes.get('/:id/questions', quizController.getWithQuestions);
quizzesRoutes.put('/:id', authMiddleware, quizController.update);
quizzesRoutes.delete('/:id', authMiddleware, quizController.delete);

export default quizzesRoutes;
