# Guide de Déploiement - QuizLab API

Ce document décrit les procédures complètes pour déployer l'API QuizLab sur un serveur VPS Debian ou sur Render.com.

---

## Table des matières

1. [Déploiement sur VPS (Debian)](#déploiement-sur-vps-debian)
2. [Déploiement sur Render.com](#déploiement-sur-rendercom)
3. [Configuration du Frontend](#configuration-du-frontend)
4. [Résolution des problèmes](#résolution-des-problèmes)

---

## Déploiement sur VPS (Debian)

### Prérequis

- Serveur VPS avec Debian 12 ou Ubuntu 20.04+
- Accès SSH root ou sudo
- Node.js version 20 ou supérieure (minimum 19.7 pour compatibilité Hono)
- PostgreSQL 15 ou supérieur

---

### Étape 1 : Connexion au serveur

```bash
ssh root@VOTRE_IP_SERVEUR
```

---

### Étape 2 : Installation des dépendances

```bash
# Mise à jour du système
apt update && apt upgrade -y

# Installer Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Vérifier l'installation
node -v  # Doit afficher v20.x.x ou v18.x.x minimum (v20 recommandé)
npm -v   # Doit afficher 10.x.x environ

# Installer PostgreSQL
apt install -y postgresql postgresql-contrib

# Installer Git
apt install -y git

# Installer PM2 (gestionnaire de processus)
npm install -g pm2

# Installer Nginx (reverse proxy)
apt install -y nginx
```

---

### Étape 3 : Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql
```

Dans le prompt PostgreSQL (`postgres=#`), exécutez **une commande à la fois** :

```sql
CREATE DATABASE quiz;
CREATE USER quizuser WITH ENCRYPTED PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE quiz TO quizuser;
\c quiz
GRANT ALL ON SCHEMA public TO quizuser;
ALTER DATABASE quiz OWNER TO quizuser;
\q
```

---

### Étape 4 : Cloner le projet

```bash
# Créer le répertoire pour les applications web
mkdir -p /var/www
cd /var/www

# Cloner le projet
git clone https://github.com/Bayebaradiop/Project_quiz.git
cd Project_quiz

# Changer vers la branche de production
git checkout Amelioration
```

---

### Étape 5 : Créer le fichier .env

```bash
nano .env
```

Copiez le contenu suivant (modifiez les valeurs selon vos besoins) :

```env
# Base de données
DATABASE_URL="postgresql://quizuser:VotreMotDePasseSecurise123!@localhost:5432/quiz?schema=public"

# API Keys
GROQ_API_KEY=votre_cle_groq_api

# JWT Configuration
JWT_SECRET=votre_jwt_secret_tres_securise_production
JWT_REFRESH_SECRET=votre_refresh_secret_tres_securise_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3002

# CORS et Frontend
CORS_ORIGIN=https://senquiz.netlify.app
FRONTEND_URL=https://senquiz.netlify.app

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_app
SMTP_FROM_EMAIL=votre_email@gmail.com
SMTP_FROM_NAME=QuizLab

# Autres
BCRYPT_ROUNDS=12
```

**Sauvegardez** : `Ctrl+X` → `Y` → `Enter`

---

### Étape 6 : Installer et compiler

```bash
# Installer les dépendances
npm install

# Compiler le projet TypeScript
npm run build

# Générer Prisma Client
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push
```

---

### Étape 7 : Démarrer avec PM2

```bash
# Démarrer l'application
pm2 start dist/app.js --name quizlab

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot du serveur
pm2 startup
# Exécutez la commande affichée par pm2 startup

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs quizlab
```

---

### Étape 8 : Configurer Nginx

```bash
# Créer le fichier de configuration
nano /etc/nginx/sites-available/quizlab
```

Copiez cette configuration :

```nginx
server {
    listen 80;
    server_name VOTRE_IP_OU_DOMAINE;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Activez la configuration** :

```bash
# Créer un lien symbolique
ln -s /etc/nginx/sites-available/quizlab /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

---

### Étape 9 : Configurer le pare-feu

```bash
# Autoriser SSH, HTTP et HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

### Étape 10 : Installer SSL (HTTPS) - IMPORTANT pour les cookies !

 **Requis si vous avez un nom de domaine**

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir un certificat SSL (remplacez par votre domaine)
certbot --nginx -d api.votredomaine.com

# Redémarrer Nginx
systemctl restart nginx
```

Le certificat se renouvellera automatiquement.

---

### Vérification du déploiement

Testez votre API :

```bash
# Test en HTTP
curl http://VOTRE_IP_OU_DOMAINE

# Test en HTTPS (si certificat SSL configuré)
curl https://api.votredomaine.com
```

Réponse attendue :

```json
{
  "success": true,
  "message": "QuizLab API",
  "version": "1.0.0",
  "status": "running"
}
```

---

### Procédure de mise à jour

Pour déployer les nouvelles versions après un push sur GitHub :

```bash
cd /var/www/Project_quiz
git pull origin Amelioration
npm install
npm run build
npx prisma generate
npx prisma db push
pm2 restart quizlab
```

---

### Erreur : "Cannot find module"

**Solution** : Recompiler le projet TypeScript

```bash
npm run build
pm2 restart quizlab
```

---

### Erreur PostgreSQL : "permission denied for schema public"

**Solution** : Accorder les permissions nécessaires à l'utilisateur PostgreSQL

```bash
sudo -u postgres psql
\c quiz
GRANT ALL ON SCHEMA public TO quizuser;
ALTER DATABASE quiz OWNER TO quizuser;
\q
```

---

### PM2 : Application ne démarre pas

**Consulter les logs :**

```bash
pm2 logs quizlab --lines 100
```

**Causes fréquentes :**
- Variables d'environnement manquantes dans le fichier `.env`
- Port déjà utilisé (modifier la variable `PORT` dans `.env`)
- Erreur de connexion à PostgreSQL (vérifier `DATABASE_URL`)

---

### Nginx : Erreur "502 Bad Gateway"

**Solution** : Vérifier que l'application Node.js est en cours d'exécution

```bash
pm2 status
curl http://localhost:3002
```

Si l'application ne répond pas :

```bash
pm2 restart quizlab
```

---

## Commandes utiles

### PM2

```bash
pm2 list              # Liste des applications
pm2 logs quizlab      # Voir les logs
pm2 restart quizlab   # Redémarrer
pm2 stop quizlab      # Arrêter
pm2 delete quizlab    # Supprimer
pm2 monit             # Monitoring en temps réel
```

### PostgreSQL

```bash
# Se connecter
sudo -u postgres psql

# Lister les bases
\l

# Se connecter à une base
\c quiz

# Lister les tables
\dt

# Voir les utilisateurs
\du
```

### Nginx

```bash
nginx -t                    # Tester la configuration
systemctl restart nginx     # Redémarrer
systemctl status nginx      # Statut
tail -f /var/log/nginx/error.log  # Logs d'erreur
```

---

## Sécurité - Bonnes pratiques

1. Modifier les secrets JWT en production avec des valeurs aléatoires fortes
2. Utiliser des mots de passe complexes pour PostgreSQL
3. Activer HTTPS avec Let's Encrypt (gratuit)
4. Configurer le pare-feu (ufw) pour limiter les ports ouverts
5. Maintenir le système et les dépendances à jour régulièrement
6. Effectuer des sauvegardes régulières de la base de données

---

## Problèmes courants et solutions

### Erreur "Mixed Content" - Frontend HTTPS vers API HTTP

**Symptôme :** Le frontend déployé sur Netlify (HTTPS) ne peut pas contacter l'API sur le VPS (HTTP uniquement).

**Message d'erreur :** "Mixed Content: The page at 'https://senquiz.netlify.app' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint"

**Cause :** Les navigateurs modernes bloquent les requêtes HTTP depuis une page servie en HTTPS pour des raisons de sécurité.

**Solutions :**

**Option A : Activer HTTPS sur le VPS (RECOMMANDÉ)**

1. Obtenir un nom de domaine (gratuit sur freenom.com, noip.com, ou payant)
2. Configurer le DNS pour pointer vers l'IP du VPS (195.35.48.54)
3. Installer un certificat SSL gratuit avec Let's Encrypt :

```bash
# Sur le VPS
apt install -y certbot python3-certbot-nginx

# Modifier la configuration Nginx
nano /etc/nginx/sites-available/quizlab
# Changer: server_name 195.35.48.54;
# En: server_name api.votredomaine.com;

# Obtenir le certificat SSL
certbot --nginx -d api.votredomaine.com

# Redémarrer Nginx
systemctl restart nginx
```

4. Mettre à jour l'URL de l'API dans le frontend Angular :
```typescript
// environment.prod.ts
apiUrl: 'https://api.votredomaine.com/api/v1'
```

**Option B : Déployer sur Render.com**

Render fournit HTTPS automatiquement et gratuitement. Suivre les étapes de la section "Déploiement sur Render.com" de ce guide.

**Option C : Utiliser un tunnel HTTPS temporaire (développement uniquement)**

Utiliser ngrok ou cloudflare tunnel pour exposer le VPS en HTTPS temporairement :

```bash
# Installer ngrok
snap install ngrok

# Créer un tunnel HTTPS vers le port 3002
ngrok http 3002

# Utiliser l'URL HTTPS fournie par ngrok dans le frontend
```

**Note :** Cette dernière option n'est pas recommandée pour la production car l'URL change à chaque redémarrage de ngrok.

---

## Support technique

En cas de problème persistant :
1. Consulter les logs de l'application : `pm2 logs quizlab`
2. Tester l'API en local : `curl http://localhost:3002`
3. Vérifier la configuration des variables d'environnement
4. Consulter la documentation officielle de Render : https://render.com/docs

---

**Projet** : QuizLab API  
**Version** : 1.0.0  
**Date de dernière mise à jour** : 8 novembre 2025
