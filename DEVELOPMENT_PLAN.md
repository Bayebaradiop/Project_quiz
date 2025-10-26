# Plan de Développement - QuizLab API

## État actuel : 26 octobre 2025

### ✅ Modules Complétés

#### 1. Module Utilisateur/Authentification (dev/v1.0.0)
- ✅ Registration avec validation
- ✅ Login avec JWT (HTTP-only cookies)
- ✅ Logout
- ✅ Récupération des rôles
- ✅ Système de rôles en enum (user/admin)
- ✅ Messages d'erreur centralisés
- ✅ Documentation POSTMAN complète

#### 2. Module Quiz (dev/quiz-v1.0.0) ✨ ACTUEL
- ✅ CRUD complet pour les quiz
- ✅ Génération automatique de lien de partage
- ✅ Permissions (créateur uniquement pour modification/suppression)
- ✅ Accès public via lien de partage
- ✅ Types: instantane | programme
- ✅ Statuts: brouillon | publie
- ✅ Documentation POSTMAN + Tests curl
- ✅ Validation Zod complète
- ✅ Tests fonctionnels réussis

---

## 🚀 Modules à Développer

### 3. Module Question (dev/question-v1.0.0)
**Dépendances:** Quiz

**Schéma Prisma existant:**
```prisma
model Question {
  id              Int       @id @default(autoincrement())
  quiz_id         Int
  quiz            Quiz      @relation(fields: [quiz_id], references: [id])
  texte_question  String
  type_question   TypeQuestion
  points          Int       @default(1)
  temps_limite    Int?
  ordre           Int
  reponses        Reponse[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
}

enum TypeQuestion {
  choix_unique
  choix_multiple
  vrai_faux
  texte_court
}
```

**Fonctionnalités à implémenter:**
- [ ] CRUD Questions (lié à un quiz)
- [ ] Types de questions: choix_unique, choix_multiple, vrai_faux, texte_court
- [ ] Gestion de l'ordre des questions
- [ ] Points par question (score)
- [ ] Temps limite optionnel par question
- [ ] Validation: créateur du quiz uniquement
- [ ] Endpoint: GET /api/v1/quizzes/:quizId/questions
- [ ] Endpoint: POST /api/v1/quizzes/:quizId/questions
- [ ] Endpoint: PUT /api/v1/questions/:id
- [ ] Endpoint: DELETE /api/v1/questions/:id
- [ ] Réorganisation de l'ordre des questions

**Fichiers à créer:**
- `src/interfaces/QuestionInterface.ts`
- `src/validations/Question.validator.ts`
- `src/repositories/QuestionRepository.ts`
- `src/services/Question.Service.ts`
- `src/controllers/QuestionController.ts`
- `src/routes/questions.routes.ts`

---

### 4. Module Réponse (dev/reponse-v1.0.0)
**Dépendances:** Question

**Schéma Prisma existant:**
```prisma
model Reponse {
  id                Int       @id @default(autoincrement())
  question_id       Int
  question          Question  @relation(fields: [question_id], references: [id])
  texte_reponse     String
  est_correcte      Boolean   @default(false)
  ordre             Int?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
}
```

**Fonctionnalités à implémenter:**
- [ ] CRUD Réponses (lié à une question)
- [ ] Marquer les réponses correctes
- [ ] Gestion de l'ordre des réponses
- [ ] Validation: créateur du quiz uniquement
- [ ] Support choix multiple (plusieurs réponses correctes)
- [ ] Endpoint: GET /api/v1/questions/:questionId/reponses
- [ ] Endpoint: POST /api/v1/questions/:questionId/reponses
- [ ] Endpoint: PUT /api/v1/reponses/:id
- [ ] Endpoint: DELETE /api/v1/reponses/:id

**Fichiers à créer:**
- `src/interfaces/ReponseInterface.ts`
- `src/validations/Reponse.validator.ts`
- `src/repositories/ReponseRepository.ts`
- `src/services/Reponse.Service.ts`
- `src/controllers/ReponseController.ts`
- `src/routes/reponses.routes.ts`

