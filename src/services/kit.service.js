import { Op } from "sequelize";
import db from "../models/index.js";
import { getPagination, buildPage } from "../utils/pagination.js";
import { makeSlug } from "../utils/helpers.js";
import AppError from "../utils/AppError.js";

const { Kit, Produit, KitProduit } = db;

// ---- Logique Métier : Calcul du Prix du Kit ----
export function calculerPrixKit(kit) {
  // 1. Somme des produits inclus
  const prix_plein = kit.produits.reduce((acc, produit) => {
    // La quantité est stockée dans la table de liaison KitProduit
    const quantite = produit.KitProduit ? produit.KitProduit.quantite : 1;
    return acc + (produit.prix * quantite);
  }, 0);

  // 2. Vérification de la validité de la promotion
  let promo_valide = kit.promo_active;

  if (promo_valide) {
    const now = new Date();
    if (kit.promo_debut && new Date(kit.promo_debut) > now) {
      promo_valide = false;
    }
    if (kit.promo_fin && new Date(kit.promo_fin) < now) {
      promo_valide = false;
    }
  }

  // 3. Calcul du prix final
  let prix_final = prix_plein;
  if (promo_valide && kit.reduction_pourcentage > 0) {
    prix_final = Math.round(prix_plein * (1 - kit.reduction_pourcentage / 100));
  }

  return {
    prix_plein,
    prix_final,
    en_promo: promo_valide,
    reduction_pourcentage: kit.reduction_pourcentage
  };
}

// Inclusions standard pour récupérer un kit
const INCLUDES = [
  { 
    model: Produit, 
    as: "produits",
    attributes: ["id", "nom", "slug", "prix", "photo", "stock", "actif"],
    through: { attributes: ["quantite"] }
  }
];

export async function listerKits(query, { inclureInactifs = false } = {}) {
  const { page, limit, offset } = getPagination(query);

  const where = {};
  if (!inclureInactifs) where.actif = true;

  if (query.q) where.nom = { [Op.iLike]: `%${query.q}%` };

  const sortField = query.sort === "nom" ? "nom" : "created_at";
  const order = (query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  const result = await Kit.findAndCountAll({
    where,
    include: INCLUDES,
    order: [[sortField, order]],
    limit,
    offset,
    distinct: true,
  });

  // Mapper pour ajouter les prix calculés
  const kitsCalcules = result.rows.map(k => {
    const json = k.toJSON();
    json.prix = calculerPrixKit(json);
    return json;
  });

  result.rows = kitsCalcules;
  return buildPage(result, page, limit);
}

export async function getKitParSlug(slug) {
  const kit = await Kit.findOne({ where: { slug }, include: INCLUDES });
  if (!kit) {
    throw new AppError("Kit introuvable.", 404, "KIT_NOT_FOUND");
  }
  const json = kit.toJSON();
  json.prix = calculerPrixKit(json);
  return json;
}

export async function creerKit(data) {
  validerKitData(data);
  const t = await db.sequelize.transaction();
  try {
    const slug = makeSlug(data.nom);
    const kit = await Kit.create({ ...data, slug }, { transaction: t });
    
    if (data.produits && Array.isArray(data.produits)) {
      for (const prod of data.produits) {
        await KitProduit.create({
          kit_id: kit.id,
          produit_id: prod.produit_id,
          quantite: prod.quantite || 1
        }, { transaction: t });
      }
    }
    
    await t.commit();
    return getKitParSlug(slug);
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export async function modifierKit(id, data) {
  validerKitData(data);
  const t = await db.sequelize.transaction();
  try {
    const kit = await Kit.findByPk(id);
    if (!kit) {
      throw new AppError("Kit introuvable.", 404, "KIT_NOT_FOUND");
    }

    if (data.nom) data.slug = makeSlug(data.nom);
    
    await kit.update(data, { transaction: t });

    if (data.produits && Array.isArray(data.produits)) {
      // Supprimer les anciens liens
      await KitProduit.destroy({ where: { kit_id: kit.id }, transaction: t });
      
      // Créer les nouveaux
      for (const prod of data.produits) {
        await KitProduit.create({
          kit_id: kit.id,
          produit_id: prod.produit_id,
          quantite: prod.quantite || 1
        }, { transaction: t });
      }
    }

    await t.commit();
    return getKitParSlug(kit.slug);
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export async function supprimerKit(id) {
  const kit = await Kit.findByPk(id);
  if (!kit) {
    throw new AppError("Kit introuvable.", 404, "KIT_NOT_FOUND");
  }
  await kit.destroy();
  return true;
}

function validerKitData(data) {
  const missingFields = [];

  if (data.produits !== undefined) {
    if (!Array.isArray(data.produits) || data.produits.length === 0) {
      throw new AppError("Un kit doit contenir au moins un produit.", 400, "EMPTY_KIT");
    }

    const idsSet = new Set();
    for (const prod of data.produits) {
      if (idsSet.has(prod.produit_id)) {
        throw new AppError("Ce produit est déjà présent dans le kit.", 400, "DUPLICATE_PRODUCT");
      }
      idsSet.add(prod.produit_id);
    }
  }

  if (data.reduction_pourcentage !== undefined) {
    const reduction = Number(data.reduction_pourcentage);
    if (isNaN(reduction) || reduction < 0 || reduction > 100) {
      throw new AppError("La réduction doit être comprise entre 0 et 100 %.", 400, "INVALID_DISCOUNT");
    }
  }

  if (data.promo_active && data.promo_debut && data.promo_fin) {
    const debut = new Date(data.promo_debut);
    const fin = new Date(data.promo_fin);
    if (fin <= debut) {
      throw new AppError("La date de fin de promotion doit être postérieure à la date de début.", 400, "INVALID_DATES");
    }
  }

  if (missingFields.length > 0) {
    throw new AppError("Données de kit invalides.", 400, "VALIDATION_ERROR", missingFields);
  }
}

export default {
  calculerPrixKit,
  listerKits,
  getKitParSlug,
  creerKit,
  modifierKit,
  supprimerKit,
};
