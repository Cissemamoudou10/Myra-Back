// ============================================================
//  Service d'authentification admin
//  Stratégie scalable :
//   1) Au démarrage, vérifie les identifiants contre l'.env
//      (admin unique).
//   2) Si une table User contient des utilisateurs, on pourra
//      basculer dessus sans toucher au reste du code : seule
//      cette fonction changera.
// ============================================================
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import db from "../models/index.js";
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";

dotenv.config();

const { User, ROLES } = db;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Génère un token JWT pour un utilisateur (réel ou "env")
function signerToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Authentifie et renvoie un token, ou lève une erreur 401
export async function login(username, password) {
  if (!username || !password) {
    throw new AppError("Identifiants incorrects.", 401, "INVALID_CREDENTIALS");
  }

  // --- Étape 1 : tenter via la table User (si des admins existent) ---
  const count = await User.count();
  if (count > 0) {
    const user = await User.findOne({ where: { username, actif: true } });
    if (user && (await bcrypt.compare(password, user.mot_de_passe))) {
      logger.info({ username, role: user.role }, "Connexion admin réussie (DB)");
      return {
        token: signerToken({ sub: user.id, username: user.username, role: user.role }),
        user: { id: user.id, username: user.username, role: user.role },
      };
    }
    // Si la table existe mais identifiants faux → on échoue
    logger.warn({ username }, "Tentative de connexion échouée (identifiants DB invalides)");
    throw new AppError("Identifiants incorrects.", 401, "INVALID_CREDENTIALS");
  }

  // --- Étape 2 : admin unique via .env (démarrage) ---
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  if (username === envUser && password === envPass) {
    logger.info({ username }, "Connexion admin réussie (ENV)");
    return {
      token: signerToken({ sub: "env-admin", username: envUser, role: ROLES.ADMIN }),
      user: { id: "env-admin", username: envUser, role: ROLES.ADMIN },
    };
  }

  logger.warn({ username }, "Tentative de connexion échouée (identifiants ENV invalides)");
  throw new AppError("Identifiants incorrects.", 401, "INVALID_CREDENTIALS");
}

// Vérifie un token et renvoie son contenu décodé (utilisé par le middleware)
export function verifierToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export default { login, verifierToken };
