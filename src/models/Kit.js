import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Kit = sequelize.define(
  "Kit",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    photo: { type: DataTypes.STRING, allowNull: true },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    reduction_pourcentage: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    },
    promo_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    promo_debut: { type: DataTypes.DATE, allowNull: true },
    promo_fin: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "kits" }
);

export default Kit;
