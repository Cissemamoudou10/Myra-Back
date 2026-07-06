// ============================================================
//  Avis client — soumis via le site après réception du lien.
//  Modéré par l'admin avant publication.
// ============================================================
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const STATUTS_AVIS = {
  EN_ATTENTE: "en_attente",
  PUBLIE: "publie",
  REJETE: "rejete",
};

const Avis = sequelize.define(
  "Avis",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    note: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    texte: { type: DataTypes.TEXT, allowNull: false },
    statut: {
      type: DataTypes.ENUM(...Object.values(STATUTS_AVIS)),
      allowNull: false,
      defaultValue: STATUTS_AVIS.EN_ATTENTE,
    },
    // Lien optionnel vers la commande concernée
    commande_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "avis" }
);

export default Avis;
