// ============================================================
//  Petits utilitaires partagés
// ============================================================
import slugify from "slugify";

// Génère un slug propre à partir d'un texte (ex. "Sérum Centella" → "serum-centella")
export function makeSlug(text) {
  return slugify(text, { lower: true, strict: true, locale: "fr" });
}

// Masque un numéro de téléphone pour les logs (données personnelles) :
// "22370123456" → "*******3456"
export function masquerNumero(numero) {
  const chiffres = String(numero || "").replace(/\D/g, "");
  if (chiffres.length <= 4) return "****";
  return "*".repeat(chiffres.length - 4) + chiffres.slice(-4);
}

// Génère un numéro de commande lisible : CMD-2026-XXXXXX
// (basé sur l'année et l'id de la commande, tiré de la séquence PostgreSQL)
export function makeOrderNumber(seq) {
  const year = new Date().getFullYear();
  const padded = String(seq).padStart(6, "0");
  return `CMD-${year}-${padded}`;
}
