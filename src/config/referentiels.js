// ============================================================
//  Instanciation des référentiels (catégories, marques, etc.)
//  Centralise la création des services et contrôleurs CRUD pour
//  les cinq tables simples.
// ============================================================
import db from "../models/index.js";
import { creerServiceReferentiel } from "../services/referentiel.service.js";
import { creerControleurReferentiel } from "../controllers/referentiel.controller.js";

const { Categorie, Marque, PrincipeActif, Probleme, TypePeau, Tag } = db;

// Services
const categorieService = creerServiceReferentiel(Categorie, { hasSlug: true });
const marqueService = creerServiceReferentiel(Marque, { hasSlug: true });
const actifService = creerServiceReferentiel(PrincipeActif, { hasSlug: true });
const problemeService = creerServiceReferentiel(Probleme, { hasSlug: true });
const typePeauService = creerServiceReferentiel(TypePeau);
const tagService = creerServiceReferentiel(Tag, { hasSlug: true });

// Contrôleurs
export const referentiels = {
  categories: {
    service: categorieService,
    ctrl: creerControleurReferentiel(categorieService),
  },
  marques: {
    service: marqueService,
    ctrl: creerControleurReferentiel(marqueService),
  },
  "principes-actifs": {
    service: actifService,
    ctrl: creerControleurReferentiel(actifService),
  },
  problemes: {
    service: problemeService,
    ctrl: creerControleurReferentiel(problemeService),
  },
  "types-peau": {
    service: typePeauService,
    ctrl: creerControleurReferentiel(typePeauService),
  },
  tags: {
    service: tagService,
    ctrl: creerControleurReferentiel(tagService),
  },
};

export default referentiels;
