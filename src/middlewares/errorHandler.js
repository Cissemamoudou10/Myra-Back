// ============================================================
//  Middlewares utilitaires : 404 et gestion d'erreurs
// ============================================================

import logger from "../config/logger.js";
import multer from "multer";

// Route non trouvée
export function notFound(req, res) {
  res.status(404).json({ erreur: true, message: "Ressource introuvable." });
}

// Gestionnaire d'erreurs central : capture les erreurs des
// contrôleurs et renvoie une réponse JSON propre. Le statut est
// lu depuis err.status (défini dans les services), sinon 500.
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Une erreur interne est survenue. Veuillez réessayer.";
  let code = err.code || null;
  let details = err.details || null;

  // Traduction Sequelize
  if (err.name === "SequelizeValidationError") {
    statusCode = 422;
    message = "Des erreurs de validation sont survenues.";
    code = "VALIDATION_ERROR";
    details = err.errors ? err.errors.map(e => ({ champ: e.path, probleme: e.message })) : [];
  } else if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = "Un élément avec cette valeur existe déjà.";
    code = "DUPLICATE_ENTRY";
    details = err.errors ? err.errors.map(e => ({ champ: e.path, probleme: "Cette valeur est déjà utilisée." })) : [];
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 409;
    message = "Opération impossible : l'élément est lié à d'autres données (ou référence invalide).";
    code = "FOREIGN_KEY_CONSTRAINT";
  } else if (err.name === "SequelizeDatabaseError") {
    statusCode = 500;
    message = "Erreur interne de la base de données.";
    code = "DATABASE_ERROR";
  }

  // Traduction JWT
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Votre session a expiré, veuillez vous reconnecter.";
    code = "TOKEN_EXPIRED";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Session invalide.";
    code = "TOKEN_INVALID";
  }

  // Traduction Multer
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "L'image est trop volumineuse (max 5 Mo).";
      code = "FILE_TOO_LARGE";
    } else {
      statusCode = 400;
      message = "Erreur lors de l'upload du fichier.";
      code = "UPLOAD_ERROR";
    }
  } else if (err.message === "Format d'image non supporté (jpeg, png, webp, gif).") {
    statusCode = 415;
    code = "UNSUPPORTED_MEDIA_TYPE";
  }

  // Fallback et Logs
  if (statusCode >= 500) {
    logger.error(err, "Erreur serveur non interceptée");
    // Masquer le détail des erreurs 500 pour le client sauf si c'est explicitement une AppError attendue (rare)
    if (err.name !== "AppError") {
      message = "Une erreur interne est survenue. Veuillez réessayer.";
      code = "INTERNAL_ERROR";
    }
  } else if (statusCode >= 400 && statusCode < 500) {
    logger.warn({ status: statusCode, code, message, path: req.path }, "Erreur métier ou requête invalide");
  }

  const response = { erreur: true, message };
  if (code) response.code = code;
  if (details) response.details = details;

  res.status(statusCode).json(response);
}

export default { notFound, errorHandler };
