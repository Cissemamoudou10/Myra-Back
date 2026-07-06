import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KitProduit = sequelize.define(
  "KitProduit",
  {
    kit_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'kits', key: 'id' } },
    produit_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'produits', key: 'id' } },
    quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } }
  },
  { tableName: "kit_produit" }
);

export default KitProduit;
