# 📄 Génération de Questions depuis Documents

## Endpoint

```
POST /api/v1/quizzes/:quizId/generate-from-document
```

**Authentification requise** : Oui (Cookie JWT)

## Formats supportés

- 📄 **PDF** (.pdf)
- 📝 **Word** (.docx)
- 🖼️ **Images** (.jpg, .jpeg, .png) - avec OCR

## Paramètres

### URL
- `quizId` : ID hashé du quiz

### Body (multipart/form-data)
- `document` : Le fichier à uploader (requis)
- `numQuestions` : Nombre de questions à générer (optionnel, défaut: 5)
- `difficulty` : Niveau de difficulté (optionnel, défaut: "moyen")

## Exemple avec cURL

### 1. Connexion pour obtenir le token
```bash
curl -i -X POST http://localhost:3000/api/v1/utilisateurs/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jean.dupont@example.com", "password": "Test@123456"}'
```

### 2. Upload d'un PDF
```bash
curl -X POST http://localhost:3000/api/v1/quizzes/Qp3ndGMw/generate-from-document \
  -H "Cookie: access_token=VOTRE_TOKEN_JWT" \
  -F "document=@/chemin/vers/votre/document.pdf" \
  -F 'numQuestions=5' \
  -F 'difficulty=moyen'
```

### 3. Upload d'un document Word
```bash
curl -X POST http://localhost:3000/api/v1/quizzes/Qp3ndGMw/generate-from-document \
  -H "Cookie: access_token=VOTRE_TOKEN_JWT" \
  -F "document=@/chemin/vers/votre/document.docx" \
  -F 'numQuestions=3'
```

### 4. Upload d'une image (OCR)
```bash
curl -X POST http://localhost:3000/api/v1/quizzes/Qp3ndGMw/generate-from-document \
  -H "Cookie: access_token=VOTRE_TOKEN_JWT" \
  -F "document=@/chemin/vers/votre/image.jpg" \
  -F 'numQuestions=4'
```

## Réponse

### Succès (200)
```json
{
  "success": true,
  "quizId": "Qp3ndGMw",
  "questions": "[{\"question\":\"...\",\"options\":[...],\"correct_answer\":\"...\",\"explication\":\"...\"}]",
  "metadata": {
    "documentName": "cours-biologie.pdf",
    "documentType": "application/pdf",
    "extractedChars": 2543,
    "numQuestionsRequested": 5
  }
}
```

### Erreur (400/500)
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "Détails techniques"
}
```

## Limites

- Taille maximale : **10 MB**
- Formats acceptés : PDF, Word (.docx), Images (JPG, PNG)
- Le texte extrait doit contenir au moins **50 caractères**

## Workflow

1. 📤 Upload du fichier
2. 📝 Extraction du texte (PDF/Word/OCR)
3. 🧹 Nettoyage du texte
4. 🤖 Génération de questions via IA (Groq)
5. 📊 Retour des questions au format JSON
6. 🗑️ Suppression automatique du fichier temporaire

## Notes

- L'OCR pour les images utilise Tesseract avec support français et anglais
- Les images avec peu de texte ou de mauvaise qualité peuvent donner des résultats limités
- Les documents PDF scannés (images) sont traités comme des PDF normaux, pas comme des images OCR
