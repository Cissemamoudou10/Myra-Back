// ============================================================
//  Job planifié — expiration automatique des commandes
//  Toutes les heures, repère les commandes encore « en attente
//  de paiement » dont la date d'expiration est dépassée, et les
//  bascule en « expirée » via la machine à états (ce qui restitue
//  le stock et prévient le client).
// ============================================================
import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";
import { expirerCommande } from "../services/commande.service.js";
import logger from "../config/logger.js";

const { Commande, STATUTS } = db;

export async function expirerCommandes() {
  const commandes = await Commande.findAll({
    attributes: ["id", "numero"],
    where: {
      statut: STATUTS.EN_ATTENTE,
      expire_le: { [Op.lt]: new Date() },
    },
  });

  let expirees = 0;
  for (const { id, numero } of commandes) {
    try {
      await expirerCommande(id);
      expirees++;
    } catch (error) {
      // Ex. : l'admin a validé le paiement entre la recherche et la transition.
      // On n'interrompt pas le traitement des autres commandes.
      logger.warn({ commande: numero, err: error.message }, "Job expiration: commande ignorée");
    }
  }

  if (expirees > 0) {
    logger.info({ count: expirees }, "Job expiration: commandes expirées traitées");
  } else {
    logger.debug("Job expiration: aucune commande à expirer");
  }
  return expirees;
}

// Démarre la tâche planifiée (toutes les heures, à la minute 0)
export function demarrerJobExpiration() {
  cron.schedule("0 * * * *", () => {
    logger.info("Exécution du job d'expiration des commandes");
    expirerCommandes().catch((e) =>
      logger.error(e, "Erreur lors de l'exécution du job d'expiration")
    );
  });
  logger.info("Job d'expiration des commandes planifié (toutes les heures).");
}

export default { expirerCommandes, demarrerJobExpiration };
