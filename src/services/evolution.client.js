// ============================================================
//  Client bas niveau de l'API Evolution (WhatsApp)
//  Tous les appels HTTP vers Evolution passent par ici : la clé
//  API reste côté serveur, jamais exposée au front.
//  Configuration : WHATSAPP_API_URL, WHATSAPP_API_KEY, WHATSAPP_INSTANCE.
// ============================================================
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import { masquerNumero } from "../utils/helpers.js";

const DELAI_MS = 15000;

// Lu à chaque appel (et non au chargement du module) pour suivre le .env courant
export function configEvolution() {
  return {
    url: (process.env.WHATSAPP_API_URL || "").replace(/\/+$/, ""),
    cle: process.env.WHATSAPP_API_KEY,
    instance: process.env.WHATSAPP_INSTANCE,
  };
}

export function evolutionConfiguree() {
  const { url, cle, instance } = configEvolution();
  return Boolean(url && cle && instance);
}

// Les réponses d'Evolution peuvent contenir des numéros : on les masque avant de logger
const masquerNumeros = (texte) => texte.replace(/\d{8,}/g, (n) => masquerNumero(n));

function lireJson(texte) {
  try {
    return texte ? JSON.parse(texte) : null;
  } catch {
    return null;
  }
}

// Appelle Evolution et renvoie le corps JSON. En cas d'échec, lève une AppError
// portant `statutEvolution` (code HTTP renvoyé par Evolution, ex. 404 = instance absente).
export async function appelerEvolution(methode, chemin, corps) {
  if (!evolutionConfiguree()) {
    throw new AppError(
      "WhatsApp n'est pas configuré sur le serveur (variables WHATSAPP_API_URL, WHATSAPP_API_KEY, WHATSAPP_INSTANCE).",
      503,
      "WHATSAPP_NON_CONFIGURE"
    );
  }
  const { url, cle } = configEvolution();

  let reponse;
  try {
    reponse = await fetch(`${url}${chemin}`, {
      method: methode,
      headers: { "Content-Type": "application/json", apikey: cle },
      body: corps ? JSON.stringify(corps) : undefined,
      signal: AbortSignal.timeout(DELAI_MS),
    });
  } catch (error) {
    logger.error({ err: error.message, chemin }, "Evolution API injoignable");
    throw new AppError("Le service WhatsApp est injoignable pour le moment.", 502, "WHATSAPP_INJOIGNABLE");
  }

  const texte = await reponse.text();
  if (!reponse.ok) {
    logger.warn({ status: reponse.status, chemin, detail: masquerNumeros(texte.slice(0, 500)) }, "Evolution API a refusé la requête");
    const erreur = new AppError("Le service WhatsApp a refusé la requête.", 502, "WHATSAPP_ERREUR");
    erreur.statutEvolution = reponse.status;
    throw erreur;
  }
  return lireJson(texte);
}

// Format attendu par Evolution : chiffres uniquement, indicatif du Mali (223) ajouté
// aux numéros locaux à 8 chiffres.
export function normaliserNumero(numero) {
  const chiffres = String(numero || "").replace(/\D/g, "");
  return chiffres.length === 8 ? `223${chiffres}` : chiffres;
}
