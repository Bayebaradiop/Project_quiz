# Sécurité des Endpoints - API QuizLab

## Vue d'ensemble

Ce document définit clairement quels endpoints doivent être protégés par authentification et lesquels doivent rester publics.

**Principe clé :** Les participants anonymes peuvent passer des quiz, mais seuls les utilisateurs authentifiés peuvent créer et gérer des quiz.

---

## Endpoints PUBLICS (Sans authentification)

### 1. Authentification & Inscription

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/utilisateurs/register` | POST | Inscription utilisateur | Nouveau compte |
| `/api/v1/utilisateurs/login` | POST | Connexion | Authentification initiale |
| `/api/v1/utilisateurs/roles` | GET | Lister les rôles | Info publique |

**Cas d'usage :** Permettre à quiconque de créer un compte pour devenir créateur de quiz.

---

### 2. Consultation des Quiz (Lecture seule)

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/quizzes/partage/:lien` | GET | Accéder via lien de partage | Partage public |
| `/api/v1/quizzes/:id` | GET | Détails d'un quiz | Participants anonymes |
| `/api/v1/quizzes/:id/questions` | GET | Questions d'un quiz | Participants anonymes |
| `/api/v1/quizzes/:quizId/questions` | GET | Liste des questions | Participants anonymes |

**Cas d'usage :** Les participants reçoivent un lien et doivent voir le quiz sans compte.

---

### 3. Participations (Flux complet anonyme)

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/participations/public/:lien_partage` | POST | Accéder quiz public | Lien partagé |
| `/api/v1/participations` | POST | Démarrer une participation | Anonyme ou avec code |
| `/api/v1/participations/reponses` | POST | Soumettre une réponse | Pendant le quiz |
| `/api/v1/participations/terminer` | POST | Terminer et voir score | Fin du quiz |
| `/api/v1/participations/:id/abandonner` | POST | Abandonner | Participant quitte |
| `/api/v1/participations/:id` | GET | Résultats d'une participation | Voir son score |

**Cas d'usage :** Un participant anonyme reçoit un lien, passe le quiz, voit son score, sans jamais se connecter.

**Email post-quiz :** Après avoir terminé, le participant anonyme reçoit un email automatique :
```
Quiz terminé ! Score : 85%

Vous avez aimé cette expérience ?
Créez vos propres quiz en installant l'application QuizLab !

[Télécharger l'application] [S'inscrire sur le web]
```

---

## Endpoints PROTÉGÉS (Authentification requise)

### 1. Gestion du Compte Utilisateur

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/utilisateurs/me` | GET | Profil utilisateur | Données personnelles |
| `/api/v1/utilisateurs/logout` | POST | Déconnexion | Session active |
| `/api/v1/utilisateurs/:id` | GET | Détails utilisateur | Données personnelles |

---

### 2. Création et Gestion des Quiz

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/quizzes` | POST | Créer un quiz | Réservé aux créateurs |
| `/api/v1/quizzes` | GET | Liste tous les quiz | Navigation créateur |
| `/api/v1/quizzes/mes-quiz` | GET | Mes quiz | Gestion personnelle |
| `/api/v1/quizzes/:id` | PUT | Modifier un quiz | Propriétaire seul |
| `/api/v1/quizzes/:id` | DELETE | Supprimer un quiz | Propriétaire seul |

**Vérification supplémentaire :** Le middleware vérifie que l'utilisateur est le créateur du quiz.

---

### 3. Gestion des Questions

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/quizzes/:quizId/questions` | POST | Ajouter une question | Créateur seul |
| `/api/v1/quizzes/:quizId/questions/next-ordre` | GET | Prochain ordre | Créateur seul |
| `/api/v1/questions` | GET | Toutes les questions | Admin/créateur |
| `/api/v1/questions/:id` | PUT | Modifier une question | Créateur seul |
| `/api/v1/questions/:id` | DELETE | Supprimer une question | Créateur seul |

---

