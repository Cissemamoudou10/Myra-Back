// ============================================================
//  Contrôleurs : avis, recherche globale, authentification
// ============================================================
import avisService from "../services/avis.service.js";
import rechercheService from "../services/recherche.service.js";
import authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ---- AVIS ----
export const soumettreAvis = asyncHandler(async (req, res) => {
  const avis = await avisService.soumettreAvis(req.body);
  res.status(201).json({
    message: "Merci ! Votre avis sera publié après validation.",
    avis,
  });
});

export const listerAvisPublies = asyncHandler(async (req, res) => {
  res.json(await avisService.listerAvisPublies(req.query));
});

export const listerTousAvis = asyncHandler(async (req, res) => {
  res.json(await avisService.listerTousAvis(req.query));
});

export const publierAvis = asyncHandler(async (req, res) => {
  const a = await avisService.publierAvis(req.params.id);
  res.json({ message: "Avis publié.", avis: a });
});

export const rejeterAvis = asyncHandler(async (req, res) => {
  const a = await avisService.rejeterAvis(req.params.id);
  res.json({ message: "Avis rejeté.", avis: a });
});

// ---- RECHERCHE GLOBALE ----
export const rechercheGlobale = asyncHandler(async (req, res) => {
  const limite = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const resultats = await rechercheService.rechercheGlobale(req.query.q, limite);
  res.json(resultats);
});

// ---- AUTH ----
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
