// ============================================================
//  Script de synchronisation : crée/met à jour les tables
//  Usage : npm run db:sync
//  ⚠️  L'option { alter: true } adapte les tables au modèle.
//      En production, préférez des migrations versionnées.
// ============================================================
import db from "../models/index.js";
import { testConnection } from "../config/database.js";

async function sync() {
  try {
    await testConnection();
    await db.sequelize.sync({ alter: true });
    console.log("✓ Tables synchronisées avec succès.");
    console.log(
      "  Tables :",
      Object.keys(db.sequelize.models).join(", ")
    );
    process.exit(0);
  } catch (error) {
    console.error("✗ Échec de la synchronisation :", error.message);
    process.exit(1);
  }
}

sync();
