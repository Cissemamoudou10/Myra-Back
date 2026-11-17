// ============================================================
//  Point d'entrée — démarre le serveur Myra Skin Care
// ============================================================
import app from "./src/app.js";
import { testConnection } from "./src/config/database.js";
import db from "./src/models/index.js";
import { demarrerJobExpiration } from "./src/jobs/expirationCommandes.js";
import dotenv from "dotenv";
import logger from "./src/config/logger.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Refuse de démarrer si une variable indispensable manque : mieux vaut
// échouer tout de suite qu'au premier login admin (erreur 500).
function verifierConfiguration() {
  const manquantes = ["JWT_SECRET", "DB_NAME", "DB_USER"].filter((nom) => !process.env[nom]);
  if (manquantes.length > 0) {
    throw new Error(`Variables d'environnement manquantes : ${manquantes.join(", ")}`);
  }
}

async function demarrer() {
  try {
    verifierConfiguration();

    // 1) Vérifier la connexion à la base
    await testConnection();

    // 2) Synchroniser les modèles (crée les tables si elles n'existent pas)
    await db.sequelize.sync();
    logger.info("Modèles synchronisés avec succès.");

    // 3) Démarrer le job d'expiration des commandes
    demarrerJobExpiration();

    // 4) Lancer le serveur HTTP
    app.listen(PORT, () => {
      logger.info(`API Myra Skin Care démarrée sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error(error, "Démarrage impossible du serveur");
    process.exit(1);
  }
}

demarrer();
