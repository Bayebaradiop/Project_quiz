# 🎯 Flux Utilisateurs - API QuizLab

## Vue d'ensemble des Parcours

Ce document présente visuellement les différents parcours utilisateurs dans l'application QuizLab.

---

## 🚶 Flux A : Participant Anonyme (SANS compte)

```
┌─────────────────────────────────────────────────────────────┐
│  👤 PARTICIPANT ANONYME                                      │
│  Objectif : Passer un quiz sans créer de compte             │
└─────────────────────────────────────────────────────────────┘

📧 Étape 1 : Réception email/SMS
   ↓
   "Vous êtes invité à passer le quiz : JavaScript ES6+"
   Lien : https://quizlab.com/quiz/abc123xyz

🌐 Étape 2 : Accès au quiz (Public ✅)
   ↓
   GET /api/v1/quizzes/partage/abc123xyz
   ↓
   Affiche : Titre, description, nb_questions, durée

▶️ Étape 3 : Démarrer la participation (Public ✅)
   ↓
   POST /api/v1/participations
   Body: {
     "quiz_id": 8,
     "email_participant": "participant@example.com",
     "nom_participant": "Sophie Martin",
     "code_acces": "a1b2c3d4..." (optionnel)
   }
   ↓
   Reçoit : participation_id = 14

📝 Étape 4 : Répondre aux questions (Public ✅)
   ↓
   POST /api/v1/participations/reponses (x3 fois)
   Body: {
     "participation_id": 14,
     "question_id": 19,
     "choix_reponse_id": 68,
     "temps_reponse": 20
   }
   ↓
   Peut MODIFIER ses réponses tant que statut = "en_cours"

🏁 Étape 5 : Terminer le quiz (Public ✅)
   ↓
   POST /api/v1/participations/terminer
   Body: { "participation_id": 14 }
   ↓
   Reçoit : Score, pourcentage, réponses détaillées

📧 Étape 6 : Email automatique
   ↓
   "🎉 Quiz terminé ! Score : 85%
   
   Créez vos propres quiz gratuitement !
   [📱 Télécharger l'app] [🌐 S'inscrire]"

✅ RÉSULTAT : Quiz passé sans jamais créer de compte
```

**Endpoints utilisés :** Tous PUBLICS ✅

---

## 👨‍🏫 Flux B : Créateur de Quiz (AVEC compte)

```
┌─────────────────────────────────────────────────────────────┐
│  👨‍💼 CRÉATEUR                                                 │
│  Objectif : Créer et gérer des quiz                         │
└─────────────────────────────────────────────────────────────┘

📝 Étape 1 : Inscription (Public ✅)
   ↓
   POST /api/v1/utilisateurs/register
   Body: {
     "nom": "Dupont",
     "prenom": "Jean",
     "email": "jean@example.com",
     "mot_de_passe": "SecurePass@123"
   }
   ↓
   Reçoit : user_id = 5

🔑 Étape 2 : Connexion (Public ✅)
   ↓
   POST /api/v1/utilisateurs/login
   Body: { "email": "jean@example.com", "mot_de_passe": "..." }
   ↓
   Reçoit : Cookie de session (JWT)

🆕 Étape 3 : Créer un quiz (Protégé 🔒)
   ↓
   POST /api/v1/quizzes
   Cookie: [Session JWT]
   Body: {
     "titre": "Quiz JavaScript Avancé",
     "description": "Testez vos connaissances",
     "type_quiz": "instantane",
     "statut": "brouillon"
   }
   ↓
   Reçoit : quiz_id = 8, lien_partage

➕ Étape 4 : Ajouter des questions (Protégé 🔒)
   ↓
   POST /api/v1/quizzes/8/questions (x3 fois)
   Cookie: [Session JWT]
   Body: {
     "texte": "Quelle est la différence entre let et var ?",
     "duree": 30,
     "ordre": 1,
     "choix_reponses": [
       { "texte": "Aucune différence", "est_correcte": false },
       { "texte": "let a une portée de bloc", "est_correcte": true }
     ]
   }

📢 Étape 5 : Publier le quiz (Protégé 🔒)
   ↓
   PUT /api/v1/quizzes/8
   Cookie: [Session JWT]
   Body: { "statut": "publie" }

✉️ Étape 6 : Inviter des participants (Protégé 🔒)
   ↓
   POST /api/v1/invitations/quizzes/8/invitations (x5 fois)
   Cookie: [Session JWT]
   Body: {
     "email": "participant1@example.com",
     "nom": "Martin",
     "prenom": "Sophie"
   }
   ↓
   Génère : code_acces unique pour chaque invité
   ↓
   Envoie : Email automatique avec lien + code

⏳ Étape 7 : Les participants passent le quiz
   ↓
   (Voir Flux A - Participant Anonyme)
   ↓
   15 participants terminent le quiz

📊 Étape 8 : Consulter les résultats (Protégé 🔒)
   ↓
   GET /api/v1/participations/quiz/8/participations
   Cookie: [Session JWT]
   ↓
   Reçoit : Liste de toutes les participations avec scores

📈 Étape 9 : Voir les statistiques (Protégé 🔒)
   ↓
   GET /api/v1/participations/quiz/8/statistics
   Cookie: [Session JWT]
   ↓
   Reçoit : Taux de réussite, temps moyen, graphiques

✅ RÉSULTAT : Quiz créé, participants invités, statistiques analysées
```

