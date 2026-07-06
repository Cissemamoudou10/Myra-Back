// ============================================================
//  Cycle de vie des commandes — transitions autorisées
//  Traduction en code du diagramme validé.
//  Règle d'annulation : possible tant que la commande n'est ni
//  livrée ni expirée.
// ============================================================
import { STATUTS } from "../models/Commande.js";
import AppError from "./AppError.js";

// Pour chaque statut, la liste des statuts vers lesquels on peut aller
const TRANSITIONS = {
  [STATUTS.EN_ATTENTE]: [STATUTS.SIGNALE, STATUTS.PAYEE, STATUTS.ANNULEE, STATUTS.EXPIREE],
  [STATUTS.SIGNALE]: [STATUTS.PAYEE, STATUTS.ANNULEE],
  [STATUTS.PAYEE]: [STATUTS.EN_LIVRAISON, STATUTS.ANNULEE],
  [STATUTS.EN_LIVRAISON]: [STATUTS.LIVREE, STATUTS.ANNULEE],
  [STATUTS.LIVREE]: [], // état final
  [STATUTS.ANNULEE]: [], // état final
  [STATUTS.EXPIREE]: [], // état final
};

// Vérifie si une transition est permise
export function peutPasser(actuel, cible) {
  const autorises = TRANSITIONS[actuel] || [];
  return autorises.includes(cible);
}

// Lève une erreur explicite si la transition est interdite
export function verifierTransition(actuel, cible) {
  if (!peutPasser(actuel, cible)) {
    throw new AppError(
      `Cette action n'est pas possible pour une commande au statut "${actuel}".`,
      409,
      "TRANSITION_INVALIDE"
    );
  }
}

export { TRANSITIONS };
