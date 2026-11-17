-- Produit : contenance et mode d'emploi (17/11/2026)
-- sequelize.sync() au démarrage crée les tables manquantes mais n'ajoute pas
-- de colonnes : à appliquer AVANT de déployer le code qui les utilise.
--   ssh deploy@162.55.158.90 "cd /opt/apps/myra && docker compose exec -T db psql -U myra -d myra" < ce_fichier.sql
ALTER TABLE produits ADD COLUMN IF NOT EXISTS contenance VARCHAR(50);
ALTER TABLE produits ADD COLUMN IF NOT EXISTS mode_emploi TEXT;
