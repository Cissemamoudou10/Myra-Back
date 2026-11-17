// ============================================================
//  Import du catalogue initial (catalogue/catalogue.js) via l'API admin
//  Passe par l'API (et non par la base) : mêmes validations que
//  l'admin, photos envoyées comme un upload normal.
//  Idempotent : ce qui existe déjà (même nom/titre) est laissé intact.
//
//  Usage (depuis myra_back/) :
//    node src/scripts/importer-catalogue.js --verifier       # contrôle seul, rien n'est écrit
//    MYRA_API=https://…/api MYRA_ADMIN_PASSWORD=… \
//    MYRA_PHOTOS="…/MyraSkinCarePhotos" node src/scripts/importer-catalogue.js
// ============================================================
import fs from "fs";
import path from "path";
import {
  PRIX_PROVISOIRE, STOCK_PROVISOIRE,
  CATEGORIES, PROBLEMES, TYPES_PEAU, TAGS, ACTIFS, MARQUES, PRODUITS, KITS, ARTICLES,
} from "./catalogue/catalogue.js";

const API = (process.env.MYRA_API || "http://localhost:4000/api").replace(/\/+$/, "");
const UTILISATEUR = process.env.MYRA_ADMIN_USERNAME || "admin";
const MOT_DE_PASSE = process.env.MYRA_ADMIN_PASSWORD;
const PHOTOS = process.env.MYRA_PHOTOS || path.resolve("..", "MyraSkinCarePhotos");
const VERIFIER_SEULEMENT = process.argv.includes("--verifier");

const fichierPhoto = (suffixe) => path.join(PHOTOS, `WhatsApp Image 2026-11-07 at 14.18.${suffixe}.jpeg`);

// ---- 1. Cohérence des données (avant toute écriture) ----
function verifier() {
  const erreurs = [];
  const listes = {
    marque: new Set(MARQUES.map((m) => m.nom)),
    categorie: new Set(CATEGORIES),
    actifs: new Set(ACTIFS),
    problemes: new Set(PROBLEMES),
    types_peau: new Set(TYPES_PEAU),
    tags: new Set(TAGS),
  };
  const noms = new Set();
  const photos = new Set();

  for (const p of PRODUITS) {
    if (noms.has(p.nom)) erreurs.push(`Produit en double : ${p.nom}`);
    noms.add(p.nom);
    if (photos.has(p.photo)) erreurs.push(`Photo utilisée deux fois : ${p.photo}`);
    photos.add(p.photo);
    if (!fs.existsSync(fichierPhoto(p.photo))) erreurs.push(`Photo introuvable pour ${p.nom} : ${fichierPhoto(p.photo)}`);
    if (!listes.marque.has(p.marque)) erreurs.push(`${p.nom} : marque inconnue « ${p.marque} »`);
    if (!listes.categorie.has(p.categorie)) erreurs.push(`${p.nom} : catégorie inconnue « ${p.categorie} »`);
    for (const champ of ["actifs", "problemes", "types_peau", "tags"]) {
      for (const valeur of p[champ]) {
        if (!listes[champ].has(valeur)) erreurs.push(`${p.nom} : ${champ} inconnu « ${valeur} »`);
      }
    }
  }
  for (const k of KITS) {
    for (const nom of k.produits) if (!noms.has(nom)) erreurs.push(`Kit ${k.nom} : produit inconnu « ${nom} »`);
  }
  for (const a of ARTICLES) {
    if (!noms.has(a.image)) erreurs.push(`Article ${a.titre} : produit d'illustration inconnu « ${a.image} »`);
  }
  return erreurs;
}

// ---- 2. Client HTTP minimal ----
let jeton;

async function appel(methode, chemin, corps) {
  const enTetes = { Authorization: `Bearer ${jeton}` };
  let body;
  if (corps instanceof FormData) body = corps;
  else if (corps) {
    enTetes["Content-Type"] = "application/json";
    body = JSON.stringify(corps);
  }
  const reponse = await fetch(`${API}${chemin}`, { method: methode, headers: enTetes, body });
  const texte = await reponse.text();
  if (!reponse.ok) throw new Error(`${methode} ${chemin} → ${reponse.status} ${texte.slice(0, 300)}`);
  return texte ? JSON.parse(texte) : null;
}

const lignes = (reponse) => (Array.isArray(reponse) ? reponse : reponse?.data || []);

