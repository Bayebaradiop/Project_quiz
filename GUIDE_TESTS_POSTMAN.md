# 🧪 Guide Complet de Tests - QuizLab API

> **Version :** 1.0.0  
> **Branch :** feature/api-standardization  
> **Date :** 27 octobre 2025

---

## 📋 Table des Matières

1. [Prérequis](#-prérequis)
2. [Configuration Postman](#-configuration-postman)
3. [Tests Participations](#-tests-participations)
   - [Cas 1 : Avec Invitation](#cas-1--participation-avec-invitation-code-daccès)
   - [Cas 2 : Sans Invitation](#cas-2--participation-sans-invitation-accès-public)
4. [Données de Test](#-données-de-test)
5. [Collections Postman](#-collections-postman-json)
6. [Erreurs Courantes](#-erreurs-courantes)

---

## 🔧 Prérequis

### Serveur
```bash
# Démarrer le serveur
npm run dev

# Serveur accessible sur
http://localhost:3000
```

### Base de données
- PostgreSQL en cours d'exécution
- Migrations appliquées
- Données de test présentes (Quiz ID 7)

### Utilisateur de test
- **Email :** testapi@quizlab.com
- **Mot de passe :** Test@1234
- **ID :** 4

---

## 🎯 Configuration Postman

### Variables d'environnement recommandées

Créer un environnement "QuizLab Local" avec :

| Variable | Valeur Initiale | Valeur Courante |
|----------|-----------------|-----------------|
| `baseUrl` | `http://localhost:3000/api/v1` | - |
| `creatorEmail` | `testapi@quizlab.com` | - |
| `creatorPassword` | `Test@1234` | - |
| `quizId` | `7` | - |
| `participation_id` | - | (auto-rempli) |
| `code_acces` | - | (auto-rempli) |

### Scripts Postman utiles

**Dans "Tests" de la requête "Créer Invitation" :**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("code_acces", response.data.code_acces);
}
```

**Dans "Tests" de la requête "Démarrer Participation" :**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("participation_id", response.data.id);
}
```

---

## 🎯 Tests Participations

## CAS 1 : Participation AVEC Invitation (Code d'accès)

### 📝 Scénario
Un créateur invite un participant par email. Le participant utilise le code d'accès pour démarrer le quiz.

---

### Étape 1 : Connexion du Créateur

**Endpoint :**
```
POST {{baseUrl}}/utilisateurs/login
```

**Headers :**
```
Content-Type: application/json
```

**Body (raw JSON) :**
```json
{
  "email": "testapi@quizlab.com",
  "mot_de_passe": "Test@1234"
}
```

**Réponse attendue (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie"
}
```

**⚠️ Action requise :**
- Copiez le cookie `Set-Cookie` dans les headers de réponse
- Ou activez "Automatically follow redirects" dans Postman

---

### Étape 2 : Créer une Invitation

**Endpoint :**
```
POST {{baseUrl}}/invitations/quizzes/7/invitations
```

**Headers :**
```
Content-Type: application/json
Cookie: [Cookie de l'étape 1]
```

**Body (raw JSON) :**
```json
{
  "email": "participant@example.com",
  "nom": "Participant",
  "prenom": "Test"
}
```

**Réponse attendue (201) :**
```json
{
  "success": true,
  "message": "Invitation créée avec succès",
  "data": {
    "id": 5,
    "quiz_id": 7,
    "email": "participant@example.com",
    "nom": "Participant",
    "prenom": "Test",
    "statut": "en_attente",
    "code_acces": "cd3af23d7430428c196cc24c7e89bc55",
    "date_envoi": "2025-10-27T10:00:00.000Z",
    "date_expiration": "2025-11-26T10:00:00.000Z"
  }
}
```

**⚠️ Action requise :**
- **Copiez le `code_acces`** pour l'étape suivante
- Le code expire dans 30 jours

---

### Étape 3 : Démarrer la Participation avec Code

**Endpoint :**
```
POST {{baseUrl}}/participations
```

**Headers :**
```
Content-Type: application/json
```

**Body (raw JSON) :**
```json
{
  "quiz_id": 7,
  "email_participant": "participant@example.com",
  "nom_participant": "Test Participant",
  "code_acces": "cd3af23d7430428c196cc24c7e89bc55"
}
```

**Réponse attendue (201) :**
```json
{
  "success": true,
  "message": "Participation démarrée avec succès",
  "data": {
    "id": 11,
    "quiz_id": 7,
    "email_participant": "participant@example.com",
    "nom_participant": "Test Participant",
    "code_acces": "cd3af23d7430428c196cc24c7e89bc55",
    "statut": "en_cours",
    "date_debut": "2025-10-27T10:05:00.000Z"
  }
}
```

**⚠️ Action requise :**
- **Notez le `id` de la participation** (ex: 11)
- Utilisez-le pour toutes les réponses suivantes

---

### Étape 4 : Répondre à la Question 1

**Endpoint :**
```
POST {{baseUrl}}/participations/reponses
```

**Headers :**
```
Content-Type: application/json
```

**Body (raw JSON) :**
```json
{
  "participation_id": 11,
  "question_id": 16,
  "choix_reponse_id": 58,
  "temps_reponse": 12
}
```

**Réponse attendue (201) :**
```json
{
  "success": true,
  "message": "Réponse enregistrée avec succès"
}
```

**Détails :**
- Question 16 : "Quelle est la capitale de la France ?"
- Choix 58 : "Paris" ✅ (correct)
- Temps : 12 secondes

---

### Étape 5 : Répondre à la Question 2

**Endpoint :**
```
POST {{baseUrl}}/participations/reponses
```

**Body (raw JSON) :**
```json
{
  "participation_id": 11,
  "question_id": 17,
  "choix_reponse_id": 62,
  "temps_reponse": 8
}
```

**Réponse attendue (201) :**
```json
{
  "success": true,
  "message": "Réponse enregistrée avec succès"
}
```

**Détails :**
- Question 17 : "Combien font 2 + 2 ?"
- Choix 62 : "4" ✅ (correct)
- Temps : 8 secondes

---

### Étape 6 : Répondre à la Question 3

**Endpoint :**
```
POST {{baseUrl}}/participations/reponses
```

**Body (raw JSON) :**
```json
{
  "participation_id": 11,
  "question_id": 18,
  "choix_reponse_id": 65,
  "temps_reponse": 7
}
```

**Réponse attendue (201) :**
```json
{
  "success": true,
  "message": "Réponse enregistrée avec succès"
}
```

**Détails :**
- Question 18 : "Quelle est la couleur du ciel ?"
- Choix 65 : "Bleu" ✅ (correct)
- Temps : 7 secondes

---

### Étape 7 : Terminer et Afficher le Score 🎉

**Endpoint :**
```
POST {{baseUrl}}/participations/terminer
```

**Headers :**
```
Content-Type: application/json
```

**Body (raw JSON) :**
```json
{
  "participation_id": 11
}
```

**Réponse attendue (200) :**
```json
{
  "success": true,
  "message": "Participation terminée avec succès",
  "data": {
    "participation": {
      "id": 11,
      "score": 3,
      "score_max": 3,
      "pourcentage": 100,
      "temps_total": 27,
      "statut": "termine"
    },
    "reponses": [
      {
        "question_id": 16,
        "texte_question": "Quelle est la capitale de la France ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      },
      {
        "question_id": 17,
        "texte_question": "Combien font 2 + 2 ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      },
      {
        "question_id": 18,
        "texte_question": "Quelle est la couleur du ciel ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      }
    ],
    "quiz": {
      "id": 7,
      "titre": "Quiz Test E2E Final",
      "description": "Test complet avec score participant"
    },
    "statistiques": {
      "score": 3,
      "score_max": 3,
      "pourcentage": 100,
      "temps_total": 27,
      "questions_repondues": 3,
      "questions_correctes": 3
    }
  }
}
```

**✅ Résultat :**
- Score parfait : **3/3 (100%)**
- Temps total : 27 secondes (12 + 8 + 7)
- Toutes les réponses correctes
- Statistiques détaillées affichées

---

## CAS 2 : Participation SANS Invitation (Accès Public)

### 📝 Scénario
Un utilisateur accède directement au quiz public sans invitation.

---

### Étape 1 : Démarrer la Participation Publique

**Endpoint :**
```
POST {{baseUrl}}/participations
```

**Headers :**
```
Content-Type: application/json
```

**Body (raw JSON) :**
```json
{
  "quiz_id": 7,
  "email_participant": "public.user@example.com",
  "nom_participant": "Utilisateur Public"
}
```

**⚠️ Notez : Pas de `code_acces` dans le body**

**Réponse attendue (201) :**
```json
{
  "success": true,
  "message": "Participation démarrée avec succès",
  "data": {
    "id": 12,
    "quiz_id": 7,
    "email_participant": "public.user@example.com",
    "nom_participant": "Utilisateur Public",
    "code_acces": null,
    "statut": "en_cours",
    "date_debut": "2025-10-27T11:00:00.000Z"
  }
}
```

**⚠️ Action requise :**
- **Notez le `id` de la participation** (ex: 12)

---

### Étape 2 : Répondre aux Questions

**Question 1 :**
```
POST {{baseUrl}}/participations/reponses
```
```json
{
  "participation_id": 12,
  "question_id": 16,
  "choix_reponse_id": 58,
  "temps_reponse": 15
}
```

**Question 2 :**
```json
{
  "participation_id": 12,
  "question_id": 17,
  "choix_reponse_id": 62,
  "temps_reponse": 10
}
```

**Question 3 :**
```json
{
  "participation_id": 12,
  "question_id": 18,
  "choix_reponse_id": 65,
  "temps_reponse": 9
}
```

---

### Étape 3 : Terminer et Afficher le Score 🎉

**Endpoint :**
```
POST {{baseUrl}}/participations/terminer
```

**Body :**
```json
{
  "participation_id": 12
}
```

**Réponse attendue (200) :**
```json
{
  "success": true,
  "message": "Participation terminée avec succès",
  "data": {
    "participation": {
      "id": 12,
      "score": 3,
      "score_max": 3,
      "pourcentage": 100,
      "temps_total": 34,
      "statut": "termine"
    },
    "reponses": [
      {
        "question_id": 16,
        "texte_question": "Quelle est la capitale de la France ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      },
      {
        "question_id": 17,
        "texte_question": "Combien font 2 + 2 ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      },
      {
        "question_id": 18,
        "texte_question": "Quelle est la couleur du ciel ?",
        "votre_reponse": null,
        "est_correcte": true,
        "points_obtenus": 1
      }
    ],
    "quiz": {
      "id": 7,
      "titre": "Quiz Test E2E Final",
      "description": "Test complet avec score participant"
    },
    "statistiques": {
      "score": 3,
      "score_max": 3,
      "pourcentage": 100,
      "temps_total": 34,
      "questions_repondues": 3,
      "questions_correctes": 3
    }
  }
}
```

---

## 📊 Données de Test

### Quiz Test (ID: 7)
- **Titre :** Quiz Test E2E Final
- **Description :** Test complet avec score participant
- **Type :** Public
- **Statut :** Publié
- **Nombre de questions :** 3
- **Durée totale :** 65 secondes

### Questions et Réponses

#### Question 16 : "Quelle est la capitale de la France ?"
- **Durée :** 30 secondes
- **Ordre :** 1
- **Choix :**
  - ✅ **ID 58** : "Paris" (correct)
  - ❌ ID 59 : "Lyon"
  - ❌ ID 60 : "Marseille"

#### Question 17 : "Combien font 2 + 2 ?"
- **Durée :** 20 secondes
- **Ordre :** 2
- **Choix :**
  - ❌ ID 61 : "3"
  - ✅ **ID 62** : "4" (correct)
  - ❌ ID 63 : "5"

#### Question 18 : "Quelle est la couleur du ciel ?"
- **Durée :** 15 secondes
- **Ordre :** 3
- **Choix :**
  - ❌ ID 64 : "Vert"
  - ✅ **ID 65** : "Bleu" (correct)
  - ❌ ID 66 : "Rouge"

### Utilisateur Créateur
- **ID :** 4
- **Email :** testapi@quizlab.com
- **Mot de passe :** Test@1234
- **Prénom :** Test
- **Nom :** API

---

## 📦 Collections Postman JSON

### Collection CAS 1 : Avec Invitation

Créez une nouvelle collection et importez :

```json
{
  "info": {
    "name": "QuizLab - Participation Avec Invitation",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Login Créateur",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Success is true\", function () {",
              "    const jsonData = pm.response.json();",
              "    pm.expect(jsonData.success).to.be.true;",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"{{creatorEmail}}\",\n  \"mot_de_passe\": \"{{creatorPassword}}\"\n}"
        },
        "url": "{{baseUrl}}/utilisateurs/login"
      }
    },
    {
      "name": "2. Créer Invitation",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 201\", function () {",
              "    pm.response.to.have.status(201);",
              "});",
              "",
              "const response = pm.response.json();",
              "if (response.success) {",
              "    pm.environment.set(\"code_acces\", response.data.code_acces);",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"participant@example.com\",\n  \"nom\": \"Participant\",\n  \"prenom\": \"Test\"\n}"
        },
        "url": "{{baseUrl}}/invitations/quizzes/{{quizId}}/invitations"
      }
    },
    {
      "name": "3. Démarrer Participation",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "if (response.success) {",
              "    pm.environment.set(\"participation_id\", response.data.id);",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"quiz_id\": {{quizId}},\n  \"email_participant\": \"participant@example.com\",\n  \"nom_participant\": \"Test Participant\",\n  \"code_acces\": \"{{code_acces}}\"\n}"
        },
        "url": "{{baseUrl}}/participations"
      }
    },
    {
      "name": "4. Réponse Question 1",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}},\n  \"question_id\": 16,\n  \"choix_reponse_id\": 58,\n  \"temps_reponse\": 12\n}"
        },
        "url": "{{baseUrl}}/participations/reponses"
      }
    },
    {
      "name": "5. Réponse Question 2",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}},\n  \"question_id\": 17,\n  \"choix_reponse_id\": 62,\n  \"temps_reponse\": 8\n}"
        },
        "url": "{{baseUrl}}/participations/reponses"
      }
    },
    {
      "name": "6. Réponse Question 3",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}},\n  \"question_id\": 18,\n  \"choix_reponse_id\": 65,\n  \"temps_reponse\": 7\n}"
        },
        "url": "{{baseUrl}}/participations/reponses"
      }
    },
    {
      "name": "7. Terminer et Score",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Score parfait 3/3\", function () {",
              "    const data = pm.response.json().data;",
              "    pm.expect(data.participation.score).to.eql(3);",
              "    pm.expect(data.participation.pourcentage).to.eql(100);",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}}\n}"
        },
        "url": "{{baseUrl}}/participations/terminer"
      }
    }
  ]
}
```

### Collection CAS 2 : Sans Invitation

```json
{
  "info": {
    "name": "QuizLab - Participation Sans Invitation",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Démarrer Participation Publique",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "if (response.success) {",
              "    pm.environment.set(\"participation_id\", response.data.id);",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"quiz_id\": {{quizId}},\n  \"email_participant\": \"public.user@example.com\",\n  \"nom_participant\": \"Utilisateur Public\"\n}"
        },
        "url": "{{baseUrl}}/participations"
      }
    },
    {
      "name": "2. Réponse Question 1",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}},\n  \"question_id\": 16,\n  \"choix_reponse_id\": 58,\n  \"temps_reponse\": 15\n}"
        },
        "url": "{{baseUrl}}/participations/reponses"
      }
    },
    {
      "name": "3. Réponse Question 2",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}},\n  \"question_id\": 17,\n  \"choix_reponse_id\": 62,\n  \"temps_reponse\": 10\n}"
        },
        "url": "{{baseUrl}}/participations/reponses"
      }
    },
    {
      "name": "4. Réponse Question 3",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}},\n  \"question_id\": 18,\n  \"choix_reponse_id\": 65,\n  \"temps_reponse\": 9\n}"
        },
        "url": "{{baseUrl}}/participations/reponses"
      }
    },
    {
      "name": "5. Terminer et Score",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Score parfait 3/3\", function () {",
              "    const data = pm.response.json().data;",
              "    pm.expect(data.participation.score).to.eql(3);",
              "    pm.expect(data.participation.pourcentage).to.eql(100);",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"participation_id\": {{participation_id}}\n}"
        },
        "url": "{{baseUrl}}/participations/terminer"
      }
    }
  ]
}
```

---

## 🚨 Erreurs Courantes

### "Vous avez déjà répondu à cette question"
**Cause :** La participation a déjà soumis une réponse pour cette question.

**Solution :** 
- Créez une nouvelle participation
- Ou passez à la question suivante

---

### "Quiz non trouvé ou non accessible"
**Cause :** Le quiz n'existe pas ou n'est pas publié.

**Solution :**
- Vérifiez que le `quiz_id` est correct (7)
- Vérifiez que le quiz a le statut "publie"

---

### "Code d'accès invalide ou expiré"
**Cause :** Le code d'invitation est incorrect ou a expiré (> 30 jours).

**Solution :**
- Créez une nouvelle invitation
- Vérifiez que vous copiez le bon `code_acces`

---

### "Cette participation est déjà terminée"
**Cause :** Vous essayez de terminer une participation déjà terminée.

**Solution :**
- Impossible de terminer deux fois
- Créez une nouvelle participation pour retester

---

### "Unauthorized" ou "Token manquant"
**Cause :** Cookie de session manquant ou expiré.

**Solution :**
- Reconnectez-vous (étape 1)
- Vérifiez que les cookies sont activés dans Postman
- Settings → General → Enable "Automatically follow redirects"

---

## ✅ Checklist de Validation

### CAS 1 : Avec Invitation
- [ ] Login créateur réussi (200)
- [ ] Invitation créée avec `code_acces` (201)
- [ ] `code_acces` copié dans la variable
- [ ] Participation démarrée avec code valide (201)
- [ ] `participation_id` récupéré
- [ ] Réponse Q1 enregistrée (201)
- [ ] Réponse Q2 enregistrée (201)
- [ ] Réponse Q3 enregistrée (201)
- [ ] Participation terminée (200)
- [ ] Score affiché : 3/3 (100%)
- [ ] Structure de réponse : `{participation, reponses, quiz, statistiques}`

### CAS 2 : Sans Invitation
- [ ] Participation publique démarrée (201)
- [ ] Pas de `code_acces` dans le body
- [ ] `participation_id` récupéré
- [ ] 3 réponses enregistrées (201 chacune)
- [ ] Participation terminée (200)
- [ ] Score affiché : 3/3 (100%)
- [ ] Même structure de réponse que CAS 1

---

## 📝 Notes Importantes

1. **Format de Réponse Standardisé**
   ```json
   {
     "success": true,
     "message": "...",
     "data": {...},
     "meta": {
       "timestamp": "2025-10-27T...",
       "version": "1.0.0"
     }
   }
   ```

2. **Structure du Score Final**
   - `participation` : Infos de base (id, score, statut)
   - `reponses` : Détails de chaque réponse
   - `quiz` : Infos du quiz
   - `statistiques` : Analyse complète

3. **Temps de Réponse**
   - En secondes
   - Doit être > 0
   - Additionné dans `temps_total`

4. **Code d'Accès**
   - Unique par invitation
   - Valide 30 jours
   - Format : UUID v4 (32 caractères hexadécimaux)

5. **Sécurité**
   - `est_correcte` jamais exposé dans les choix avant réponse
   - Seules les réponses du participant sont retournées
   - Pas de comparaison avec les bonnes réponses si faux

---

## 🎯 Format de Réponse Complète

### Structure du Score Final

```typescript
{
  success: boolean,
  message: string,
  data: {
    participation: {
      id: number,
      score: number,
      score_max: number,
      pourcentage: number,
      temps_total: number,  // en secondes
      statut: "termine"
    },
    reponses: [
      {
        question_id: number,
        texte_question: string,
        votre_reponse: string | null,
        est_correcte: boolean,
        points_obtenus: number
      }
    ],
    quiz: {
      id: number,
      titre: string,
      description: string | null
    },
    statistiques: {
      score: number,
      score_max: number,
      pourcentage: number,
      temps_total: number,
      questions_repondues: number,
      questions_correctes: number
    }
  }
}
```

---

## 📞 Support

Pour toute question ou problème :
- Vérifiez les logs du serveur
- Consultez la section [Erreurs Courantes](#-erreurs-courantes)
- Vérifiez que la base de données contient les données de test

---

**Dernière mise à jour :** 27 octobre 2025  
**Version API :** 1.0.0  
**Branch :** feature/api-standardization
