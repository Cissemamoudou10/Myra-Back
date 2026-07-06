// ============================================================
//  Service Recherche globale
//  Interroge en parallèle les six tables et renvoie les résultats
//  groupés par type. Alimente la barre de recherche du header.
//  Par défaut, limite à quelques résultats par catégorie (aperçu).
// ============================================================
import { Op } from "sequelize";
import db from "../models/index.js";

const {
  Produit,
  Marque,
  Categorie,
  PrincipeActif,
  Probleme,
  TypePeau,
} = db;

// Recherche par nom sur un modèle, limitée
async function chercher(Model, terme, limite, extra = {}) {
  const { rows, count } = await Model.findAndCountAll({
    where: { nom: { [Op.iLike]: `%${terme}%` }, ...extra },
    limit: limite,
  });
  return { resultats: rows, total: count };
}

// Recherche globale : q = terme, limite par catégorie (défaut 5)
export async function rechercheGlobale(q, limite = 5) {
  if (!q || q.trim().length === 0) {
    return {
      produits: { resultats: [], total: 0 },
      marques: { resultats: [], total: 0 },
      categories: { resultats: [], total: 0 },
      types_peau: { resultats: [], total: 0 },
      principes_actifs: { resultats: [], total: 0 },
      problemes: { resultats: [], total: 0 },
    };
  }

  const terme = q.trim();

  // Les six requêtes lancées en parallèle pour la rapidité
  const [
    produits,
    marques,
    categories,
    types_peau,
    principes_actifs,
    problemes,
  ] = await Promise.all([
    chercher(Produit, terme, limite, { actif: true }),
    chercher(Marque, terme, limite),
    chercher(Categorie, terme, limite),
    chercher(TypePeau, terme, limite),
    chercher(PrincipeActif, terme, limite),
    chercher(Probleme, terme, limite),
  ]);

  return {
    produits,
    marques,
    categories,
    types_peau,
    principes_actifs,
    problemes,
  };
}

export default { rechercheGlobale };
