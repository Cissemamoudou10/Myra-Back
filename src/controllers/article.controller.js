import { asyncHandler } from "../utils/asyncHandler.js";
import { articleService } from "../services/article.service.js";

export const lister = asyncHandler(async (req, res) => {
  res.json(await articleService.lister(req.query));
});

export const getParId = asyncHandler(async (req, res) => {
  res.json(await articleService.getParId(req.params.id));
});

export const getParSlug = asyncHandler(async (req, res) => {
  res.json(await articleService.getParSlug(req.params.slug));
});

export const creer = asyncHandler(async (req, res) => {
  const item = await articleService.creer(req.body);
  res.status(201).json(item);
});

export const modifier = asyncHandler(async (req, res) => {
  const item = await articleService.modifier(req.params.id, req.body);
  res.json(item);
});

export const supprimer = asyncHandler(async (req, res) => {
  await articleService.supprimer(req.params.id);
  res.json({ message: "Article supprimé." });
});
