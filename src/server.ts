import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ENV, validateEnv } from './config/env.config';
import utilisateursRoutes from './routes/utilisateurs.routes';

validateEnv();

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: ENV.NODE_ENV === 'production'
    ? ['https://votredomaine.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'QuizLab API',
    version: '1.0.0',
    status: 'running',
  });
});

app.route('/api/v1/utilisateurs', utilisateursRoutes);

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