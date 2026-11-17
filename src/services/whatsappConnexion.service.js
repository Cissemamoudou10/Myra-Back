// ============================================================
//  Connexion du numéro WhatsApp de la boutique (admin)
//  Remplace la configuration manuelle dans le manager d'Evolution :
//  l'admin voit l'état, scanne le QR code (ou saisit un code
//  d'appairage) et se déconnecte depuis Admin → WhatsApp.
//  L'instance Evolution (WHATSAPP_INSTANCE) est créée au besoin.
// ============================================================
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import { appelerEvolution, configEvolution, normaliserNumero } from "./evolution.client.js";
import { envoyerMessage } from "./whatsapp.service.js";

// États Evolution (Baileys) → états affichés par l'admin
const ETATS = {
  open: "connecte",
  connecting: "connexion",
  close: "deconnecte",
};

const cheminInstance = (action) => `/instance/${action}/${encodeURIComponent(configEvolution().instance)}`;
const instanceAbsente = (erreur) => erreur.statutEvolution === 404;

async function lireEtatBrut() {
  const reponse = await appelerEvolution("GET", cheminInstance("connectionState"));
  return reponse?.instance?.state;
}

// Numéro et nom du compte connecté (null si indisponibles)
async function lireProfil() {
  const { instance } = configEvolution();
  const liste = await appelerEvolution("GET", `/instance/fetchInstances?instanceName=${encodeURIComponent(instance)}`);
  const info = Array.isArray(liste) ? liste.find((i) => i.name === instance) || liste[0] : null;
  return {
    numero: info?.ownerJid ? info.ownerJid.split("@")[0] : null,
    nom: info?.profileName || null,
  };
}

// ---- État de la connexion ----
export async function getEtat() {
  try {
    const etat = ETATS[await lireEtatBrut()] || "deconnecte";
    if (etat !== "connecte") return { etat };
    return { etat, ...(await lireProfil()) };
  } catch (erreur) {
    // Instance jamais créée : pour l'admin, c'est simplement « déconnecté »
    if (instanceAbsente(erreur)) return { etat: "deconnecte" };
    throw erreur;
  }
}

async function creerInstanceSiAbsente() {
  try {
    await lireEtatBrut();
  } catch (erreur) {
    if (!instanceAbsente(erreur)) throw erreur;
    const { instance } = configEvolution();
    await appelerEvolution("POST", "/instance/create", {
      instanceName: instance,
      integration: "WHATSAPP-BAILEYS",
      qrcode: false,
    });
    logger.info({ instance }, "Instance WhatsApp créée");
  }
}

// ---- Démarrer (ou relancer) la connexion ----
// Sans numéro : renvoie un QR code à scanner (image en data URI).
// Avec numéro : renvoie aussi un code d'appairage à saisir dans WhatsApp
// (utile quand l'admin est sur le téléphone à connecter et ne peut pas scanner).
export async function demarrerConnexion({ numero } = {}) {
  await creerInstanceSiAbsente();

  // Evolution ne fournit un code d'appairage que pour une session repartie de zéro :
  // on abandonne la tentative en cours (QR affiché, par exemple) avant de le demander.
  if (numero) await reinitialiserSession();

  const parametre = numero ? `?number=${normaliserNumero(numero)}` : "";
  const reponse = await appelerEvolution("GET", `${cheminInstance("connect")}${parametre}`);

  if (reponse?.instance?.state === "open") return getEtat();
  if (!reponse?.base64 && !reponse?.pairingCode) {
    throw new AppError("WhatsApp n'a pas fourni de QR code. Réessayez dans quelques secondes.", 502, "WHATSAPP_QR_INDISPONIBLE");
  }
  return {
    etat: "connexion",
    qr: reponse.base64 || null,
    codeAppairage: reponse.pairingCode || null,
  };
}

// Ferme la session WhatsApp (connectée ou en cours de connexion).
// Instance absente ou déjà fermée (400/404) : le résultat voulu est atteint.
async function reinitialiserSession() {
  try {
    await appelerEvolution("DELETE", cheminInstance("logout"));
  } catch (erreur) {
    if (![400, 404].includes(erreur.statutEvolution)) throw erreur;
  }
}

// ---- Déconnecter le numéro (l'instance est conservée pour la prochaine connexion) ----
export async function deconnecter() {
  await reinitialiserSession();
  logger.info("WhatsApp déconnecté depuis l'admin");
  return getEtat();
}

// ---- Message de test ----
export async function envoyerTest(numero) {
  if (!normaliserNumero(numero)) {
    throw new AppError("Indiquez le numéro qui doit recevoir le message de test.", 400, "NUMERO_REQUIS");
  }
  const { etat } = await getEtat();
  if (etat !== "connecte") {
    throw new AppError("WhatsApp n'est pas connecté : scannez d'abord le QR code.", 409, "WHATSAPP_DECONNECTE");
  }
  try {
    await envoyerMessage(numero, "✅ Message de test Myra Skin Care : la connexion WhatsApp fonctionne.");
  } catch (erreur) {
    if (erreur.statutEvolution === 400) {
      throw new AppError("WhatsApp a refusé l'envoi : vérifiez que ce numéro a bien un compte WhatsApp.", 400, "NUMERO_INVALIDE");
    }
    throw erreur;
  }
}

export default { getEtat, demarrerConnexion, deconnecter, envoyerTest };
