// ============================================================
//  Recherche textuelle insensible à la casse et aux accents
//  (« serum » trouve « Sérum », « creme » trouve « Crème »).
//  Sans extension PostgreSQL : translate() + lower() des deux côtés.
//  Plusieurs mots = tous doivent être trouvés (ET), chacun dans
//  n'importe lequel des champs (OU).
// ============================================================
import { Op } from "sequelize";
import sequelize from "../config/database.js";

const AVEC_ACCENTS = "àáâäãåèéêëìíîïòóôöõùúûüýÿçñ";
const SANS_ACCENTS = "aaaaaaeeeeiiiiooooouuuuyycn";
if (AVEC_ACCENTS.length !== SANS_ACCENTS.length) {
  throw new Error("recherche.js : tables d'accents de longueurs différentes");
}

// Expression SQL d'une colonne normalisée (minuscules, sans accents)
export const sansAccent = (colonneSql) =>
  `translate(lower(${colonneSql}), '${AVEC_ACCENTS}', '${SANS_ACCENTS}')`;

// Termes saisis -> mots normalisés (les caractères spéciaux de LIKE sont retirés)
export function motsRecherche(q) {
  return String(q || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[%_\\]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
}

const motif = (mot) => sequelize.escape(`%${mot}%`);

// Condition « chaque mot apparaît dans au moins une des colonnes SQL données »
export function conditionMots(mots, colonnesSql) {
  return {
    [Op.and]: mots.map((mot) =>
      sequelize.literal(`(${colonnesSql.map((c) => `${sansAccent(c)} LIKE ${motif(mot)}`).join(" OR ")})`)
    ),
  };
}

// Produits : nom, description, marque et principes actifs
export function conditionProduits(mots) {
  return {
    [Op.and]: mots.map((mot) => {
      const m = motif(mot);
      return sequelize.literal(`(
        ${sansAccent('"Produit"."nom"')} LIKE ${m}
        OR ${sansAccent('"Produit"."description"')} LIKE ${m}
        OR "Produit"."marque_id" IN (SELECT id FROM marques WHERE ${sansAccent("nom")} LIKE ${m})
        OR "Produit"."id" IN (
          SELECT pa.produit_id FROM produit_actif pa
          JOIN principes_actifs a ON a.id = pa.actif_id
          WHERE ${sansAccent("a.nom")} LIKE ${m}
        )
      )`);
    }),
  };
}
