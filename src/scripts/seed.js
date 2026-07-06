// ============================================================
//  Script de seed — pré-remplit la base avec des données d'exemple
//  Usage : npm run db:seed
//  ⚠️  Réinitialise les tables (force: true) puis insère les données.
// ============================================================
import db from "../models/index.js";
import { testConnection } from "../config/database.js";
import { makeSlug } from "../utils/helpers.js";

const {
  sequelize,
  Categorie,
  Marque,
  PrincipeActif,
  Probleme,
  TypePeau,
  Produit,
} = db;

async function seed() {
  try {
    await testConnection();
    console.log("⏳ Réinitialisation des tables…");
    await sequelize.sync({ force: true });

    // --- Référentiels ---
    const categories = await Categorie.bulkCreate(
      ["Nettoyant", "Sérum", "Crème", "Masque", "Toner", "Protection solaire"].map(
        (nom) => ({ nom, slug: makeSlug(nom) })
      )
    );

    const marques = await Marque.bulkCreate(
      ["Myra", "Hanbit", "Seoul Dew", "Pure Seoul", "Goyo"].map((nom) => ({
        nom,
        slug: makeSlug(nom),
        description: `Marque ${nom} — soins coréens sélectionnés par Myra.`,
      }))
    );

    const actifs = await PrincipeActif.bulkCreate(
      ["Centella", "Acide hyaluronique", "Niacinamide", "Ginseng", "Mucine d'escargot", "Thé vert"].map(
        (nom) => ({ nom })
      )
    );

    const problemes = await Probleme.bulkCreate(
      ["Déshydratation", "Teint terne", "Imperfections", "Rides", "Rougeurs", "Pores dilatés"].map(
        (nom) => ({ nom })
      )
    );

    const typesPeau = await TypePeau.bulkCreate(
      ["Sèche", "Grasse", "Mixte", "Sensible", "Normale", "Tous types"].map((nom) => ({
        nom,
      }))
    );

    // --- Produits ---
    const produitsData = [
      {
        nom: "Sérum Centella Apaisant",
        description: "Sérum concentré aux actifs coréens pour une peau apaisée et lumineuse.",
        prix: 29000,
        categorie: "Sérum",
        marque: "Myra",
        actifs: ["Centella", "Niacinamide"],
        problemes: ["Rougeurs", "Imperfections"],
        peaux: ["Sensible", "Mixte"],
      },
      {
        nom: "Crème Riz Fermenté",
        description: "Texture fondante nourrissante, éclat et confort immédiat.",
        prix: 24000,
        categorie: "Crème",
        marque: "Hanbit",
        actifs: ["Niacinamide"],
        problemes: ["Teint terne", "Déshydratation"],
        peaux: ["Sèche", "Normale"],
      },
      {
        nom: "Essence Ginseng",
        description: "Essence revitalisante, fermeté et lumière jour après jour.",
        prix: 25500,
        categorie: "Toner",
        marque: "Seoul Dew",
        actifs: ["Ginseng"],
        problemes: ["Rides", "Teint terne"],
        peaux: ["Tous types"],
      },
      {
        nom: "Crème Mucine d'Escargot",
        description: "Réparation intense, peau rebondie et lissée.",
        prix: 14500,
        categorie: "Crème",
        marque: "Pure Seoul",
        actifs: ["Mucine d'escargot", "Acide hyaluronique"],
        problemes: ["Déshydratation", "Rides"],
        peaux: ["Sèche", "Sensible"],
      },
      {
        nom: "Toner Acide Hyaluronique",
        description: "Lotion hydratante repulpante, fraîcheur instantanée.",
        prix: 21000,
        categorie: "Toner",
        marque: "Goyo",
        actifs: ["Acide hyaluronique"],
        problemes: ["Déshydratation"],
        peaux: ["Tous types"],
      },
      {
        nom: "Masque Thé Vert Purifiant",
        description: "Masque purifiant à l'argile et thé vert, pores resserrés.",
        prix: 18500,
        categorie: "Masque",
        marque: "Myra",
        actifs: ["Thé vert"],
        problemes: ["Imperfections", "Pores dilatés"],
        peaux: ["Grasse", "Mixte"],
      },
    ];

    const findId = (list, nom) => list.find((x) => x.nom === nom)?.id;

    for (const p of produitsData) {
      const produit = await Produit.create({
        nom: p.nom,
        slug: makeSlug(p.nom),
        description: p.description,
        prix: p.prix,
        actif: true,
        categorie_id: findId(categories, p.categorie),
        marque_id: findId(marques, p.marque),
      });
      await produit.setPrincipes_actifs(p.actifs.map((n) => findId(actifs, n)));
      await produit.setProblemes(p.problemes.map((n) => findId(problemes, n)));
      await produit.setTypes_peau(p.peaux.map((n) => findId(typesPeau, n)));
    }

    console.log("✓ Données d'exemple insérées :");
    console.log(`  - ${categories.length} catégories`);
    console.log(`  - ${marques.length} marques`);
    console.log(`  - ${actifs.length} principes actifs`);
    console.log(`  - ${problemes.length} problèmes`);
    console.log(`  - ${typesPeau.length} types de peau`);
    console.log(`  - ${produitsData.length} produits`);
    process.exit(0);
  } catch (error) {
    console.error("✗ Échec du seed :", error.message);
    process.exit(1);
  }
}

seed();
