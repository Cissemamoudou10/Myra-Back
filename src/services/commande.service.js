// ============================================================
//  Service Commande — cœur de la logique métier
//  - création : calcule le total à partir des prix réels en base
//    (jamais ceux envoyés par le client), fige les prix, crée la
//    commande + ses lignes dans une transaction, déclenche WhatsApp.
//  - transitions : applique le cycle de vie validé et déclenche
//    les messages aux bons moments.
// ============================================================
import db from "../models/index.js";
import { makeOrderNumber } from "../utils/helpers.js";
import { verifierTransition } from "../utils/statutCommande.js";
import whatsapp from "./whatsapp.service.js";
import { calculerPrixKit } from "./kit.service.js";
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";

const { Commande, LigneCommande, Produit, Kit, KitProduit, STATUTS, sequelize } = db;
const EXPIRATION_H = parseInt(process.env.ORDER_EXPIRATION_HOURS || "48", 10);

// ---- Création d'une commande ----
// payload : { prenom, nom, whatsapp, quartier, articles: [{ produit_id, quantite }] }
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
  return sequelize.transaction(async (t) => {
    // 1) Récupérer les produits réels et figer leurs prix
    const lignesData = [];
    let total = 0;

    for (const item of articles) {
      const quantite = Math.max(1, parseInt(item.quantite, 10) || 1);

      if (item.kit_id) {
        const kit = await Kit.findByPk(item.kit_id, {
          include: [{ model: Produit, as: "produits", through: { attributes: ["quantite"] } }],
          transaction: t
        });

        if (!kit || !kit.actif) {
          throw new AppError("Un article de votre panier n'est plus disponible.", 400, "KIT_UNAVAILABLE", [{ champ: "kit_id", probleme: `Kit indisponible (id ${item.kit_id}).` }]);
        }

        // Vérification et décrémentation des stocks des produits du kit
        const composition_figee = [];
        for (const prod of kit.produits) {
          const qtyRequired = (prod.KitProduit ? prod.KitProduit.quantite : 1) * quantite;
          const fullProd = await Produit.findByPk(prod.id, { transaction: t });
          if (!fullProd || !fullProd.actif || fullProd.stock < qtyRequired) {
            throw new AppError("Un article de votre panier est en rupture de stock.", 400, "INSUFFICIENT_STOCK", [{ champ: "stock", probleme: `Stock insuffisant pour le produit "${fullProd ? fullProd.nom : prod.nom}" inclus dans le kit.` }]);
          }
          fullProd.stock -= qtyRequired;
          await fullProd.save({ transaction: t });

          composition_figee.push({
            nom_produit: fullProd.nom,
            quantite: prod.KitProduit ? prod.KitProduit.quantite : 1
          });
        }

        const { prix_final } = calculerPrixKit(kit.toJSON ? kit.toJSON() : kit);
        const prix_unitaire = prix_final;
        total += prix_unitaire * quantite;

        lignesData.push({
          kit_id: kit.id,
          produit_id: null,
          nom_produit: kit.nom,
          quantite,
          prix_unitaire,
          type: "kit",
          composition_figee
        });

      } else if (item.produit_id) {
        const produit = await Produit.findByPk(item.produit_id, { transaction: t });
        if (!produit || !produit.actif) {
          throw new AppError("Un article de votre panier n'est plus disponible.", 400, "PRODUCT_UNAVAILABLE", [{ champ: "produit_id", probleme: `Produit indisponible (id ${item.produit_id}).` }]);
        }
        
        if (produit.stock < quantite) {
          throw new AppError(`Stock insuffisant pour le produit "${produit.nom}".`, 400, "INSUFFICIENT_STOCK");
        }
        
        produit.stock -= quantite;
        await produit.save({ transaction: t });

        const prix_unitaire = produit.prix;
        total += prix_unitaire * quantite;

        lignesData.push({
          kit_id: null,
          produit_id: produit.id,
          nom_produit: produit.nom,
          quantite,
          prix_unitaire,
          type: "produit",
          composition_figee: null
        });
      } else {
        throw new AppError("Article invalide (ni produit ni kit spécifié).", 400, "INVALID_ITEM");
      }
    }

    // 2) Numéro de commande (basé sur le nombre de commandes existantes)
    const count = await Commande.count({ transaction: t });
    const numeroCommande = makeOrderNumber(count + 1);

    // 3) Date d'expiration : maintenant + 48 h
    const expire_le = new Date(Date.now() + EXPIRATION_H * 3600 * 1000);

    // 4) Créer la commande
    const commande = await Commande.create(
      {
        numero: numeroCommande,
        prenom,
        nom,
        whatsapp: numero,
        quartier,
        total,
        statut: STATUTS.EN_ATTENTE,
        expire_le,
      },
      { transaction: t }
    );

    // 5) Créer les lignes
    const lignes = await Promise.all(
      lignesData.map((l) =>
        LigneCommande.create({ ...l, commande_id: commande.id }, { transaction: t })
      )
    );

    // 6) Déclencher la séquence WhatsApp (hors transaction critique :
    //    on n'annule pas la commande si l'envoi échoue)
    commande.dataValues.lignes = lignes;
    
    logger.info({ commande: numeroCommande, total, prenom, nom, whatsapp: numero }, "Nouvelle commande créée");

    whatsapp.envoyerCreationCommande(commande, lignes).catch(() => {});

    return { commande, lignes };
  });
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

