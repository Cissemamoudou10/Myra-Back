// ============================================================
//  Service Commande — cœur de la logique métier
//  - création : calcule le total à partir des prix réels en base
//    (jamais ceux envoyés par le client), fige les prix, crée la
//    commande + ses lignes dans une transaction, déclenche WhatsApp.
//  - transitions : applique le cycle de vie validé et déclenche
//    les messages aux bons moments.
//
//  Concurrence : les produits sont verrouillés (SELECT … FOR UPDATE)
//  le temps de la transaction, pour que deux commandes simultanées
//  ne puissent pas vendre la même unité de stock.
// ============================================================
import { QueryTypes } from "sequelize";
import db from "../models/index.js";
import { makeOrderNumber } from "../utils/helpers.js";
import { verifierTransition } from "../utils/statutCommande.js";
import whatsapp from "./whatsapp.service.js";
import { calculerPrixKit } from "./kit.service.js";
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";

const { Commande, LigneCommande, Produit, Kit, KitProduit, STATUTS, sequelize } = db;
const EXPIRATION_H = parseInt(process.env.ORDER_EXPIRATION_HOURS || "48", 10);

// ---- Réservation de stock d'un produit (ligne verrouillée) ----
async function reserverStock(produitId, quantite, t, erreurIndisponible, erreurRupture) {
  const produit = await Produit.findByPk(produitId, { transaction: t, lock: t.LOCK.UPDATE });
  if (!produit || !produit.actif) throw erreurIndisponible(produit);
  if (produit.stock < quantite) throw erreurRupture(produit);

  produit.stock -= quantite;
  await produit.save({ transaction: t });
  return produit;
}

// ---- Transforme le panier en lignes de commande ----
// Vérifie la disponibilité, réserve le stock et fige les prix réels.
// articles : [{ produit_id | kit_id, quantite }]
async function preparerLignes(articles, t) {
  const lignesData = [];
  let total = 0;

  for (const item of articles) {
    const quantite = Math.max(1, parseInt(item.quantite, 10) || 1);

    if (item.kit_id) {
      const kit = await Kit.findByPk(item.kit_id, {
        include: [{ model: Produit, as: "produits", through: { attributes: ["quantite"] } }],
        transaction: t,
      });

      if (!kit || !kit.actif) {
        throw new AppError("Un article de votre panier n'est plus disponible.", 400, "KIT_UNAVAILABLE", [{ champ: "kit_id", probleme: `Kit indisponible (id ${item.kit_id}).` }]);
      }

      const composition_figee = [];
      for (const prod of kit.produits) {
        const quantiteParKit = prod.KitProduit ? prod.KitProduit.quantite : 1;
        const erreurKit = (p) => new AppError("Un article de votre panier est en rupture de stock.", 400, "INSUFFICIENT_STOCK", [{ champ: "stock", probleme: `Stock insuffisant pour le produit "${p ? p.nom : prod.nom}" inclus dans le kit.` }]);
        const produit = await reserverStock(prod.id, quantiteParKit * quantite, t, erreurKit, erreurKit);
        composition_figee.push({ nom_produit: produit.nom, quantite: quantiteParKit });
      }

      const { prix_final: prix_unitaire } = calculerPrixKit(kit.toJSON());
      total += prix_unitaire * quantite;

      lignesData.push({
        kit_id: kit.id,
        produit_id: null,
        nom_produit: kit.nom,
        quantite,
        prix_unitaire,
        type: "kit",
        composition_figee,
      });
    } else if (item.produit_id) {
      const produit = await reserverStock(
        item.produit_id,
        quantite,
        t,
        () => new AppError("Un article de votre panier n'est plus disponible.", 400, "PRODUCT_UNAVAILABLE", [{ champ: "produit_id", probleme: `Produit indisponible (id ${item.produit_id}).` }]),
        (p) => new AppError(`Stock insuffisant pour le produit "${p.nom}".`, 400, "INSUFFICIENT_STOCK")
      );

      const prix_unitaire = produit.prix;
      total += prix_unitaire * quantite;

      lignesData.push({
        kit_id: null,
        produit_id: produit.id,
        nom_produit: produit.nom,
        quantite,
        prix_unitaire,
        type: "produit",
        composition_figee: null,
      });
    } else {
      throw new AppError("Article invalide (ni produit ni kit spécifié).", 400, "INVALID_ITEM");
    }
  }

  return { lignesData, total };
}

