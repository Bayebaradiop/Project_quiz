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
