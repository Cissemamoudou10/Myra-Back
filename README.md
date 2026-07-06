# Myra Skin Care — Backend (API)

API REST de la boutique de cosmétiques coréens **Myra Skin Care** (Bamako, Mali).

Construite avec **Node.js**, **Express** et **Sequelize** sur **PostgreSQL**.

## Prérequis

- Node.js 18 ou supérieur
- PostgreSQL 13 ou supérieur (une base accessible)

## Installation

```bash
npm install
cp .env.example .env   # puis renseigner les vraies valeurs
```

Éditez le fichier `.env` : identifiants PostgreSQL, secret JWT, identifiants admin,
clés de l'API WhatsApp Evolution, numéro Sarali.

## Démarrage

```bash
npm run db:seed   # (optionnel) données d'exemple pour tester
npm run dev       # serveur avec rechargement auto
# ou
npm start         # serveur en production
```

Le serveur démarre sur `http://localhost:4000` (configurable via `PORT`).
Vérifiez : `GET http://localhost:4000/api/health`.

## Scripts

- `npm start` — démarre le serveur
- `npm run dev` — démarre avec rechargement automatique
- `npm run db:sync` — crée/met à jour les tables sans supprimer les données
- `npm run db:seed` — réinitialise et insère des données d'exemple

## Structure

```
src/
├── config/          Connexion BDD, instanciation des référentiels
├── models/          Les 11 tables Sequelize + associations (index.js)
├── routes/          public.routes.js + admin.routes.js
├── controllers/     Traduisent HTTP ↔ services
├── services/        Logique métier (commandes, WhatsApp, recherche, auth…)
├── middlewares/     Auth JWT, upload, erreurs
├── jobs/            Expiration auto des commandes (48 h)
├── utils/           Pagination, slug, machine à états des statuts
├── scripts/         sync.js, seed.js
├── uploads/         Photos produits stockées
├── app.js           Configuration Express
└── ../server.js     Point d'entrée
```

## Principales routes

### Publiques (sans authentification)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/produits` | Liste + recherche + filtres + pagination |
| GET | `/api/produits/:slug` | Détail d'un produit |
| GET | `/api/categories` `/marques` `/principes-actifs` `/problemes` `/types-peau` | Référentiels |
| POST | `/api/commandes` | Créer une commande (déclenche WhatsApp) |
| POST | `/api/avis` | Soumettre un avis |
| GET | `/api/avis` | Avis publiés |
| GET | `/api/recherche?q=` | Recherche globale (6 tables) |

### Admin (token JWT requis)

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/admin/login` | Connexion → token |
| GET/POST/PUT/DELETE | `/api/admin/produits` | CRUD produits (avec photo) |
| GET/POST/PUT/DELETE | `/api/admin/{referentiel}` | CRUD référentiels |
| GET | `/api/admin/commandes` | Liste des commandes |
| PATCH | `/api/admin/commandes/:id/valider` | Valider le paiement |
| PATCH | `/api/admin/commandes/:id/livraison` | Mettre en livraison |
| PATCH | `/api/admin/commandes/:id/livree` | Marquer livrée |
| PATCH | `/api/admin/commandes/:id/annuler` | Annuler |
| GET | `/api/admin/avis` | Tous les avis |
| PATCH | `/api/admin/avis/:id/publier` `rejeter` | Modération |

### Paramètres de recherche / pagination

`?q=` (terme), `?page=` `?limit=` (pagination), `?sort=` `?order=` (tri).
Pour les produits : `?categorie=` `?marque=` `?probleme=` `?typepeau=` `?actif_id=`
`?prix_min=` `?prix_max=`.

Réponse paginée :
```json
{ "data": [ ... ], "meta": { "page": 1, "limit": 12, "total": 87, "pages": 8 } }
```

## Authentification

Au démarrage, un admin unique est défini par `ADMIN_USERNAME` / `ADMIN_PASSWORD`
dans `.env`. Le système est prêt pour le multi-utilisateur : dès que la table
`users` contient des comptes, l'authentification bascule automatiquement dessus.

## Cycle de vie d'une commande

```
en_attente_paiement → paiement_signale → payee → en_livraison → livree
         │                    │
         └─ expiree (48 h)    └─ annulee (manuel, tant que non livrée/expirée)
```

La création envoie la 1ʳᵉ séquence WhatsApp (récap + Sarali + consigne + délai).
La validation du paiement envoie la 2ᵈᵉ (confirmation + appel + lien d'avis).
