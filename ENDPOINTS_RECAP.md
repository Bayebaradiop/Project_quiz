# Récapitulatif - Endpoints Publics vs Protégés

## Vue d'ensemble rapide

| Catégorie | Publics | Protégés | Total |
|-----------|-----------|------------|-------|
| Authentification | 2 | 2 | 4 |
| Quiz | 4 | 5 | 9 |
| Questions | 2 | 5 | 7 |
| Invitations | 0 | 3 | 3 |
| Participations | 6 | 3 | 9 |
| **TOTAL** | **14** | **18** | **32** |

**Ratio :** 44% publics, 56% protégés

---

## Endpoints PUBLICS (14 au total)

### 1. Authentification (2)
```
POST /api/v1/utilisateurs/register     - Inscription
POST /api/v1/utilisateurs/login        - Connexion
```

### 2. Consultation Quiz (4)
```
GET  /api/v1/quizzes/partage/:lien     - Via lien de partage
GET  /api/v1/quizzes/:id               - Détails d'un quiz
GET  /api/v1/quizzes/:id/questions     - Questions du quiz
GET  /api/v1/quizzes/:quizId/questions - Liste des questions
```

### 3. Participations Complètes (6)
```
POST /api/v1/participations/public/:lien   - Via lien public
POST /api/v1/participations                - Démarrer
POST /api/v1/participations/reponses       - Soumettre réponse
POST /api/v1/participations/terminer       - Terminer & score
POST /api/v1/participations/:id/abandonner - Abandonner
GET  /api/v1/participations/:id            - Voir résultats
```

### 4. Autres (2)
```
GET  /api/v1/utilisateurs/roles        - Liste des rôles
GET  /api/v1/quizzes/partage/:lien     - Quiz public
```

---

## Endpoints PROTÉGÉS (18 au total)

### 1. Compte Utilisateur (2)
```
[AUTH] GET  /api/v1/utilisateurs/me          - Profil utilisateur
[AUTH] POST /api/v1/utilisateurs/logout      - Déconnexion
```

### 2. Gestion Quiz (5)
```
[AUTH] POST   /api/v1/quizzes                - Créer quiz
[AUTH] GET    /api/v1/quizzes                - Liste tous les quiz
[AUTH] GET    /api/v1/quizzes/mes-quiz       - Mes quiz
[AUTH] PUT    /api/v1/quizzes/:id            - Modifier quiz
[AUTH] DELETE /api/v1/quizzes/:id            - Supprimer quiz
```

### 3. Gestion Questions (5)
```
[AUTH] POST   /api/v1/quizzes/:quizId/questions     - Ajouter question
[AUTH] GET    /api/v1/quizzes/:quizId/questions/next-ordre - Prochain ordre
[AUTH] GET    /api/v1/questions                     - Toutes les questions
[AUTH] PUT    /api/v1/questions/:id                 - Modifier question
[AUTH] DELETE /api/v1/questions/:id                 - Supprimer question
```

### 4. Invitations (3)
```
[AUTH] POST   /api/v1/invitations/quizzes/:quizId/invitations - Créer invitation
[AUTH] GET    /api/v1/invitations/quizzes/:quizId/invitations - Liste invitations
[AUTH] DELETE /api/v1/invitations/:id                         - Supprimer invitation
```

### 5. Statistiques (3)
```
[AUTH] GET /api/v1/participations/mes-participations       - Mes participations
[AUTH] GET /api/v1/participations/quiz/:quizId/participations - Participations quiz
[AUTH] GET /api/v1/participations/quiz/:quizId/statistics     - Statistiques quiz
```

---

## Cas d'Usage par Endpoint

### Participant Anonyme (14 endpoints)
```
Inscription → Voir quiz → Démarrer → Répondre → Terminer → Voir score
   [PUBLIC]     [PUBLIC]    [PUBLIC]    [PUBLIC]    [PUBLIC]    [PUBLIC]
```

### Créateur (32 endpoints = 14 publics + 18 protégés)
```
Inscription → Login → Créer quiz → Ajouter Q → Inviter → Voir stats
  [PUBLIC]   [PUBLIC]   [AUTH]       [AUTH]      [AUTH]     [AUTH]
```

---

## Matrice de Permissions

