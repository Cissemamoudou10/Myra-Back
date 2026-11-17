// ============================================================
//  Contrôleur Paramètres — admin uniquement
// ============================================================
import parametreService from "../services/parametre.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getParametres = asyncHandler(async (req, res) => {
  const param = await parametreService.getParametres();
  res.json(param);
});

export const modifierParametres = asyncHandler(async (req, res) => {
  const param = await parametreService.modifierParametres(req.body);
  res.json(param);
});
