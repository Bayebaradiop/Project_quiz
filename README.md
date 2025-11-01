## Génération automatique de questions de quiz via l'IA

Pour générer des questions automatiquement avec l'API OpenAI, utilisez le endpoint :

```
curl -X POST http://localhost:3000/api/v1/quizzes/{quizId}/generate-questions \
   -H "Content-Type: application/json" \
   -d '{"prompt": "Génère 5 questions à choix multiples sur le thème de la biologie."}'
```

Remplacez `{quizId}` par l'ID du quiz cible.
La réponse contiendra les questions générées par l'IA.
# QuizLab - Backend API

API REST pour système de quiz avec questions à choix multiples (QCM).

**📚 [INDEX DE LA DOCUMENTATION COMPLÈTE](./INDEX.md)** - Navigation par profil et sujet

---

## 📚 Documentation

### 🎯 Pour Démarrer Rapidement

1. **[TEST_POSTMAN_COMPLET.md](./TEST_POSTMAN_COMPLET.md)** ⭐ **NOUVEAU - TESTS POSTMAN A-Z**
   - Guide complet de test de l'application du début à la fin
   - 45+ tests couvrant tous les endpoints
   - Variables d'environnement automatiques
   - Scénarios réels : Créateur, Participant, Invitations, Statistiques
   - Collection Postman exportable

2. **[GUIDE_FRONTEND.md](./GUIDE_FRONTEND.md)** ⭐ **NOUVEAU - GUIDE FRONTEND**
   - API optimisée pour faciliter le travail frontend
   - Zéro logique côté client (backend fait tout)
   - Exemples de code prêts à l'emploi
   - Cas d'usage complets avec réponses JSON

3. **[SWAGGER_TEST_DATA.md](./SWAGGER_TEST_DATA.md)** ⭐ **TESTS SWAGGER**
   - Comptes de test avec mots de passe réels (seeder)
   - Exemples de données cohérents pour tous les endpoints
   - 7 scénarios complets de bout en bout
   - Interface interactive : http://localhost:3000/api-docs

4. **[GUIDE_TEST_COMPLET_POSTMAN.md](./GUIDE_TEST_COMPLET_POSTMAN.md)** 📘 **TESTS POSTMAN (ANCIEN)**
   - Guide complet de A à Z avec tous les endpoints
   - Tests Postman détaillés (8 sections)
   - Scénarios réels : Créateur, Participant avec/sans invitation
   - Format : Body, Headers, Réponses attendues

5. **[SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)** 📘 **DOCUMENTATION SWAGGER**
   - Interface interactive Swagger UI
   - Comptes de test disponibles
   - Contraintes de validation détaillées
   - Codes d'erreur HTTP complets

6. **[ENDPOINTS_SECURITY.md](./ENDPOINTS_SECURITY.md)** 🔒 **SÉCURITÉ**
   - Liste complète : Endpoints publics vs protégés
   - Règles d'authentification par endpoint
   - Vérifications de sécurité (propriétaire, etc.)
   - Recommandations d'implémentation

7. **[FLUX_UTILISATEURS.md](./FLUX_UTILISATEURS.md)** 🚶 **PARCOURS UX**
   - Flux A : Participant anonyme (sans compte)
   - Flux B : Créateur de quiz (avec compte)
   - Flux C : Conversion anonyme → créateur
   - Diagrammes visuels et métriques

### Pour l'équipe Frontend 👨‍💻

📖 **[GUIDE_FRONTEND.md](./GUIDE_FRONTEND.md)** - Guide complet d'intégration frontend
📖 **[README_FRONTEND_DEV.md](./README_FRONTEND_DEV.md)** - Guide d'intégration (ancien)

Ces fichiers contiennent :
- Vue d'ensemble de l'API
- Liens vers toute la documentation
- Exemples de code React/TypeScript
- API optimisée : Backend fait tout le travail
- Recommandations UX/UI
- Checklist d'intégration

### Documentation technique

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
   - Documentation technique de l'architecture
   - Structure des tables (Prisma)
   - Relations entre entités

2. **[tests/QuizLab_Postman_Collection.json](./tests/QuizLab_Postman_Collection.json)**
   - Collection Postman prête à l'emploi
   - Tests automatisés avec assertions

3. **[POSTMAN_TESTS.md](./POSTMAN_TESTS.md)**
   - Tests de base (référence vers GUIDE_TEST_COMPLET_POSTMAN.md)

---

## 🚀 Installation

### Prérequis
- Node.js >= 18.0.0
- PostgreSQL
- npm ou yarn

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Modifier le fichier .env avec vos paramètres

# 3. Configurer la base de données
npm run db:generate
npm run db:push
npm run db:seed

# 4. Démarrer le serveur
npm run dev
```

Le serveur démarre sur : **http://localhost:3000**

---

## 📦 Commandes disponibles

```bash
# Développement
npm run dev                    # Démarrer avec hot-reload
npm run build                  # Build pour production
npm start                      # Démarrer en production

# Base de données
npm run db:generate            # Générer le client Prisma
npm run db:push                # Mettre à jour le schéma
npm run db:migrate             # Créer une migration
npm run db:seed                # Initialiser les données
npm run db:studio              # Interface graphique de la BDD

