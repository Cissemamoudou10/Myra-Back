import db from "../models/index.js";
import AppError from "../utils/AppError.js";
import { STATUTS } from "../models/Commande.js";
import logger from "../config/logger.js";
import { makeOrderNumber } from "../utils/helpers.js";

const { Commande, LigneCommande, Produit, Kit, KitProduit } = db;

// ============================================================
// Création d'une vente en boutique (POS)
// ============================================================
export const creerVentePOS = async (req, res, next) => {
  // Démarre une transaction pour assurer la cohérence (création commande + lignes + déduction stock)
  const transaction = await db.sequelize.transaction();

  try {
    const { total, items, client } = req.body;
    // items: [{ type: "produit"|"kit", id: number, quantite: number, prix_unitaire: number }]

    if (!items || items.length === 0) {
      throw new AppError("Le panier est vide.", 400);
    }

    // 1) Création de la commande "Boutique"
    const count = await Commande.count({ transaction });
    const numero = makeOrderNumber(count + 1);
    
    // Si client est renseigné, on le met, sinon valeurs par défaut
    const prenom = client?.prenom || "Client";
    const nom = client?.nom || "Boutique";
    const whatsapp = client?.whatsapp || "N/A";
    const quartier = client?.quartier || "Boutique Physique";

    const nouvelleCommande = await Commande.create(
      {
        numero,
        prenom,
        nom,
        whatsapp,
        quartier,
        total,
        statut: STATUTS.LIVREE, // La vente en boutique est livrée immédiatement
        source: "boutique",
        expire_le: null // Ne s'applique pas
      },
      { transaction }
    );

    // 2) Création des lignes et déduction des stocks
    for (const item of items) {
      if (item.type === "produit") {
        const produit = await Produit.findByPk(item.id, { transaction });
        if (!produit) throw new AppError(`Produit (ID: ${item.id}) introuvable.`, 404);
        if (produit.stock < item.quantite) {
          throw new AppError(`Stock insuffisant pour le produit : ${produit.nom} (Reste : ${produit.stock}).`, 400);
        }

        // Créer la ligne
        await LigneCommande.create(
          {
            commande_id: nouvelleCommande.id,
            produit_id: produit.id,
            prix_unitaire: item.prix_unitaire,
            quantite: item.quantite,
            nom_produit: produit.nom,
            type: "produit",
            composition_figee: null
          },
          { transaction }
        );

        // Déduire le stock
        await produit.decrement("stock", { by: item.quantite, transaction });
      } 
      else if (item.type === "kit") {
        const kit = await Kit.findByPk(item.id, {
          include: [{ model: Produit, as: "produits", through: { attributes: ["quantite"] } }],
          transaction
        });
        if (!kit) throw new AppError(`Kit (ID: ${item.id}) introuvable.`, 404);

        // Vérifier le stock de chaque produit composant le kit
        for (const p of kit.produits) {
          const qteRequise = p.KitProduit.quantite * item.quantite;
          if (p.stock < qteRequise) {
            throw new AppError(`Stock insuffisant pour le produit "${p.nom}" inclus dans le kit "${kit.nom}".`, 400);
          }
        }

        // Composition du kit pour garder la trace
        const composition_figee = kit.produits.map(p => ({
          nom_produit: p.nom,
          quantite: p.KitProduit.quantite
        }));

        // Créer la ligne
        await LigneCommande.create(
          {
            commande_id: nouvelleCommande.id,
            kit_id: kit.id,
            prix_unitaire: item.prix_unitaire,
            quantite: item.quantite,
            nom_produit: kit.nom,
            type: "kit",
            composition_figee
          },
          { transaction }
        );

        // Déduire le stock des composants
        for (const p of kit.produits) {
          const qteRequise = p.KitProduit.quantite * item.quantite;
          await p.decrement("stock", { by: qteRequise, transaction });
        }
      } else {
        throw new AppError(`Type d'article inconnu: ${item.type}`, 400);
      }
    }

    // Validation finale
    await transaction.commit();

    logger.info(`Nouvelle vente boutique enregistrée : ${numero} - Total: ${total} FCFA`);

    res.status(201).json({
      erreur: false,
      message: "Vente encaissée avec succès.",
      data: nouvelleCommande
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
