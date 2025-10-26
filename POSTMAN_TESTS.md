# Guide de Tests API - QuizLab

Ce guide contient tous les tests à effectuer sur l'API avec Postman.

---

## Démarrage du projet Backend

### Prérequis
- Node.js >= 18.0.0
- PostgreSQL
- npm ou yarn

### Installation et configuration

1. **Cloner le projet** (si ce n'est pas déjà fait)
```bash
git clone <url-du-repo>
cd ProjectQuiz
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Copier le fichier `.env.example` et le renommer en `.env` :
```bash
cp .env.example .env
```

Ensuite, modifier les valeurs dans le fichier `.env` selon votre configuration locale (notamment les identifiants de la base de données).

4. **Configurer la base de données**
```bash
# Générer le client Prisma
npm run db:generate

# Créer/mettre à jour le schéma de la base de données
npm run db:push

# OU créer une migration
npm run db:migrate

# Initialiser la base avec l'admin par défaut
npm run db:seed
```

5. **Démarrer le serveur en mode développement**
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Commandes disponibles

```bash
# Développement avec hot-reload
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Vérification TypeScript
npm run type-check

# Vérification TypeScript en continu
npm run type-check:watch

# Générer le client Prisma
npm run db:generate

# Mettre à jour la base de données
npm run db:push

# Créer une migration
npm run db:migrate

# Initialiser/Réinitialiser les données
npm run db:seed

# Interface graphique de la base de données
npm run db:studio
```

### Compte admin par défaut

Après l'exécution du seed (`npm run db:seed`), un compte admin est créé :
- **Email:** `admin@quizlab.com`
- **Password:** `Admin@1234`
- **Rôle:** `admin`

---

## Configuration Postman

### Variables d'environnement
Créez ces variables dans Postman :
- `base_url` : `http://localhost:3000`
- `token` : (sera automatiquement rempli après login)

---

## 1. AUTHENTIFICATION

### 1.1 Inscription (Register) - Succès

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "Test@1234"
}
```

**Réponse attendue (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "utilisateur": {
    "id": 1,
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@example.com",
    "role": "user"
  }
}
```

---

### 1.2 Inscription - Email déjà existant

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/register`

**Body (JSON):**
```json
{
  "prenom": "Marie",
  "nom": "Martin",
  "email": "jean.dupont@example.com",
  "password": "Test@5678"
}
```

**Réponse attendue (409):**
```json
{
  "success": false,
  "error": "Un utilisateur avec cet email existe déjà"
}
```

---

### 1.3 Inscription - Validation des champs

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/register`

**Body (JSON) - Prénom trop court:**
```json
{
  "prenom": "J",
  "nom": "Dupont",
  "email": "test@example.com",
  "password": "Test@1234"
}
```

**Réponse attendue (400):**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "prenom",
      "message": "Le prénom doit contenir au moins 2 caractères"
    }
  ]
}
```

---

### 1.4 Inscription - Mot de passe faible

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/register`

**Body (JSON):**
```json
{
  "prenom": "Test",
  "nom": "User",
  "email": "test2@example.com",
  "password": "test"
}
```

**Réponse attendue (400):**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins 8 caractères"
    }
  ]
}
```

---

### 1.5 Inscription - Email invalide

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/register`

**Body (JSON):**
```json
{
  "prenom": "Test",
  "nom": "User",
  "email": "email-invalide",
  "password": "Test@1234"
}
```

**Réponse attendue (400):**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "email",
      "message": "L'adresse email n'est pas valide"
    }
  ]
}
```

---

### 1.6 Connexion (Login) - Succès

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "jean.dupont@example.com",
  "password": "Test@1234"
}
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "utilisateur": {
    "id": 1,
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@example.com"
  }
}
```

**Note:** Le token JWT est envoyé dans un cookie HTTP-only.

---

### 1.7 Connexion - Email incorrect

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/login`

**Body (JSON):**
```json
{
  "email": "email.inexistant@example.com",
  "password": "Test@1234"
}
```

**Réponse attendue (401):**
```json
{
  "success": false,
  "error": "L'email est incorrect",
  "details": [
    {
      "field": "email",
      "message": "L'email est incorrect"
    }
  ]
}
```

---

### 1.8 Connexion - Mot de passe incorrect

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/login`