# TypeScript
npm run type-check             # Vérifier les types
npm run type-check:watch       # Vérifier en continu
```

---

## 🔑 Comptes par défaut

Après `npm run db:seed` :

**Admin :**
- Email : `admin@quizlab.com`
- Password : `Admin@1234`

**Utilisateur :**
- Email : `user@quizlab.com`
- Password : `User@1234`

---

## 🎯 Fonctionnalités

### ✅ Authentification
- Inscription / Connexion / Déconnexion
- JWT dans cookies HTTP-only

### ✅ Quiz
- Création et gestion de quiz
- Statuts : brouillon / publié
- Lien de partage unique

### ✅ Questions à Choix Multiples
- Minimum 2 choix par question
- Au moins 1 choix correct obligatoire
- Ordre personnalisable

### ✅ Participations - 2 Modes
**Mode Invitation :**
- Envoi d'email avec code d'accès
- Code à durée limitée (30 jours)

**Mode Public :**
- Accès direct via lien de partage
- Participation anonyme

### ✅ Scoring Automatique
- Calcul du score à la fin
- Pourcentage de réussite
- Temps total de participation
- Détail des réponses avec correction

### ✅ Sécurité
- Champ `est_correcte` masqué pour les participants
- Validation Zod de toutes les données
- Protection CORS

---

## 🏗️ Architecture

```
ProjectQuiz/
├── prisma/
│   └── schema.prisma              # Schéma de base de données
├── src/
│   ├── app.ts                     # Point d'entrée
│   ├── server.ts                  # Configuration serveur
│   ├── config/                    # Configuration (env, jwt)
│   ├── controllers/               # Contrôleurs HTTP
│   ├── services/                  # Logique métier
│   ├── repositories/              # Accès base de données
│   ├── interfaces/                # Types TypeScript
│   ├── validations/               # Schémas Zod
│   ├── middleware/                # Middleware (auth)
│   ├── routes/                    # Routes API
│   └── utils/                     # Utilitaires
├── tests/
│   └── QuizLab_Postman_Collection.json
├── GUIDE_TESTS_COMPLET.md         # ⭐ Documentation principale
├── README_FRONTEND_DEV.md         # Guide pour frontend
└── API_DOCUMENTATION.md           # Documentation technique

```

---

## 🗄️ Base de données

### Modèles principaux

- **Utilisateur** : Gestion des comptes
- **Quiz** : Quiz avec titre, description, statut
- **Question** : Questions du quiz
- **ChoixReponse** : Choix de réponse pour chaque question
- **Invitation** : Invitations avec code d'accès
- **Participation** : Participation d'un utilisateur à un quiz
- **ReponseParticipant** : Réponses soumises par les participants

### Relations

```
Quiz
  ├── Questions (1-N)
  │     └── ChoixReponses (1-N)
  ├── Invitations (1-N)
  └── Participations (1-N)
        └── ReponsesParticipants (1-N)
```

---

## 🔒 Sécurité

### Authentification
- JWT stocké dans cookie HTTP-only
- Expiration : 24h
- Refresh automatique à chaque requête

### Validation
- Toutes les entrées validées par Zod
- Messages d'erreur détaillés

### Masquage des données sensibles
- Champ `est_correcte` automatiquement supprimé des réponses API pour les participants

### CORS
- Configuré pour autoriser les domaines frontend

---

## 🧪 Tests

### Postman

```bash
# 1. Importer la collection
tests/QuizLab_Postman_Collection.json

# 2. Configurer l'environnement
base_url = http://localhost:3000

# 3. Exécuter les tests
Run Collection
```

### Tests manuels

Suivre le **GUIDE_TESTS_COMPLET.md** pour tester tous les endpoints.

---

## 📊 Stack Technique

- **Runtime :** Node.js 18+
- **Framework :** Hono v4.10.2
- **Base de données :** PostgreSQL
- **ORM :** Prisma v6.18.0
- **Validation :** Zod v3.24.0
- **Auth :** JWT (jsonwebtoken v9.0.2)
- **Email :** Nodemailer v6.10.1
- **TypeScript :** v5.7.3

---

## 🌐 Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/quizlab"

# JWT
JWT_SECRET="votre-secret-jwt"
JWT_EXPIRES_IN="24h"

# Email (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASS="votre-mot-de-passe-app"

# Serveur
PORT=3000
NODE_ENV="development"
```

---

## 📝 Changelog

### Version 1.0.0 (26 octobre 2025)

**Nouvelles fonctionnalités :**
- ✅ Système de questions à choix multiples (QCM)
- ✅ Modèle `ChoixReponse` pour les options de réponse
- ✅ Sécurité : masquage automatique du champ `est_correcte`
- ✅ Deux modes de participation :
  - Mode invitation avec code d'accès par email
  - Mode public avec lien de partage direct
- ✅ Calcul automatique du score
- ✅ Envoi automatique d'emails d'invitation
- ✅ Détail complet des résultats avec correction

**Modifications de la base de données :**
- Suppression des champs `options` (JSON) et `bonne_reponse` du modèle `Question`
- Ajout du modèle `ChoixReponse` avec relation 1-N vers `Question`
- Modification du modèle `ReponseParticipant` : `reponse_id` → `choix_reponse_id`

---

## 👥 Contribution

### Branches

- `main` : Production
- `dev/participation-v1.0.0` : Développement en cours

### Workflow

```bash
# 1. Créer une branche
git checkout -b feature/nom-feature

# 2. Faire vos modifications
git add .
git commit -m "Description des changements"

# 3. Pousser la branche
git push origin feature/nom-feature

# 4. Créer une Pull Request
```

---

## 📞 Support

- **Email :** dev@quizlab.com
- **Documentation :** [GUIDE_TESTS_COMPLET.md](./GUIDE_TESTS_COMPLET.md)
- **Issues :** GitHub Issues

---

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

**Développé avec ❤️ par l'équipe QuizLab**
