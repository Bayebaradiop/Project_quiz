# 📚 Guide Swagger - Documentation API Interactive

## 🚀 Comment accéder à la documentation Swagger

Votre serveur est déjà démarré ! Accédez à la documentation via votre navigateur :

### URLs disponibles :

1. **Interface Swagger UI Interactive** ⭐ (Recommandé)
   ```
   http://localhost:3000/api-docs
   ```
   - Interface graphique complète
   - Testez directement les endpoints
   - Voir les exemples de requêtes/réponses

2. **Spécification JSON**
   ```
   http://localhost:3000/api-docs.json
   ```
   - Format JSON de la spec OpenAPI 3.0.3
   - Utile pour outils d'import (Postman, Insomnia)

3. **Fichier YAML original**
   ```
   http://localhost:3000/swagger.yaml
   ```
   - Version YAML lisible
   - Utile pour édition/versioning

---

## 📖 Ce qui a été ajouté dans la documentation

### ✅ 1. Endpoint pour PUBLIER un quiz
```http
PATCH /api/v1/quizzes/{id}/publier
```
**Fonctionnalité :**
- Change le statut d'un quiz de `brouillon` → `publie`
- Rend le quiz accessible aux participants
- Vérifie qu'il y a au moins une question

**Exemple :**
```bash
curl -X PATCH 'http://localhost:3000/api/v1/quizzes/VAG7e3Qj/publier' \
  -H 'Cookie: token=...'
```

---

### ✅ 2. Liste des quiz (PUBLIC et AUTHENTIFIÉ)
```http
GET /api/v1/quizzes
```

**DEUX CAS clairement documentés :**

#### 🌍 CAS 1: Sans authentification (PUBLIC)
- Retourne UNIQUEMENT les quiz **publiés ET publics**
- Accessible à tout le monde
- Utile pour page d'accueil

**Exemple :**
```bash
curl http://localhost:3000/api/v1/quizzes
```

#### 🔒 CAS 2: Avec authentification
- Retourne TOUS les quiz de l'utilisateur connecté
- Inclut brouillons, publiés, archivés
- Permet de gérer ses quiz

**Exemple :**
```bash
curl http://localhost:3000/api/v1/quizzes \
  -H 'Cookie: token=...'
```

---

### ✅ 3. Participations (DEUX CAS)

#### 🌍 CAS 1: Participation à un QUIZ PUBLIC
```http
POST /api/v1/participations/quiz/{quiz_id}
```

**Quand l'utiliser :**
- Quiz visible dans liste publique
- Quiz avec `statut: "publie"` ET `est_public: true`
- Pas besoin de code d'invitation

**Workflow complet :**
1. `GET /quizzes` (sans auth) → liste quiz publics
2. Choisir un quiz → récupérer son `quiz_id` (ex: "VAG7e3Qj")
3. `POST /participations/quiz/VAG7e3Qj` → démarrer participation

**Erreur courante :**
```json
{
  "success": false,
  "message": "Ce quiz n'est pas encore disponible"
}
```
➡️ **Solution:** Le quiz doit être PUBLIÉ d'abord avec `PATCH /quizzes/{id}/publier`

---

#### ✉️ CAS 2: Participation avec CODE D'INVITATION
```http
POST /api/v1/participations
```

**Quand l'utiliser :**
- Quiz avec invitations par email
- Quiz privés (accessible UNIQUEMENT par invitation)
- Quiz publics avec invitations personnalisées

**Workflow complet :**
1. Créateur envoie invitation → `POST /invitations`
2. Participant reçoit email avec `code_acces`
3. (Optionnel) Valider le code → `POST /invitations/validate`
4. `POST /participations` avec `code_acces` → démarrer participation

**DIFFÉRENCE CLÉS :**
- `quiz_id` N'EST PAS requis (calculé depuis l'invitation)
- Fonctionne même si quiz privé
- Code doit être valide et non expiré