**Body (JSON):**
```json
{
  "email": "jean.dupont@example.com",
  "password": "MauvaisPassword@123"
}
```

**Réponse attendue (401):**
```json
{
  "success": false,
  "error": "Le mot de passe est incorrect",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe est incorrect"
    }
  ]
}
```

---

### 1.8b Connexion - Email et mot de passe incorrects

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/login`

**Body (JSON):**
```json
{
  "email": "email.inexistant@example.com",
  "password": "MauvaisPassword@123"
}
```

**Réponse attendue (401):**
```json
{
  "success": false,
  "error": "L'email et le mot de passe sont incorrects",
  "details": [
    {
      "field": "email",
      "message": "L'email est incorrect"
    },
    {
      "field": "password",
      "message": "Le mot de passe est incorrect"
    }
  ]
}
```

---

### 1.9 Connexion - Champs manquants

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/login`

**Body (JSON):**
```json
{
  "email": "jean.dupont@example.com"
}
```

**Réponse attendue (400):**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe est requis"
    }
  ]
}
```

---

## 2. UTILISATEURS

### 2.1 Récupérer un utilisateur par ID - Succès

**Endpoint:** `GET {{base_url}}/api/v1/utilisateurs/1`

**Headers:**
```
Content-Type: application/json
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "utilisateur": {
    "id": 1,
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@example.com",
    "statut": "actif",
    "role": "user"
  }
}
```

---

### 2.2 Récupérer un utilisateur - ID invalide

**Endpoint:** `GET {{base_url}}/api/v1/utilisateurs/abc`

**Réponse attendue (400):**
```json
{
  "success": false,
  "error": "ID invalide"
}
```

---

### 2.3 Récupérer un utilisateur - Utilisateur inexistant

**Endpoint:** `GET {{base_url}}/api/v1/utilisateurs/9999`

**Réponse attendue (404):**
```json
{
  "success": false,
  "error": "Utilisateur non trouvé"
}
```

---

## 3. RÔLES

### 3.1 Récupérer tous les rôles - Succès

**Endpoint:** `GET {{base_url}}/api/v1/utilisateurs/roles`

**Headers:**
```
Content-Type: application/json
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "roles": [
    {
      "id": 1,
      "libelle": "admin"
    },
    {
      "id": 2,
      "libelle": "user"
    }
  ]
}
```

**Note:** Les rôles sont maintenant des enums (`user` et `admin`) mais l'API retourne un format compatible pour l'affichage.

---

## 4. DÉCONNEXION

### 4.1 Déconnexion - Succès

**Endpoint:** `POST {{base_url}}/api/v1/utilisateurs/logout`

**Headers:**
```
Content-Type: application/json
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

**Note:** Le cookie JWT est supprimé.

---

## 5. SANTÉ DE L'API

### 5.1 Status de l'API

**Endpoint:** `GET {{base_url}}/`

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "QuizLab API",
  "version": "1.0.0",
  "status": "running"
}
```

---

### 5.2 Endpoint inexistant

**Endpoint:** `GET {{base_url}}/api/v1/endpoint-inexistant`

**Réponse attendue (404):**
```json
{
  "success": false,
  "message": "Endpoint non trouvé",
  "path": "/api/v1/endpoint-inexistant"
}
```

---

## 6. CAS DE TEST AVANCÉS

### 6.1 Inscription avec mot de passe sans majuscule

**Body:**
```json
{
  "prenom": "Test",
  "nom": "User",
  "email": "test3@example.com",
  "password": "test@1234"
}
```

**Erreur attendue:**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins une lettre majuscule"
    }
  ]
}
```

---

### 6.2 Inscription avec mot de passe sans chiffre

**Body:**
```json
{
  "prenom": "Test",
  "nom": "User",
  "email": "test4@example.com",
  "password": "Test@abcd"
}
```

**Erreur attendue:**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins un chiffre"
    }
  ]
}
```

---

### 6.3 Inscription avec mot de passe sans caractère spécial

**Body:**
```json
{
  "prenom": "Test",
  "nom": "User",
  "email": "test5@example.com",
  "password": "Test1234"
}
```

**Erreur attendue:**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins un caractère spécial"
    }
  ]
}
```

---

### 6.4 Inscription avec tous les champs manquants