// ---- Changer le statut d'une commande (avec vérification + effets) ----
async function changerStatut(id, cible, { raison } = {}) {
  const commande = await Commande.findByPk(id, {
    include: [{ model: LigneCommande, as: "lignes" }],
  });
  
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
  await commande.save();

  logger.info({ commande: commande.numero, ancienStatut, nouveauStatut: cible }, "Statut de commande mis à jour");

  // Effets de bord selon le nouveau statut
  if (cible === STATUTS.PAYEE) {
    whatsapp.envoyerConfirmationPaiement(commande).catch(() => {});
  } else if (cible === STATUTS.ANNULEE || cible === STATUTS.EXPIREE) {
    const mot = cible === STATUTS.EXPIREE ? "expirée" : "annulée";
    whatsapp.envoyerAnnulation(commande, mot).catch(() => {});
    
    // Restituer le stock
    for (const ligne of commande.lignes) {
      if (ligne.kit_id) {
        const kit = await Kit.findByPk(ligne.kit_id, {
          include: [{ model: Produit, as: "produits", through: { attributes: ["quantite"] } }]
        });
        if (kit) {
          for (const prod of kit.produits) {
            const qtyRequired = (prod.KitProduit ? prod.KitProduit.quantite : 1) * ligne.quantite;
            const p = await Produit.findByPk(prod.id);
            if (p) {
              p.stock += qtyRequired;
              await p.save();
            }
          }
        }
      } else if (ligne.produit_id) {
        const p = await Produit.findByPk(ligne.produit_id);
        if (p) {
          p.stock += ligne.quantite;
          await p.save();
        }
      }
    }
  }

  return commande;
}

// Actions exposées (utilisées par le contrôleur admin)
export const signalerPaiement = (id) => changerStatut(id, STATUTS.SIGNALE);
export const validerPaiement = (id) => changerStatut(id, STATUTS.PAYEE);
export const mettreEnLivraison = (id) => changerStatut(id, STATUTS.EN_LIVRAISON);
export const marquerLivree = (id) => changerStatut(id, STATUTS.LIVREE);
export const annulerCommande = (id) => changerStatut(id, STATUTS.ANNULEE);

export default {
  creerCommande,
  getCommande,
  signalerPaiement,
  validerPaiement,
  mettreEnLivraison,
  marquerLivree,
  annulerCommande,
};
