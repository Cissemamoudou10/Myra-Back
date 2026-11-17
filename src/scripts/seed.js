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
    // "Visage" est une rubrique de premier niveau ; les 6 catégories
    // ci-dessous en deviennent les sous-rubriques (menu automatique).
    const visage = await Categorie.create({ nom: "Visage", slug: makeSlug("Visage"), ordre: 1 });
    const categories = await Categorie.bulkCreate(
      ["Nettoyant", "Sérum", "Crème", "Masque", "Toner", "Protection solaire"].map(
        (nom, i) => ({ nom, slug: makeSlug(nom), parent_id: visage.id, ordre: i })
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
        (nom) => ({ nom, slug: makeSlug(nom) })
      )
    );

    // Photos Unsplash de démonstration — à remplacer par de vraies photos
    // depuis l'admin (Caractéristiques > Problèmes > champ Image URL).
    const U = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;
    const problemes = await Probleme.bulkCreate(
      [
        { nom: "Hydratation & confort", image_url: U("1556228720-195a672e8a03") },
        { nom: "Éclat & teint terne", image_url: U("1620916566398-39f1143ab7be") },
        { nom: "Imperfections & pores", image_url: U("1612817288484-6f916006741a") },
        { nom: "Anti-âge", image_url: U("1571781926291-c477ebfd024b") },
        { nom: "Sensibilité & rougeurs", image_url: U("1608248543803-ba4f8c70ae0b") },
        { nom: "Soin du regard", image_url: U("1556228578-8c89e6adf883") },
      ].map((p) => ({ ...p, slug: makeSlug(p.nom) }))
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
        problemes: ["Sensibilité & rougeurs", "Imperfections & pores"],
        peaux: ["Sensible", "Mixte"],
      },
      {
        nom: "Crème Riz Fermenté",
        description: "Texture fondante nourrissante, éclat et confort immédiat.",
        prix: 24000,
        categorie: "Crème",
        marque: "Hanbit",
        actifs: ["Niacinamide"],
        problemes: ["Éclat & teint terne", "Hydratation & confort"],
        peaux: ["Sèche", "Normale"],
      },
      {
        nom: "Essence Ginseng",
        description: "Essence revitalisante, fermeté et lumière jour après jour.",
        prix: 25500,
        categorie: "Toner",
        marque: "Seoul Dew",
        actifs: ["Ginseng"],
        problemes: ["Anti-âge", "Éclat & teint terne"],
        peaux: ["Tous types"],
      },
      {
        nom: "Crème Mucine d'Escargot",
        description: "Réparation intense, peau rebondie et lissée.",
        prix: 14500,
        categorie: "Crème",
        marque: "Pure Seoul",
        actifs: ["Mucine d'escargot", "Acide hyaluronique"],
        problemes: ["Hydratation & confort", "Anti-âge"],
        peaux: ["Sèche", "Sensible"],
      },
      {
        nom: "Toner Acide Hyaluronique",
        description: "Lotion hydratante repulpante, fraîcheur instantanée.",
        prix: 21000,
        categorie: "Toner",
        marque: "Goyo",
        actifs: ["Acide hyaluronique"],
        problemes: ["Hydratation & confort"],
        peaux: ["Tous types"],
      },
      {
        nom: "Masque Thé Vert Purifiant",
        description: "Masque purifiant à l'argile et thé vert, pores resserrés.",
        prix: 18500,
        categorie: "Masque",
        marque: "Myra",
        actifs: ["Thé vert"],
        problemes: ["Imperfections & pores"],
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
    console.log(`  - ${categories.length + 1} catégories`);
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
