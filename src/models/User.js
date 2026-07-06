// ============================================================
//  User (admin) — isolé, pour le futur multi-utilisateur.
//  Au démarrage, l'authentification lit les identifiants depuis
//  l'.env ; cette table existe dès maintenant pour basculer vers
//  une vraie gestion d'utilisateurs sans migration lourde.
// ============================================================
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const ROLES = {
  ADMIN: "admin",
  VENDEUR: "vendeur",
};

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    // Mot de passe haché (bcrypt) — jamais en clair
    mot_de_passe: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.ADMIN,
    },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: "users" }
);

export default User;
