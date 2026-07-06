// Principe actif : centella, acide hyaluronique, niacinamide…
// Relation plusieurs-à-plusieurs avec Produit.
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PrincipeActif = sequelize.define(
  "PrincipeActif",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: "principes_actifs" }
);

export default PrincipeActif;
