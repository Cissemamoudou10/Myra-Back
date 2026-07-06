// ============================================================
//  Contrôleur Produit — public + admin
// ============================================================
import produitService from "../services/produit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Construit l'URL publique d'une photo à partir de son chemin stocké
function withPhotoUrl(req, produit) {
  return produit; // le chemin est déjà relatif ; le front préfixe avec BACKEND_URL
}

// ---- Public ----
export const lister = asyncHandler(async (req, res) => {
  const result = await produitService.listerProduits(req.query);
  res.json(result);
});

export const getParSlug = asyncHandler(async (req, res) => {
  const produit = await produitService.getProduitParSlug(req.params.slug);
  res.json(produit);
});

// ---- Admin ----
export const listerAdmin = asyncHandler(async (req, res) => {
  const result = await produitService.listerProduits(req.query, {
    inclureInactifs: true,
  });
  res.json(result);
});

export const creer = asyncHandler(async (req, res) => {
  const data = parseBody(req);
  const produit = await produitService.creerProduit(data);
  res.status(201).json(produit);
});

export const modifier = asyncHandler(async (req, res) => {
  const data = parseBody(req);
  const produit = await produitService.modifierProduit(req.params.id, data);
  res.json(produit);
});

export const supprimer = asyncHandler(async (req, res) => {
  await produitService.supprimerProduit(req.params.id);
  res.json({ message: "Produit supprimé." });
});

// Normalise le corps : ajoute le chemin photo si un fichier est uploadé,
// et parse les tableaux d'ids (envoyés en JSON ou en champs répétés).
function parseBody(req) {
  const data = { ...req.body };

  if (req.file) {
    data.photo = `/uploads/${req.file.filename}`;
  }

  // Les relations m2m peuvent arriver en chaîne JSON via FormData
  for (const champ of ["principes_actifs", "problemes", "types_peau", "tags"]) {
    if (typeof data[champ] === "string") {
      try {
        data[champ] = JSON.parse(data[champ]);
      } catch {
        data[champ] = data[champ].split(",").map((x) => x.trim()).filter(Boolean);
      }
    }
  }

  // Conversions de types
  if (data.prix) data.prix = parseInt(data.prix, 10);
  if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
  if (data.categorie_id) data.categorie_id = parseInt(data.categorie_id, 10);
  if (data.marque_id) data.marque_id = parseInt(data.marque_id, 10);
  if (data.actif !== undefined) data.actif = data.actif === "true" || data.actif === true;

  return data;
}
