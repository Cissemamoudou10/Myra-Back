// ============================================================
//  Connexion à la base de données PostgreSQL via Sequelize
// ============================================================
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: (msg) => logger.debug(msg),
    define: {
      // Colonnes created_at / updated_at automatiques, en snake_case
      timestamps: true,
      underscored: true,
    },
  }
);

// Vérifie que la connexion fonctionne au démarrage
export async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info("Connexion à PostgreSQL réussie.");
  } catch (error) {
    logger.error(error, "Impossible de se connecter à PostgreSQL");
    throw error;
  }
}

export default sequelize;
