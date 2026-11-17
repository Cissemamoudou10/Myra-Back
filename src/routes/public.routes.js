// ============================================================
//  Routes publiques — appelées par le site vitrine (sans auth)
// ============================================================
import { Router } from "express";
import * as produit from "../controllers/produit.controller.js";
import * as commande from "../controllers/commande.controller.js";
import * as divers from "../controllers/divers.controller.js";
import * as article from "../controllers/article.controller.js";
import * as kit from "../controllers/kit.controller.js";
import { referentiels } from "../config/referentiels.js";
import { limiteCommandes, limiteAvis } from "../middlewares/rateLimit.js";

const router = Router();

// Produits
router.get("/produits", produit.lister);
router.get("/produits/:slug", produit.getParSlug);

// Référentiels (lecture seule en public)
for (const [chemin, { ctrl }] of Object.entries(referentiels)) {
  router.get(`/${chemin}`, ctrl.lister);
  router.get(`/${chemin}/:id`, ctrl.getParId);
}

// Commandes
router.post("/commandes", limiteCommandes, commande.creer);

// Avis
router.post("/avis", limiteAvis, divers.soumettreAvis);
router.get("/avis", divers.listerAvisPublies);

// Recherche globale
router.get("/recherche", divers.rechercheGlobale);

// Articles (Journal)
// On va forcer query.publie = "true" dans le contrôleur ou simplement l'ajouter ici
router.get("/articles", (req, res, next) => {
  req.query.publie = "true";
  next();
}, article.lister);
router.get("/articles/:slug", article.getParSlug);

// Kits
router.get("/kits", kit.lister);
router.get("/kits/:slug", kit.getParSlug);

export default router;
