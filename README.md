# 🎯 QuizLab Backend API

API RESTful versionnée avec authentification JWT et cookies HTTP-only, construite avec **Hono**, **Prisma** et **PostgreSQL**.

## ✨ Fonctionnalités

- ✅ **Authentification JWT** avec cookies HTTP-only sécurisés
- ✅ **API RESTful** versionnée (v1)
- ✅ **Architecture en couches** (Controller → Service → Repository)
- ✅ **Validation des données** avec Zod
- ✅ **TypeScript** strict
- ✅ **Prisma ORM** pour PostgreSQL
- ✅ **Middleware d'authentification** et de rôles
- ✅ **Gestion des erreurs** centralisée
- ✅ **CORS** configuré
- ✅ **Soft delete** pour les utilisateurs

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 18
- PostgreSQL >= 13
- npm ou yarn

### Installation

1. **Cloner et installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Puis éditer `.env` avec vos configurations.

3. **Configurer la base de données**
   ```bash
   # Générer le client Prisma
   npm run db:generate

   # Appliquer le schéma à la base de données
   npm run db:push

   # Ou créer une migration
   npm run db:migrate
   ```

4. **Démarrer le serveur**
   ```bash
   # Mode développement (avec hot reload)
   npm run dev

   # Mode production
   npm run build
   npm start
   ```

Le serveur démarre sur `http://localhost:3000`

## 📁 Structure du projet

```
src/
├── config/               # Configuration (JWT, environnement, etc.)
│   ├── env.config.ts    # Variables d'environnement
│   └── jwt.config.ts    # Configuration JWT
│
├── controllers/          # Contrôleurs (gestion des requêtes/réponses)
│   ├── AuthController.ts
│   └── UtilisateurController.ts
│
├── interfaces/           # Interfaces TypeScript
│   └── UtilisateurInterface.ts
│
├── middleware/           # Middlewares personnalisés
│   └── Auth.ts          # Authentification et autorisation
│
├── repositories/         # Couche d'accès aux données (Prisma)
│   └── UtilisateurRepository.ts
│
├── routes/              # Routes API versionnées
│   └── v1/
│       ├── index.ts             # Point d'entrée v1
│       ├── auth.routes.ts       # Routes d'authentification
│       └── utilisateurs.routes.ts # Routes utilisateurs
│
├── services/            # Logique métier
│   ├── AuthService.ts
│   └── Utilisateur.Service.ts
│
├── types/               # Types TypeScript personnalisés
│   └── auth.types.ts
│
├── utils/               # Fonctions utilitaires
│   ├── jwt.utils.ts     # Gestion des JWT
│   └── password.utils.ts # Hashage des mots de passe
│
├── validations/         # Schémas de validation Zod
│   ├── Auth.validator.ts
│   └── erreurs_messages/
│       └── Message.error.ts
│
├── app.ts              # Point d'entrée de l'application
└── server.ts           # Configuration du serveur Hono
```

## 🔐 Authentification

L'API utilise **JWT avec cookies HTTP-only** pour une sécurité maximale contre les attaques XSS.

### Cookies utilisés

- `access_token` : Token d'accès (durée : 1h)
- `refresh_token` : Token de rafraîchissement (durée : 7j)

### Sécurité

- 🔒 Cookies HTTP-only (protection XSS)
- 🔒 SameSite configuré (protection CSRF)
- 🔒 Secure en production (HTTPS uniquement)
- 🔒 Mots de passe hashés avec bcrypt (10 rounds)
- 🔒 Validation stricte des entrées avec Zod

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/register` | Inscription | ❌ |
| POST | `/auth/login` | Connexion | ❌ |
| POST | `/auth/logout` | Déconnexion | ✅ |
| POST | `/auth/refresh` | Rafraîchir le token | 🔄 |
| GET | `/auth/me` | Profil utilisateur | ✅ |

### Utilisateurs

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/utilisateurs/me` | Mon profil | ✅ | Tous |
| GET | `/utilisateurs` | Liste utilisateurs | ✅ | Admin |
| GET | `/utilisateurs/:id` | Utilisateur par ID | ✅ | Admin |
| GET | `/utilisateurs/role/:roleId` | Par rôle | ✅ | Admin |
| GET | `/utilisateurs/statut/:statut` | Par statut | ✅ | Admin |
| PUT | `/utilisateurs/:id` | Modifier | ✅ | Admin |
| DELETE | `/utilisateurs/:id` | Supprimer | ✅ | Admin |

Légende :
- ✅ : Authentification requise
- 🔄 : Refresh token requis
- ❌ : Public

## 📝 Exemples d'utilisation

### Inscription
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "John",
    "nom": "Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Accéder à une route protégée
```bash
curl http://localhost:3000/api/v1/auth/me \
  -b cookies.txt
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Développement avec hot reload
npm run build        # Build de production
npm start            # Démarrer en production
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma vers la DB
npm run db:migrate   # Créer une migration
npm run db:studio    # Ouvrir Prisma Studio
```

## 🔒 Rôles et Permissions

### Rôles disponibles

- **Admin** (role_id: 1)
  - Accès complet à tous les endpoints
  - Gestion des utilisateurs
  - Accès aux statistiques

- **Utilisateur** (role_id: 2)
  - Accès aux endpoints publics
  - Gestion de son propre profil
  - Participation aux quiz

## 📊 Modèle de données

### Utilisateur
```typescript
{
  id: number
  prenom: string
  nom: string
  email: string (unique)
  password: string (hashé)
  statut: 'actif' | 'inactif'
  role_id: number
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime? (soft delete)
}
```

## 🛠️ Technologies utilisées

- **[Hono](https://hono.dev/)** - Framework web ultra-rapide
- **[Prisma](https://www.prisma.io/)** - ORM TypeScript moderne
- **[PostgreSQL](https://www.postgresql.org/)** - Base de données relationnelle
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[Zod](https://zod.dev/)** - Validation de schémas
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - Gestion JWT
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hashage de mots de passe

## 🌍 Variables d'environnement

Voir `.env.example` pour la liste complète.

### Essentielles

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET="votre_secret_jwt_securise"
JWT_REFRESH_SECRET="votre_refresh_secret_securise"
PORT=3000
NODE_ENV="development"
```

### Production

```env
NODE_ENV="production"
COOKIE_SECURE="true"
COOKIE_DOMAIN="votredomaine.com"
```

## 📖 Documentation complète

Voir [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour la documentation détaillée de l'API.

## 🧪 Tests

```bash
# À venir
npm test
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT

---

Développé avec ❤️ par l'équipe QuizLab
# Project_quiz
