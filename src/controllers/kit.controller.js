import kitService from "../services/kit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ---- Public ----
export const lister = asyncHandler(async (req, res) => {
  const result = await kitService.listerKits(req.query);
  res.json(result);
});

export const getParSlug = asyncHandler(async (req, res) => {
  const kit = await kitService.getKitParSlug(req.params.slug);
  res.json(kit);
});

// ---- Admin ----
export const listerAdmin = asyncHandler(async (req, res) => {
  const result = await kitService.listerKits(req.query, { inclureInactifs: true });
  res.json(result);
});

export const creer = asyncHandler(async (req, res) => {
  const data = parseBody(req);
  const kit = await kitService.creerKit(data);
  res.status(201).json(kit);
});

export const modifier = asyncHandler(async (req, res) => {
  const data = parseBody(req);
  const kit = await kitService.modifierKit(req.params.id, data);
  res.json(kit);
});

export const supprimer = asyncHandler(async (req, res) => {
  await kitService.supprimerKit(req.params.id);
  res.json({ message: "Kit supprimé." });
});

function parseBody(req) {
  const data = { ...req.body };

  if (req.file) {
    data.photo = `/uploads/${req.file.filename}`;
  }

  if (typeof data.produits === "string") {
    try {
      data.produits = JSON.parse(data.produits);
    } catch {
      data.produits = [];
    }
  }

  if (data.reduction_pourcentage !== undefined) {
    data.reduction_pourcentage = parseInt(data.reduction_pourcentage, 10);
  }
  
  if (data.actif !== undefined) data.actif = data.actif === "true" || data.actif === true;
  if (data.promo_active !== undefined) data.promo_active = data.promo_active === "true" || data.promo_active === true;
  
  if (!data.promo_debut) data.promo_debut = null;
  if (!data.promo_fin) data.promo_fin = null;

  return data;
}
