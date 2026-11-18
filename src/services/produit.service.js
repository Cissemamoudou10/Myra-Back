// ============================================================
//  Service Produit — CRUD et recherche dynamique paginée
//  Gère la recherche par nom (q), les filtres (catégorie, marque,
//  actifs, problèmes, types de peau, fourchette de prix), le tri
//  et la pagination.
// ============================================================
import { Op } from "sequelize";
import db from "../models/index.js";
import { getPagination, buildPage } from "../utils/pagination.js";
import { makeSlug } from "../utils/helpers.js";
import { motsRecherche, conditionProduits } from "../utils/recherche.js";
import AppError from "../utils/AppError.js";

const {
  Produit,
  Categorie,
  Marque,
  PrincipeActif,
  Probleme,
  TypePeau,
  Tag,
  Parametre,
} = db;

// Inclusions standard pour renvoyer un produit complet
const INCLUDES = [
  { model: Categorie, as: "categorie" },
  { model: Marque, as: "marque" },
  { model: PrincipeActif, as: "principes_actifs", through: { attributes: [] } },
  { model: Probleme, as: "problemes", through: { attributes: [] } },
  { model: TypePeau, as: "types_peau", through: { attributes: [] } },
  { model: Tag, as: "tags", through: { attributes: [] } },
];

// Tris autorisés (évite l'injection via le paramètre sort)
const SORTS = { nom: "nom", prix: "prix", date: "created_at" };

// ---- Liste + recherche + filtres + pagination ----
export async function listerProduits(query, { inclureInactifs = false } = {}) {
  const { page, limit, offset } = getPagination(query);

  const where = {};
  if (!inclureInactifs) where.actif = true;

  // Recherche : nom, description, marque, actifs ; insensible aux accents, plusieurs mots
  const mots = motsRecherche(query.q);
  if (mots.length) Object.assign(where, conditionProduits(mots));

  // Fourchette de prix
  if (query.prix_min || query.prix_max) {
    where.prix = {};
    if (query.prix_min) where.prix[Op.gte] = parseInt(query.prix_min, 10);
    if (query.prix_max) where.prix[Op.lte] = parseInt(query.prix_max, 10);
  }

  // Filtre par catégorie : inclut aussi les sous-catégories (rubrique -> sous-rubriques)
  if (query.categorie) {
    const categorieId = parseInt(query.categorie, 10);
    if (!Number.isNaN(categorieId)) {
      const enfants = await Categorie.findAll({
        where: { parent_id: categorieId },
        attributes: ["id"],
      });
      where.categorie_id = { [Op.in]: [categorieId, ...enfants.map((c) => c.id)] };
    }
  }

  // "Nouveautés" : produits créés dans les N derniers jours (seuil réglable dans Paramètres)
  if (query.nouveautes === "true") {
    const param = await Parametre.findByPk(1);
    const dureeJours = param?.nouveaute_duree_jours ?? 60;
    const seuil = new Date();
    seuil.setDate(seuil.getDate() - dureeJours);
    where.created_at = { [Op.gte]: seuil };
  }

  // Filtres many-to-many et relations : on ajoute des inclusions filtrantes (par slug)
  const include = INCLUDES.map((inc) => ({ ...inc }));

  // Filtre Marque par slug au lieu de l'ID direct
  if (query.marque) {
    const m = include.find(x => x.as === "marque");
    m.where = { slug: query.marque };
    m.required = true;
  }

  // Filtres many-to-many : on ajoute des inclusions filtrantes (par slug)
  const applyM2M = (alias, value) => {
    const i = include.find((x) => x.as === alias);
    // On suppose que la requête front envoie un slug (ex: ?tag=nettoyant)
    i.where = { slug: value };
    i.required = true;
  };
  
  if (query.probleme) applyM2M("problemes", query.probleme);
  // TypePeau n'a pas de slug : filtre par id
  if (query.typepeau) {
    const typePeauId = parseInt(query.typepeau, 10);
    if (!Number.isNaN(typePeauId)) {
      const i = include.find((x) => x.as === "types_peau");
      i.where = { id: typePeauId };
      i.required = true;
    }
  }
  if (query.actif) applyM2M("principes_actifs", query.actif);
  if (query.tag) applyM2M("tags", query.tag);

  // Tri
  const sortField = SORTS[query.sort] || "created_at";
  const order = (query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  const result = await Produit.findAndCountAll({
    where,
    include,
    order: [[sortField, order]],
    limit,
    offset,
    distinct: true, // count correct avec les jointures m2m
  });

  return buildPage(result, page, limit);
}

// ---- Récupérer un produit par slug ----
export async function getProduitParSlug(slug) {
  const produit = await Produit.findOne({ where: { slug }, include: INCLUDES });
  if (!produit) {
    throw new AppError("Produit introuvable.", 404, "PRODUCT_NOT_FOUND");
  }
  return produit;
}

// ---- Récupérer un produit par id (admin : formulaire d'édition) ----
export async function getProduitParId(id) {
  const produit = await Produit.findByPk(id, { include: INCLUDES });
  if (!produit) {
    throw new AppError("Produit introuvable.", 404, "PRODUCT_NOT_FOUND");
  }
  return produit;
}

// ---- Créer un produit ----
export async function creerProduit(data) {
  const slug = makeSlug(data.nom);
  const produit = await Produit.create({ ...data, slug });
  await appliquerRelations(produit, data);
  return getProduitParSlug(slug);
}

// ---- Modifier un produit ----
export async function modifierProduit(id, data) {
  const produit = await Produit.findByPk(id);
  if (!produit) {
    throw new AppError("Produit introuvable.", 404, "PRODUCT_NOT_FOUND");
  }
  if (data.nom) data.slug = makeSlug(data.nom);
  await produit.update(data);
  await appliquerRelations(produit, data);
  return getProduitParSlug(produit.slug);
}

// ---- Supprimer un produit ----
export async function supprimerProduit(id) {
  const produit = await Produit.findByPk(id);
  if (!produit) {
    throw new AppError("Produit introuvable.", 404, "PRODUCT_NOT_FOUND");
  }
  await produit.destroy();
  return true;
}

// Applique les relations many-to-many si fournies (tableaux d'ids)
async function appliquerRelations(produit, data) {
  if (Array.isArray(data.principes_actifs))
    await produit.setPrincipes_actifs(data.principes_actifs);
  if (Array.isArray(data.problemes))
    await produit.setProblemes(data.problemes);
  if (Array.isArray(data.types_peau))
    await produit.setTypes_peau(data.types_peau);
  if (Array.isArray(data.tags))
    await produit.setTags(data.tags);
}

export default {
  listerProduits,
  getProduitParSlug,
  getProduitParId,
  creerProduit,
  modifierProduit,
  supprimerProduit,
};
