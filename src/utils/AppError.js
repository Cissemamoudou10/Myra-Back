// ============================================================
//  Classe de base pour les erreurs métiers
//  Permet de lever des erreurs structurées depuis les services
// ============================================================

export class AppError extends Error {
  constructor(message, statusCode = 400, code = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Assurer que la stack trace est propre à l'endroit où l'erreur est instanciée
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
