import { Hono } from 'hono';
import { UtilisateurController } from '../controllers/UtilisateurController';
import { authMiddleware } from '../middleware/Auth';

const utilisateurs = new Hono();
const utilisateurController = new UtilisateurController();


utilisateurs.post('/register', (c) => utilisateurController.register(c));

utilisateurs.post('/login', (c) => utilisateurController.login(c));

utilisateurs.get('/roles', (c) => utilisateurController.getAllRoles(c));

utilisateurs.post('/logout', authMiddleware, (c) => utilisateurController.logout(c));

utilisateurs.get('/:id', authMiddleware, (c) => utilisateurController.getUtilisateurById(c));

export default utilisateurs;