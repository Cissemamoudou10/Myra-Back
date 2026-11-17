// ============================================================
//  Routes admin — protégées par JWT (sauf le login)
// ============================================================
import { Router } from "express";
import * as produit from "../controllers/produit.controller.js";
import * as commande from "../controllers/commande.controller.js";
import * as divers from "../controllers/divers.controller.js";
import { referentiels } from "../config/referentiels.js";
import { requireAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import { limiteLogin } from "../middlewares/rateLimit.js";
import * as dashboard from "../controllers/dashboard.controller.js";
import * as article from "../controllers/article.controller.js";
import * as kit from "../controllers/kit.controller.js";
import * as pos from "../controllers/pos.controller.js";
import * as whatsapp from "../controllers/whatsapp.controller.js";
import * as parametre from "../controllers/parametre.controller.js";

const router = Router();

// ---- Authentification (public) ----
router.post("/login", limiteLogin, divers.login);

// ---- Tout ce qui suit exige un token valide ----
router.use(requireAuth);

router.get("/me", divers.me);
router.get("/dashboard/stats", dashboard.getStats);
router.get("/statistiques", dashboard.getStatistiquesPeriode);

// Paramètres de la boutique
router.get("/parametres", parametre.getParametres);
router.put("/parametres", parametre.modifierParametres);

// Upload d'image (renvoie le chemin)
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Aucun fichier reçu." });
  res.status(201).json({ path: `/uploads/${req.file.filename}` });
});

// Produits (CRUD complet, avec photo)
router.get("/produits", produit.listerAdmin);
router.post("/produits", upload.single("photo"), produit.creer);
router.put("/produits/:id", upload.single("photo"), produit.modifier);
router.delete("/produits/:id", produit.supprimer);

// Kits
router.get("/kits", kit.listerAdmin);
router.post("/kits", upload.single("photo"), kit.creer);
router.put("/kits/:id", upload.single("photo"), kit.modifier);
router.delete("/kits/:id", kit.supprimer);

// Référentiels (CRUD complet)
for (const [chemin, { ctrl }] of Object.entries(referentiels)) {
  router.get(`/${chemin}`, ctrl.lister);
  router.post(`/${chemin}`, ctrl.creer);
  router.put(`/${chemin}/:id`, ctrl.modifier);
  router.delete(`/${chemin}/:id`, ctrl.supprimer);
}

// Articles (Journal)
router.get("/articles", article.lister);
router.get("/articles/:id", article.getParId);
router.post("/articles", article.creer);
router.put("/articles/:id", article.modifier);
router.delete("/articles/:id", article.supprimer);

// Commandes (liste, détail, transitions)
router.get("/commandes", commande.lister);
router.get("/commandes/:id", commande.getParId);
router.patch("/commandes/:id/signaler", commande.signalerPaiement);
router.patch("/commandes/:id/valider", commande.validerPaiement);
router.patch("/commandes/:id/livraison", commande.mettreEnLivraison);
router.patch("/commandes/:id/livree", commande.marquerLivree);
router.patch("/commandes/:id/annuler", commande.annuler);

// POS (Ventes directes)
router.post("/pos/vente", pos.creerVentePOS);

// WhatsApp (connexion du numéro de la boutique)
router.get("/whatsapp/etat", whatsapp.getEtat);
router.post("/whatsapp/connexion", whatsapp.connecter);
router.post("/whatsapp/deconnexion", whatsapp.deconnecter);
router.post("/whatsapp/test", whatsapp.envoyerTest);

// Avis (modération)
router.get("/avis", divers.listerTousAvis);
router.patch("/avis/:id/publier", divers.publierAvis);
router.patch("/avis/:id/rejeter", divers.rejeterAvis);

export default router;
