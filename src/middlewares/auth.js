// ============================================================
//  Middleware d'authentification
//  Vérifie le token JWT envoyé dans l'en-tête Authorization.
//  Protège toutes les routes admin.
// ============================================================
import { verifierToken } from "../services/auth.service.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erreur: true, message: "Authentification requise.", code: "AUTH_REQUIRED" });
  }

  try {
    const payload = verifierToken(token);
    req.user = payload; // { sub, username, role }
    next();
  } catch (error) {
    // Les erreurs JWT seront récupérées par le gestionnaire central si on utilisait next(error)
    // Mais ici on renvoie directement
    return res.status(401).json({ erreur: true, message: "Session invalide ou expirée.", code: "TOKEN_INVALID" });
  }
}

// Optionnel : restreindre à certains rôles (pour le futur multi-utilisateur)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ erreur: true, message: "Accès non autorisé.", code: "FORBIDDEN" });
    }
    next();
  };
}

export default { requireAuth, requireRole };
