// ============================================================
//  Commande — cœur de la logique métier
//  Statuts du cycle de vie validé :
//   en_attente_paiement → paiement_signale → payee
//                       → en_livraison → livree
//   sorties : annulee (manuel) | expiree (auto après 48 h)
// ============================================================
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Liste centrale des statuts possibles (réutilisée par les services)
export const STATUTS = {
  EN_ATTENTE: "en_attente_paiement",
  SIGNALE: "paiement_signale",
  PAYEE: "payee",
  EN_LIVRAISON: "en_livraison",
  LIVREE: "livree",
  ANNULEE: "annulee",
  EXPIREE: "expiree",
};

const Commande = sequelize.define(
  "Commande",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // Numéro lisible présenté au client (ex. CMD-2026-0042)
    numero: { type: DataTypes.STRING, allowNull: false, unique: true },
    // Identité du client (optionnel pour la boutique)
    prenom: { type: DataTypes.STRING, allowNull: true },
    nom: { type: DataTypes.STRING, allowNull: true },
    whatsapp: { type: DataTypes.STRING, allowNull: true },
    quartier: { type: DataTypes.STRING, allowNull: true },
    // Total figé en FCFA
    total: { type: DataTypes.INTEGER, allowNull: false },
    statut: {
      type: DataTypes.ENUM(...Object.values(STATUTS)),
      allowNull: false,
      defaultValue: STATUTS.EN_ATTENTE,
    },
    // Source de la commande (Web ou Boutique)
    source: {
      type: DataTypes.ENUM("en_ligne", "boutique"),
      allowNull: false,
      defaultValue: "en_ligne"
    },
    // Chemin de la capture de paiement (optionnel, si transmise au système)
    capture_paiement: { type: DataTypes.STRING, allowNull: true },
    // Date au-delà de laquelle une commande impayée expire (création + 48 h) - optionnel
    expire_le: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "commandes" }
);

export default Commande;
