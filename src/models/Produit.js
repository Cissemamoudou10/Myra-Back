// ============================================================
//  Produit — entité centrale du catalogue
//  Appartient à une catégorie et une marque (clés étrangères).
//  Relations plusieurs-à-plusieurs (actifs, problèmes, types de
//  peau) déclarées dans models/index.js.
// ============================================================
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Produit = sequelize.define(
  "Produit",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    // Prix en FCFA, entier (pas de centimes en franc CFA)
    prix: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    photo: { type: DataTypes.STRING, allowNull: true }, // chemin du fichier
    // Produit visible en ligne ou masqué
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    categorie_id: { type: DataTypes.INTEGER, allowNull: true },
    marque_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "produits" }
);

export default Produit;
