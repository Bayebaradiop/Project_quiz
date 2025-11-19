import { Hono } from 'hono';
import { QuestionController } from '../controllers/QuestionController';
import { authMiddleware } from '../middleware/Auth';
import { hashIdMiddleware } from '../middleware/HashId';

const questionsRoutes = new Hono();
const questionController = new QuestionController();

questionsRoutes.get('/questions', authMiddleware, questionController.getAll);

questionsRoutes.get('/questions/:id', questionController.getById);
questionsRoutes.put('/questions/:id', authMiddleware, hashIdMiddleware('id'), questionController.update);
questionsRoutes.delete('/questions/:id', authMiddleware, hashIdMiddleware('id'), questionController.delete);

export default questionsRoutes;
