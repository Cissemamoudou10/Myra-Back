#!/usr/bin/env bash
# Génère les secrets de production SUR LE SERVEUR (jamais dans le dépôt), chmod 600.
# Refuse d'écraser un fichier existant.
# Usage : bash /opt/apps/myra/generer-env.sh
# (les numéros Orange Money / Sarali se règlent dans Admin → Paramètres)
set -euo pipefail
umask 077
ENV_FICHIER=/opt/apps/myra/.env
EVOLUTION_ENV=/opt/apps/evolution-api/.env

[ -e "$ENV_FICHIER" ] && { echo "ERREUR : $ENV_FICHIER existe déjà ; rien n'est modifié." >&2; exit 1; }

# Clé Evolution API lue sur place : elle ne transite jamais par le poste
WHATSAPP_CLE=$(grep '^AUTHENTICATION_API_KEY=' "$EVOLUTION_ENV" | cut -d= -f2-)
[ -n "$WHATSAPP_CLE" ] || { echo "ERREUR : clé introuvable dans $EVOLUTION_ENV" >&2; exit 1; }

# Nom du conteneur Evolution sur le réseau « web » (déterminé par Docker Compose)
EVOLUTION_HOTE=$(docker ps --filter label=com.docker.compose.project=evolution-api \
  --filter label=com.docker.compose.service=api --format '{{.Names}}' | head -1)
[ -n "$EVOLUTION_HOTE" ] || { echo "ERREUR : conteneur Evolution API introuvable (est-il démarré ?)" >&2; exit 1; }

ADMIN_MDP=$(openssl rand -base64 18 | tr -d '/+=')

cat > "$ENV_FICHIER" <<FIN
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://myra-skin-care.vercel.app
BACKEND_URL=https://myra-api.162-55-158-90.sslip.io
LOG_LEVEL=info
LOG_DIR=logs
LOG_RETENTION_DAYS=14

DB_PASSWORD=$(openssl rand -hex 32)

ADMIN_USERNAME=admin
ADMIN_PASSWORD=$ADMIN_MDP
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

WHATSAPP_API_URL=http://$EVOLUTION_HOTE:8080
WHATSAPP_API_KEY=$WHATSAPP_CLE
WHATSAPP_INSTANCE=myra
ORDER_EXPIRATION_HOURS=48
FIN
chmod 600 "$ENV_FICHIER"

echo "Secrets générés : $ENV_FICHIER (chmod 600)."
echo "Connexion admin -> identifiant : admin   mot de passe : $ADMIN_MDP"
echo "(affiché une seule fois ; il reste lisible dans $ENV_FICHIER)"
