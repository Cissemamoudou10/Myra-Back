// ============================================================
//  Contrôleur Commande — création (public) + gestion (admin)
// ============================================================
import commandeService from "../services/commande.service.js";
import { listerTousAvis } from "../services/avis.service.js";
import db from "../models/index.js";
import { getPagination, buildPage } from "../utils/pagination.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const { Commande, LigneCommande } = db;

// ---- Public : créer une commande ----
export const creer = asyncHandler(async (req, res) => {
  const { commande, lignes } = await commandeService.creerCommande(req.body);
  res.status(201).json({
    message: "Commande créée. Consultez WhatsApp pour le paiement.",
    numero: commande.numero,
    total: commande.total,
    commande,
    lignes,
  });
});

// ---- Admin : lister les commandes (filtre par statut) ----
export const lister = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.statut) where.statut = req.query.statut;

  const result = await Commande.findAndCountAll({
    where,
    include: [{ model: LigneCommande, as: "lignes" }],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
  res.json(buildPage(result, page, limit));
});

// ---- Admin : détail d'une commande ----
export const getParId = asyncHandler(async (req, res) => {
  const commande = await commandeService.getCommande(req.params.id);
  res.json(commande);
});

// ---- Admin : transitions de statut ----
export const validerPaiement = asyncHandler(async (req, res) => {
  const c = await commandeService.validerPaiement(req.params.id);
  res.json({ message: "Paiement validé, confirmation envoyée.", commande: c });
});

export const mettreEnLivraison = asyncHandler(async (req, res) => {
  const c = await commandeService.mettreEnLivraison(req.params.id);
  res.json({ message: "Commande en livraison.", commande: c });
});

export const marquerLivree = asyncHandler(async (req, res) => {
  const c = await commandeService.marquerLivree(req.params.id);
  res.json({ message: "Commande livrée.", commande: c });
});

export const annuler = asyncHandler(async (req, res) => {
  const c = await commandeService.annulerCommande(req.params.id);
  res.json({ message: "Commande annulée.", commande: c });
});

export const signalerPaiement = asyncHandler(async (req, res) => {
  const c = await commandeService.signalerPaiement(req.params.id);
  res.json({ message: "Paiement signalé.", commande: c });
});
