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
dotenv.config();

const API_URL = process.env.WHATSAPP_API_URL;
const API_KEY = process.env.WHATSAPP_API_KEY;
const INSTANCE = process.env.WHATSAPP_INSTANCE;
const SARALI = process.env.SARALI_NUMBER;
const EXPIRATION_H = process.env.ORDER_EXPIRATION_HOURS || 48;
const SITE_URL = process.env.FRONTEND_URL;

// Envoi bas niveau d'un message texte via Evolution
async function envoyerTexte(numero, message) {
  if (!API_URL || !API_KEY || !INSTANCE) {
    logger.warn("WhatsApp non configuré (.env) — message non envoyé.");
    return false;
  }

  // Formatage du numéro pour l'API Evolution (sans espaces, ni +, avec indicatif 223 par défaut)
  let numeroPropre = (numero || "").replace(/\D/g, "");
  if (numeroPropre.length === 8) {
    numeroPropre = "223" + numeroPropre;
  }

  try {
    const res = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: API_KEY,
      },
      body: JSON.stringify({
        number: numeroPropre,
        text: message,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      logger.error({ status: res.status, detail, numero: numeroPropre }, "Échec envoi WhatsApp (Evolution API)");
      return false;
    }
    
    logger.info({ numero: numeroPropre }, "Message WhatsApp envoyé avec succès");
    return true;
  } catch (error) {
    logger.error(error, "Erreur réseau lors de l'envoi WhatsApp");
    return false;
  }
}

// Formate un montant en FCFA
const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

// ---- Séquence 1 : à la création de la commande ----
export async function envoyerCreationCommande(commande, lignes) {
  const recap = lignes
    .map((l) => `• ${l.quantite}× ${l.nom_produit} — ${fcfa(l.prix_unitaire * l.quantite)}`)
    .join("\n");

  const messages = [
    `Bonjour ${commande.prenom} 🌸\n\nMerci pour votre commande chez Myra Skin Care !\n\n*Commande ${commande.numero}*\n${recap}\n\n*Total : ${fcfa(commande.total)}*\nLivraison : ${commande.quartier}`,
    `💳 *Paiement*\n\nPour valider votre commande, envoyez le montant de ${fcfa(commande.total)} via Sarali / Orange Money au numéro suivant :\n\n*${SARALI}*`,
    `📸 Après paiement, envoyez-nous une *capture d'écran* du message de confirmation Sarali sur ce même numéro WhatsApp, afin que nous validions votre commande.`,
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
  envoyerCreationCommande,
  envoyerConfirmationPaiement,
  envoyerAnnulation,
};
