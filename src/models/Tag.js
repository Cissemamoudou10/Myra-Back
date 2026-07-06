import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Tag = sequelize.define(
  "Tag",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    image_url: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "tags" }
);

export default Tag;
