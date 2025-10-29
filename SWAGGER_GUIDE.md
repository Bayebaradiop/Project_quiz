# Documentation Swagger - QuizLab API

## Accès à la Documentation Interactive

### Interface Swagger UI

Une fois le serveur démarré, accédez à :

**URL :** http://localhost:3000/api-docs

Cette interface vous permet de :
- Voir tous les endpoints de l'API
- Tester les requêtes directement depuis le navigateur
- Voir les schémas de validation (request/response)
- Comprendre les codes de statut HTTP

---

## Démarrage

### 1. Installation

Les packages Swagger sont déjà installés :

```bash
npm install @hono/swagger-ui @hono/zod-openapi zod-openapi
```

### 2. Lancer le serveur

```bash
npm run dev
```

### 3. Accéder à Swagger

Ouvrir dans le navigateur :

```
http://localhost:3000/api-docs
```

---

## Utilisation de Swagger UI

### Interface Swagger

```
┌────────────────────────────────────────────────────────┐
│  QuizLab API - Swagger UI                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Authentification]  ▼                                 │
│    POST /api/v1/utilisateurs/register                  │
│    POST /api/v1/utilisateurs/login                     │
│                                                        │
│  [Quiz]  ▼                                             │
│    POST /api/v1/quizzes                    PROTEGE     │
│    GET  /api/v1/quizzes                    PROTEGE     │
│                                                        │
│  [Participations]  ▼                                   │
│    POST /api/v1/participations             PUBLIC      │
│    POST /api/v1/participations/reponses    PUBLIC      │
│    POST /api/v1/participations/terminer    PUBLIC      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Symboles

- **PUBLIC** - Pas d'authentification requise
- **PROTEGE** - Authentification requise (cookie)

---

## Tester un Endpoint

### Exemple : S'inscrire

1. **Cliquer sur** `POST /api/v1/utilisateurs/register`

2. **Cliquer sur** "Try it out"

3. **Modifier le JSON** :
   ```json
   {
     "nom": "Dupont",
     "prenom": "Jean",
     "email": "jean.dupont@example.com",
     "mot_de_passe": "SecurePass@123"
   }
   ```

4. **Cliquer sur** "Execute"

5. **Voir la réponse** :
   ```json
   {
     "success": true,
     "message": "Utilisateur créé avec succès",
     "data": {
       "id": 5,
       "nom": "Dupont",
       "prenom": "Jean",
       "email": "jean.dupont@example.com"
     }
   }
   ```

---

## Tester avec Authentification

### Étape 1 : Se connecter

1. **POST** `/api/v1/utilisateurs/login`
2. **Body** :
   ```json
   {
     "email": "jean.dupont@example.com",
     "mot_de_passe": "SecurePass@123"
   }
   ```
3. **Execute** → Le cookie est automatiquement stocké par le navigateur

### Étape 2 : Utiliser un endpoint protégé

1. **POST** `/api/v1/quizzes` [PROTEGE]
2. **Body** :
   ```json
   {
     "titre": "Quiz JavaScript",
     "description": "Test Swagger",
     "type_quiz": "instantane",
     "statut": "brouillon"
   }
   ```
3. **Execute** → Fonctionne car le cookie est envoyé automatiquement !

---

## Endpoints Documentés

### 1. Authentification (Public)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/utilisateurs/register` | POST | Inscription |
| `/api/v1/utilisateurs/login` | POST | Connexion |

### 2. Quiz (Protégé)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/quizzes` | POST | Créer quiz |
| `/api/v1/quizzes` | GET | Liste quiz (paginés) |

### 3. Participations (Public)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/participations` | POST | Démarrer quiz |
| `/api/v1/participations/reponses` | POST | Répondre |
| `/api/v1/participations/terminer` | POST | Terminer & score |

---

## Personnalisation

### Ajouter un nouvel endpoint

Modifier `src/config/swagger.simple.ts` :

```typescript
'/api/v1/votre-endpoint': {
  post: {
    tags: ['Catégorie'],
    summary: 'Description courte',
    description: 'Description détaillée',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['champ1', 'champ2'],
            properties: {
              champ1: { type: 'string', example: 'Exemple' },
              champ2: { type: 'number', example: 42 },
            },
          },
        },
      },
    },
    responses: {
      '200': { description: 'Succès' },
      '400': { description: 'Erreur validation' },
    },
  },
},
```

---

## Swagger vs Postman

| Critère | Swagger | Postman |
|---------|---------|---------|
| **Interface** | Web (navigateur) | Application desktop |
| **Tests** | Basique | Avancé (scripts, tests auto) |
| **Documentation** | Automatique | Manuel |
| **Partage** | URL simple | Export collection |
| **Idéal pour** | Démo, doc, tests rapides | Tests complets, automation |

---

## Recommandations