| Action | Anonyme | Utilisateur | Créateur | Admin |
|--------|---------|-------------|----------|-------|
| **Voir quiz public** | Oui | Oui | Oui | Oui |
| **Passer un quiz** | Oui | Oui | Oui | Oui |
| **Créer quiz** | Non | Oui | Oui | Oui |
| **Modifier son quiz** | Non | Non | Oui | Oui |
| **Modifier quiz d'autrui** | Non | Non | Non | Oui |
| **Voir statistiques** | Non | Non | Oui | Oui |
| **Inviter participants** | Non | Non | Oui | Oui |

---

## Middleware Utilisé

### `authMiddleware`
**Fichier :** `src/middleware/Auth.ts`

**Vérifie :**
1. Présence du cookie de session
2. Validité du JWT
3. Extraction du `userId`

**Appliqué sur :**
- Routes `/quizzes` (sauf consultation)
- Routes `/questions` (sauf lecture quiz)
- Routes `/invitations` (toutes)
- Routes `/participations/mes-*` et `/participations/quiz/*`

**Non appliqué sur :**
- `/utilisateurs/register` et `/login`
- `/participations` (démarrer, répondre, terminer)
- `/quizzes/partage/:lien` et `/quizzes/:id` (consultation)

---

## Points de Vigilance

### Erreurs à Éviter

1. **Protéger les participations**
   ```typescript
   // FAUX
   participationRoutes.post('/', authMiddleware, ...)
   
   // CORRECT
   participationRoutes.post('/', ...) // Public
   ```

2. **Oublier la vérification propriétaire**
   ```typescript
   // FAUX - Modifier quiz sans vérifier
   async updateQuiz(id, data) {
     return await quizRepository.update(id, data);
   }
   
   // CORRECT - Vérifier le créateur
   async updateQuiz(id, data, createur_id) {
     const quiz = await quizRepository.findById(id);
     if (quiz.createur_id !== createur_id) {
       throw new Error('FORBIDDEN');
     }
     return await quizRepository.update(id, data);
   }
   ```

3. **Exposer des données sensibles**
   ```typescript
   // FAUX
   return { quiz, createur: { email, mot_de_passe } }
   
   // CORRECT
   return QuizMapper.toPublicDTO(quiz) // Filtre les données
   ```

---

## Checklist de Sécurité

### Configuration Serveur
- [ ] Cookie httpOnly = true
- [ ] Cookie secure = true (en production)
- [ ] JWT secret fort (32+ caractères)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé

### Endpoints Publics
- [ ] Participations accessibles sans compte
- [ ] Consultation quiz publique
- [ ] Pas de données sensibles exposées
- [ ] Validation des inputs stricte

### Endpoints Protégés
- [ ] authMiddleware sur toutes les routes de gestion
- [ ] Vérification propriétaire dans les services
- [ ] Messages d'erreur clairs (403 vs 401)
- [ ] Logs des tentatives d'accès non autorisées

### Tests à Effectuer
- [ ] Participant anonyme passe un quiz complet
- [ ] Participant anonyme NE PEUT PAS créer de quiz
- [ ] Créateur NE PEUT PAS modifier quiz d'autrui
- [ ] Token JWT expiré rejette la requête
- [ ] Sans token, endpoints protégés = 401

---

## Statistiques d'Utilisation (Prévisions)

| Type d'utilisateur | % trafic | Endpoints utilisés |
|-------------------|----------|-------------------|
| **Anonyme** | 70% | 14 publics |
| **Créateur occasionnel** | 20% | 14 publics + 10 protégés |
| **Créateur actif** | 10% | Tous (32 endpoints) |

**Conclusion :** 70% du trafic sur endpoints publics → Optimiser ces endpoints en priorité !

---

## Références

- **Documentation détaillée :** [ENDPOINTS_SECURITY.md](./ENDPOINTS_SECURITY.md)
- **Flux utilisateurs :** [FLUX_UTILISATEURS.md](./FLUX_UTILISATEURS.md)
- **Tests Postman :** [GUIDE_TEST_COMPLET_POSTMAN.md](./GUIDE_TEST_COMPLET_POSTMAN.md)

---

**Date :** 27 octobre 2025  
**Version :** 1.0.0  
**Branch :** feature/api-standardization
