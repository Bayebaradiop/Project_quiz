import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * Configuration Swagger/OpenAPI pour l'API QuizLab
 * 
 * Charge et sert la documentation OpenAPI depuis swagger.yaml
 */
export const createSwaggerApp = () => {
  const app = new Hono();

  // Charger le fichier swagger.yaml
  const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
  const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');
  const swaggerSpec = yaml.load(swaggerFile) as any;

  // Endpoint JSON de la spécification OpenAPI
  app.get('/api-docs.json', (c) => {
    return c.json(swaggerSpec);
  });

  // Interface Swagger UI
  app.get(
    '/api-docs',
    swaggerUI({
      url: '/api-docs.json',
    })
  );

  // Route pour servir directement le YAML
  app.get('/swagger.yaml', (c) => {
    c.header('Content-Type', 'application/x-yaml');
    return c.text(swaggerFile);
  });

  console.log('\n📚 Documentation Swagger disponible sur:');
  console.log('   - http://localhost:3000/api-docs (Interface UI)');
  console.log('   - http://localhost:3000/api-docs.json (JSON)');
  console.log('   - http://localhost:3000/swagger.yaml (YAML)\n');

  return app;
};

// Fonction pour créer les routes Swagger (compatibilité avec server.ts)
export const createSwaggerRoutes = (app: Hono) => {
  const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
  const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');
  const swaggerSpec = yaml.load(swaggerFile) as any;

  // Endpoint JSON de la spécification OpenAPI
  app.get('/api-docs.json', (c) => {
    return c.json(swaggerSpec);
  });

  // Interface Swagger UI
  app.get(
    '/api-docs',
    swaggerUI({
      url: '/api-docs.json',
    })
  );

  // Route pour servir directement le YAML
  app.get('/swagger.yaml', (c) => {
    c.header('Content-Type', 'application/x-yaml');
    return c.text(swaggerFile);
  });
};
