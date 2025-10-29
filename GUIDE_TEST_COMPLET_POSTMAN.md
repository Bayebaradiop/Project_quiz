# 📚 Guide de Test Complet - API QuizLab

## 🎯 Vue d'ensemble

Ce guide couvre **TOUS** les endpoints de l'API du début à la fin avec des scénarios réels de test pour Postman.

**Serveur :** `http://localhost:3000`  
**Version API :** v1.0.0  
**Branch :** feature/api-standardization

---

## 📋 Table des Matières

1. [Authentification & Utilisateurs](#1-authentification--utilisateurs)
2. [Gestion des Quiz](#2-gestion-des-quiz)
3. [Gestion des Questions](#3-gestion-des-questions)
4. [Invitations](#4-invitations)
5. [Participations AVEC Invitation](#5-participations-avec-invitation)
6. [Participations SANS Invitation](#6-participations-sans-invitation)
7. [Modification de Réponses](#7-modification-de-réponses-en-cours)
8. [Statistiques & Résultats](#8-statistiques--résultats)

**📖 Documents complémentaires :**
- [🔒 Sécurité des Endpoints (ENDPOINTS_SECURITY.md)](./ENDPOINTS_SECURITY.md) - Documentation détaillée de la sécurité
- [📋 Récapitulatif Endpoints (ENDPOINTS_RECAP.md)](./ENDPOINTS_RECAP.md) - Vue d'ensemble rapide publics vs protégés
- [🚶 Flux Utilisateurs (FLUX_UTILISATEURS.md)](./FLUX_UTILISATEURS.md) - Parcours utilisateurs complets

---

## 1. Authentification & Utilisateurs

### 1.1 Inscription d'un nouvel utilisateur

```http
POST http://localhost:3000/api/v1/utilisateurs/register
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "mot_de_passe": "SecurePass@123"
}
```

**Résultat attendu :**
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

**⚠️ Note :** Copiez l'ID de l'utilisateur pour les tests suivants.

---

### 1.2 Connexion

```http
POST http://localhost:3000/api/v1/utilisateurs/login
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "mot_de_passe": "SecurePass@123"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "utilisateur": {
      "id": 5,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com"
    }
  }
}
```

**🔑 IMPORTANT :** Dans Postman, allez dans l'onglet **Cookies** et copiez le cookie de session. Vous devez l'inclure dans toutes les requêtes authentifiées suivantes.

---

### 1.3 Obtenir le profil de l'utilisateur connecté

```http
GET http://localhost:3000/api/v1/utilisateurs/me
Cookie: [Coller le cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "createdAt": "2025-10-27T..."
  }
}
```

---

### 1.4 Déconnexion

```http
POST http://localhost:3000/api/v1/utilisateurs/logout
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

## 2. Gestion des Quiz

### 2.1 Créer un nouveau quiz (authentifié)

```http
POST http://localhost:3000/api/v1/quizzes
Content-Type: application/json
Cookie: [Cookie de session]

{
  "titre": "Quiz JavaScript Avancé",
  "description": "Testez vos connaissances en JavaScript ES6+",
  "type_quiz": "instantane",
  "statut": "brouillon"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Quiz créé avec succès",
  "data": {
    "id": 8,
    "titre": "Quiz JavaScript Avancé",
    "description": "Testez vos connaissances en JavaScript ES6+",
    "type_quiz": "instantane",
    "statut": "brouillon",
    "lien_partage": "xyz123abc...",
    "nb_questions": 0,
    "duree_totale": 0,
    "createur": {
      "id": 5,
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@example.com"
    },
    "questions": [],
    "participations": [],
    "createdAt": "2025-10-27T...",
    "updatedAt": "2025-10-27T...",
    "statistiques": {
      "nb_participations": 0,
      "nb_invitations": 0,
      "taux_reussite": 0,
      "temps_moyen": 0
    }
  }
}
```

**📝 Note :** Copiez l'ID du quiz (ex: 8) pour les étapes suivantes.

---

### 2.2 Obtenir tous les quiz (paginés)

```http
GET http://localhost:3000/api/v1/quizzes?page=1&limit=10
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "titre": "Quiz JavaScript Avancé",
      "description": "Testez vos connaissances en JavaScript ES6+",
      "type_quiz": "prive",
      "statut": "brouillon",
      "lien_partage": null,
      "nb_questions": 0,
      "duree_totale": 0,
      "nb_participations": 0,
      "createur": {
        "id": 5,
        "prenom": "Jean",
        "nom": "Dupont",
        "email": "jean.dupont@example.com"
      },
      "questions": [],
      "createdAt": "2025-10-27T...",
      "updatedAt": "2025-10-27T..."
    }
  ],
  "meta": {
    "timestamp": "2025-10-27T...",
    "version": "1.0.0"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 2.3 Obtenir un quiz par ID

```http
GET http://localhost:3000/api/v1/quizzes/8
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "titre": "Quiz JavaScript Avancé",
    "description": "Testez vos connaissances en JavaScript ES6+",
    "type_quiz": "prive",
    "statut": "brouillon",
    "lien_partage": null,
    "nb_questions": 0,
    "duree_totale": 0,
    "nb_participations": 0,
    "createur": {
      "id": 5,
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@example.com"
    },
    "questions": [],
    "createdAt": "2025-10-27T...",
    "updatedAt": "2025-10-27T..."
  },
  "meta": {
    "timestamp": "2025-10-27T...",
    "version": "1.0.0"
  }
}
```

---

### 2.4 Obtenir mes quiz (quiz créés par moi)

```http
GET http://localhost:3000/api/v1/quizzes/mes-quiz
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "titre": "Quiz JavaScript Avancé",
      "statut": "brouillon",
      "nb_questions": 0,
      "nb_participations": 0,
      "questions": [],
      "participations": [],
      "createdAt": "2025-10-27T..."
    }
  ]
}
```

---

### 2.5 Mettre à jour un quiz

```http
PUT http://localhost:3000/api/v1/quizzes/8
Content-Type: application/json
Cookie: [Cookie de session]

{
  "titre": "Quiz JavaScript ES6+ Complet",
  "description": "Quiz mis à jour avec plus de détails",
  "type_quiz": "instantane",
  "statut": "brouillon"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Quiz mis à jour avec succès",
  "data": {
    "id": 8,
    "titre": "Quiz JavaScript ES6+ Complet",
    "description": "Quiz mis à jour avec plus de détails",
    "type_quiz": "public",
    "statut": "brouillon"
  }
}
```

---

## 3. Gestion des Questions

### 3.1 Ajouter une question au quiz

```http
POST http://localhost:3000/api/v1/quizzes/8/questions
Content-Type: application/json
Cookie: [Cookie de session]

{
  "texte": "Quelle est la différence entre let et var en JavaScript ?",
  "duree": 30,
  "ordre": 1,
  "choix_reponses": [
    {
      "texte": "Aucune différence",
      "est_correcte": false,
      "ordre": 1
    },
    {
      "texte": "let a une portée de bloc, var a une portée de fonction",
      "est_correcte": true,
      "ordre": 2
    },
    {
      "texte": "var est obsolète, let est moderne",
      "est_correcte": false,
      "ordre": 3
    }
  ]
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Question ajoutée avec succès",
  "data": {
    "id": 19,
    "texte": "Quelle est la différence entre let et var en JavaScript ?",
    "duree": 30,
    "ordre": 1,
    "quiz_id": 8,
    "choix_reponses": [
      {
        "id": 67,
        "texte": "Aucune différence",
        "est_correcte": false,
        "ordre": 1
      },
      {
        "id": 68,
        "texte": "let a une portée de bloc, var a une portée de fonction",
        "est_correcte": true,
        "ordre": 2
      },
      {
        "id": 69,
        "texte": "var est obsolète, let est moderne",
        "est_correcte": false,
        "ordre": 3
      }
    ]
  }
}
```

**📝 Note :** Copiez l'ID de la question (19) et les IDs des choix (67, 68, 69).

---

### 3.2 Ajouter une deuxième question

```http
POST http://localhost:3000/api/v1/quizzes/8/questions
Content-Type: application/json
Cookie: [Cookie de session]

{
  "texte": "Qu'est-ce qu'une Promise en JavaScript ?",
  "duree": 45,
  "ordre": 2,
  "choix_reponses": [
    {
      "texte": "Une fonction synchrone",
      "est_correcte": false,
      "ordre": 1
    },
    {
      "texte": "Un objet représentant une opération asynchrone",
      "est_correcte": true,
      "ordre": 2
    },
    {
      "texte": "Un type de variable",
      "est_correcte": false,
      "ordre": 3
    }
  ]
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Question ajoutée avec succès",
  "data": {
    "id": 20,
    "texte": "Qu'est-ce qu'une Promise en JavaScript ?",
    "duree": 45,
    "ordre": 2,
    "quiz_id": 8,
    "choix_reponses": [...]
  }
}
```

---

### 3.3 Ajouter une troisième question

```http
POST http://localhost:3000/api/v1/quizzes/8/questions
Content-Type: application/json
Cookie: [Cookie de session]

{
  "texte": "Que fait l'opérateur spread (...) en JavaScript ?",
  "duree": 30,
  "ordre": 3,
  "choix_reponses": [
    {
      "texte": "Supprime des éléments d'un tableau",
      "est_correcte": false,
      "ordre": 1
    },
    {
      "texte": "Étend les éléments d'un itérable",
      "est_correcte": true,
      "ordre": 2
    },
    {
      "texte": "Crée une boucle",
      "est_correcte": false,
      "ordre": 3
    }
  ]
}
```

---

### 3.4 Obtenir toutes les questions d'un quiz

```http
GET http://localhost:3000/api/v1/quizzes/8/questions
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "id": 19,
      "texte": "Quelle est la différence entre let et var en JavaScript ?",
      "duree": 30,
      "ordre": 1,
      "choix_reponses": [...]
    },
    {
      "id": 20,
      "texte": "Qu'est-ce qu'une Promise en JavaScript ?",
      "duree": 45,
      "ordre": 2,
      "choix_reponses": [...]
    },
    {
      "id": 21,
      "texte": "Que fait l'opérateur spread (...) en JavaScript ?",
      "duree": 30,
      "ordre": 3,
      "choix_reponses": [...]
    }
  ]
}
```

---

### 3.5 Mettre à jour une question

```http
PUT http://localhost:3000/api/v1/quizzes/8/questions/19
Content-Type: application/json
Cookie: [Cookie de session]

{
  "texte": "Quelle est la principale différence entre let et var ?",
  "duree": 25,
  "ordre": 1
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Question mise à jour avec succès",
  "data": {
    "id": 19,
    "texte": "Quelle est la principale différence entre let et var ?",
    "duree": 25,
    "ordre": 1
  }
}
```

---

### 3.6 Supprimer une question

```http
DELETE http://localhost:3000/api/v1/quizzes/8/questions/21
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Question supprimée avec succès"
}
```

---

### 3.7 Publier le quiz

```http
PUT http://localhost:3000/api/v1/quizzes/8
Content-Type: application/json
Cookie: [Cookie de session]

{
  "statut": "publie"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Quiz mis à jour avec succès",
  "data": {
    "id": 8,
    "statut": "publie"
  }
}
```

---

## 4. Invitations

### 4.1 Créer une invitation pour un participant

```http
POST http://localhost:3000/api/v1/invitations/quizzes/8/invitations
Content-Type: application/json
Cookie: [Cookie de session]

{
  "email": "participant1@example.com",
  "nom": "Martin",
  "prenom": "Sophie"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Invitation créée avec succès",
  "data": {
    "id": 6,
    "quiz_id": 8,
    "email": "participant1@example.com",
    "nom": "Martin",
    "prenom": "Sophie",
    "statut": "en_attente",
    "code_acces": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "date_envoi": "2025-10-27T...",
    "date_expiration": "2025-11-26T..."
  }
}
```

**🔑 IMPORTANT :** Copiez le `code_acces` pour la participation.

---

### 4.2 Créer plusieurs invitations

```http
POST http://localhost:3000/api/v1/invitations/quizzes/8/invitations
Content-Type: application/json
Cookie: [Cookie de session]

{
  "email": "participant2@example.com",
  "nom": "Bernard",
  "prenom": "Pierre"
}
```

```http
POST http://localhost:3000/api/v1/invitations/quizzes/8/invitations
Content-Type: application/json
Cookie: [Cookie de session]

{
  "email": "participant3@example.com",
  "nom": "Dubois",
  "prenom": "Marie"
}
```

---

### 4.3 Obtenir toutes les invitations d'un quiz

```http
GET http://localhost:3000/api/v1/invitations/quizzes/8/invitations
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "email": "participant1@example.com",
      "nom": "Martin",
      "prenom": "Sophie",
      "statut": "en_attente",
      "code_acces": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "date_envoi": "2025-10-27T...",
      "date_expiration": "2025-11-26T..."
    },
    {
      "id": 7,
      "email": "participant2@example.com",
      "nom": "Bernard",
      "prenom": "Pierre",
      "statut": "en_attente"
    },
    {
      "id": 8,
      "email": "participant3@example.com",
      "nom": "Dubois",
      "prenom": "Marie",
      "statut": "en_attente"
    }
  ]
}
```

---

### 4.4 Supprimer une invitation

```http
DELETE http://localhost:3000/api/v1/invitations/8
Cookie: [Cookie de session]
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Invitation supprimée avec succès"
}
```

---

## 5. Participations AVEC Invitation

### 5.1 Démarrer une participation avec code d'accès

```http
POST http://localhost:3000/api/v1/participations
Content-Type: application/json

{
  "quiz_id": 8,
  "email_participant": "participant1@example.com",
  "nom_participant": "Sophie Martin",
  "code_acces": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Participation démarrée avec succès",
  "data": {
    "id": 14,
    "quiz_id": 8,
    "email_participant": "participant1@example.com",
    "nom_participant": "Sophie Martin",
    "code_acces": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "statut": "en_cours",
    "date_debut": "2025-10-27T..."
  }
}
```

**📝 Note :** Copiez l'ID de participation (14).

---

### 5.2 Répondre à la Question 1

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 14,
  "question_id": 19,
  "choix_reponse_id": 68,
  "temps_reponse": 20
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Réponse enregistrée avec succès"
}
```

---

### 5.3 Répondre à la Question 2

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 14,
  "question_id": 20,
  "choix_reponse_id": 71,
  "temps_reponse": 35
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Réponse enregistrée avec succès"
}
```

---

### 5.4 Terminer la participation et obtenir le score

```http
POST http://localhost:3000/api/v1/participations/terminer
Content-Type: application/json

{
  "participation_id": 14
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Participation terminée avec succès",
  "data": {
    "participation": {
      "id": 14,
      "score": 2,
      "score_max": 2,
      "pourcentage": 100,
      "temps_total": 55,
      "statut": "termine"
    },
    "reponses": [
      {
        "question_id": 19,
        "texte_question": "Quelle est la principale différence entre let et var ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      },
      {
        "question_id": 20,
        "texte_question": "Qu'est-ce qu'une Promise en JavaScript ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      }
    ],
    "quiz": {
      "id": 8,
      "titre": "Quiz JavaScript ES6+ Complet",
      "description": "Quiz mis à jour avec plus de détails"
    },
    "statistiques": {
      "score": 2,
      "score_max": 2,
      "pourcentage": 100,
      "temps_total": 55,
      "questions_repondues": 2,
      "questions_correctes": 2
    }
  }
}
```

---

## 6. Participations SANS Invitation

### 6.1 Démarrer une participation publique (sans code)

```http
POST http://localhost:3000/api/v1/participations
Content-Type: application/json

{
  "quiz_id": 8,
  "email_participant": "anonyme@example.com",
  "nom_participant": "Participant Anonyme"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Participation démarrée avec succès",
  "data": {
    "id": 15,
    "quiz_id": 8,
    "email_participant": "anonyme@example.com",
    "nom_participant": "Participant Anonyme",
    "code_acces": null,
    "statut": "en_cours",
    "date_debut": "2025-10-27T..."
  }
}
```

---

### 6.2 Répondre aux questions

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 15,
  "question_id": 19,
  "choix_reponse_id": 68,
  "temps_reponse": 18
}
```

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 15,
  "question_id": 20,
  "choix_reponse_id": 71,
  "temps_reponse": 40
}
```

---

### 6.3 Terminer et obtenir le score

```http
POST http://localhost:3000/api/v1/participations/terminer
Content-Type: application/json

{
  "participation_id": 15
}
```

---

## 7. Modification de Réponses EN COURS

### 7.1 Démarrer une nouvelle participation

```http
POST http://localhost:3000/api/v1/participations
Content-Type: application/json

{
  "quiz_id": 8,
  "email_participant": "test.modif@example.com",
  "nom_participant": "Test Modification",
  "code_acces": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Résultat :** Participation ID = 16

---

### 7.2 Répondre avec une MAUVAISE réponse

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 16,
  "question_id": 19,
  "choix_reponse_id": 67,
  "temps_reponse": 10
}
```

**Note :** Choix 67 = "Aucune différence" (FAUX)

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Réponse enregistrée avec succès"
}
```

---

### 7.3 MODIFIER la réponse avec la BONNE réponse ✅

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 16,
  "question_id": 19,
  "choix_reponse_id": 68,
  "temps_reponse": 15
}
```

**Note :** Choix 68 = "let a une portée de bloc..." (CORRECT)

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Réponse enregistrée avec succès"
}
```

**🎯 La modification a réussi car la participation est toujours "en_cours" !**

---

### 7.4 Répondre à la Question 2

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 16,
  "question_id": 20,
  "choix_reponse_id": 71,
  "temps_reponse": 30
}
```

---

### 7.5 Terminer et vérifier le score

```http
POST http://localhost:3000/api/v1/participations/terminer
Content-Type: application/json

{
  "participation_id": 16
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "participation": {
      "id": 16,
      "score": 2,
      "score_max": 2,
      "pourcentage": 100,
      "statut": "termine"
    }
  }
}
```

**✅ Score 2/2 (100%) car la réponse modifiée (68) a été prise en compte !**

---

### 7.6 Tentative de modification APRÈS la fin ❌

```http
POST http://localhost:3000/api/v1/participations/reponses
Content-Type: application/json

{
  "participation_id": 16,
  "question_id": 19,
  "choix_reponse_id": 67,
  "temps_reponse": 5
}
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Cette participation est déjà terminée ou abandonnée. Vous ne pouvez plus modifier vos réponses."
}
```

**🔒 Modification bloquée car statut = "termine" !**

---

## 8. Statistiques & Résultats

### 8.1 Obtenir les participations d'un quiz (créateur)

```http
GET http://localhost:3000/api/v1/quizzes/8/participations
Cookie: [Cookie de session du créateur]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "id": 14,
      "email_participant": "participant1@example.com",
      "nom_participant": "Sophie Martin",
      "statut": "termine",
      "score": 2,
      "pourcentage": 100,
      "date_debut": "2025-10-27T...",
      "date_fin": "2025-10-27T..."
    },
    {
      "id": 15,
      "email_participant": "anonyme@example.com",
      "nom_participant": "Participant Anonyme",
      "statut": "termine",
      "score": 2,
      "pourcentage": 100
    },
    {
      "id": 16,
      "email_participant": "test.modif@example.com",
      "nom_participant": "Test Modification",
      "statut": "termine",
      "score": 2,
      "pourcentage": 100
    }
  ]
}
```

---

### 8.2 Obtenir les détails d'une participation

```http
GET http://localhost:3000/api/v1/participations/14
Cookie: [Cookie de session du créateur]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "id": 14,
    "quiz": {
      "id": 8,
      "titre": "Quiz JavaScript ES6+ Complet"
    },
    "participant": {
      "email": "participant1@example.com",
      "nom": "Sophie Martin"
    },
    "statut": "termine",
    "score": 2,
    "score_max": 2,
    "pourcentage": 100,
    "temps_total": 55,
    "reponses": [
      {
        "question": "Quelle est la principale différence entre let et var ?",
        "reponse_donnee": "let a une portée de bloc, var a une portée de fonction",
        "est_correcte": true,
        "points": 1
      },
      {
        "question": "Qu'est-ce qu'une Promise en JavaScript ?",
        "reponse_donnee": "Un objet représentant une opération asynchrone",
        "est_correcte": true,
        "points": 1
      }
    ]
  }
}
```

---

### 8.3 Supprimer un quiz

```http
DELETE http://localhost:3000/api/v1/quizzes/8
Cookie: [Cookie de session du créateur]
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Quiz supprimé avec succès"
}
```

---

## 📊 Variables Postman (Recommandées)

Créez ces variables dans Postman pour faciliter les tests :

| Variable | Valeur Initiale | Description |
|----------|----------------|-------------|
| `base_url` | `http://localhost:3000` | URL du serveur |
| `api_version` | `/api/v1` | Version de l'API |
| `user_id` | `5` | ID utilisateur connecté |
| `quiz_id` | `8` | ID du quiz de test |
| `question_id` | `19` | ID d'une question |
| `participation_id` | `14` | ID d'une participation |
| `code_acces` | `a1b2...` | Code d'invitation |
| `auth_cookie` | `` | Cookie de session |

**Utilisation :** `{{base_url}}{{api_version}}/quizzes`

---

## 🎯 Scénarios de Test Complets

### Scénario A : Flux Créateur Complet
1. Inscription → Login
2. Créer quiz (brouillon)
3. Ajouter 3 questions avec choix
4. Publier le quiz
5. Créer invitations
6. Consulter participations
7. Voir statistiques

### Scénario B : Flux Participant Avec Invitation
1. Recevoir code d'accès
2. Démarrer participation avec code
3. Répondre à toutes les questions
4. Terminer et voir score

### Scénario C : Flux Participant Sans Invitation
1. Démarrer participation publique
2. Répondre aux questions
3. Terminer et voir score

### Scénario D : Modification de Réponses
1. Démarrer participation
2. Répondre avec mauvaise réponse
3. Modifier avec bonne réponse (SUCCÈS)
4. Terminer participation
5. Tenter de modifier (ÉCHEC)

---

## ✅ Checklist de Test

### Authentification
- [ ] Inscription avec validation email/mot de passe
- [ ] Login avec cookies
- [ ] Obtenir profil utilisateur
- [ ] Déconnexion

### Quiz
- [ ] Créer quiz (brouillon)
- [ ] Lister tous les quiz (pagination)
- [ ] Obtenir un quiz par ID
- [ ] Obtenir mes quiz
- [ ] Mettre à jour quiz
- [ ] Supprimer quiz

### Questions
- [ ] Ajouter question avec choix
- [ ] Lister questions d'un quiz
- [ ] Mettre à jour question
- [ ] Supprimer question

### Invitations
- [ ] Créer invitation avec code
- [ ] Lister invitations d'un quiz
- [ ] Supprimer invitation

### Participations
- [ ] Démarrer avec code (invitation)
- [ ] Démarrer sans code (public)
- [ ] Répondre à une question
- [ ] Modifier une réponse (en cours) ✅
- [ ] Bloquer modification (terminée) ✅
- [ ] Terminer et obtenir score
- [ ] Consulter participations (créateur)

---

## 🚨 Erreurs Courantes & Solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `"Vous devez être connecté"` | Pas de cookie de session | Se reconnecter et copier le cookie |
| `"Cette participation est déjà terminée"` | Tentative de modification après fin | Normal, c'est voulu ! |
| `"Vous avez déjà répondu"` | (N'apparaît plus) | Maintenant ça modifie la réponse |
| `"Quiz non trouvé"` | Mauvais ID ou quiz supprimé | Vérifier l'ID du quiz |
| `"Code d'accès invalide"` | Code expiré (30j) ou faux | Créer nouvelle invitation |
| `"Vous n'êtes pas autorisé"` | Quiz privé sans code | Obtenir une invitation du créateur |

---

## 📝 Notes Finales

### Format de Réponse Standardisé
Toutes les réponses suivent ce format :
```json
{
  "success": boolean,
  "message": string,
  "data": object,
  "meta": {
    "timestamp": string,
    "version": string
  },
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  }
}
```

### Sécurité
- Les cookies sont httpOnly et sécurisés
- Les mots de passe sont hashés avec bcrypt
- Les codes d'invitation expirent après 30 jours
- `est_correcte` n'est JAMAIS exposé aux participants avant la fin

### Modification de Réponses
- ✅ **Autorisée** si `statut = "en_cours"`
- ❌ **Bloquée** si `statut = "termine"` ou `"abandonne"`
- La dernière réponse enregistrée est celle prise en compte pour le score

---

## 🔒 Sécurité des Endpoints

### Endpoints PUBLICS (Sans authentification) ✅

| Endpoint | Description | Raison |
|----------|-------------|--------|
| `POST /utilisateurs/register` | Inscription | Nouveau compte |
| `POST /utilisateurs/login` | Connexion | Authentification initiale |
| `GET /quizzes/partage/:lien` | Quiz via lien | Partage public |
| `GET /quizzes/:id` | Détails quiz | Participants anonymes |
| `GET /quizzes/:id/questions` | Questions | Participants anonymes |
| `POST /participations` | Démarrer quiz | Anonyme ou avec code |
| `POST /participations/reponses` | Soumettre réponse | Pendant quiz |
| `POST /participations/terminer` | Terminer quiz | Voir score |
| `GET /participations/:id` | Résultats | Voir son score |

### Endpoints PROTÉGÉS (Authentification requise) 🔒

| Endpoint | Description | Raison |
|----------|-------------|--------|
| `POST /quizzes` | Créer quiz | Créateur seul |
| `GET /quizzes/mes-quiz` | Mes quiz | Gestion personnelle |
| `PUT /quizzes/:id` | Modifier quiz | Propriétaire seul |
| `DELETE /quizzes/:id` | Supprimer quiz | Propriétaire seul |
| `POST /quizzes/:id/questions` | Ajouter question | Créateur seul |
| `PUT /questions/:id` | Modifier question | Créateur seul |
| `DELETE /questions/:id` | Supprimer question | Créateur seul |
| `POST /invitations/...` | Créer invitation | Créateur seul |
| `GET /participations/quiz/:id/...` | Statistiques quiz | Créateur seul |

**📖 Documentation complète :** Voir [ENDPOINTS_SECURITY.md](./ENDPOINTS_SECURITY.md)

---

**Date :** 27 octobre 2025  
**Version API :** 1.0.0  
**Branch :** feature/api-standardization  
**Auteur :** QuizLab Team