### Utilisez Swagger pour :
- Démontrer l'API à l'équipe frontend
- Tests rapides pendant le développement
- Documentation toujours à jour
- Onboarding nouveaux développeurs

### Utilisez Postman pour :
- Tests E2E complets (voir [GUIDE_TEST_COMPLET_POSTMAN.md](./GUIDE_TEST_COMPLET_POSTMAN.md))
- Scénarios complexes (8 sections documentées)
- Automation avec Newman
- Tests de régression

---

## Configuration Avancée

### Personnaliser l'interface Swagger

Dans `src/config/swagger.simple.ts` :

```typescript
app.get(
  '/api-docs',
  swaggerUI({
    url: '/api-docs.json',
    // Personnalisation
    theme: 'dark', // ou 'light'
    docExpansion: 'list', // 'none', 'list', 'full'
    defaultModelsExpandDepth: 1,
  })
);
```

### Exporter la spécification OpenAPI

```bash
curl http://localhost:3000/api-docs.json > openapi.json
```

Cette spec peut être :
- Importée dans Postman
- Utilisée pour générer du code client
- Partagée avec des partenaires

---

## Limitations

### Ce qui N'est PAS documenté dans Swagger

Pour une documentation complète, consulter :

1. **[GUIDE_TEST_COMPLET_POSTMAN.md](./GUIDE_TEST_COMPLET_POSTMAN.md)**
   - 8 sections complètes
   - Scénarios de test détaillés
   - Modification de réponses
   - Flux complets A-Z

2. **[ENDPOINTS_SECURITY.md](./ENDPOINTS_SECURITY.md)**
   - Liste complète des 32 endpoints
   - Règles de sécurité détaillées
   - Middleware Auth
   - Vérifications propriétaire

3. **[FLUX_UTILISATEURS.md](./FLUX_UTILISATEURS.md)**
   - Parcours utilisateurs complets
   - Diagrammes visuels
   - Métriques de conversion

---

## Ressources

### Liens Utiles

- **Swagger Editor** : https://editor.swagger.io/
- **OpenAPI Spec** : https://swagger.io/specification/
- **Hono + Swagger** : https://github.com/honojs/middleware/tree/main/packages/swagger-ui

### Documentation Projet

| Document | Lien |
|----------|------|
| Guide Test Complet | [GUIDE_TEST_COMPLET_POSTMAN.md](./GUIDE_TEST_COMPLET_POSTMAN.md) |
| Sécurité Endpoints | [ENDPOINTS_SECURITY.md](./ENDPOINTS_SECURITY.md) |
| Flux Utilisateurs | [FLUX_UTILISATEURS.md](./FLUX_UTILISATEURS.md) |
| Index Navigation | [INDEX.md](./INDEX.md) |

---

## Exemples d'Utilisation

### Scénario 1 : Nouveau développeur frontend

1. Ouvrir http://localhost:3000/api-docs
2. Explorer les endpoints disponibles
3. Tester l'inscription : `POST /utilisateurs/register`
4. Tester la connexion : `POST /utilisateurs/login`
5. Voir qu'un cookie est défini automatiquement
6. Tester création quiz : `POST /quizzes` (protégé)
7. Comprendre le flux en 10 minutes !

### Scénario 2 : Démonstration client

1. Partager le lien : http://your-server.com/api-docs
2. Le client peut tester directement dans son navigateur
3. Pas besoin d'installer Postman
4. Interface professionnelle et claire
5. Documentation toujours à jour avec le code

### Scénario 3 : Génération client SDK

```bash
# Exporter la spec
curl http://localhost:3000/api-docs.json > openapi.json

# Générer client TypeScript
npx @openapitools/openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-fetch \
  -o ./client-sdk
```

---

## Checklist de Configuration

- [x] Packages Swagger installés
- [x] Fichier `swagger.simple.ts` créé
- [x] Configuration intégrée dans `server.ts`
- [x] Endpoint `/api-docs.json` accessible
- [x] Interface UI `/api-docs` fonctionnelle
- [ ] Documenter tous les endpoints (32 au total)
- [ ] Ajouter exemples de réponses
- [ ] Tester avec authentification
- [ ] Partager URL avec l'équipe

---

## Avantages de Swagger dans QuizLab

### Pour les Développeurs
- Tests rapides sans Postman
- Documentation auto-générée
- Validation schémas en un coup d'œil

### Pour l'Équipe Frontend
- Voir les endpoints disponibles
- Comprendre les formats de données
- Tester sans backend local

### Pour les Product Managers
- Vue d'ensemble de l'API
- Démonstration facile aux clients
- Pas besoin de compétences techniques

### Pour les QA
- Tests exploratoires rapides
- Validation des schémas
- Complémentaire à Postman

---

**Documentation complète :** [INDEX.md](./INDEX.md)  
**Dernière mise à jour :** 28 octobre 2025  
**Version :** 1.0.0
