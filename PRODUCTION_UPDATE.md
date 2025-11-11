# 🚀 Mise à jour Production - Correction Authentification

## ⚠️ Problème identifié

Erreur sur le serveur de production :
```
TypeError: this[#res].headers.getSetCookie is not a function
```

## ✅ Solution

### 1. Mettre à jour le fichier `.env` en production

Connectez-vous au serveur et ajoutez ces lignes dans `/var/www/Project_quiz/.env` :

```bash
ssh root@srv879364

cd /var/www/Project_quiz

# Ajouter la configuration des cookies
cat >> .env << 'EOF'

# Configuration des cookies pour cross-domain
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
EOF
```

### 2. Vérifier la version de Node.js

```bash
node --version
```

**Version requise : Node.js >= 18.0.0**

Si la version est inférieure, mettez à jour Node.js :

```bash
# Installer nvm si nécessaire
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Installer Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18
```

### 3. Mettre à jour les dépendances

```bash
cd /var/www/Project_quiz
npm install
```

### 4. Redémarrer PM2

```bash
pm2 restart quizlab
pm2 logs quizlab --lines 50
```

### 5. Tester

```bash
# Test de connexion
curl -X POST https://backquizlab.aihorizonplusconsulting.com/api/v1/utilisateurs/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123@"}' \
  | jq

# Test avec le token
curl -X GET https://backquizlab.aihorizonplusconsulting.com/api/v1/quizzes/mes-quiz \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  | jq
```

## 📋 Vérifications

✅ Fichier `.env` mis à jour avec `COOKIE_SECURE` et `COOKIE_SAME_SITE`  
✅ Node.js version >= 18  
✅ Dépendances à jour  
✅ PM2 redémarré  
✅ API répond correctement  

## 🔑 Utilisation Frontend

### Option 1 : Authorization Header (recommandé)

```javascript
// À la connexion
const response = await fetch('https://backquizlab.../api/v1/utilisateurs/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
localStorage.setItem('token', token);

// Pour les requêtes suivantes
fetch('https://backquizlab.../api/v1/quizzes/mes-quiz', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### Option 2 : Cookies (si Node.js >= 18)

```javascript
// À la connexion
const response = await fetch('https://backquizlab.../api/v1/utilisateurs/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important !
  body: JSON.stringify({ email, password })
});

// Pour les requêtes suivantes
fetch('https://backquizlab.../api/v1/quizzes/mes-quiz', {
  credentials: 'include' // Important !
});
```

## 📝 Notes

- Le token est maintenant retourné dans la réponse JSON lors du login/register
- L'authentification supporte à la fois les cookies ET le header Authorization
- Pour le cross-domain HTTPS, utilisez l'Authorization header (plus simple)
