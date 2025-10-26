import { Hono } from 'hono';
import { QuestionController } from '../controllers/QuestionController';
import { authMiddleware } from '../middleware/Auth';

const questionsRoutes = new Hono();
const questionController = new QuestionController();

questionsRoutes.get('/questions', authMiddleware, questionController.getAll);
questionsRoutes.get('/questions/:id', questionController.getById);
questionsRoutes.get('/questions/:id/reponses', questionController.getWithReponses);
questionsRoutes.put('/questions/:id', authMiddleware, questionController.update);
questionsRoutes.delete('/questions/:id', authMiddleware, questionController.delete);

export default questionsRoutes;
