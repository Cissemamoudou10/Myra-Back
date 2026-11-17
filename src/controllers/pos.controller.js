import commandeService from "../services/commande.service.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Convertit un article de la caisse ({ type, id, quantite }) au format
// commun du service commande ({ produit_id | kit_id, quantite }).
// Le prix et le total envoyés par le navigateur sont volontairement
// ignorés : ils sont recalculés côté serveur à partir de la base.
function versArticle(item) {
  if (item.type === "produit") return { produit_id: item.id, quantite: item.quantite };
  if (item.type === "kit") return { kit_id: item.id, quantite: item.quantite };
  throw new AppError(`Type d'article inconnu: ${item.type}`, 400, "INVALID_ITEM");
}

// ============================================================
// Création d'une vente en boutique (POS)
// ============================================================
export const creerVentePOS = asyncHandler(async (req, res) => {
  const { items, client } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Le panier est vide.", 400, "EMPTY_CART");
  }

  const { commande } = await commandeService.creerVenteBoutique({
    articles: items.map(versArticle),
    client: client || {},
  });

  res.status(201).json({
    erreur: false,
    message: "Vente encaissée avec succès.",
    data: commande,
  });
});
