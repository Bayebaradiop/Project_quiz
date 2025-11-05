# 🔗 Utilisation du Lien de Partage

## Votre Quiz
```json
{
  "id": "L93D03e0",
  "titre": "Quiz la guerre mondial",
  "lien_partage": "905bf58c0e9cbfb0db0ddf5e48597774"
}
```

---

## 📋 Comment ça marche

### **1. Accès PUBLIC au quiz via le lien**

**Endpoint :**
```
GET http://localhost:3000/api/v1/quizzes/partage/905bf58c0e9cbfb0db0ddf5e48597774
```

**Pas d'authentification requise** ✅

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "L93D03e0",
    "titre": "Quiz la guerre mondial",
    "description": "string",
    "questions": [...],
    "lien_partage": "905bf58c0e9cbfb0db0ddf5e48597774"
  }
}
```

---

## 🎯 Cas d'usage

### **Scénario 1 : Partage direct**
```
1. Créateur crée le quiz
2. Reçoit le lien_partage: "905bf58c0e9cbfb0db0ddf5e48597774"
3. Partage ce lien à ses participants
4. Les participants accèdent au quiz via:
   GET /api/v1/quizzes/partage/905bf58c0e9cbfb0db0ddf5e48597774
```

### **Scénario 2 : Frontend**
```
Le frontend peut construire l'URL:
http://votreapp.com/quiz/905bf58c0e9cbfb0db0ddf5e48597774

Qui fait en interne:
GET /api/v1/quizzes/partage/905bf58c0e9cbfb0db0ddf5e48597774
```

---

## 🔐 Différences avec les autres endpoints

### **Par lien de partage (PUBLIC)**
```
✅ Pas d'authentification
✅ N'importe qui avec le lien peut accéder
✅ Utilisé pour les quiz publics
✅ Endpoint: GET /api/v1/quizzes/partage/{lien}
```

### **Par ID (SELON LE STATUT)**
```
⚠️  Peut nécessiter une authentification selon le statut
🔒 Endpoint: GET /api/v1/quizzes/{id}
```

---

## 📝 Test dans Postman

### **Requête :**
```
GET {{base_url}}/api/v1/quizzes/partage/905bf58c0e9cbfb0db0ddf5e48597774
```

**Headers :**
```
Aucun header requis (endpoint public)
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": "L93D03e0",
    "titre": "Quiz la guerre mondial",
    "description": "string",
    "type_quiz": "instantane",
    "statut": "brouillon",
    "lien_partage": "905bf58c0e9cbfb0db0ddf5e48597774",
    "questions": [],
    "createur": {
      "id": "2m3KMGnQ",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@example.com"
    }
  }
}
```

---

## 🚀 Utilisation dans une application web

### **Frontend (React/Vue/Angular) :**

```javascript
// 1. Récupérer le quiz par lien de partage
async function getQuizByLink(lienPartage) {
  const response = await fetch(
    `http://localhost:3000/api/v1/quizzes/partage/${lienPartage}`
  );
  const data = await response.json();
  return data.data;
}

// 2. Utilisation
const quiz = await getQuizByLink('905bf58c0e9cbfb0db0ddf5e48597774');
console.log(quiz.titre); // "Quiz la guerre mondial"
```

### **Partage du lien :**

```javascript
// Construire l'URL de partage
const shareUrl = `https://votreapp.com/quiz/${quiz.lien_partage}`;

// Partager par email, SMS, réseaux sociaux, etc.
navigator.share({
  title: quiz.titre,
  text: `Participez à mon quiz : ${quiz.titre}`,
  url: shareUrl
});
```

---

## ✅ Avantages du lien de partage

1. **Simple** : Un seul lien pour tout le monde
2. **Public** : Pas besoin de compte pour accéder
3. **Unique** : Chaque quiz a son propre lien
4. **Permanent** : Le lien ne change jamais
5. **Facile à partager** : Email, SMS, réseaux sociaux

---

## 🔄 Flux complet

```
1. Créateur crée quiz → Reçoit lien_partage
2. Créateur partage le lien (email, SMS, etc.)
3. Participant clique sur le lien
4. Frontend appelle GET /api/v1/quizzes/partage/{lien}
5. Backend retourne les données du quiz
6. Participant peut commencer à répondre
```

---

## 🎯 Résumé

**Votre lien de partage :**
```
905bf58c0e9cbfb0db0ddf5e48597774
```

**Pour y accéder :**
```
GET http://localhost:3000/api/v1/quizzes/partage/905bf58c0e9cbfb0db0ddf5e48597774
```

**C'est tout !** ✅ Simple et efficace.
