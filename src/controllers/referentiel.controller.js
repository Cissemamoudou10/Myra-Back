// ============================================================
//  Contrôleur Référentiel — factorisé
//  Génère les handlers CRUD pour chaque référentiel à partir de
//  son service. Évite de dupliquer 5 contrôleurs identiques.
// ============================================================
import { asyncHandler } from "../utils/asyncHandler.js";

export function creerControleurReferentiel(service) {
  return {
    lister: asyncHandler(async (req, res) => {
      res.json(await service.lister(req.query));
    }),
    getParId: asyncHandler(async (req, res) => {
      res.json(await service.getParId(req.params.id));
    }),
    creer: asyncHandler(async (req, res) => {
      const item = await service.creer(req.body);
      res.status(201).json(item);
    }),
    modifier: asyncHandler(async (req, res) => {
      const item = await service.modifier(req.params.id, req.body);
      res.json(item);
    }),
    supprimer: asyncHandler(async (req, res) => {
      await service.supprimer(req.params.id);
      res.json({ message: "Élément supprimé." });
    }),
  };
}
