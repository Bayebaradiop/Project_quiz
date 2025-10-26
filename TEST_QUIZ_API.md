# Tests API Quiz - Guide Rapide

## 1. Se connecter avec l'admin

```bash
curl -X POST http://localhost:3000/api/v1/utilisateurs/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quizlab.com",
    "password": "Admin@1234"
  }' \
  -c cookies.txt
```

## 2. Créer un quiz (brouillon)

```bash
curl -X POST http://localhost:3000/api/v1/quizzes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "titre": "Quiz de test",
    "description": "Ceci est un quiz de test",
    "type_quiz": "instantane",
    "statut": "brouillon"
  }'
```

## 3. Créer un quiz (publié)

```bash
curl -X POST http://localhost:3000/api/v1/quizzes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "titre": "Quiz JavaScript",
    "description": "Testez vos connaissances en JavaScript",
    "type_quiz": "instantane",
    "statut": "publie"
  }'
```

## 4. Récupérer tous les quiz

```bash
curl -X GET http://localhost:3000/api/v1/quizzes \
  -b cookies.txt
```

## 5. Récupérer mes quiz

```bash
curl -X GET http://localhost:3000/api/v1/quizzes/mes-quiz \
  -b cookies.txt
```

## 6. Récupérer un quiz par ID

```bash
curl -X GET http://localhost:3000/api/v1/quizzes/1 \
  -b cookies.txt
```

## 7. Modifier un quiz

```bash
curl -X PUT http://localhost:3000/api/v1/quizzes/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "titre": "Quiz JavaScript (Modifié)",
    "statut": "publie"
  }'
```

## 8. Accéder à un quiz via le lien de partage (PUBLIC - pas besoin de cookie)

Remplacez `<LIEN_PARTAGE>` par le lien retourné lors de la création du quiz:

```bash
curl -X GET http://localhost:3000/api/v1/quizzes/partage/<LIEN_PARTAGE>
```

## 9. Supprimer un quiz

```bash
curl -X DELETE http://localhost:3000/api/v1/quizzes/1 \
  -b cookies.txt
```

## Tests d'erreurs

### Créer un quiz sans être connecté (401)
```bash
curl -X POST http://localhost:3000/api/v1/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Quiz test",
    "type_quiz": "instantane"
  }'
```

### Créer un quiz avec des données invalides (400)
```bash
curl -X POST http://localhost:3000/api/v1/quizzes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "titre": "AB",
    "type_quiz": "invalide"
  }'
```

### Modifier le quiz d'un autre utilisateur (403)
1. Se connecter avec un autre compte
2. Essayer de modifier un quiz qui ne vous appartient pas

### Accéder à un quiz inexistant (404)
```bash
curl -X GET http://localhost:3000/api/v1/quizzes/9999 \
  -b cookies.txt
```

---

## Résultats attendus

### Succès - Création de quiz
```json
{
  "success": true,
  "message": "Quiz créé avec succès",
  "data": {
    "id": 1,
    "titre": "Quiz de test",
    "description": "Ceci est un quiz de test",
    "type_quiz": "instantane",
    "lien_partage": "a1b2c3d4e5f6...",
    "statut": "brouillon",
    "createur_id": 1,
    "createdAt": "2025-10-26T...",
    "updatedAt": "2025-10-26T...",
    "deletedAt": null
  }
}
```

### Erreur - Validation
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "field": "titre",
      "message": "Le titre doit contenir au moins 3 caractères"
    },
    {
      "field": "type_quiz",
      "message": "Le type de quiz doit être \"instantane\" ou \"programme\""
    }
  ]
}
```

### Erreur - Non authentifié
```json
{
  "success": false,
  "message": "Token manquant"
}
```

### Erreur - Accès interdit
```json
{
  "success": false,
  "message": "Accès interdit"
}
```

### Erreur - Quiz non trouvé
```json
{
  "success": false,
  "message": "Quiz non trouvé"
}
```
