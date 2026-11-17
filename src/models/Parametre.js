// ============================================================
//  Paramètres de la boutique — table à une seule ligne (id=1)
//  Réglages globaux modifiables depuis l'admin (Paramètres).
// ============================================================
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Parametre = sequelize.define(
  "Parametre",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    // Durée (en jours) pendant laquelle un produit reste dans "Nouveautés"
    nouveaute_duree_jours: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    // Numéros de paiement communiqués aux clientes dans le message WhatsApp de commande
    // (null = moyen de paiement non proposé)
    orange_money_numero: { type: DataTypes.STRING(30), allowNull: true },
    sarali_numero: { type: DataTypes.STRING(30), allowNull: true },
  },
  { tableName: "parametres" }
);

export default Parametre;