### 4. Gestion des Invitations

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/invitations/quizzes/:quizId/invitations` | POST | Créer invitation | Créateur seul |
| `/api/v1/invitations/quizzes/:quizId/invitations` | GET | Liste invitations | Créateur seul |
| `/api/v1/invitations/:id` | DELETE | Supprimer invitation | Créateur seul |

**Note :** Toutes les routes d'invitations sont protégées via `invitationRoutes.use('/*', authMiddleware)`

---

### 5. Statistiques et Résultats (Créateur)

| Endpoint | Méthode | Description | Raison |
|----------|---------|-------------|--------|
| `/api/v1/participations/mes-participations` | GET | Mes participations | Utilisateur connecté |
| `/api/v1/participations/quiz/:quizId/participations` | GET | Participations d'un quiz | Créateur seul |
| `/api/v1/participations/quiz/:quizId/statistics` | GET | Statistiques du quiz | Créateur seul |

**Vérification supplémentaire :** Le service vérifie que l'utilisateur est le créateur du quiz.

---

## Flux Utilisateurs

### Flux A : Participant Anonyme (SANS authentification)

```
1. Reçoit lien par email : https://quizlab.com/quiz/abc123xyz
2. GET /api/v1/quizzes/partage/abc123xyz → Voir détails du quiz
3. POST /api/v1/participations → Démarrer (email + nom)
4. POST /api/v1/participations/reponses → Répondre aux questions
5. POST /api/v1/participations/reponses → Modifier réponse (si en_cours)
6. POST /api/v1/participations/terminer → Voir score final
7. [EMAIL] Reçoit email : "Créez vos propres quiz !"
```

**Aucune authentification requise**

---

### Flux B : Créateur Authentifié

```
1. POST /api/v1/utilisateurs/register → Créer compte
2. POST /api/v1/utilisateurs/login → Se connecter
3. [AUTH] POST /api/v1/quizzes → Créer quiz
4. [AUTH] POST /api/v1/quizzes/:id/questions → Ajouter questions
5. [AUTH] PUT /api/v1/quizzes/:id → Publier (statut=publie)
6. [AUTH] POST /api/v1/invitations/quizzes/:id/invitations → Inviter participants
7. Participants anonymes passent le quiz (flux A)
8. [AUTH] GET /api/v1/participations/quiz/:id/participations → Voir résultats
9. [AUTH] GET /api/v1/participations/quiz/:id/statistics → Voir statistiques
```

**Authentification requise à partir de l'étape 3**

---

### Flux C : Participant avec Invitation (SANS authentification)

```
1. Reçoit email avec code_acces : a1b2c3d4e5f6...
2. POST /api/v1/participations
   Body: { quiz_id, email, nom, code_acces }