// ---- Identifiant + numéro lisible de la prochaine commande ----
// On tire l'id dans la séquence PostgreSQL : unique même sous forte
// concurrence (contrairement à un « nombre de commandes + 1 »).
// Une transaction annulée laisse un trou dans la numérotation : c'est normal.
async function reserverNumeroCommande(t) {
  const [{ id }] = await sequelize.query(
    "SELECT nextval(pg_get_serial_sequence('commandes', 'id')) AS id",
    { type: QueryTypes.SELECT, transaction: t }
  );
  const idCommande = Number(id);
  return { id: idCommande, numero: makeOrderNumber(idCommande) };
}

// ---- Crée la commande et ses lignes (dans la transaction fournie) ----
async function enregistrerCommande(champs, lignesData, t) {
  const { id, numero } = await reserverNumeroCommande(t);
  const commande = await Commande.create({ id, numero, ...champs }, { transaction: t });
  const lignes = await Promise.all(
    lignesData.map((l) => LigneCommande.create({ ...l, commande_id: commande.id }, { transaction: t }))
  );
  commande.dataValues.lignes = lignes;
  return { commande, lignes };
}

// ---- Création d'une commande en ligne ----
// payload : { prenom, nom, whatsapp, quartier, articles: [{ produit_id | kit_id, quantite }] }
export async function creerCommande(payload) {
  const { prenom, nom, whatsapp: numero, quartier, articles } = payload;

  // Validations de base avec détails
  const missingFields = [];
  if (!prenom) missingFields.push({ champ: "prenom", probleme: "Le prénom est requis." });
  if (!nom) missingFields.push({ champ: "nom", probleme: "Le nom est requis." });
  if (!numero) missingFields.push({ champ: "whatsapp", probleme: "Le numéro WhatsApp est requis." });
  if (!quartier) missingFields.push({ champ: "quartier", probleme: "Le quartier de livraison est requis." });

  if (missingFields.length > 0) {
    throw new AppError("Des informations sont manquantes pour valider votre commande.", 400, "MISSING_FIELDS", missingFields);
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    throw new AppError("Votre panier est vide.", 400, "EMPTY_CART");
  }

  // Transaction : tout réussit, ou rien n'est créé
  const { commande, lignes } = await sequelize.transaction(async (t) => {
    const { lignesData, total } = await preparerLignes(articles, t);
    return enregistrerCommande(
      {
        prenom,
        nom,
        whatsapp: numero,
        quartier,
        total,
        statut: STATUTS.EN_ATTENTE,
        expire_le: new Date(Date.now() + EXPIRATION_H * 3600 * 1000),
      },
      lignesData,
      t
    );
  });

  logger.info({ commande: commande.numero, total: commande.total }, "Nouvelle commande créée");

  // WhatsApp seulement une fois la commande réellement enregistrée (après commit).
  // Un échec d'envoi n'annule pas la commande.
  whatsapp.envoyerCreationCommande(commande, lignes).catch(() => {});

  return { commande, lignes };
}

// ---- Vente directe en boutique (POS) ----
// Mêmes règles que la commande en ligne (prix réels, stock verrouillé),
// mais livrée immédiatement et sans message WhatsApp.
// articles : [{ produit_id | kit_id, quantite }], client optionnel
export async function creerVenteBoutique({ articles, client = {} }) {
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new AppError("Le panier est vide.", 400, "EMPTY_CART");
  }

  const resultat = await sequelize.transaction(async (t) => {
    const { lignesData, total } = await preparerLignes(articles, t);
    return enregistrerCommande(
      {
        prenom: client.prenom || "Client",
        nom: client.nom || "Boutique",
        whatsapp: client.whatsapp || "N/A",
        quartier: client.quartier || "Boutique Physique",
        total,
        statut: STATUTS.LIVREE,
        source: "boutique",
        expire_le: null,
      },
      lignesData,
      t
    );
  });

  logger.info({ commande: resultat.commande.numero, total: resultat.commande.total }, "Nouvelle vente boutique enregistrée");
  return resultat;
}

