// ============================================================
//  Contrôleur WhatsApp (admin) — connexion du numéro de la boutique
// ============================================================
import whatsappConnexion from "../services/whatsappConnexion.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getEtat = asyncHandler(async (req, res) => {
  res.json(await whatsappConnexion.getEtat());
});

export const connecter = asyncHandler(async (req, res) => {
  res.json(await whatsappConnexion.demarrerConnexion({ numero: req.body?.numero }));
});

export const deconnecter = asyncHandler(async (req, res) => {
  res.json(await whatsappConnexion.deconnecter());
});

export const envoyerTest = asyncHandler(async (req, res) => {
  await whatsappConnexion.envoyerTest(req.body?.numero);
  res.json({ message: "Message de test envoyé." });
});
