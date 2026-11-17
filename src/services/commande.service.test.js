// ============================================================
//  Tests d'intégration du service Commande (stock, numérotation,
//  concurrence, expiration). Nécessitent une base PostgreSQL
//  DÉDIÉE aux tests, entièrement réinitialisée à chaque lancement.
//
//  Lancement :
//    TEST_DB_NAME=myra_test DB_HOST=... DB_USER=... DB_PASSWORD=... npm test
//  Sans TEST_DB_NAME, ces tests sont ignorés.
// ============================================================
import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

const TEST_DB = process.env.TEST_DB_NAME;
// Garde-fou : le schéma est recréé (force: true), jamais sur une vraie base.
const actif = Boolean(TEST_DB && TEST_DB.endsWith("_test"));

describe("Service Commande (intégration)", { skip: !actif && "TEST_DB_NAME (se terminant par _test) non défini" }, () => {
  let db, service, expirerCommandes;

  before(async () => {
    process.env.DB_NAME = TEST_DB;
    process.env.WHATSAPP_API_URL = ""; // aucun message réel pendant les tests
    process.env.LOG_LEVEL = "silent";
    db = (await import("../models/index.js")).default;
    service = (await import("./commande.service.js")).default;
    ({ expirerCommandes } = await import("../jobs/expirationCommandes.js"));
  });

  after(async () => {
    await db?.sequelize.close();
  });

  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  const creerProduit = (champs) =>
    db.Produit.create({ nom: champs.slug, prix: 1000, stock: 10, ...champs });

  const client = { prenom: "Awa", nom: "Diarra", whatsapp: "70000000", quartier: "Hamdallaye" };

  const stockDe = async (id) => (await db.Produit.findByPk(id)).stock;

  test("fige le prix réel et décrémente le stock", async () => {
    const p = await creerProduit({ slug: "serum", prix: 7500, stock: 5 });
    const { commande } = await service.creerCommande({
      ...client,
      articles: [{ produit_id: p.id, quantite: 2, prix_unitaire: 1 }],
    });
    assert.equal(commande.total, 15000);
    assert.equal(await stockDe(p.id), 3);
  });

  test("commandes simultanées : jamais plus vendu que le stock, numéros uniques", async () => {
    const p = await creerProduit({ slug: "creme", stock: 2 });
    const resultats = await Promise.allSettled(
      Array.from({ length: 6 }, () =>
        service.creerCommande({ ...client, articles: [{ produit_id: p.id, quantite: 1 }] })
      )
    );
    const reussies = resultats.filter((r) => r.status === "fulfilled");
    assert.equal(reussies.length, 2);
    assert.equal(await stockDe(p.id), 0);
    const numeros = new Set(reussies.map((r) => r.value.commande.numero));
    assert.equal(numeros.size, 2);
  });

  test("le job d'expiration restitue le stock (produit et kit)", async () => {
    const a = await creerProduit({ slug: "toner", stock: 10 });
    const b = await creerProduit({ slug: "masque", stock: 10 });
    const kit = await db.Kit.create({ nom: "Routine", slug: "routine" });
    await db.KitProduit.bulkCreate([
      { kit_id: kit.id, produit_id: a.id, quantite: 1 },
      { kit_id: kit.id, produit_id: b.id, quantite: 2 },
    ]);

    const { commande } = await service.creerCommande({
      ...client,
      articles: [{ kit_id: kit.id, quantite: 2 }, { produit_id: a.id, quantite: 1 }],
    });
    assert.equal(await stockDe(a.id), 7);
    assert.equal(await stockDe(b.id), 6);

    await commande.update({ expire_le: new Date(Date.now() - 1000) });
    assert.equal(await expirerCommandes(), 1);

    assert.equal((await db.Commande.findByPk(commande.id)).statut, db.STATUTS.EXPIREE);
    assert.equal(await stockDe(a.id), 10);
    assert.equal(await stockDe(b.id), 10);
  });

  test("deux annulations simultanées ne restituent le stock qu'une fois", async () => {
    const p = await creerProduit({ slug: "spf", stock: 5 });
    const { commande } = await service.creerCommande({
      ...client,
      articles: [{ produit_id: p.id, quantite: 3 }],
    });

    const resultats = await Promise.allSettled([
      service.annulerCommande(commande.id),
      service.annulerCommande(commande.id),
    ]);
    assert.equal(resultats.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(await stockDe(p.id), 5);
  });

  test("paramètres de paiement : enregistrés, vidés, et rejetés s'ils ne sont pas numériques", async () => {
    const parametres = (await import("./parametre.service.js")).default;
    let param = await parametres.modifierParametres({ orange_money_numero: " 76 61 29 34 ", sarali_numero: "7647" });
    assert.equal(param.orange_money_numero, "76 61 29 34");
    assert.equal(param.sarali_numero, "7647");

    param = await parametres.modifierParametres({ sarali_numero: "" });
    assert.equal(param.sarali_numero, null);
    assert.equal(param.orange_money_numero, "76 61 29 34"); // champ absent : inchangé

    await assert.rejects(parametres.modifierParametres({ sarali_numero: "abc" }), { code: "VALIDATION_ERROR" });
  });

  test("la vente boutique calcule le total côté serveur", async () => {
    const p = await creerProduit({ slug: "nettoyant", prix: 4000, stock: 3 });
    const { commande } = await service.creerVenteBoutique({
      articles: [{ produit_id: p.id, quantite: 2 }],
    });
    assert.equal(commande.total, 8000);
    assert.equal(commande.statut, db.STATUTS.LIVREE);
    assert.equal(await stockDe(p.id), 1);
  });
});
