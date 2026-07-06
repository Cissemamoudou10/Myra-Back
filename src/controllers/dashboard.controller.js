import { Op } from "sequelize";
import db from "../models/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import AppError from "../utils/AppError.js";
import logger from "../config/logger.js";

const { Produit, Commande, LigneCommande, Probleme, sequelize } = db;

export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const countProduits = await Produit.count({ where: { actif: true } });

  const countCommandesMois = await Commande.count({
    where: { created_at: { [Op.gte]: startOfMonth } },
  });

  const countEnAttente = await Commande.count({
    where: { statut: { [Op.in]: ["en_attente_paiement", "paiement_signale"] } },
  });

  const commandesRevenu = await Commande.findAll({
    where: {
      created_at: { [Op.gte]: startOfMonth },
      statut: { [Op.in]: ["payee", "en_livraison", "livree"] },
    },
    attributes: ["total"],
  });
  
  const revenuMois = commandesRevenu.reduce((acc, c) => acc + Number(c.total || 0), 0);

  const recentCommandes = await Commande.findAll({
    order: [["created_at", "DESC"]],
    limit: 5,
  });

  // --- NOUVEAUTÉ : Analyse avancée ---

  // 1. Courbe des ventes (7 derniers jours)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0,0,0,0);

  const ventes7j = await Commande.findAll({
    where: {
      created_at: { [Op.gte]: sevenDaysAgo },
      statut: { [Op.in]: ["payee", "en_livraison", "livree"] },
    },
    attributes: ["created_at", "total"]
  });

  // Regroupement par jour
  const salesMap = {};
  for(let i=0; i<7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    salesMap[d.toISOString().split('T')[0]] = 0;
  }
  
  ventes7j.forEach(c => {
    const dateObj = new Date(c.getDataValue ? c.getDataValue('createdAt') : (c.createdAt || c.created_at));
    if (!isNaN(dateObj.getTime())) {
      const dateStr = dateObj.toISOString().split('T')[0];
      if (salesMap[dateStr] !== undefined) {
        salesMap[dateStr] += Number(c.total);
      }
    }
  });

  const salesData = Object.keys(salesMap).map(date => ({
    date,
    CA: salesMap[date]
  }));

  // 2. Produits en rupture ou stock faible (< 5)
  const lowStock = await Produit.findAll({
    where: { stock: { [Op.lt]: 5 } },
    attributes: ["id", "nom", "stock"],
    limit: 5
  });

  // 3. Top Produits Vendus (simplifié via LigneCommande)
  const topLignes = await LigneCommande.findAll({
    include: [{ model: Produit, as: "produit", attributes: ["nom"] }]
  });
  const productSales = {};
  topLignes.forEach(l => {
    if (l.produit) {
      productSales[l.produit.nom] = (productSales[l.produit.nom] || 0) + l.quantite;
    }
  });
  const topProducts = Object.keys(productSales)
    .map(name => ({ name, qty: productSales[name] }))
    .sort((a,b) => b.qty - a.qty)
    .slice(0, 5);

  res.json({
    stats: [
      { label: "Produits", value: countProduits.toString(), hint: "en catalogue" },
      { label: "Commandes", value: countCommandesMois.toString(), hint: "ce mois-ci" },
      { label: "En attente", value: countEnAttente.toString(), hint: "à traiter" },
      { label: "Revenu", value: revenuMois.toLocaleString("fr-FR"), hint: "FCFA ce mois" },
    ],
    salesData,
    lowStock,
    topProducts,
    recent: recentCommandes.map(o => ({
      id: o.numero,
      client: `${o.prenom} ${o.nom}`,
      total: `${Number(o.total).toLocaleString("fr-FR")} FCFA`,
      statut: o.statut.replace(/_/g, " "),
    })),
  });
});

