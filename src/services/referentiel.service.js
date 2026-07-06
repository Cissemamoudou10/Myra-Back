// ============================================================
//  Service Référentiel — factorise le CRUD + recherche paginée
//  pour les tables simples : Catégorie, Marque, PrincipeActif,
//  Probleme, TypePeau. On évite de dupliquer le même code 5 fois.
// ============================================================
import { Op } from "sequelize";
import { getPagination, buildPage } from "../utils/pagination.js";
import { makeSlug } from "../utils/helpers.js";
import AppError from "../utils/AppError.js";

// Crée un service CRUD pour un modèle donné.
// options.hasSlug : la table possède une colonne slug (Marque, Catégorie)
export function creerServiceReferentiel(Model, { hasSlug = false } = {}) {
  return {
    async lister(query) {
      const { page, limit, offset } = getPagination(query, { defaultLimit: 50 });
      const where = {};
      if (query.q) where.nom = { [Op.iLike]: `%${query.q}%` };

      const order =
        (query.order || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

      const result = await Model.findAndCountAll({
        where,
        order: [["nom", order]],
        limit,
        offset,
      });
      return buildPage(result, page, limit);
    },

    async getParId(id) {
      const item = await Model.findByPk(id);
      if (!item) {
        throw new AppError("Élément introuvable.", 404, "ITEM_NOT_FOUND");
      }
      return item;
    },

    async creer(data) {
      const payload = { ...data };
      if (hasSlug && data.nom) payload.slug = makeSlug(data.nom);
      return Model.create(payload);
    },

    async modifier(id, data) {
      const item = await this.getParId(id);
      const payload = { ...data };
      if (hasSlug && data.nom) payload.slug = makeSlug(data.nom);
      await item.update(payload);
      return item;
    },

    async supprimer(id) {
      const item = await this.getParId(id);
      await item.destroy();
      return true;
    },
  };
}
