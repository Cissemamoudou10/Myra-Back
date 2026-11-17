// Catégorie (type de produit) : Nettoyant, Sérum, Crème, Masque…
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Categorie = sequelize.define(
  "Categorie",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    image_url: { type: DataTypes.STRING, allowNull: true },
    // Catégorie parente (rubrique) — null = rubrique de premier niveau.
    // Une catégorie qui a déjà un parent ne peut pas en avoir une elle-même
    // (hiérarchie à 2 niveaux, imposée côté admin) : rubrique > sous-rubrique.
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    // Ordre d'affichage dans le menu public (croissant)
    ordre: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    // Permet de masquer une catégorie du menu public sans la supprimer
    affiche_menu: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: "categories" }
);

export default Categorie;
