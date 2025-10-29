# 🎨 Diagrammes Visuels - QuizLab

## Vue d'ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUIZLAB API ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────┐         ┌───────────────────┐
│   👤 ANONYME      │         │   👨‍🏫 CRÉATEUR    │
│   (70% trafic)    │         │   (30% trafic)    │
└────────┬──────────┘         └────────┬──────────┘
         │                             │
         │ ✅ Endpoints publics        │ 🔒 Endpoints protégés
         ↓                             ↓
┌────────────────────────────────────────────────────────────────┐
│                         HONO SERVER                             │
│                      (Port 3000)                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Routes     │  │  Middleware  │  │ Controllers  │        │
│  │   (Public)   │→ │   (Auth?)    │→ │  (Logique)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  ↓                  │                │
│         └──────────────────┼──────────────────┘                │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────┐     │
│  │                    SERVICES                           │     │
│  │  (Quiz, Question, Participation, Invitation, Email)   │     │
│  └──────────────────────────────────────────────────────┘     │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────┐     │
│  │                  REPOSITORIES                         │     │
│  │     (Accès données via Prisma ORM)                   │     │
│  └──────────────────────────────────────────────────────┘     │
│                            ↓                                   │
└────────────────────────────┼───────────────────────────────────┘
                             ↓
                    ┌────────────────┐
                    │   PostgreSQL   │
                    │   (Database)   │
                    └────────────────┘
```

---

## Flux de Sécurité

```
┌──────────────────────────────────────────────────────────────────┐
│                    DÉCISION D'AUTHENTIFICATION                    │
└──────────────────────────────────────────────────────────────────┘

                           Requête entrante
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │  Endpoint demandé ?     │
                    └─────────────────────────┘
                          /           \
                         /             \
               ┌────────┴────────┐    └────────┬────────┐
               │  PUBLIC ✅      │             │ PROTÉGÉ 🔒 │
               └────────┬────────┘             └────────┬────────┘
                        │                               │
                        ↓                               ↓
              ┌──────────────────┐          ┌──────────────────┐
              │ Pas de middleware│          │  authMiddleware  │
              │ Accès direct     │          │  Vérifie JWT     │
              └────────┬─────────┘          └────────┬─────────┘
                       │                              │
                       │                              ↓
                       │                    ┌──────────────────┐
                       │                    │ Cookie valide ?  │
                       │                    └────────┬─────────┘
                       │                          /     \
                       │                    ✅ Oui    ❌ Non
                       │                       │        │
                       │                       ↓        ↓
                       │                  Controller  401
                       │                               │
                       ↓                               ↓
              ┌──────────────────┐          ┌──────────────────┐
              │   Controller     │          │  Erreur retournée│
              │   Traitement     │          │  "Non autorisé"  │
              └────────┬─────────┘          └──────────────────┘
                       │
                       ↓
              ┌──────────────────┐
              │    Service       │
              │   (Logique)      │
              └────────┬─────────┘
                       │
                       ↓
              ┌──────────────────┐
              │   Repository     │
              │    (Prisma)      │
              └────────┬─────────┘
                       │
                       ↓
              ┌──────────────────┐
              │    Réponse       │
              │     (JSON)       │
              └──────────────────┘
```

---

## Flux Participant Anonyme

```
┌────────────────────────────────────────────────────────────────┐
│              👤 FLUX PARTICIPANT ANONYME                        │
│              (Sans création de compte)                          │
└────────────────────────────────────────────────────────────────┘

📧 Email reçu
   "Vous êtes invité : Quiz JavaScript"
   Lien : quizlab.com/quiz/abc123
        │
        ↓
┌────────────────────────┐
│ 1. Clic sur le lien    │  ✅ GET /quizzes/partage/:lien
└───────────┬────────────┘     (Public)
            ↓
┌────────────────────────┐
│ 2. Voir détails quiz   │  Affiche : Titre, description,
│    (Sans compte)       │           nb_questions, durée
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ 3. Démarrer quiz       │  ✅ POST /participations
│    Email + Nom requis  │     Body: { quiz_id, email, nom }
└───────────┬────────────┘     (Public)
            ↓
            │ Reçoit participation_id = 14
            ↓
┌────────────────────────┐
│ 4. Question 1          │  ✅ POST /participations/reponses
│    Répondre A          │     Body: { participation_id, question_id,
└───────────┬────────────┘            choix_reponse_id }
            ↓                 (Public)