**Body:**
```json
{}
```

**Erreur attendue (400):**
```json
{
  "success": false,
  "error": "Erreur de validation",
  "details": [
    {
      "field": "prenom",
      "message": "Le prénom est requis"
    },
    {
      "field": "nom",
      "message": "Le nom est requis"
    },
    {
      "field": "email",
      "message": "L'adresse email est requise"
    },
    {
      "field": "password",
      "message": "Le mot de passe est requis"
    }
  ]
}
```

---

## Tests Quiz

---

### 1. Créer un Quiz (POST) ✅

**URL:** `http://localhost:3000/api/v1/quizzes`

**Méthode:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Auth:** Bearer Token (utilisateur authentifié)

**Body:**
```json
{
  "titre": "Quiz JavaScript Débutant",
  "description": "Testez vos connaissances en JavaScript",
  "type_quiz": "instantane",
  "statut": "brouillon"
}
```

**Réponse attendue (201):**
```json
{
  "success": true,
  "message": "Quiz créé avec succès",
  "data": {
    "id": 1,
    "titre": "Quiz JavaScript Débutant",
    "description": "Testez vos connaissances en JavaScript",
    "type_quiz": "instantane",
    "lien_partage": "a1b2c3d4e5f6g7h8",
    "statut": "brouillon",
    "createur_id": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "deletedAt": null
  }
}
```

---

### 2. Obtenir tous les Quiz (GET) ✅

**URL:** `http://localhost:3000/api/v1/quizzes`

**Méthode:** `GET`

**Auth:** Bearer Token

**Réponse attendue (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titre": "Quiz JavaScript Débutant",
      "description": "Testez vos connaissances en JavaScript",
      "type_quiz": "instantane",
      "lien_partage": "a1b2c3d4e5f6g7h8",
      "statut": "brouillon",
      "createur_id": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### 3. Obtenir mes Quiz (GET) ✅

**URL:** `http://localhost:3000/api/v1/quizzes/mes-quiz`

**Méthode:** `GET`

**Auth:** Bearer Token

**Réponse attendue (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titre": "Quiz JavaScript Débutant",
      "description": "Testez vos connaissances en JavaScript",
      "type_quiz": "instantane",
      "lien_partage": "a1b2c3d4e5f6g7h8",
      "statut": "brouillon",
      "createur_id": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### 4. Obtenir un Quiz par ID (GET) ✅

**URL:** `http://localhost:3000/api/v1/quizzes/1`

**Méthode:** `GET`

**Auth:** Bearer Token

**Réponse attendue (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titre": "Quiz JavaScript Débutant",
    "description": "Testez vos connaissances en JavaScript",
    "type_quiz": "instantane",
    "lien_partage": "a1b2c3d4e5f6g7h8",
    "statut": "brouillon",
    "createur_id": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "deletedAt": null
  }
}
```

**Réponse en cas d'erreur (404):**
```json
{
  "success": false,
  "message": "Quiz non trouvé"
}
```

---

### 5. Obtenir un Quiz par lien de partage (GET) ⚡ Sans Auth

**URL:** `http://localhost:3000/api/v1/quizzes/partage/a1b2c3d4e5f6g7h8`

**Méthode:** `GET`

**Auth:** Aucune (accès public pour les participants)

**Réponse attendue (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titre": "Quiz JavaScript Débutant",
    "description": "Testez vos connaissances en JavaScript",
    "type_quiz": "instantane",
    "lien_partage": "a1b2c3d4e5f6g7h8",
    "statut": "publie",
    "createur_id": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "deletedAt": null
  }
}
```

---

### 6. Obtenir un Quiz avec ses Questions (GET) ⚡ Sans Auth

**URL:** `http://localhost:3000/api/v1/quizzes/1/questions`

**Méthode:** `GET`

**Auth:** Aucune (accès public)

**Réponse attendue (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titre": "Quiz JavaScript Débutant",
    "description": "Testez vos connaissances en JavaScript",
    "type_quiz": "instantane",
    "lien_partage": "a1b2c3d4e5f6g7h8",
    "statut": "publie",
    "createur_id": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "deletedAt": null,
    "questions": []
  }
}
```

---

### 7. Mettre à jour un Quiz (PUT) ✅

**URL:** `http://localhost:3000/api/v1/quizzes/1`

