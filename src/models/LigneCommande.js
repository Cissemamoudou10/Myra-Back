// ============================================================
//  Ligne de commande — relie une commande à un produit
//  Le prix unitaire est FIGÉ au moment de l'achat, pour que
//  l'historique reste juste même si le prix du produit change.
// ============================================================
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LigneCommande = sequelize.define(
  "LigneCommande",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    commande_id: { type: DataTypes.INTEGER, allowNull: false },
    produit_id: { type: DataTypes.INTEGER, allowNull: true },
    kit_id: { type: DataTypes.INTEGER, allowNull: true },
    // Nom du produit conservé tel quel (au cas où le produit serait supprimé)
    nom_produit: { type: DataTypes.STRING, allowNull: false },
    quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    prix_unitaire: { type: DataTypes.INTEGER, allowNull: false },
    // Type: 'produit' ou 'kit' (pour l'auto-description)
    type: { type: DataTypes.STRING, allowNull: true },
    // Composition figée (si c'est un kit)
    composition_figee: { type: DataTypes.JSONB, allowNull: true },
  },
  { tableName: "lignes_commande" }
);

export default LigneCommande;
