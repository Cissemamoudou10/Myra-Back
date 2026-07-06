// ============================================================
//  Helpers de pagination
//  Construit les paramètres pour Sequelize et la réponse
//  standardisée { data, meta }.
// ============================================================

// Lit page et limit depuis la query, avec valeurs par défaut sûres
export function getPagination(query, { defaultLimit = 12, maxLimit = 100 } = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Construit la réponse paginée à partir du résultat de findAndCountAll
export function buildPage({ count, rows }, page, limit) {
  return {
    data: rows,
    meta: {
      page,
      limit,
      total: count,
      pages: Math.max(1, Math.ceil(count / limit)),
    },
  };
}