**Méthode:** `PUT`

**Headers:**
```
Content-Type: application/json
```

**Auth:** Bearer Token (créateur du quiz uniquement)

**Body:**
```json
{
  "titre": "Quiz JavaScript Intermédiaire",
  "description": "Niveau intermédiaire en JavaScript",
  "type_quiz": "programme",
  "statut": "publie"
}
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Quiz mis à jour avec succès",
  "data": {
    "id": 1,
    "titre": "Quiz JavaScript Intermédiaire",
    "description": "Niveau intermédiaire en JavaScript",
    "type_quiz": "programme",
    "lien_partage": "a1b2c3d4e5f6g7h8",
    "statut": "publie",
    "createur_id": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "deletedAt": null
  }
}
```

**Réponse en cas d'accès interdit (403):**
```json
{
  "success": false,
  "message": "Accès interdit"
}
```

---

### 8. Supprimer un Quiz (DELETE) ✅

**URL:** `http://localhost:3000/api/v1/quizzes/1`

**Méthode:** `DELETE`

**Auth:** Bearer Token (créateur du quiz uniquement)

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Quiz supprimé avec succès"
}
```

**Réponse en cas d'accès interdit (403):**
```json
{
  "success": false,
  "message": "Accès interdit"
}
```

---

### 9. Cas d'erreur - Validation du Quiz (POST)

**URL:** `http://localhost:3000/api/v1/quizzes`

**Méthode:** `POST`

**Auth:** Bearer Token

**Body:** (données invalides)
```json
{
  "titre": "AB",
  "type_quiz": "invalid_type"
}
```

**Réponse attendue (400):**
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "field": "titre",
      "message": "Le titre doit contenir au moins 3 caractères"
    },
    {
      "field": "type_quiz",
      "message": "Le type de quiz doit être \"instantane\" ou \"programme\""
    }
  ]
}
```

---

### 10. Cas d'erreur - Non authentifié (POST)

**URL:** `http://localhost:3000/api/v1/quizzes`

**Méthode:** `POST`

**Auth:** Aucune

**Body:**
```json
{
  "titre": "Quiz Test",
  "type_quiz": "instantane"
}
```

**Réponse attendue (401):**
```json
{
  "success": false,
  "message": "Token non fourni"
}
```

---

## Notes importantes

### Types de Quiz
- **instantane**: Les participants répondent en temps réel, question par question
- **programme**: Quiz planifié avec date/heure de début

### Statuts de Quiz
- **brouillon**: Quiz en cours de création, non accessible aux participants
- **publie**: Quiz publié et accessible via le lien de partage

### Permissions
- **Création**: Utilisateurs authentifiés uniquement
- **Lecture**: 
  - Liste des quiz: Authentification requise
  - Quiz spécifique par ID: Authentification requise
  - Quiz par lien de partage: Accès public (pour les participants)
  - Quiz avec questions: Accès public (pour les participants)
- **Modification/Suppression**: Créateur du quiz uniquement

### Lien de partage
- Généré automatiquement lors de la création du quiz
- Format: Chaîne hexadécimale de 32 caractères
- Permet aux participants sans compte d'accéder au quiz
- Le statut du quiz doit être "publie" pour être accessible via le lien

---

## Notes importantes

### Workflow de test recommandé
1. **D'abord**: Créer un compte utilisateur (Inscription)
2. **Ensuite**: Se connecter (Login) pour obtenir le cookie
3. **Puis**: Tester les endpoints protégés (création quiz, modification, suppression)
4. **Enfin**: Tester les endpoints publics (accès via lien de partage)

### Gestion des cookies dans Postman
- Les cookies sont automatiquement gérés par Postman
- Après le login, le cookie `token` est stocké automatiquement
- Il est envoyé automatiquement avec chaque requête suivante
- Pour se déconnecter, appelez l'endpoint Logout

### Codes d'erreur HTTP
- **200**: Succès
- **201**: Création réussie
- **400**: Erreur de validation (données invalides)
- **401**: Non authentifié (token manquant ou invalide)
- **403**: Accès interdit (pas les permissions nécessaires)
- **404**: Ressource non trouvée
- **500**: Erreur serveur

---

**Documentation créée pour les développeurs frontend** ✨