// Crée les éléments manquants d'un référentiel et renvoie la table nom → id
async function synchroniserReferentiel(chemin, elements) {
  const existants = new Map(lignes(await appel("GET", `/admin/${chemin}?limit=100`)).map((e) => [e.nom, e.id]));
  let crees = 0;
  for (const element of elements) {
    const donnees = typeof element === "string" ? { nom: element } : element;
    if (existants.has(donnees.nom)) continue;
    const cree = await appel("POST", `/admin/${chemin}`, donnees);
    existants.set(donnees.nom, cree.id);
    crees++;
  }
  console.log(`  ${chemin} : ${crees} créé(s), ${elements.length - crees} déjà présent(s)`);
  return existants;
}

async function importer() {
  const connexion = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: UTILISATEUR, password: MOT_DE_PASSE }),
  });
  if (!connexion.ok) throw new Error(`Connexion admin refusée (${connexion.status})`);
  jeton = (await connexion.json()).token;

  console.log("Référentiels :");
  const ids = {
    marque: await synchroniserReferentiel("marques", MARQUES),
    categorie: await synchroniserReferentiel("categories", CATEGORIES),
    actifs: await synchroniserReferentiel("principes-actifs", ACTIFS),
    problemes: await synchroniserReferentiel("problemes", PROBLEMES),
    types_peau: await synchroniserReferentiel("types-peau", TYPES_PEAU),
    tags: await synchroniserReferentiel("tags", TAGS),
  };

  console.log("Produits :");
  const produits = new Map(lignes(await appel("GET", "/admin/produits?limit=100")).map((p) => [p.nom, p]));
  let crees = 0;
  for (const p of PRODUITS) {
    if (produits.has(p.nom)) continue;
    const formulaire = new FormData();
    formulaire.append("nom", p.nom);
    formulaire.append("description", p.description);
    formulaire.append("mode_emploi", p.mode_emploi);
    if (p.contenance) formulaire.append("contenance", p.contenance);
    formulaire.append("prix", String(PRIX_PROVISOIRE));
    formulaire.append("stock", String(STOCK_PROVISOIRE));
    formulaire.append("actif", "true");
    formulaire.append("marque_id", String(ids.marque.get(p.marque)));
    formulaire.append("categorie_id", String(ids.categorie.get(p.categorie)));
    formulaire.append("principes_actifs", JSON.stringify(p.actifs.map((n) => ids.actifs.get(n))));
    formulaire.append("problemes", JSON.stringify(p.problemes.map((n) => ids.problemes.get(n))));
    formulaire.append("types_peau", JSON.stringify(p.types_peau.map((n) => ids.types_peau.get(n))));
    formulaire.append("tags", JSON.stringify(p.tags.map((n) => ids.tags.get(n))));
    const photo = await fs.openAsBlob(fichierPhoto(p.photo), { type: "image/jpeg" });
    formulaire.append("photo", photo, `${p.marque}-${p.nom}.jpeg`);
    produits.set(p.nom, await appel("POST", "/admin/produits", formulaire));
    crees++;
  }
  console.log(`  ${crees} créé(s), ${PRODUITS.length - crees} déjà présent(s)`);

  console.log("Kits (désactivés) :");
  const kits = new Set(lignes(await appel("GET", "/admin/kits?limit=100")).map((k) => k.nom));
  for (const k of KITS) {
    if (kits.has(k.nom)) continue;
    await appel("POST", "/admin/kits", {
      nom: k.nom,
      description: k.description,
      actif: false,
      produits: k.produits.map((nom) => ({ produit_id: produits.get(nom).id, quantite: 1 })),
    });
    console.log(`  + ${k.nom}`);
  }

  console.log("Articles (brouillons) :");
  const origine = API.replace(/\/api$/, "");
  const articles = new Set(lignes(await appel("GET", "/admin/articles?limit=100")).map((a) => a.titre));
  for (const a of ARTICLES) {
    if (articles.has(a.titre)) continue;
    await appel("POST", "/admin/articles", {
      titre: a.titre,
      type: a.type,
      contenu: a.contenu.join("\n"),
      image_url: `${origine}${produits.get(a.image).photo}`,
      publie: false,
    });
    console.log(`  + ${a.titre}`);
  }
}

const erreurs = verifier();
if (erreurs.length > 0) {
  console.error(`Données incohérentes (${erreurs.length}) :\n- ${erreurs.join("\n- ")}`);
  process.exit(1);
}
console.log(`Données cohérentes : ${PRODUITS.length} produits, ${MARQUES.length} marques, ${KITS.length} kits, ${ARTICLES.length} articles.`);
if (VERIFIER_SEULEMENT) process.exit(0);
if (!MOT_DE_PASSE) {
  console.error("MYRA_ADMIN_PASSWORD manquant.");
  process.exit(1);
}
importer().catch((erreur) => {
  console.error(`Échec : ${erreur.message}`);
  process.exit(1);
});
