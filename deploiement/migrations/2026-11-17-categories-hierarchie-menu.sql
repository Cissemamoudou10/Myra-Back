-- Catégories hiérarchiques pour le menu public automatisé (17/11/2026)
-- (rubrique > sous-rubrique, ordre d'affichage, masquage du menu)
-- À appliquer AVANT de déployer le code qui les utilise :
--   ssh deploy@162.55.158.90 "cd /opt/apps/myra && docker compose exec -T db psql -U myra -d myra -v ON_ERROR_STOP=1" < ce_fichier.sql
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS ordre INTEGER NOT NULL DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS affiche_menu BOOLEAN NOT NULL DEFAULT true;