// ---- Récupérer une commande avec ses lignes ----
export async function getCommande(id) {
  const commande = await Commande.findByPk(id, {
    include: [{ model: LigneCommande, as: "lignes" }],
  });
  if (!commande) {
    throw new AppError("Commande introuvable.", 404, "ORDER_NOT_FOUND");
  }

  // Assurer la rétrocompatibilité d'affichage et formater "composition"
  const commandeJSON = commande.toJSON();
  commandeJSON.lignes = commandeJSON.lignes.map(l => {
    // Rétrocompatibilité : déduire le type s'il n'est pas rempli
    if (!l.type) {
      l.type = l.kit_id ? "kit" : "produit";
    }
    // Mapping pour coller à la spec (renvoyer "composition" plutôt que "composition_figee" si souhaité,
    // mais "composition" est plus standard).
    if (l.type === "kit" && l.composition_figee) {
      l.composition = l.composition_figee;
    }
    delete l.composition_figee;
    return l;
  });

  return commandeJSON;
}

// ---- Remet en stock les articles d'une commande annulée/expirée ----
// Note : pour un kit, on se base sur sa composition actuelle (la
// composition figée ne stocke que les noms, pas les ids produits).
async function restituerStock(lignes, t) {
  for (const ligne of lignes) {
    if (ligne.kit_id) {
      const composition = await KitProduit.findAll({ where: { kit_id: ligne.kit_id }, transaction: t });
      for (const { produit_id, quantite } of composition) {
        await Produit.increment("stock", { by: quantite * ligne.quantite, where: { id: produit_id }, transaction: t });
      }
    } else if (ligne.produit_id) {
      await Produit.increment("stock", { by: ligne.quantite, where: { id: ligne.produit_id }, transaction: t });
    }
  }
}

// ---- Changer le statut d'une commande (avec vérification + effets) ----
// Toute la transition (statut + restitution du stock) est atomique, et
// la commande est verrouillée : deux annulations simultanées ne peuvent
// pas restituer le stock deux fois.
async function changerStatut(id, cible) {
  const { commande, ancienStatut } = await sequelize.transaction(async (t) => {
    // Pas d'include ici : PostgreSQL refuse FOR UPDATE sur une jointure externe.
    const commande = await Commande.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!commande) {
      throw new AppError("Commande introuvable.", 404, "ORDER_NOT_FOUND");
    }

    try {
      verifierTransition(commande.statut, cible);
    } catch (error) {
      logger.warn({ commande: commande.numero, ancienStatut: commande.statut, cible_demandee: cible }, "Transition de commande refusée (invalide)");
      throw error;
    }

    const ancienStatut = commande.statut;
    commande.statut = cible;
    await commande.save({ transaction: t });

    const lignes = await LigneCommande.findAll({ where: { commande_id: commande.id }, transaction: t });
    commande.dataValues.lignes = lignes;

    if (cible === STATUTS.ANNULEE || cible === STATUTS.EXPIREE) {
      await restituerStock(lignes, t);
    }

    return { commande, ancienStatut };
  });

  logger.info({ commande: commande.numero, ancienStatut, nouveauStatut: cible }, "Statut de commande mis à jour");

  // Effets de bord externes, une fois la transition enregistrée
  if (cible === STATUTS.PAYEE) {
    whatsapp.envoyerConfirmationPaiement(commande).catch(() => {});
  } else if (cible === STATUTS.ANNULEE || cible === STATUTS.EXPIREE) {
    const mot = cible === STATUTS.EXPIREE ? "expirée" : "annulée";
    whatsapp.envoyerAnnulation(commande, mot).catch(() => {});
  }

  return commande;
}

// Actions exposées (contrôleur admin + job d'expiration)
export const signalerPaiement = (id) => changerStatut(id, STATUTS.SIGNALE);
export const validerPaiement = (id) => changerStatut(id, STATUTS.PAYEE);
export const mettreEnLivraison = (id) => changerStatut(id, STATUTS.EN_LIVRAISON);
export const marquerLivree = (id) => changerStatut(id, STATUTS.LIVREE);
export const annulerCommande = (id) => changerStatut(id, STATUTS.ANNULEE);
export const expirerCommande = (id) => changerStatut(id, STATUTS.EXPIREE);

export default {
  creerCommande,
  creerVenteBoutique,
  getCommande,
  signalerPaiement,
  validerPaiement,
  mettreEnLivraison,
  marquerLivree,
  annulerCommande,
  expirerCommande,
};
