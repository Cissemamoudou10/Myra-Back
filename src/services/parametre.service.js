// ============================================================
//  Service Paramètres — table à une seule ligne (id=1)
// ============================================================
import db from "../models/index.js";
import AppError from "../utils/AppError.js";

const { Parametre } = db;

const DEFAUTS = { id: 1, nouveaute_duree_jours: 60, orange_money_numero: null, sarali_numero: null };
const CHAMPS_NUMERO = {
  orange_money_numero: "Le numéro Orange Money",
  sarali_numero: "Le numéro Sarali",
};

export async function getParametres() {
  const [param] = await Parametre.findOrCreate({ where: { id: 1 }, defaults: DEFAUTS });
  return param;
}

// Vide → null (moyen de paiement non proposé) ; sinon chiffres, espaces et « + » uniquement
function nettoyerNumero(valeur, champ) {
  const texte = String(valeur ?? "").trim().replace(/\s+/g, " ");
  if (!texte) return null;
  if (!/^\+?[\d ]{2,30}$/.test(texte)) {
    throw new AppError(`${CHAMPS_NUMERO[champ]} ne doit contenir que des chiffres.`, 400, "VALIDATION_ERROR", [
      { champ, probleme: "Chiffres, espaces et « + » uniquement." },
    ]);
  }
  return texte;
}

// Seuls les champs présents dans `data` sont modifiés
export async function modifierParametres(data) {
  const param = await getParametres();
  const modifications = {};

  if (data.nouveaute_duree_jours !== undefined) {
    const duree = parseInt(data.nouveaute_duree_jours, 10);
    if (!Number.isNaN(duree)) modifications.nouveaute_duree_jours = duree;
  }
  for (const champ of Object.keys(CHAMPS_NUMERO)) {
    if (data[champ] !== undefined) modifications[champ] = nettoyerNumero(data[champ], champ);
  }

  await param.update(modifications);
  return param;
}

export default { getParametres, modifierParametres };
