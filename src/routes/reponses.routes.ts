import { Hono } from 'hono';
import { ReponseController } from '../controllers/ReponseController';
import { authMiddleware } from '../middleware/Auth';

const reponsesRoutes = new Hono();
const reponseController = new ReponseController();

reponsesRoutes.get('/reponses', authMiddleware, reponseController.getAll);
reponsesRoutes.get('/reponses/:id', reponseController.getById);
reponsesRoutes.put('/reponses/:id', authMiddleware, reponseController.update);
reponsesRoutes.delete('/reponses/:id', authMiddleware, reponseController.delete);

export default reponsesRoutes;
