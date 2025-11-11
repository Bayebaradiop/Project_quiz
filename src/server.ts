import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ENV, validateEnv } from './config/env.config';
import { autoEncodeIdsMiddleware } from './middleware/HashId';
import utilisateursRoutes from './routes/utilisateurs.routes';
import quizzesRoutes from './routes/quizzes.routes';
import questionsRoutes from './routes/questions.routes';
import reponsesRoutes from './routes/reponses.routes';
import { invitationRoutes } from './routes/invitations.routes';
import { participationRoutes } from './routes/participations.routes';
import { createSwaggerRoutes } from './config/swagger.config';

validateEnv();

const app = new Hono();

app.use('*', logger());

const allowedOrigins = ENV.NODE_ENV === 'production'
  ? ['https://senquiz.netlify.app', 'http://195.35.48.54:8200','http://localhost:4200','https://quizzboard.jgohub.com']
  : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173', 'http://senquiz.netlify.app'];

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return allowedOrigins[0];
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Set-Cookie'],
}));

app.use('/api/v1/*', autoEncodeIdsMiddleware);

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'QuizLab API',
    version: '1.0.0',
    status: 'running',
    documentation: {
      swagger: 'http://localhost:3000/api-docs',
      postman: 'https://github.com/Bayebaradiop/Project_quiz/blob/feature/api-standardization/GUIDE_TEST_COMPLET_POSTMAN.md',
    },
  });
});

// Documentation Swagger
createSwaggerRoutes(app);

app.route('/api/v1/utilisateurs', utilisateursRoutes);
app.route('/api/v1/quizzes', quizzesRoutes);
app.route('/api/v1', questionsRoutes);
app.route('/api/v1', reponsesRoutes);
app.route('/api/v1/invitations', invitationRoutes);
app.route('/api/v1/participations', participationRoutes);

app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Endpoint non trouvé',
    path: c.req.path,
  }, 404);
});

app.onError((err, c) => {
  console.error('Erreur:', err);
  return c.json({
    success: false,
    message: ENV.NODE_ENV === 'development' ? err.message : 'Erreur interne',
  }, 500);
});

console.log(`🚀 Serveur: http://localhost:${ENV.PORT}`);

export default {
  port: ENV.PORT,
  fetch: app.fetch,
};