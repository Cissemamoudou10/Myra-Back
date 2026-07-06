import { Op } from "sequelize";
import db from "../models/index.js";
import { getPagination, buildPage } from "../utils/pagination.js";
import { makeSlug } from "../utils/helpers.js";
import AppError from "../utils/AppError.js";

const { Article } = db;

export const articleService = {
  async lister(query) {
    const { page, limit, offset } = getPagination(query, { defaultLimit: 50 });
    const where = {};
    if (query.q) where.titre = { [Op.iLike]: `%${query.q}%` };
    if (query.type) where.type = query.type;
    if (query.publie !== undefined) where.publie = query.publie === "true";

    const order = (query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

    const result = await Article.findAndCountAll({
      where,
      order: [["createdAt", order]],
      limit,
      offset,
    });
    return buildPage(result, page, limit);
  },

  async getParId(id) {
    const item = await Article.findByPk(id);
    if (!item) {
      throw new AppError("Article introuvable.", 404, "ARTICLE_NOT_FOUND");
    }
    return item;
  },
  
  async getParSlug(slug) {
    const item = await Article.findOne({ where: { slug } });
    if (!item) {
      throw new AppError("Article introuvable.", 404, "ARTICLE_NOT_FOUND");
    }
    return item;
  },

  async creer(data) {
    const payload = { ...data };
    if (data.titre) payload.slug = makeSlug(data.titre);
    return Article.create(payload);
  },

  async modifier(id, data) {
    const item = await this.getParId(id);
    const payload = { ...data };
    if (data.titre) payload.slug = makeSlug(data.titre);
    await item.update(payload);
    return item;
  },

  async supprimer(id) {
    const item = await this.getParId(id);
    await item.destroy();
    return true;
  },
};
