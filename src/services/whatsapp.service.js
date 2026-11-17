// ============================================================
//  Service WhatsApp — communication avec l'API Evolution
//  Tout l'envoi de messages passe par ici. Les identifiants
//  restent côté serveur (jamais exposés au front).
//
//  Les fonctions n'interrompent jamais le flux de commande si
//  l'envoi échoue : elles loguent l'erreur et renvoient false,
//  pour qu'une commande puisse exister même si WhatsApp est
//  momentanément indisponible (l'admin peut relancer).
// ============================================================
import dotenv from "dotenv";
import logger from "../config/logger.js";
import { masquerNumero } from "../utils/helpers.js";
dotenv.config();

import { appelerEvolution, configEvolution, evolutionConfiguree, normaliserNumero } from "./evolution.client.js";

import { getParametres } from "./parametre.service.js";

const EXPIRATION_H = process.env.ORDER_EXPIRATION_HOURS || 48;
const SITE_URL = process.env.FRONTEND_URL;

// Envoie un message texte ; lève une AppError en cas d'échec
// (utilisé tel quel par le message de test de l'admin).
export async function envoyerMessage(numero, message) {
  const numeroPropre = normaliserNumero(numero);
  await appelerEvolution("POST", `/message/sendText/${encodeURIComponent(configEvolution().instance)}`, {
    number: numeroPropre,
    text: message,
  });
  logger.info({ numero: masquerNumero(numeroPropre) }, "Message WhatsApp envoyé avec succès");
}

// Variante tolérante pour les séquences automatiques : n'interrompt jamais
// le flux de commande, renvoie simplement false en cas d'échec.
async function envoyerTexte(numero, message) {
  if (!evolutionConfiguree()) {
    logger.warn("WhatsApp non configuré (.env) — message non envoyé.");
    return false;
  }
  try {
    await envoyerMessage(numero, message);
    return true;
  } catch (error) {
    logger.error({ code: error.code, numero: masquerNumero(numero) }, "Échec envoi WhatsApp");
    return false;
  }
}

// Formate un montant en FCFA
const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

// Message de paiement, construit à partir des numéros réglés dans Admin → Paramètres
export function messagePaiement(total, { orange_money_numero, sarali_numero }) {
  const moyens = [
    orange_money_numero && `• Orange Money : *${orange_money_numero}*`,
    sarali_numero && `• Sarali : *${sarali_numero}*`,
  ].filter(Boolean);

  if (moyens.length === 0) {
    return `💳 *Paiement*\n\nMontant à régler : ${fcfa(total)}.\nRépondez à ce message : nous vous indiquons comment payer.`;
  }
  return `💳 *Paiement*\n\nPour valider votre commande, envoyez ${fcfa(total)} via :\n\n${moyens.join("\n")}`;
}

// ---- Séquence 1 : à la création de la commande ----
export async function envoyerCreationCommande(commande, lignes) {
  const recap = lignes
    .map((l) => `• ${l.quantite}× ${l.nom_produit} — ${fcfa(l.prix_unitaire * l.quantite)}`)
    .join("\n");
  const parametres = await getParametres();

  const messages = [
    `Bonjour ${commande.prenom} 🌸\n\nMerci pour votre commande chez Myra Skin Care !\n\n*Commande ${commande.numero}*\n${recap}\n\n*Total : ${fcfa(commande.total)}*\nLivraison : ${commande.quartier}`,
    messagePaiement(commande.total, parametres),
    `📸 Après paiement, envoyez-nous une *capture d'écran* de la confirmation de paiement sur ce même numéro WhatsApp, afin que nous validions votre commande.`,
    `⏳ Sans paiement sous *${EXPIRATION_H} heures*, votre commande sera automatiquement annulée.\n\nÀ très vite chez Myra Skin Care ✨`,
  ];

  let ok = true;
  for (const msg of messages) {
    const sent = await envoyerTexte(commande.whatsapp, msg);
    ok = ok && sent;
  }
  return ok;
}

// ---- Séquence 2 : à la validation du paiement par l'admin ----
export async function envoyerConfirmationPaiement(commande) {
  const lien = SITE_URL ? `${SITE_URL}/avis` : "notre site";
  const messages = [
    `✅ Bonne nouvelle ${commande.prenom} !\n\nNous avons bien reçu votre paiement pour la commande *${commande.numero}*. Elle est confirmée.`,
    `📞 Nous vous appellerons très bientôt sur ce numéro pour organiser la *livraison* à ${commande.quartier}.`,
    `🌟 Une fois votre commande reçue, n'hésitez pas à partager votre avis ici :\n${lien}\n\nMerci de votre confiance — Myra Skin Care 💛`,
  ];

  let ok = true;
  for (const msg of messages) {
    const sent = await envoyerTexte(commande.whatsapp, msg);
    ok = ok && sent;
  }
  return ok;
}

// ---- Optionnel : notifier l'annulation/expiration ----
export async function envoyerAnnulation(commande, raison = "annulée") {
  return envoyerTexte(
    commande.whatsapp,
    `Votre commande *${commande.numero}* a été ${raison}.\n\nPour toute question, répondez à ce message. Myra Skin Care.`
  );
}

export default {
  envoyerMessage,
  envoyerCreationCommande,
  envoyerConfirmationPaiement,
  envoyerAnnulation,
};