**Endpoints utilisés :** Publics (1-2) puis PROTÉGÉS (3-9) 🔒

---

## 🔄 Flux C : Conversion Anonyme → Créateur

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 CONVERSION                                               │
│  Objectif : Transformer un participant en créateur          │
└─────────────────────────────────────────────────────────────┘

👤 Étape 1 : Participant anonyme passe un quiz
   ↓
   (Voir Flux A complet)
   ↓
   Score : 85% - Expérience positive ! 🎉

📧 Étape 2 : Réception email automatique
   ↓
   "🎉 Félicitations ! Score : 85%
   
   Vous avez aimé cette expérience ?
   
   🌟 Créez vos propres quiz GRATUITEMENT !
   
   En tant que créateur :
   ✅ Quiz illimités
   ✅ Invitations illimitées
   ✅ Statistiques détaillées
   ✅ Partage facile par lien
   
   [🚀 CRÉER MON COMPTE MAINTENANT]"

👆 Étape 3 : Clic sur le bouton
   ↓
   Redirige vers : /register
   ↓
   Email pré-rempli : participant@example.com

📝 Étape 4 : Inscription (Public ✅)
   ↓
   POST /api/v1/utilisateurs/register
   Body: {
     "nom": "Martin",
     "prenom": "Sophie",
     "email": "participant@example.com", // Pré-rempli
     "mot_de_passe": "MonMotDePasse@123"
   }
   ↓
   Compte créé ! 🎊

🔑 Étape 5 : Connexion automatique
   ↓
   POST /api/v1/utilisateurs/login
   ↓
   Session active

🎓 Étape 6 : Onboarding créateur
   ↓
   "Bienvenue Sophie ! 👋
   
   Créez votre premier quiz en 3 étapes :
   1. Donnez un titre et une description
   2. Ajoutez vos questions
   3. Partagez le lien !"

🆕 Étape 7 : Création du premier quiz
   ↓
   (Voir Flux B à partir de l'étape 3)

✅ RÉSULTAT : Conversion réussie ! Participant → Créateur actif
```

**Taux de conversion visé :** 15-20% des participants anonymes

---

## 📊 Comparaison des Flux

| Critère | Participant Anonyme | Créateur | Conversion |
|---------|---------------------|----------|------------|
| **Authentification** | ❌ Non requise | ✅ Requise | ✅ Après expérience |
| **Friction** | 🟢 Minimale | 🟡 Modérée | 🟢 Optimisée |
| **Endpoints publics** | ✅ Tous | ⚠️ 2/10 | ✅ Puis protégés |
| **Temps moyen** | 5-10 min | 15-30 min | Variable |
| **Email reçu** | 1 (post-quiz) | Multiple | 1 (conversion) |
| **Valeur ajoutée** | Passer quiz | Créer quiz | Les deux ! |

---

## 🔐 Règles de Sécurité par Flux

### Flux A (Participant Anonyme)
✅ **Peut :**
- Voir un quiz via lien
- Démarrer une participation
- Répondre aux questions
- Modifier réponses (en cours)
- Terminer et voir score

❌ **Ne peut PAS :**
- Créer un quiz
- Modifier un quiz existant
- Voir les statistiques globales
- Inviter d'autres participants

### Flux B (Créateur)
✅ **Peut :**
- Tout ce qu'un anonyme peut faire
- Créer des quiz illimités
- Gérer ses quiz (CRUD)
- Inviter des participants
- Voir toutes les statistiques
- Accéder à son dashboard

❌ **Ne peut PAS :**
- Modifier les quiz d'autres créateurs
- Supprimer les participations des autres
- Accéder aux données sensibles

---

## 🎯 Métriques de Succès

### Pour le Flux A (Anonyme)
- ✅ Taux d'abandon < 20%
- ✅ Temps moyen de complétion < 10 min
- ✅ Satisfaction score > 4/5
- ✅ Email de conversion ouvert > 30%

### Pour le Flux B (Créateur)
- ✅ Premier quiz créé < 24h après inscription
- ✅ Taux d'invitation > 5 participants/quiz
- ✅ Retour créateur > 50% (2e quiz créé)
- ✅ Statistiques consultées > 70%

### Pour le Flux C (Conversion)
- ✅ Taux de clic email > 10%
- ✅ Taux de conversion > 15%
- ✅ Temps avant première création < 48h
- ✅ Rétention 30 jours > 40%

---

## 🚀 Optimisations Recommandées

### Pour Augmenter la Conversion

1. **Email timing**
   - Envoyer immédiatement après le quiz
   - Rappel après 24h si pas de clic
   - Rappel après 7j avec témoignage

2. **Contenu email**
   - Personnaliser avec le score
   - Montrer des exemples de quiz créés
   - Témoignages de créateurs satisfaits
   - Badge "Top Participant" si score > 80%

3. **Landing page d'inscription**
   - Email pré-rempli
   - Formulaire simplifié
   - Preview d'un quiz exemple
   - Compteur "Déjà 1,234 créateurs"

4. **Onboarding guidé**
   - Tutorial interactif
   - Template de quiz pré-rempli
   - Suggestions de questions
   - Premier partage facilité

---

**Date :** 27 octobre 2025  
**Version :** 1.0.0  
**Branch :** feature/api-standardization  
**Auteur :** QuizLab UX Team
