// ============================================================
//  Job planifié — expiration automatique des commandes
//  Toutes les heures, repère les commandes encore « en attente
//  de paiement » dont la date d'expiration est dépassée, et les
//  bascule en « expirée ».
// ============================================================
import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";
import whatsapp from "../services/whatsapp.service.js";
import logger from "../config/logger.js";

const { Commande, STATUTS } = db;

export async function expirerCommandes() {
  const maintenant = new Date();
  const commandes = await Commande.findAll({
    where: {
      statut: STATUTS.EN_ATTENTE,
      expire_le: { [Op.lt]: maintenant },
    },
  });

  for (const commande of commandes) {
    commande.statut = STATUTS.EXPIREE;
    await commande.save();
    whatsapp.envoyerAnnulation(commande, "expirée").catch(() => {});
  }

  if (commandes.length > 0) {
    logger.info({ count: commandes.length }, "Job expiration: commandes expirées traitées");
  } else {
    logger.debug("Job expiration: aucune commande à expirer");
  }
  return commandes.length;
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