┌────────────────────────┐
│ 5. Question 2          │  ✅ POST /participations/reponses
│    Répondre B          │     (Public)
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ 6. Question 3          │  ✅ POST /participations/reponses
│    Répondre C          │     (Public)
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ 7. Terminer quiz       │  ✅ POST /participations/terminer
│    Voir score : 85%    │     Body: { participation_id }
└───────────┬────────────┘     (Public)
            ↓
            │ Reçoit : Score, réponses détaillées
            ↓
┌────────────────────────────────────────┐
│ 8. Email automatique envoyé 📧         │
│    "🎉 Score 85% !                     │
│    Créez vos propres quiz !"           │
│    [Créer mon compte]                  │
└────────────────────────────────────────┘

✅ AUCUNE AUTHENTIFICATION REQUISE
```

---

## Flux Créateur

```
┌────────────────────────────────────────────────────────────────┐
│                 👨‍🏫 FLUX CRÉATEUR                               │
│                 (Avec compte requis)                            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────┐
│ 1. Inscription         │  ✅ POST /utilisateurs/register
│    Email + Password    │     Body: { nom, prenom, email, password }
└───────────┬────────────┘     (Public)
            ↓
            │ Compte créé → user_id = 5
            ↓
┌────────────────────────┐
│ 2. Connexion           │  ✅ POST /utilisateurs/login
│    Email + Password    │     Body: { email, password }
└───────────┬────────────┘     (Public)
            ↓
            │ Reçoit Cookie JWT 🔑
            ↓
╔════════════════════════╗
║   ZONE PROTÉGÉE 🔒     ║  (authMiddleware actif)
╚════════════════════════╝
            ↓
┌────────────────────────┐
│ 3. Créer quiz          │  🔒 POST /quizzes
│    Titre + Desc        │     Cookie: JWT
└───────────┬────────────┘     Body: { titre, description, type }
            ↓
            │ Quiz créé → quiz_id = 8
            ↓
┌────────────────────────┐
│ 4. Ajouter question 1  │  🔒 POST /quizzes/8/questions
│    + choix réponses    │     Cookie: JWT
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ 5. Ajouter question 2  │  🔒 POST /quizzes/8/questions
│    + choix réponses    │     Cookie: JWT
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ 6. Publier quiz        │  🔒 PUT /quizzes/8
│    statut = "publie"   │     Cookie: JWT
└───────────┬────────────┘     Body: { statut: "publie" }
            ↓
┌────────────────────────┐
│ 7. Inviter 10 personnes│  🔒 POST /invitations/quizzes/8/invitations
│    Emails liste        │     Cookie: JWT (x10 fois)
└───────────┬────────────┘
            ↓
            │ 10 emails envoyés automatiquement 📧
            ↓
┌────────────────────────┐
│ 8. Participants passent│  (Voir flux anonyme ci-dessus)
│    le quiz             │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ 9. Voir résultats      │  🔒 GET /participations/quiz/8/participations
│    Liste scores        │     Cookie: JWT
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ 10. Statistiques       │  🔒 GET /participations/quiz/8/statistics
│     Graphiques, taux   │     Cookie: JWT
└────────────────────────┘

🔒 AUTHENTIFICATION REQUISE (étapes 3-10)
```

---

## Matrice de Permissions

```
┌─────────────────────────────────────────────────────────────────┐
│                   QUI PEUT FAIRE QUOI ?                          │
└─────────────────────────────────────────────────────────────────┘

                    👤         👨‍💼          👨‍🏫         👑
                 Anonyme   Utilisateur   Créateur     Admin
                ─────────────────────────────────────────────
