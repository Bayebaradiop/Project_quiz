import { Hono } from 'hono';
import { QuestionController } from '../controllers/QuestionController';
import { ReponseController } from '../controllers/ReponseController';
import { authMiddleware } from '../middleware/Auth';
import { hashIdMiddleware } from '../middleware/HashId';

const questionsRoutes = new Hono();
const questionController = new QuestionController();
const reponseController = new ReponseController();

questionsRoutes.get('/questions', authMiddleware, questionController.getAll);

questionsRoutes.post('/questions/:questionId/reponses', authMiddleware, reponseController.create);
questionsRoutes.get('/questions/:questionId/reponses/next-ordre', authMiddleware, reponseController.getNextOrdre);
questionsRoutes.get('/questions/:questionId/reponses', reponseController.getAllByQuestionId);

questionsRoutes.get('/questions/:id', questionController.getById);
questionsRoutes.put('/questions/:id', authMiddleware, hashIdMiddleware('id'), questionController.update);
questionsRoutes.delete('/questions/:id', authMiddleware, hashIdMiddleware('id'), questionController.delete);

export default questionsRoutes;
