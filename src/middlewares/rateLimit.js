// ============================================================
//  Limitation du nombre de requêtes sur les routes publiques
//  sensibles (par adresse IP, en mémoire — suffisant pour une
//  instance unique de l'API).
//  - commandes : chaque commande envoie un WhatsApp au numéro saisi
//    et bloque du stock 48 h → protège contre le spam.
//  - avis : évite le remplissage de la file de modération.
//  - login : freine les attaques par essais de mots de passe.
// ============================================================
import { rateLimit } from "express-rate-limit";

function creerLimiteur({ windowMinutes, max, message, ...options }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { erreur: true, message, code: "TOO_MANY_REQUESTS" },
    ...options,
  });
}

export const limiteCommandes = creerLimiteur({
  windowMinutes: 60,
  max: 10,
  message: "Trop de commandes envoyées depuis cette connexion. Réessayez dans une heure ou contactez-nous sur WhatsApp.",
});

export const limiteAvis = creerLimiteur({
  windowMinutes: 60,
  max: 5,
  message: "Trop d'avis envoyés depuis cette connexion. Réessayez plus tard.",
});

export const limiteLogin = creerLimiteur({
  windowMinutes: 15,
  max: 10,
  // Seuls les échecs comptent : un admin légitime n'est jamais bloqué.
  skipSuccessfulRequests: true,
  message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
});