Voir quiz          ✅          ✅           ✅          ✅
Passer quiz        ✅          ✅           ✅          ✅
Créer compte       ✅          ✅           ✅          ✅
─────────────────────────────────────────────────────────
Créer quiz         ❌          ✅           ✅          ✅
Modifier son quiz  ❌          ❌           ✅          ✅
Supprimer son quiz ❌          ❌           ✅          ✅
─────────────────────────────────────────────────────────
Inviter            ❌          ❌           ✅          ✅
Voir statistiques  ❌          ❌           ✅          ✅
Exporter données   ❌          ❌           ✅          ✅
─────────────────────────────────────────────────────────
Modifier quiz      ❌          ❌           ❌          ✅
d'autrui
Supprimer          ❌          ❌           ❌          ✅
n'importe quoi
Gérer utilisateurs ❌          ❌           ❌          ✅
```

---

## Conversion Funnel

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTONNOIR DE CONVERSION                       │
└─────────────────────────────────────────────────────────────────┘

📊 PHASE 1 : ACQUISITION
┌─────────────────────────────────────────┐
│  10,000 emails envoyés                  │  100%
└─────────────────┬───────────────────────┘
                  ↓ Taux ouverture 40%
┌─────────────────────────────────────────┐
│  4,000 liens cliqués                    │  40%
└─────────────────┬───────────────────────┘
                  ↓ Taux complétion 75%
┌─────────────────────────────────────────┐
│  3,000 quiz terminés                    │  30%
└─────────────────┬───────────────────────┘
                  │
                  │ 📧 Email post-quiz
                  ↓
📊 PHASE 2 : CONVERSION
┌─────────────────────────────────────────┐
│  900 emails ouverts (30%)               │  9%
└─────────────────┬───────────────────────┘
                  ↓ Taux clic CTA 20%
┌─────────────────────────────────────────┐
│  180 clics "Créer mon compte"           │  1.8%
└─────────────────┬───────────────────────┘
                  ↓ Taux inscription 80%
┌─────────────────────────────────────────┐
│  144 inscriptions                       │  1.44%
└─────────────────┬───────────────────────┘
                  │
                  ↓
📊 PHASE 3 : ACTIVATION
┌─────────────────────────────────────────┐
│  108 premiers quiz créés (75%)          │  1.08%
└─────────────────┬───────────────────────┘
                  ↓ Partage viral
┌─────────────────────────────────────────┐
│  1,080 nouvelles participations         │
│  (10 invitations/quiz)                  │
└─────────────────────────────────────────┘
                  │
                  ↓ Le cycle recommence ! 🔄
```

**Résultat :** Pour 10,000 emails initiaux → 108 créateurs actifs (1.08% conversion)

---

## Timeline de Développement

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROADMAP TECHNIQUE                           │
└─────────────────────────────────────────────────────────────────┘

SEMAINE 1-2 : Architecture Endpoints
├─ Définir endpoints publics vs protégés  ✅
├─ Implémenter middleware Auth            ✅
├─ DTOs et mappers                        ✅
└─ Documentation complète                 ✅

SEMAINE 3-4 : Flux Participants
├─ Routes publiques participations        □
├─ Service email automatique              □
├─ Tests E2E flux anonyme                 □
└─ Optimisation UX (temps réponse < 1s)   □

SEMAINE 5-6 : Flux Créateurs
├─ Routes protégées gestion quiz          □
├─ Système invitations                    □
├─ Statistiques & dashboard               □
└─ Tests E2E flux créateur                □

SEMAINE 7-8 : Conversion
├─ Email post-quiz automatique            □
├─ Landing page inscription               □
├─ Onboarding créateur guidé              □
└─ A/B testing emails (3 variantes)       □

SEMAINE 9-10 : Performance & Sécurité
├─ Rate limiting                          □
├─ Caching (Redis)                        □
├─ Tests de charge (10k users)            □
└─ Audit sécurité                         □

SEMAINE 11-12 : Beta & Launch
├─ Beta privée (100 créateurs)            □
├─ Ajustements feedback                   □
├─ Lancement public                       □
└─ Monitoring production                  □
```

---

## Stack Technique

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGIES UTILISÉES                      │
└─────────────────────────────────────────────────────────────────┘

🖥️  BACKEND
    ├─ Runtime      : Node.js 18+
    ├─ Framework    : Hono (ultra-rapide)
    ├─ ORM          : Prisma
    ├─ Auth         : JWT + httpOnly Cookies
    └─ Validation   : Zod

🗄️  DATABASE
    ├─ SGBD         : PostgreSQL 14+
    ├─ Migrations   : Prisma Migrate
    └─ Seed         : Scripts TypeScript

📧  EMAIL
    ├─ Service      : SendGrid / Mailgun
    ├─ Templates    : Handlebars
    └─ Queue        : Bull (Redis)

🧪  TESTS
    ├─ Unit         : Jest
    ├─ E2E          : Postman + Newman
    ├─ Load         : K6
    └─ Coverage     : > 80%

📊  MONITORING
    ├─ Logs         : Winston
    ├─ APM          : Datadog / New Relic
    ├─ Errors       : Sentry
    └─ Analytics    : Mixpanel

🚀  DEVOPS
    ├─ CI/CD        : GitHub Actions
    ├─ Container    : Docker
    ├─ Hosting      : AWS / Vercel
    └─ CDN          : CloudFlare
```

---

**Documentation complète :** [INDEX.md](./INDEX.md)  
**Dernière mise à jour :** 27 octobre 2025  
**Version :** 2.0.0
