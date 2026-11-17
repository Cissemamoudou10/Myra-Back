// ============================================================
//  Rassemblement des modèles et déclaration des associations
//  C'est ici que se définissent toutes les relations entre tables.
// ============================================================
import sequelize from "../config/database.js";

import Produit from "./Produit.js";
import Categorie from "./Categorie.js";
import Marque from "./Marque.js";
import PrincipeActif from "./PrincipeActif.js";
import Probleme from "./Probleme.js";
import TypePeau from "./TypePeau.js";
import Commande, { STATUTS } from "./Commande.js";
import LigneCommande from "./LigneCommande.js";
import Avis, { STATUTS_AVIS } from "./Avis.js";
import User, { ROLES } from "./User.js";
import Article from "./Article.js";
import Tag from "./Tag.js";
import Kit from "./Kit.js";
import KitProduit from "./KitProduit.js";
import Parametre from "./Parametre.js";

// ---- Relations un-à-plusieurs ----

// Une catégorie a plusieurs produits ; un produit a une catégorie
Categorie.hasMany(Produit, { foreignKey: "categorie_id", as: "produits" });
Produit.belongsTo(Categorie, { foreignKey: "categorie_id", as: "categorie" });

// Une marque a plusieurs produits ; un produit a une marque
Marque.hasMany(Produit, { foreignKey: "marque_id", as: "produits" });
Produit.belongsTo(Marque, { foreignKey: "marque_id", as: "marque" });

// ---- Relations plusieurs-à-plusieurs (via tables de jonction) ----

// Produit <-> PrincipeActif
Produit.belongsToMany(PrincipeActif, {
  through: "produit_actif",
  foreignKey: "produit_id",
  otherKey: "actif_id",
  as: "principes_actifs",
});
PrincipeActif.belongsToMany(Produit, {
  through: "produit_actif",
  foreignKey: "actif_id",
  otherKey: "produit_id",
  as: "produits",
});

// Produit <-> Probleme
Produit.belongsToMany(Probleme, {
  through: "produit_probleme",
  foreignKey: "produit_id",
  otherKey: "probleme_id",
  as: "problemes",
});
Probleme.belongsToMany(Produit, {
  through: "produit_probleme",
  foreignKey: "probleme_id",
  otherKey: "produit_id",
  as: "produits",
});

// Produit <-> TypePeau
Produit.belongsToMany(TypePeau, {
  through: "produit_typepeau",
  foreignKey: "produit_id",
  otherKey: "typepeau_id",
  as: "types_peau",
});
TypePeau.belongsToMany(Produit, {
  through: "produit_typepeau",
  foreignKey: "typepeau_id",
  otherKey: "produit_id",
  as: "produits",
});

// Produit <-> Tag
Produit.belongsToMany(Tag, {
  through: "produit_tag",
  foreignKey: "produit_id",
  otherKey: "tag_id",
  as: "tags",
});
Tag.belongsToMany(Produit, {
  through: "produit_tag",
  foreignKey: "tag_id",
  otherKey: "produit_id",
  as: "produits",
});

// Produit <-> Kit (via KitProduit explicite pour la quantité)
Kit.belongsToMany(Produit, {
  through: KitProduit,
  foreignKey: "kit_id",
  otherKey: "produit_id",
  as: "produits",
});
Produit.belongsToMany(Kit, {
  through: KitProduit,
  foreignKey: "produit_id",
  otherKey: "kit_id",
  as: "kits",
});

// ---- Commandes ----

// Une commande contient plusieurs lignes
Commande.hasMany(LigneCommande, {
  foreignKey: "commande_id",
  as: "lignes",
  onDelete: "CASCADE",
});
LigneCommande.belongsTo(Commande, { foreignKey: "commande_id", as: "commande" });

// Une ligne référence un produit
Produit.hasMany(LigneCommande, { foreignKey: "produit_id", as: "lignes" });
LigneCommande.belongsTo(Produit, { foreignKey: "produit_id", as: "produit" });

// Une ligne peut aussi référencer un kit
Kit.hasMany(LigneCommande, { foreignKey: "kit_id", as: "lignes" });
LigneCommande.belongsTo(Kit, { foreignKey: "kit_id", as: "kit" });

// Un avis peut être lié à une commande
Commande.hasOne(Avis, { foreignKey: "commande_id", as: "avis" });
Avis.belongsTo(Commande, { foreignKey: "commande_id", as: "commande" });

// ---- Export centralisé ----

const db = {
  sequelize,
  Produit,
  Categorie,
  Marque,
  PrincipeActif,
  Probleme,
  TypePeau,
  Commande,
  LigneCommande,
  Avis,
  User,
  Article,
  Tag,
  Kit,
  KitProduit,
  Parametre,
  // Constantes utiles
  STATUTS,
  STATUTS_AVIS,
  ROLES,
};

export default db;