export const getStatistiquesPeriode = asyncHandler(async (req, res) => {
  logger.info({ query: req.query }, "Consultation des statistiques");

  // 1. Gestion des dates avec valeurs par défaut (30 derniers jours)
  let { debut, fin } = req.query;
  const now = new Date();
  
  if (!fin) {
    fin = now.toISOString().split("T")[0]; // YYYY-MM-DD
  }
  if (!debut) {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    debut = d.toISOString().split("T")[0];
  }

  // Validation des dates
  const dateDebut = new Date(debut);
  const dateFin = new Date(fin);
  
  if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
    throw new AppError("Format de date invalide (attendu: YYYY-MM-DD).", 400, "INVALID_DATE_FORMAT");
  }
  if (dateDebut > dateFin) {
    throw new AppError("La date de début doit être antérieure ou égale à la date de fin.", 400, "INVALID_DATE_RANGE");
  }

  // Bornes incluses (début de journée jusqu'à fin de journée)
  const startBound = new Date(dateDebut);
  startBound.setHours(0, 0, 0, 0);
  const endBound = new Date(dateFin);
  endBound.setHours(23, 59, 59, 999);

  // 2. Chiffre d'affaires (statuts encaissés) réparti par source
  const statutsCA = ["payee", "en_livraison", "livree"];
  
  const caResult = await Commande.findAll({
    attributes: [
      "source",
      [sequelize.fn("SUM", sequelize.col("total")), "total_ca"],
      [sequelize.fn("COUNT", sequelize.col("id")), "nb_commandes_ca"]
    ],
    where: {
      created_at: { [Op.between]: [startBound, endBound] },
      statut: { [Op.in]: statutsCA }
    },
    group: ["source"],
    raw: true
  });
  
  let chiffre_affaires = 0;
  let ca_en_ligne = 0;
  let ca_boutique = 0;
  let nb_commandes_ca = 0;

  caResult.forEach(row => {
    const val = parseInt(row.total_ca || 0, 10);
    const count = parseInt(row.nb_commandes_ca || 0, 10);
    chiffre_affaires += val;
    nb_commandes_ca += count;
    if (row.source === 'boutique') ca_boutique += val;
    else ca_en_ligne += val;
  });

  const panier_moyen = nb_commandes_ca > 0 ? Math.round(chiffre_affaires / nb_commandes_ca) : 0;

  // 3. Nombre de commandes total et répartition
  const repartitionResult = await Commande.findAll({
    attributes: [
      "statut",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"]
    ],
    where: {
      created_at: { [Op.between]: [startBound, endBound] }
    },
    group: ["statut"],
    raw: true
  });

  const repartition_statuts = {
    en_attente_paiement: 0,
    paiement_signale: 0,
    payee: 0,
    en_livraison: 0,
    livree: 0,
    annulee: 0,
    expiree: 0
  };
  
  let nombre_commandes = 0;
  
  repartitionResult.forEach(row => {
    const stat = row.statut;
    const cnt = parseInt(row.count, 10);
    if (repartition_statuts[stat] !== undefined) {
      repartition_statuts[stat] = cnt;
    }
    nombre_commandes += cnt;
  });

  // 4. Top Produits et Kits (via agrégation SQL sur les lignes)
  // On compte les quantités sur les commandes appartenant au CA
  const topLignesResult = await LigneCommande.findAll({
    attributes: [
      "produit_id",
      "kit_id",
      "nom_produit",
      [sequelize.fn("SUM", sequelize.col("quantite")), "total_vendu"]
    ],
    include: [{
      model: Commande,
      as: "commande",
      attributes: [],
      where: {
        created_at: { [Op.between]: [startBound, endBound] },
        statut: { [Op.in]: statutsCA }
      }
    }],
    group: ["produit_id", "kit_id", "nom_produit"],
    order: [[sequelize.literal("total_vendu"), "DESC"]],
    raw: true
  });

  const top_produits = [];
  const top_kits = [];

  topLignesResult.forEach(row => {
    const qty = parseInt(row.total_vendu, 10);
    if (row.produit_id) {
      top_produits.push({ nom: row.nom_produit, quantite_vendue: qty, produit_id: row.produit_id });
    } else if (row.kit_id) {
      top_kits.push({ nom: row.nom_produit, quantite_vendue: qty, kit_id: row.kit_id });
    }
  });

  // Limiter aux 10 premiers
  const top10Produits = top_produits.slice(0, 10);
  const top10Kits = top_kits.slice(0, 10);

  // 5. Évolution par jour
  const evolutionMap = {};
  // Initialiser les jours de la période à 0 (jusqu'à 60 jours max pour éviter un énorme objet, 
  // mais laissons tel quel selon la période)
  let cursor = new Date(startBound);
  while (cursor <= endBound) {
    const dStr = cursor.toISOString().split("T")[0];
    evolutionMap[dStr] = { date: dStr, ca: 0, commandes: 0 };
    cursor.setDate(cursor.getDate() + 1);
  }

  const evoResult = await Commande.findAll({
    attributes: [
      // Cast vers DATE pour PostgreSQL pour extraire la date uniquement
      [sequelize.fn("DATE", sequelize.col("created_at")), "jour"],
      [sequelize.fn("SUM", sequelize.col("total")), "ca_jour"],
      [sequelize.fn("COUNT", sequelize.col("id")), "nb_jour"]
    ],
    where: {
      created_at: { [Op.between]: [startBound, endBound] },
      statut: { [Op.in]: statutsCA }
    },
    group: [sequelize.fn("DATE", sequelize.col("created_at"))],
    raw: true
  });

  evoResult.forEach(row => {
    // row.jour peut être une string YYYY-MM-DD ou un objet Date
    const d = new Date(row.jour);
    if (!isNaN(d.getTime())) {
      const dStr = d.toISOString().split("T")[0];
      if (evolutionMap[dStr]) {
        evolutionMap[dStr].ca = parseInt(row.ca_jour || 0, 10);
        evolutionMap[dStr].commandes = parseInt(row.nb_jour || 0, 10);
      }
    }
  });

  const evolution = Object.values(evolutionMap).sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    periode: { debut, fin },
    chiffre_affaires,
    ca_en_ligne,
    ca_boutique,
    nombre_commandes,
    panier_moyen,
    repartition_statuts,
    top_produits: top10Produits,
    top_kits: top10Kits,
    evolution
  });
});
