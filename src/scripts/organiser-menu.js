// ============================================================
//  Organise le menu public à partir des données du catalogue
//  (via l'API admin, idempotent) :
//  1. rubriques de premier niveau « Visage » et « Corps », les autres
//     catégories rangées sous « Visage » dans l'ordre du catalogue ;
//  2. illustre catégories, préoccupations et marques encore sans image
//     avec la photo d'un de leurs produits (vignettes du méga-menu,
//     pages Préoccupations et Marques). Une image choisie dans l'admin
//     n'est jamais écrasée.
//
//  Usage (depuis myra_back/) :
//    MYRA_API=https://…/api MYRA_ADMIN_PASSWORD=… node src/scripts/organiser-menu.js
// ============================================================
import { CATEGORIES } from "./catalogue/catalogue.js";

const API = (process.env.MYRA_API || "http://localhost:4000/api").replace(/\/+$/, "");
const ORIGINE = API.replace(/\/api$/, "");
const RUBRIQUE_VISAGE = "Visage";
const RUBRIQUE_CORPS = "Corps";

let jeton;

async function appel(methode, chemin, corps) {
  const enTetes = { Authorization: `Bearer ${jeton}` };
  if (corps) enTetes["Content-Type"] = "application/json";
  const reponse = await fetch(`${API}${chemin}`, { method: methode, headers: enTetes, body: corps && JSON.stringify(corps) });
  const texte = await reponse.text();
  if (!reponse.ok) throw new Error(`${methode} ${chemin} → ${reponse.status} ${texte.slice(0, 300)}`);
  return texte ? JSON.parse(texte) : null;
}
const lignes = (r) => (Array.isArray(r) ? r : r?.data || []);

// Photo d un produit correspondant au filtre public donné, en évitant celles
// déjà utilisées dans le même référentiel (deux préoccupations ne partagent pas la même vignette)
async function photoPour(filtre, dejaUtilisees) {
  const res = await appel("GET", `/produits?${filtre}&limit=50&sort=date&order=asc`);
  const photos = lignes(res).map((p) => p.photo).filter(Boolean).map((p) => `${ORIGINE}${p}`);
  return photos.find((p) => !dejaUtilisees.has(p)) || photos[0] || null;
}

async function organiserCategories() {
  let categories = lignes(await appel("GET", "/admin/categories?limit=100"));
  if (categories.length && !("parent_id" in categories[0])) {
    throw new Error("L'API ne gère pas encore la hiérarchie des catégories (parent_id) : déployer d'abord.");
  }
  if (!categories.some((c) => c.nom === RUBRIQUE_VISAGE)) {
    await appel("POST", "/admin/categories", { nom: RUBRIQUE_VISAGE, ordre: 1 });
    categories = lignes(await appel("GET", "/admin/categories?limit=100"));
  }
  const parNom = new Map(categories.map((c) => [c.nom, c]));
  const visage = parNom.get(RUBRIQUE_VISAGE);

  const attendu = [
    [RUBRIQUE_VISAGE, { parent_id: null, ordre: 1 }],
    [RUBRIQUE_CORPS, { parent_id: null, ordre: 2 }],
    ...CATEGORIES.filter((nom) => nom !== RUBRIQUE_CORPS).map((nom, i) => [nom, { parent_id: visage.id, ordre: i + 1 }]),
  ];
  for (const [nom, cible] of attendu) {
    const c = parNom.get(nom);
    if (!c) continue;
    if (c.parent_id !== cible.parent_id || c.ordre !== cible.ordre) {
      await appel("PUT", `/admin/categories/${c.id}`, cible);
      console.log(`  ${nom} → ${cible.parent_id ? "sous " + RUBRIQUE_VISAGE : "rubrique"} (ordre ${cible.ordre})`);
    }
  }
  return lignes(await appel("GET", "/admin/categories?limit=100"));
}

async function illustrer(chemin, elements, filtre) {
  let n = 0;
  const dejaUtilisees = new Set(elements.map((e) => e.image_url).filter(Boolean));
  for (const e of elements) {
    if (e.image_url) continue;
    const image = await photoPour(filtre(e), dejaUtilisees);
    if (!image) continue;
    dejaUtilisees.add(image);
    await appel("PUT", `/admin/${chemin}/${e.id}`, { image_url: image });
    n++;
  }
  console.log(`  ${chemin} : ${n} image(s) ajoutée(s)`);
}

async function main() {
  const connexion = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: process.env.MYRA_ADMIN_USERNAME || "admin", password: process.env.MYRA_ADMIN_PASSWORD }),
  });
  if (!connexion.ok) throw new Error(`Connexion admin refusée (${connexion.status})`);
  jeton = (await connexion.json()).token;

  console.log("Catégories :");
  const categories = await organiserCategories();
  console.log("Illustrations :");
  await illustrer("categories", categories, (c) => `categorie=${c.id}`);
  await illustrer("problemes", lignes(await appel("GET", "/admin/problemes?limit=100")), (p) => `probleme=${p.slug}`);
  await illustrer("marques", lignes(await appel("GET", "/admin/marques?limit=100")), (m) => `marque=${m.slug}`);
}

main().catch((erreur) => {
  console.error(`Échec : ${erreur.message}`);
  process.exit(1);
});