---

### 5. Module Invitation (dev/invitation-v1.0.0)
**Dépendances:** Quiz, Utilisateur

**Schéma Prisma existant:**
```prisma
model Invitation {
  id              Int              @id @default(autoincrement())
  quiz_id         Int
  quiz            Quiz             @relation(fields: [quiz_id], references: [id])
  email           String
  nom             String?
  prenom          String?
  statut          StatutInvitation @default(en_attente)
  code_acces      String           @unique
  date_envoi      DateTime         @default(now())
  date_expiration DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  deletedAt       DateTime?
}

enum StatutInvitation {
  en_attente
  accepte
  refuse
  expire
}
```

**Fonctionnalités à implémenter:**
- [ ] Inviter des participants par email
- [ ] Génération de code d'accès unique
- [ ] Envoi d'emails (optionnel pour MVP)
- [ ] Statuts: en_attente, accepte, refuse, expire
- [ ] Date d'expiration optionnelle
- [ ] Liste des invitations d'un quiz
- [ ] Validation du code d'accès
- [ ] Endpoint: POST /api/v1/quizzes/:quizId/invitations
- [ ] Endpoint: GET /api/v1/quizzes/:quizId/invitations
- [ ] Endpoint: POST /api/v1/invitations/validate (public)
- [ ] Endpoint: PUT /api/v1/invitations/:id/status

**Fichiers à créer:**
- `src/interfaces/InvitationInterface.ts`
- `src/validations/Invitation.validator.ts`
- `src/repositories/InvitationRepository.ts`
- `src/services/Invitation.Service.ts`
- `src/controllers/InvitationController.ts`
- `src/routes/invitations.routes.ts`

---

### 6. Module Participation/Réponses Participants (future)
**Dépendances:** Quiz, Question, Réponse, Invitation

**Fonctionnalités futures:**
- Enregistrer les réponses des participants
- Calcul du score en temps réel
- Statistiques par question
- Classement des participants
- Historique des participations

---

## 🔄 Ordre de Développement Recommandé

1. ✅ **Utilisateur** (complété)
2. ✅ **Quiz** (complété)
3. ⏭️ **Question** (suivant) - Car les quiz ont besoin de questions
4. ⏭️ **Réponse** (après Question) - Car les questions ont besoin de réponses
5. ⏭️ **Invitation** (après Quiz) - Peut être développé en parallèle
6. 🔮 **Participation** (futur) - Une fois tout le reste stable

---

## 📋 Checklist par Module

Pour chaque module, suivre cette checklist :

- [ ] 1. Créer l'interface TypeScript
- [ ] 2. Créer le validator Zod avec messages
- [ ] 3. Créer le repository (CRUD)
- [ ] 4. Créer le service (logique métier)
- [ ] 5. Créer le controller (HTTP handlers)
- [ ] 6. Créer les routes
- [ ] 7. Monter les routes dans server.ts
- [ ] 8. Mettre à jour Message.error.ts
- [ ] 9. Ajouter la documentation POSTMAN
- [ ] 10. Tester avec curl/Postman
- [ ] 11. Vérifier TypeScript (npx tsc --noEmit)
- [ ] 12. Commit et push sur la branche

---

## 🎯 Prochaine Action

**Démarrer le Module Question sur la branche `dev/question-v1.0.0`**

```bash
git checkout dev/question-v1.0.0
```

---

## 📝 Notes Importantes

- **Architecture respectée:** interfaces → validations → repositories → services → controllers → routes
- **Messages centralisés:** Tous les messages dans `Message.error.ts`
- **Validation Zod:** Schémas de validation stricts
- **Permissions:** Vérifier que seul le créateur peut modifier
- **Tests:** Tester chaque endpoint avant de commit
- **Documentation:** Mettre à jour POSTMAN_TESTS.md à chaque module

---

**Dernière mise à jour:** 26 octobre 2025
**Status:** Module Quiz complété ✅ - Prêt pour Question
