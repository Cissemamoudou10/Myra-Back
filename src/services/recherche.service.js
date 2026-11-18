// ============================================================
//  Service Recherche globale
//  Interroge en parallèle les six tables et renvoie les résultats
//  groupés par type. Alimente les suggestions de la barre de
//  recherche du header (quelques résultats par type).
//  Insensible aux accents et multi-mots : voir utils/recherche.js.
// ============================================================
import db from "../models/index.js";
import { motsRecherche, conditionMots, conditionProduits } from "../utils/recherche.js";

const { Produit, Marque, Categorie, PrincipeActif, Probleme, TypePeau } = db;

const VIDE = { resultats: [], total: 0 };

async function chercherProduits(mots, limite) {
  const { rows, count } = await Produit.findAndCountAll({
    where: { actif: true, ...conditionProduits(mots) },
    attributes: ["id", "nom", "slug", "photo", "prix"],
    include: [{ model: Marque, as: "marque", attributes: ["nom", "slug"] }],
    order: [["nom", "ASC"]],
    limit: limite,
  });
  return { resultats: rows, total: count };
}

async function chercherParNom(Model, mots, limite) {
  const { rows, count } = await Model.findAndCountAll({
    where: conditionMots(mots, ['"nom"']),
    order: [["nom", "ASC"]],
    limit: limite,
  });
  return { resultats: rows, total: count };
}

// Recherche globale : q = termes, limite par type (défaut 5)
export async function rechercheGlobale(q, limite = 5) {
  const mots = motsRecherche(q);
  if (mots.length === 0) {
    return { produits: VIDE, marques: VIDE, categories: VIDE, types_peau: VIDE, principes_actifs: VIDE, problemes: VIDE };
  }

  const [produits, marques, categories, types_peau, principes_actifs, problemes] = await Promise.all([
    chercherProduits(mots, limite),
    chercherParNom(Marque, mots, limite),
    chercherParNom(Categorie, mots, limite),
    chercherParNom(TypePeau, mots, limite),
    chercherParNom(PrincipeActif, mots, limite),
    chercherParNom(Probleme, mots, limite),
  ]);

  return { produits, marques, categories, types_peau, principes_actifs, problemes };
}

export default { rechercheGlobale };
