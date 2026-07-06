// ============================================================
//  Petits utilitaires partagés
// ============================================================
import slugify from "slugify";

// Génère un slug propre à partir d'un texte (ex. "Sérum Centella" → "serum-centella")
export function makeSlug(text) {
  return slugify(text, { lower: true, strict: true, locale: "fr" });
}

// Génère un numéro de commande lisible : CMD-2026-XXXXXX
// (basé sur l'année et un identifiant ; l'unicité réelle est garantie en base)
export function makeOrderNumber(seq) {
  const year = new Date().getFullYear();
  const padded = String(seq).padStart(6, "0");
  return `CMD-${year}-${padded}`;
}
