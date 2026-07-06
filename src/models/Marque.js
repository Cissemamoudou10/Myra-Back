// Marque : un produit appartient à une seule marque.
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Marque = sequelize.define(
  "Marque",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    logo: { type: DataTypes.STRING, allowNull: true }, // chemin du fichier
    image_url: { type: DataTypes.STRING, allowNull: true }, // url externe (unsplash, etc.)
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: "marques" }
);

export default Marque;
