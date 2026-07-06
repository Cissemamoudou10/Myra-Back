// ============================================================
//  Service Avis — soumission par le client, liste publique,
//  modération par l'admin.
// ============================================================
import db from "../models/index.js";
import { getPagination, buildPage } from "../utils/pagination.js";
import AppError from "../utils/AppError.js";

const { Avis, STATUTS_AVIS } = db;

// ---- Soumettre un avis (public) ----
export async function soumettreAvis(data) {
  const { nom, email, note, texte, commande_id } = data;
  const missingFields = [];
  if (!nom) missingFields.push({ champ: "nom", probleme: "Le nom est requis." });
  if (!email) missingFields.push({ champ: "email", probleme: "L'adresse email est requise." });
  if (!note) missingFields.push({ champ: "note", probleme: "La note est requise." });
  if (!texte) missingFields.push({ champ: "texte", probleme: "Le texte de l'avis est requis." });

  if (missingFields.length > 0) {
    throw new AppError("Certains champs obligatoires sont manquants.", 400, "MISSING_FIELDS", missingFields);
  }

  const n = parseInt(note, 10);
  if (isNaN(n) || n < 1 || n > 5) {
    throw new AppError("La note doit être comprise entre 1 et 5.", 400, "INVALID_RATING");
  }
  // Créé en attente de modération
  return Avis.create({
    nom,
    email,
    note: n,
    texte,
    commande_id: commande_id || null,
    statut: STATUTS_AVIS.EN_ATTENTE,
  });
}

// ---- Lister les avis publiés (public) ----
export async function listerAvisPublies(query) {
  const { page, limit, offset } = getPagination(query);
  const result = await Avis.findAndCountAll({
    where: { statut: STATUTS_AVIS.PUBLIE },
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return buildPage(result, page, limit);
}

// ---- Lister tous les avis (admin) ----
export async function listerTousAvis(query) {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.statut) where.statut = query.statut;
  const result = await Avis.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return buildPage(result, page, limit);
}

// ---- Modération (admin) ----
async function changerStatutAvis(id, statut) {
  const avis = await Avis.findByPk(id);
  if (!avis) {
    throw new AppError("Avis introuvable.", 404, "REVIEW_NOT_FOUND");
  }
  avis.statut = statut;
  await avis.save();
  return avis;
}

export const publierAvis = (id) => changerStatutAvis(id, STATUTS_AVIS.PUBLIE);
export const rejeterAvis = (id) => changerStatutAvis(id, STATUTS_AVIS.REJETE);

export default {
  soumettreAvis,
  listerAvisPublies,
  listerTousAvis,
  publierAvis,
  rejeterAvis,
};
