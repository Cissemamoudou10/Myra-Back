import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Article = sequelize.define(
  "Article",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { 
      type: DataTypes.ENUM("conseil", "ingredient", "rituel"), 
      allowNull: false 
    },
    contenu: { type: DataTypes.TEXT, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: true },
    publie: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "articles" }
);

export default Article;
