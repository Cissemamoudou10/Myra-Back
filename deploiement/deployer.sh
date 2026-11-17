#!/usr/bin/env bash
# Déploie l'API depuis le poste : envoie EXACTEMENT le code commité (git archive),
# puis reconstruit et redémarre sur le serveur. Usage, depuis myra_back/ :
#   bash deploiement/deployer.sh
set -euo pipefail
SERVEUR=deploy@162.55.158.90
cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "ATTENTION : ces modifications locales ne seront PAS déployées (seul HEAD l'est) :" >&2
  git status --short >&2
fi
VERSION=$(git rev-parse --short HEAD)
echo "Déploiement de $VERSION vers $SERVEUR"

# 1. Code et fichiers de déploiement dans des dossiers temporaires
#    (core.autocrlf=false : fins de ligne LF telles que dans le dépôt, même sous Windows)
ssh "$SERVEUR" 'mkdir -p /opt/apps/myra &&
  rm -rf /opt/apps/myra/api.nouvelle /tmp/deploiement-myra &&
  mkdir /opt/apps/myra/api.nouvelle /tmp/deploiement-myra'
git -c core.autocrlf=false archive HEAD | ssh "$SERVEUR" 'tar -x -C /opt/apps/myra/api.nouvelle'
git -c core.autocrlf=false archive HEAD:deploiement | ssh "$SERVEUR" 'tar -x -C /tmp/deploiement-myra'

# 2. Mise en place, reconstruction, redémarrage (script distant entre apostrophes :
#    aucune variable n'est développée sur le poste)
ssh "$SERVEUR" "VERSION=$VERSION bash -s" <<'DISTANT'
set -euo pipefail
D=/tmp/deploiement-myra
cd /opt/apps/myra
cp "$D/docker-compose.yml" "$D/generer-env.sh" "$D/sauvegarde.sh" /opt/apps/myra/
if [ ! -e /opt/apps/myra/.env ]; then
  rm -rf api.nouvelle "$D"
  echo "Premier déploiement : lancer d'abord bash /opt/apps/myra/generer-env.sh" >&2
  exit 2
fi
rm -rf api.ancienne
if [ -d api ]; then mv api api.ancienne; fi
mv api.nouvelle api
echo "$VERSION" > VERSION
docker compose build api
docker compose up -d

# Site Caddy : un fichier par application dans /opt/apps/caddy/sites/
mkdir -p /opt/apps/caddy/sites
cp "$D/caddy/myra.caddy" /opt/apps/caddy/sites/myra.caddy
rm -rf "$D"
cd /opt/apps/caddy
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile
DISTANT
echo "Déployé : $VERSION"
