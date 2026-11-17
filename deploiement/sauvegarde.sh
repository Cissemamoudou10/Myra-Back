#!/usr/bin/env bash
# Sauvegarde quotidienne de Myra (cron de l'utilisateur deploy, 03 h 00) :
# base PostgreSQL + photos produits uploadées. Garde 14 jours sur le serveur.
set -euo pipefail
DOSSIER=/opt/backups/myra
mkdir -p "$DOSSIER"
HORODATAGE=$(date +%Y-%m-%d-%H%M)
cd /opt/apps/myra

BASE="$DOSSIER/myra-$HORODATAGE.sql.gz"
docker compose exec -T db pg_dump -U myra --no-owner myra | gzip > "$BASE.partiel"
mv "$BASE.partiel" "$BASE"

PHOTOS="$DOSSIER/myra-uploads-$HORODATAGE.tar.gz"
docker compose exec -T api tar -C /app/src/uploads -cz . > "$PHOTOS.partiel"
mv "$PHOTOS.partiel" "$PHOTOS"

find "$DOSSIER" -name 'myra-*.gz' -mtime +14 -delete
echo "$(date -Iseconds) sauvegarde $BASE ($(du -h "$BASE" | cut -f1)) + $PHOTOS ($(du -h "$PHOTOS" | cut -f1))"