3. POST /api/v1/participations/reponses → Répondre
4. POST /api/v1/participations/terminer → Score
5. [EMAIL] Reçoit email : "Créez vos propres quiz !"
```

**Aucune authentification requise**

---

## Niveaux de Protection

### Niveau 1 : Public total
- Inscription, login
- Consultation quiz (lecture seule)
- Passer un quiz (participation complète)

### Niveau 2 : Authentification de base
- Profil utilisateur
- Déconnexion
- Mes participations

### Niveau 3 : Créateur (authentification + vérification propriétaire)
- CRUD quiz
- CRUD questions
- Invitations
- Statistiques détaillées

---

## Middleware Actuel

### `authMiddleware` (src/middleware/Auth.ts)

**Fonction :**
- Vérifie la présence du cookie de session
- Décode le JWT pour extraire `userId`
- Ajoute `utilisateur` au contexte Hono

**Utilisé sur :**
- Routes de gestion (quiz, questions, invitations)
- Routes de consultation avancée (mes-quiz, mes-participations)
- Routes de statistiques (créateur)

**Non utilisé sur :**
- Routes d'authentification (register, login)
- Routes de participation publique
- Consultation publique des quiz

---

## Tableau Récapitulatif

| Catégorie | Public | Protégé | Raison |
|-----------|--------|---------|--------|
| Inscription/Login | Oui | Non | Création de compte |
| Consultation Quiz | Oui | Non | Participants anonymes |
| Passer un Quiz | Oui | Non | Expérience sans friction |
| Créer Quiz | Non | Oui | Réservé créateurs |
| Gérer Questions | Non | Oui | Propriétaire seul |
| Invitations | Non | Oui | Créateur seul |
| Statistiques Quiz | Non | Oui | Créateur seul |
| Mes Participations | Non | Oui | Utilisateur connecté |

---

## Recommandations d'Implémentation

### 1. Email Post-Quiz pour Anonymes

**Service à créer :** `src/services/Email.Service.ts`

```typescript
async sendPostQuizEmail(participation: Participation) {
  const { email_participant, nom_participant, score, pourcentage } = participation;
  
  const emailBody = `
    Bonjour ${nom_participant},
    
    Vous avez terminé le quiz avec un score de ${score} (${pourcentage}%) !
    
    Vous avez aimé cette expérience ?
    
    Créez vos propres quiz gratuitement avec QuizLab !
    
    En tant que créateur, vous pourrez :
    - Créer des quiz illimités
    - Inviter des participants
    - Consulter les statistiques détaillées
    - Partager facilement par lien
    
    Inscrivez-vous maintenant : https://quizlab.com/register
    Ou téléchargez l'application mobile
    
    À bientôt !
    L'équipe QuizLab
  `;
  
  await sendEmail(email_participant, 'Votre résultat de quiz', emailBody);
}
```

**Appel dans :** `ParticipationController.terminer()`

```typescript
async terminer(c: Context) {
  // ... logique existante ...
  
  // Si participant anonyme (pas de code_acces lié à un utilisateur)
  if (!participation.code_acces || participation.invitation_id === null) {
    await this.emailService.sendPostQuizEmail(participation);
  }
  
  return c.json({ success: true, data: resultDTO });
}
```

---

### 2. Vérification Propriétaire dans les Services

**Exemple dans QuizService :**

```typescript
async updateQuiz(id: number, data: UpdateQuizInput, createur_id: number) {
  const quiz = await this.quizRepository.findById(id);
  
  if (!quiz) {
    throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }
  
  // ✅ Vérification : seul le créateur peut modifier
  if (quiz.createur_id !== createur_id) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }
  
  return await this.quizRepository.update(id, data);
}
```

---

### 3. Endpoint de Consultation Publique Sécurisé

Pour `/api/v1/quizzes/:id` (public), masquer certaines infos :

```typescript
async getById(c: Context) {
  const utilisateur = getUserFromContext(c); // Peut être null
  const isCreator = utilisateur && quiz.createur_id === utilisateur.userId;
  
  // DTO différent selon le rôle
  const quizDTO = isCreator 
    ? QuizMapper.toDetailDTO(quiz, true)  // Avec stats
    : QuizMapper.toPublicDTO(quiz);       // Sans stats sensibles
  
  return c.json({ success: true, data: quizDTO });
}
```

---

## 🚨 Erreurs à Éviter

### ❌ Ne PAS faire :

1. **Protéger les routes de participation**
   ```typescript
   // ❌ MAUVAIS
   participationRoutes.post('/', authMiddleware, ...)
   ```
   → Bloque les participants anonymes

2. **Exposer des données sensibles dans les endpoints publics**
   ```typescript
   // ❌ MAUVAIS
   return {
     quiz,
     createur: { email, mot_de_passe } // 🔥 Danger !
   }
   ```

3. **Ne pas vérifier le propriétaire dans les services**
   ```typescript
   // ❌ MAUVAIS
   async deleteQuiz(id: number) {
     // Pas de vérification du createur_id
     return await this.quizRepository.delete(id);
   }
   ```

---

## ✅ Checklist de Sécurité

### Endpoints Publics
- [ ] Inscription/Login accessibles
- [ ] Quiz consultables via lien
- [ ] Participations possibles sans compte
- [ ] Email post-quiz implémenté
- [ ] Pas de données sensibles exposées

### Endpoints Protégés
- [ ] authMiddleware sur toutes les routes de gestion
- [ ] Vérification propriétaire dans les services
- [ ] Messages d'erreur clairs (403 Forbidden)
- [ ] Cookies httpOnly et sécurisés

### Tests à Effectuer
- [ ] Participant anonyme peut passer un quiz complet
- [ ] Participant anonyme NE PEUT PAS créer de quiz
- [ ] Créateur NE PEUT PAS modifier le quiz d'un autre
- [ ] Email reçu après quiz anonyme

---

## 📝 Résumé Stratégique

### Objectif Principal
**Maximiser la conversion anonyme → utilisateur inscrit**

### Stratégie
1. **Friction minimale :** Passer un quiz sans compte
2. **Expérience positive :** Résultats immédiats, interface claire
3. **Appel à l'action :** Email automatique après le quiz
4. **Valeur ajoutée :** Montrer les avantages de créer un compte

### Métriques à Suivre
- Taux de participation anonyme
- Taux de conversion email → inscription
- Temps moyen pour passer un quiz
- Taux de quiz abandonnés

---

**Date :** 27 octobre 2025  
**Version :** 1.0.0  
**Branch :** feature/api-standardization  
**Auteur :** QuizLab Security Team
