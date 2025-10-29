import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

/**
 * Configuration Swagger/OpenAPI pour l'API QuizLab
 */
export const createSwaggerApp = () => {
  const app = new OpenAPIHono();

  // Configuration OpenAPI
  app.doc('/doc', (c) => ({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'QuizLab API',
      description: `
# 🎯 API QuizLab - Documentation Interactive

API REST pour système de quiz avec questions à choix multiples (QCM).

## 🔒 Authentification

L'API utilise des **cookies httpOnly** avec JWT pour l'authentification.

### Endpoints PUBLICS ✅ (Sans authentification)
- Inscription & Connexion
- Consultation des quiz
- Participations complètes (démarrer, répondre, terminer)

### Endpoints PROTÉGÉS 🔒 (Authentification requise)
- Gestion des quiz (créer, modifier, supprimer)
- Gestion des questions
- Invitations
- Statistiques

## 📚 Documentation Complète

- [Guide de Test Complet](https://github.com/Bayebaradiop/Project_quiz/blob/feature/api-standardization/GUIDE_TEST_COMPLET_POSTMAN.md)
- [Sécurité des Endpoints](https://github.com/Bayebaradiop/Project_quiz/blob/feature/api-standardization/ENDPOINTS_SECURITY.md)
- [Flux Utilisateurs](https://github.com/Bayebaradiop/Project_quiz/blob/feature/api-standardization/FLUX_UTILISATEURS.md)

## 🚀 Démarrage Rapide

1. **S'inscrire** : POST /api/v1/utilisateurs/register
2. **Se connecter** : POST /api/v1/utilisateurs/login
3. **Créer un quiz** : POST /api/v1/quizzes (🔒 authentifié)
4. **Passer un quiz** : POST /api/v1/participations (✅ public)
      `,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'https://api.quizlab.com',
        description: 'Serveur de production',
      },
    ],
    tags: [
      {
        name: 'Authentification',
        description: '👤 Inscription, connexion, profil utilisateur',
      },
      {
        name: 'Quiz',
        description: '📝 Gestion des quiz (CRUD)',
      },
      {
        name: 'Questions',
        description: '❓ Gestion des questions et choix de réponses',
      },
      {
        name: 'Invitations',
        description: '✉️ Invitations aux quiz',
      },
      {
        name: 'Participations',
        description: '🎯 Passer un quiz, répondre, voir score',
      },
      {
        name: 'Statistiques',
        description: '📊 Résultats et statistiques des quiz',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'quiz_session',
          description: 'Cookie de session avec JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erreur lors de la requête' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                version: { type: 'string', example: '1.0.0' },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  }));

  // Interface Swagger UI
  app.get(
    '/ui',
    swaggerUI({
      url: '/doc',
    })
  );

  return app;
};