**Exemple :**
```json
{
  "code_acces": "df22be74d996f008cb04ee412b5f1aa1",
  "email_participant": "participant@example.com"
}
```

---

## 🧪 Comment tester dans Swagger UI

### Étape 1: Ouvrir Swagger UI
Allez sur : http://localhost:3000/api-docs

### Étape 2: S'authentifier (pour endpoints protégés)
1. Cliquer sur un endpoint PUBLIC comme `POST /utilisateurs/login`
2. Tester la connexion (le cookie sera automatiquement stocké)
3. Tous les endpoints protégés fonctionneront ensuite

### Étape 3: Tester le workflow complet

#### Workflow QUIZ PUBLIC :
```
1. POST /utilisateurs/register → créer compte
2. POST /utilisateurs/login → se connecter (cookie auto)
3. POST /quizzes → créer quiz
4. POST /quizzes/{id}/questions → ajouter questions
5. PATCH /quizzes/{id}/publier → PUBLIER LE QUIZ ⭐
6. GET /quizzes (sans auth) → voir quiz dans liste publique
7. POST /participations/quiz/{quiz_id} → participer
```

#### Workflow QUIZ PRIVÉ (avec invitation) :
```
1. POST /utilisateurs/register → créer compte
2. POST /utilisateurs/login → se connecter
3. POST /quizzes → créer quiz (est_public: false)
4. POST /quizzes/{id}/questions → ajouter questions
5. PATCH /quizzes/{id}/publier → publier ⭐
6. POST /invitations → envoyer invitation
7. POST /participations (avec code_acces) → participer avec code
```

---

## 🔍 Fonctionnalités Swagger UI

### Dans chaque endpoint :
- **Try it out** : Activer le mode test
- **Parameters** : Voir/modifier les paramètres (IDs cryptés automatiquement gérés !)
- **Request body** : Exemples pré-remplis
- **Execute** : Lancer la requête
- **Response** : Voir la réponse en temps réel

### Exemples fournis :
- ✅ Tous les IDs sont en format crypté (ex: "VAG7e3Qj")
- ✅ Exemples de réponses d'erreur (400, 404, etc.)
- ✅ Cas multiples documentés (avec/sans auth, etc.)

---

## 📝 Points importants

### 🔐 Sécurité des IDs (HashIds)
- **Frontend ne fait AUCUNE logique de cryptage**
- Tous les IDs reçus sont déjà cryptés
- Tous les IDs envoyés sont automatiquement décodés
- Aucune bibliothèque crypto côté frontend nécessaire !

### 🍪 Authentification
- Cookies httpOnly automatiques
- Pas besoin de gérer le token manuellement
- Swagger UI gère les cookies automatiquement

### ⚠️ Erreurs courantes

**Erreur : "Ce quiz n'est pas encore disponible"**
```
Solution: Utiliser PATCH /quizzes/{id}/publier pour publier le quiz
```

**Erreur : "Code d'invitation invalide"**
```
Solution: Vérifier que le code est bien celui reçu par email
```

**Erreur : 401 Unauthorized**
```
Solution: Se connecter d'abord avec POST /utilisateurs/login
```

---

## 🎯 Prochaines étapes

1. **Ouvrir Swagger UI** : http://localhost:3000/api-docs
2. **Tester l'inscription** : `POST /utilisateurs/register`
3. **Tester la connexion** : `POST /utilisateurs/login`
4. **Créer un quiz** : `POST /quizzes`
5. **PUBLIER le quiz** : `PATCH /quizzes/{id}/publier` ⭐
6. **Tester participation** : `POST /participations/quiz/{quiz_id}`

---

## 💡 Alternatives à Swagger UI

Si vous préférez d'autres outils :

### Postman
1. Importer : http://localhost:3000/api-docs.json
2. Collection automatiquement créée !

### Insomnia
1. Importer OpenAPI 3.0
2. URL : http://localhost:3000/api-docs.json

### ReDoc (documentation read-only)
```bash
npx redoc-cli serve swagger.yaml
```

---

Bon test ! 🚀
