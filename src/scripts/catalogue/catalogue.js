// ============================================================
//  Catalogue initial de la boutique (novembre 2026)
//  Extrait des photos produits envoyées par la cliente
//  (dossier MyraSkinCarePhotos, hors dépôt). Importé en
//  production par ../importer-catalogue.js.
//
//  - Prix et stock : valeurs provisoires identiques partout,
//    la cliente saisit les vraies valeurs dans l'admin.
//  - contenance : uniquement si lisible sur la photo, sinon null.
//  - photo : suffixe du nom de fichier WhatsApp
//    (« WhatsApp Image 2026-11-07 at 14.18.<photo>.jpeg »).
// ============================================================

export const PRIX_PROVISOIRE = 10000;
export const STOCK_PROVISOIRE = 10;

// ---- Référentiels ----

export const CATEGORIES = [
  "Nettoyants",
  "Huiles démaquillantes",
  "Toniques & brumes",
  "Pads",
  "Sérums & ampoules",
  "Crèmes & hydratants",
  "Soins des yeux",
  "Masques & exfoliants",
  "Protection solaire",
  "Soin des lèvres",
  "Corps",
];

// Préoccupations (page « Préoccupations » et filtre ?probleme=<slug>)
export const PROBLEMES = [
  "Hydratation & confort",
  "Éclat & teint terne",
  "Imperfections & pores",
  "Taches pigmentaires",
  "Anti-âge",
  "Sensibilité & rougeurs",
  "Soin du regard",
];

export const TYPES_PEAU = [
  "Tous types de peau",
  "Peau sèche",
  "Peau grasse",
  "Peau mixte",
  "Peau sensible",
  "Peau normale",
];

// Tags : slugs utilisés par le menu du site (?tag=<slug>)
export const TAGS = [
  "Nettoyant",  // nettoyant
  "Tonique",    // tonique
  "Sérum",      // serum
  "Crème",      // creme
  "Exfoliant",  // exfoliant (« Exfoliants & masques »)
  "Solaire",    // solaire
  "Gel",        // gel (« Gels & gommages corps »)
  "Lait",       // lait (« Laits & crèmes corps »)
  "K-Beauty",   // k-beauty
];

export const ACTIFS = [
  "Heartleaf",
  "Centella asiatica",
  "Niacinamide",
  "Acide hyaluronique",
  "Rétinal",
  "Rétinol",
  "Vitamine C",
  "Acide salicylique (BHA)",
  "AHA",
  "Acide azélaïque",
  "Arbutine",
  "Acide tranexamique",
  "Panthénol",
  "Céramides",
  "Collagène",
  "PDRN",
  "Peptides",
  "Mucine d'escargot",
  "Riz",
  "Thé vert",
  "Acides aminés",
  "Probiotiques",
  "Squalane",
  "Sève de bouleau",
  "Glutathion",
  "Aloe vera",
  "Argile volcanique",
  "Acide kojique",
  "Miel",
  "Lotus",
  "Soja",
  "Pêche",
  "Algues",
  "Caféine",
  "Ginseng noir",
  "Zinc",
  "Argousier",
  "Avoine",
  "Huile d'amande",
];

export const MARQUES = [
  { nom: "Anua", description: "Marque coréenne connue pour ses soins au heartleaf (Houttuynia cordata), plante apaisante au cœur de ses toniques, huiles et pads." },
  { nom: "Laneige", description: "Marque coréenne experte de l'hydratation, célèbre pour ses masques de nuit." },
  { nom: "Vaseline", description: "Marque internationale de soins du corps, spécialiste de l'hydratation des peaux sèches." },
  { nom: "Sulwhasoo", description: "Maison coréenne de soins haut de gamme inspirée de la médecine traditionnelle coréenne." },
  { nom: "Arrahan", description: "Marque coréenne de soins inspirés du hanbang, la tradition des plantes coréennes." },
  { nom: "Abib", description: "Marque coréenne aux formules épurées, autour du heartleaf et des actifs apaisants." },
  { nom: "Celimax", description: "Marque coréenne de soins ciblés : pads nettoyants et exfoliants, boosters au rétinal." },
  { nom: "SKIN1004", description: "Marque coréenne construite autour de la centella asiatica de Madagascar." },
  { nom: "Mixsoon", description: "Marque coréenne minimaliste : des formules courtes, centrées sur un ingrédient essentiel." },
  { nom: "K-Secret", description: "Marque coréenne dont la ligne Seoul 1988 associe actifs modernes (rétinal liposomal) et ingrédients traditionnels." },
  { nom: "Arencia", description: "Marque coréenne de soins frais et de boosters concentrés pour le visage et le contour des yeux." },
  { nom: "Round Lab", description: "Marque coréenne aux soins doux inspirés des ressources naturelles de l'île de Dokdo." },
  { nom: "Biodance", description: "Marque coréenne spécialiste des masques en feuille hydrogel à pose longue." },
  { nom: "Beauty of Joseon", description: "Marque coréenne qui revisite les rituels de beauté de la dynastie Joseon : riz, miel, ginseng." },
  { nom: "Innisfree", description: "Marque coréenne qui puise ses ingrédients sur l'île de Jeju : thé vert, argile volcanique." },
  { nom: "Cos De BAHA", description: "Marque coréenne de sérums concentrés en un actif clé, à des prix accessibles." },
  { nom: "Dr.Althea", description: "Marque coréenne de soins apaisants pour les peaux sensibles." },
  { nom: "Medicube", description: "Marque coréenne de soins à visée dermatologique : collagène, PDRN, vitamine C, TXA." },
  { nom: "COSRX", description: "Marque coréenne de référence aux formules efficaces et simples, célèbre pour sa mucine d'escargot." },
  { nom: "Jumiso", description: "Marque coréenne de sérums ciblés, notamment contre les taches." },
  { nom: "Maycheer", description: "Marque de soins du corps." },
  { nom: "ACM", description: "Laboratoire dermatologique français ; sa gamme Dépiwhite cible les irrégularités du teint." },
  { nom: "Kojie San", description: "Marque de savons à l'acide kojique, pour un teint plus uniforme." },
  { nom: "Torriden", description: "Marque coréenne experte de l'hydratation, autour de l'acide hyaluronique." },
  { nom: "Jennie Moon", description: "Marque de savons de soin." },
  { nom: "Purito Seoul", description: "Marque coréenne de soins doux et apaisants pour les peaux sensibles." },
  { nom: "Axis-Y", description: "Marque coréenne de soins éclat et anti-taches aux formules végétales." },
  { nom: "Mediheal", description: "Marque coréenne de soins ciblés, connue pour ses masques et sérums." },
  { nom: "Illiyoon", description: "Marque coréenne de soins visage et corps pour les peaux sèches et sensibles, autour des céramides." },
];

// ---- Produits ----
// marque / categorie / actifs / problemes / types_peau / tags : noms des référentiels ci-dessus

const KB = "K-Beauty";

export const PRODUITS = [
  {
    photo: "22 (1)", nom: "Heartleaf 77% Soothing Toner", marque: "Anua", categorie: "Toniques & brumes", contenance: "500 ml",
    description: "Tonique apaisant composé à 77 % d'extrait de heartleaf. Il calme les rougeurs, hydrate en douceur et prépare la peau aux soins suivants, sans la tirailler.",
    mode_emploi: "Matin et soir, après le nettoyage, appliquer avec les mains ou un coton puis tapoter jusqu'à absorption.",
    actifs: ["Heartleaf", "Acide hyaluronique"], problemes: ["Sensibilité & rougeurs", "Hydratation & confort"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Tonique", KB],
  },
  {
    photo: "22", nom: "Lip Sleeping Mask Berry", marque: "Laneige", categorie: "Soin des lèvres", contenance: "20 g",
    description: "Masque de nuit pour les lèvres au parfum de baies. Sa texture fondante nourrit pendant le sommeil : au réveil, les lèvres sont douces et souples.",
    mode_emploi: "Le soir, appliquer une couche généreuse sur les lèvres avec la spatule fournie et laisser agir toute la nuit.",
    actifs: ["Vitamine C"], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Exfoliant", KB],
  },
  {
    photo: "23 (1)", nom: "Healthy Bright Gluta-Hya Serum Burst Lotion Dewy Radiance", marque: "Vaseline", categorie: "Corps", contenance: "200 ml",
    description: "Lotion corps à la texture sérum, au glutathion, à l'acide hyaluronique et à la niacinamide. Elle hydrate et donne à la peau un fini lumineux.",
    mode_emploi: "Appliquer chaque jour sur l'ensemble du corps, de préférence après la douche.",
    actifs: ["Glutathion", "Acide hyaluronique", "Niacinamide"], problemes: ["Éclat & teint terne", "Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Lait"],
  },
  {
    photo: "23 (2)", nom: "Gentle Cleansing Oil", marque: "Sulwhasoo", categorie: "Huiles démaquillantes", contenance: null,
    description: "Huile démaquillante douce qui dissout le maquillage et l'excès de sébum, puis se rince sans laisser de film gras. Première étape idéale du double nettoyage.",
    mode_emploi: "Sur peau sèche, masser une à deux pressions sur le visage, émulsionner avec un peu d'eau puis rincer. Poursuivre avec un nettoyant moussant.",
    actifs: [], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau", "Peau sèche"], tags: ["Nettoyant", KB],
  },
  {
    photo: "23 (3)", nom: "Hanbang Peeling Gel", marque: "Arrahan", categorie: "Masques & exfoliants", contenance: null,
    description: "Gel exfoliant inspiré de la tradition hanbang. Il élimine en douceur les cellules mortes et les impuretés de surface pour une peau plus lisse et plus nette.",
    mode_emploi: "Sur peau propre et sèche, appliquer puis masser délicatement jusqu'à formation de petites particules. Rincer. Une à deux fois par semaine.",
    actifs: [], problemes: ["Éclat & teint terne", "Imperfections & pores"], types_peau: ["Tous types de peau"], tags: ["Exfoliant", KB],
  },
  {
    photo: "23 (4)", nom: "PDRN Hyaluronic Acid 100 Moisturizing Cream", marque: "Anua", categorie: "Crèmes & hydratants", contenance: "60 ml",
    description: "Crème hydratante au PDRN et à l'acide hyaluronique. Sa texture gel-crème fraîche hydrate durablement et laisse la peau rebondie.",
    mode_emploi: "Matin et soir, en dernière étape de la routine, appliquer sur le visage et le cou.",
    actifs: ["PDRN", "Acide hyaluronique"], problemes: ["Hydratation & confort", "Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "23 (5)", nom: "Heartleaf Acne Foam Cleanser", marque: "Abib", categorie: "Nettoyants", contenance: "150 ml",
    description: "Mousse nettoyante au heartleaf, à la centella et à l'acide salicylique. Elle purifie les pores et limite l'excès de sébum tout en respectant la peau.",
    mode_emploi: "Faire mousser une petite quantité avec de l'eau, masser le visage humide puis rincer. Matin et/ou soir.",
    actifs: ["Heartleaf", "Centella asiatica", "Acide salicylique (BHA)", "Panthénol"], problemes: ["Imperfections & pores"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Nettoyant", KB],
  },
  {
    photo: "23", nom: "Ji Woo Gae One Step Mild Cleansing Pad", marque: "Celimax", categorie: "Pads", contenance: "60 pads",
    description: "Pads démaquillants imprégnés d'une lotion douce. Ils retirent maquillage léger et impuretés en un seul geste, pour toutes les peaux.",
    mode_emploi: "Passer un pad sur le visage en évitant le contour des yeux. Rincer si nécessaire.",
    actifs: [], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Nettoyant", KB],
  },
  {
    photo: "24 (1)", nom: "Madagascar Centella Air-Fit Suncream Light SPF30 PA++++", marque: "SKIN1004", categorie: "Protection solaire", contenance: "50 ml",
    description: "Protection solaire légère à la centella de Madagascar. Sa texture fluide s'absorbe vite, sans traces blanches, et apaise la peau.",
    mode_emploi: "Le matin, en dernière étape, appliquer généreusement. Renouveler toutes les deux heures en cas d'exposition.",
    actifs: ["Centella asiatica"], problemes: ["Sensibilité & rougeurs"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Solaire", KB],
  },
  {
    photo: "24 (2)", nom: "Lotus Flower Essence", marque: "Mixsoon", categorie: "Sérums & ampoules", contenance: "100 ml",
    description: "Essence à la fleur de lotus, légère et hydratante. Elle apaise la peau et lui apporte souplesse et confort.",
    mode_emploi: "Après le tonique, appliquer quelques gouttes et tapoter jusqu'à absorption.",
    actifs: ["Lotus"], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "24 (3)", nom: "Bean Cleansing Oil", marque: "Mixsoon", categorie: "Huiles démaquillantes", contenance: "195 ml",
    description: "Huile démaquillante au soja. Elle retire maquillage, crème solaire et sébum en douceur et laisse la peau souple.",
    mode_emploi: "Sur peau sèche, masser, émulsionner avec un peu d'eau puis rincer. Poursuivre avec un nettoyant moussant.",
    actifs: ["Soja"], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Nettoyant", KB],
  },
  {
    photo: "24 (4)", nom: "Seoul 1988 Cleansing Foam Pine Cica 1% + Probiotics", marque: "K-Secret", categorie: "Nettoyants", contenance: "150 ml",
    description: "Mousse nettoyante à la cica et aux probiotiques. Elle nettoie en profondeur tout en préservant l'équilibre de la peau.",
    mode_emploi: "Faire mousser avec un peu d'eau, masser le visage humide puis rincer.",
    actifs: ["Centella asiatica", "Probiotiques"], problemes: ["Sensibilité & rougeurs"], types_peau: ["Tous types de peau"], tags: ["Nettoyant", KB],
  },
  {
    photo: "24 (5)", nom: "Retinal Booster Shot", marque: "Arencia", categorie: "Crèmes & hydratants", contenance: "30 ml",
    description: "Crème visage et contour des yeux au complexe de rétinal et à la caféine. Elle raffermit, lisse les ridules et redonne du tonus.",
    mode_emploi: "Le soir, appliquer une petite quantité. Commencer deux à trois fois par semaine, puis augmenter selon la tolérance. Protection solaire indispensable le matin.",
    actifs: ["Rétinal", "Caféine"], problemes: ["Anti-âge", "Soin du regard"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "24", nom: "1025 Dokdo Cleanser", marque: "Round Lab", categorie: "Nettoyants", contenance: null,
    description: "Nettoyant moussant doux au pH faible. Il élimine les impuretés sans dessécher, pour un usage quotidien matin et soir.",
    mode_emploi: "Faire mousser avec de l'eau, masser le visage humide puis rincer.",
    actifs: [], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Nettoyant", KB],
  },
  {
    photo: "25 (1)", nom: "Refreshing Sea Kelp Real Deep Mask", marque: "Biodance", categorie: "Masques & exfoliants", contenance: "4 masques",
    description: "Masque hydrogel aux algues, à pose longue. Il apaise, purifie et rafraîchit la peau, qui retrouve un aspect net et reposé.",
    mode_emploi: "Sur peau propre, poser le masque et le laisser agir jusqu'à ce qu'il devienne transparent. Retirer puis faire pénétrer le reste du soin.",
    actifs: ["Algues"], problemes: ["Sensibilité & rougeurs", "Imperfections & pores"], types_peau: ["Tous types de peau"], tags: ["Exfoliant", KB],
  },
  {
    photo: "25 (2)", nom: "Ground Rice and Honey Glow Mask", marque: "Beauty of Joseon", categorie: "Masques & exfoliants", contenance: null,
    description: "Masque au riz moulu et au miel. Il exfolie délicatement, nourrit et révèle l'éclat de la peau.",
    mode_emploi: "Sur peau humide, appliquer, laisser poser 5 à 10 minutes, masser doucement puis rincer. Une à deux fois par semaine.",
    actifs: ["Riz", "Miel"], problemes: ["Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Exfoliant", KB],
  },
  {
    photo: "25 (3)", nom: "Super Volcanic Pore Clay Mask", marque: "Innisfree", categorie: "Masques & exfoliants", contenance: "100 ml",
    description: "Masque à l'argile volcanique de Jeju. Il absorbe l'excès de sébum, désincruste les pores et matifie la peau.",
    mode_emploi: "Appliquer une couche uniforme sur peau propre en évitant les yeux et la bouche, laisser poser 10 minutes puis rincer. Une à deux fois par semaine.",
    actifs: ["Argile volcanique"], problemes: ["Imperfections & pores"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Exfoliant", KB],
  },
  {
    photo: "25 (4)", nom: "Volcanic BHA Pore Cleansing Foam", marque: "Innisfree", categorie: "Nettoyants", contenance: "150 ml",
    description: "Mousse nettoyante à l'argile volcanique et au BHA. Elle nettoie en profondeur et désincruste les pores.",
    mode_emploi: "Faire mousser avec de l'eau, masser le visage humide puis rincer.",
    actifs: ["Argile volcanique", "Acide salicylique (BHA)"], problemes: ["Imperfections & pores"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Nettoyant", KB],
  },
  {
    photo: "25 (5)", nom: "Green Tea Amino Hydrating Cleansing Foam", marque: "Innisfree", categorie: "Nettoyants", contenance: "150 g",
    description: "Mousse nettoyante au thé vert de Jeju et aux acides aminés. Elle nettoie en douceur et laisse la peau hydratée.",
    mode_emploi: "Faire mousser avec de l'eau, masser le visage humide puis rincer.",
    actifs: ["Thé vert", "Acides aminés"], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau", "Peau sèche"], tags: ["Nettoyant", KB],
  },
  {
    photo: "25", nom: "Vitamin C Booster Shot", marque: "Arencia", categorie: "Crèmes & hydratants", contenance: "30 ml",
    description: "Crème visage et contour des yeux au complexe de vitamine C et au glutathion. Elle ravive l'éclat et unifie le teint.",
    mode_emploi: "Matin et/ou soir, appliquer une petite quantité sur le visage et le contour des yeux. Protection solaire le matin.",
    actifs: ["Vitamine C", "Glutathion"], problemes: ["Éclat & teint terne", "Soin du regard"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "26 (1)", nom: "AN Arbutin Niacinamide Serum", marque: "Cos De BAHA", categorie: "Sérums & ampoules", contenance: "30 ml",
    description: "Sérum à 5 % de bêta-arbutine et 5 % de niacinamide, avec de l'acide hyaluronique. Il atténue l'apparence des taches et unifie le teint.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes. Protection solaire le matin.",
    actifs: ["Arbutine", "Niacinamide", "Acide hyaluronique"], problemes: ["Taches pigmentaires", "Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "26 (2)", nom: "345 Relief Cream Mist", marque: "Dr.Althea", categorie: "Toniques & brumes", contenance: "60 ml",
    description: "Brume crème hydratante et apaisante à l'eau de son de riz et au panthénol. Elle réhydrate la peau à tout moment, même par-dessus le maquillage.",
    mode_emploi: "Agiter, puis vaporiser à environ 20 cm du visage, yeux fermés. Tapoter pour faire pénétrer.",
    actifs: ["Riz", "Panthénol"], problemes: ["Hydratation & confort", "Sensibilité & rougeurs"], types_peau: ["Tous types de peau"], tags: ["Tonique", KB],
  },
  {
    photo: "26 (3)", nom: "Madagascar Centella Soothing Cream", marque: "SKIN1004", categorie: "Crèmes & hydratants", contenance: "75 ml",
    description: "Crème apaisante à la centella de Madagascar. Elle calme les rougeurs, renforce la barrière cutanée et hydrate sans alourdir.",
    mode_emploi: "Matin et soir, appliquer sur le visage en dernière étape de la routine.",
    actifs: ["Centella asiatica"], problemes: ["Sensibilité & rougeurs", "Hydratation & confort"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Crème", KB],
  },
  {
    photo: "26 (4)", nom: "Fresh Green Cleanser", marque: "Arencia", categorie: "Nettoyants", contenance: "120 g",
    description: "Nettoyant hydratant à la texture fraîche. Il nettoie en profondeur et laisse la peau douce et lumineuse.",
    mode_emploi: "Prélever une petite quantité, faire mousser avec de l'eau, masser le visage humide puis rincer.",
    actifs: [], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Nettoyant", KB],
  },
  {
    photo: "26 (5)", nom: "Ji Woo Gae Heartleaf BHA Peeling Pad", marque: "Celimax", categorie: "Pads", contenance: "60 pads",
    description: "Pads exfoliants au heartleaf et au BHA pour les peaux rugueuses et ternes. Ils affinent le grain de peau et désincrustent les pores.",
    mode_emploi: "Après le nettoyage, passer la face texturée sur le visage, puis la face lisse. Deux à trois fois par semaine pour commencer.",
    actifs: ["Heartleaf", "Acide salicylique (BHA)"], problemes: ["Éclat & teint terne", "Imperfections & pores"], types_peau: ["Peau grasse", "Peau mixte", "Peau normale"], tags: ["Exfoliant", KB],
  },
  {
    photo: "26", nom: "AH Aloe Leaf Hyaluronic Acid Serum", marque: "Cos De BAHA", categorie: "Sérums & ampoules", contenance: "120 ml",
    description: "Sérum à l'aloe vera (92,5 % d'extrait) et à l'acide hyaluronique. Il hydrate intensément et apaise la peau.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes et tapoter.",
    actifs: ["Aloe vera", "Acide hyaluronique"], problemes: ["Hydratation & confort", "Sensibilité & rougeurs"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "27 (1)", nom: "Peach 77 Niacin Enriched Cream", marque: "Anua", categorie: "Crèmes & hydratants", contenance: "50 ml",
    description: "Crème riche à l'extrait de pêche et à la niacinamide. Elle nourrit, hydrate et donne à la peau un éclat satiné.",
    mode_emploi: "Matin et soir, en dernière étape, appliquer sur le visage et le cou.",
    actifs: ["Pêche", "Niacinamide"], problemes: ["Hydratation & confort", "Éclat & teint terne"], types_peau: ["Peau sèche", "Peau normale"], tags: ["Crème", KB],
  },
  {
    photo: "27 (2)", nom: "Birch 70 Moisture Boosting Cream", marque: "Anua", categorie: "Crèmes & hydratants", contenance: "50 ml",
    description: "Crème hydratante à 70 % de sève de bouleau. Légère et fraîche, elle hydrate en profondeur sans effet gras.",
    mode_emploi: "Matin et soir, en dernière étape de la routine.",
    actifs: ["Sève de bouleau"], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "27 (3)", nom: "Heartleaf Pore Control Cleansing Oil", marque: "Anua", categorie: "Huiles démaquillantes", contenance: "200 ml",
    description: "Huile démaquillante au heartleaf. Elle dissout maquillage, sébum et points noirs, puis se rince parfaitement.",
    mode_emploi: "Sur peau sèche, masser une à deux pressions, insister sur la zone T, émulsionner avec de l'eau puis rincer.",
    actifs: ["Heartleaf"], problemes: ["Imperfections & pores"], types_peau: ["Tous types de peau", "Peau grasse"], tags: ["Nettoyant", KB],
  },
  {
    photo: "27 (4)", nom: "Collagen Jelly Cream", marque: "Medicube", categorie: "Crèmes & hydratants", contenance: "110 ml",
    description: "Crème à la texture gelée au collagène. Elle hydrate, repulpe et laisse la peau rebondie et lumineuse.",
    mode_emploi: "Matin et soir, en dernière étape, appliquer sur le visage.",
    actifs: ["Collagène"], problemes: ["Hydratation & confort", "Anti-âge"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "27 (5)", nom: "Collagen Night Wrapping Mask", marque: "Medicube", categorie: "Masques & exfoliants", contenance: "75 ml",
    description: "Masque de nuit au collagène, à la niacinamide et aux céramides. Il forme un film qui garde l'hydratation toute la nuit : la peau est plus ferme et lisse au réveil.",
    mode_emploi: "Le soir, en dernière étape, appliquer une couche uniforme et laisser sécher. Retirer le film le matin puis rincer.",
    actifs: ["Collagène", "Niacinamide", "Céramides"], problemes: ["Anti-âge", "Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Exfoliant", KB],
  },
  {
    photo: "27 (6)", nom: "Advanced Snail 96 Mucin Power Essence", marque: "COSRX", categorie: "Sérums & ampoules", contenance: "100 ml",
    description: "Essence à 96 % de mucine d'escargot. Elle hydrate, répare et apaise la peau, qui gagne en souplesse et en éclat.",
    mode_emploi: "Après le tonique, appliquer une petite quantité et tapoter jusqu'à absorption.",
    actifs: ["Mucine d'escargot"], problemes: ["Hydratation & confort", "Sensibilité & rougeurs"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "27", nom: "Heartleaf TECA Capsule Serum Calming Drop", marque: "Abib", categorie: "Sérums & ampoules", contenance: "50 ml",
    description: "Sérum à capsules au heartleaf et aux actifs de la centella (TECA). Il apaise rapidement les peaux irritées.",
    mode_emploi: "Après le tonique, appliquer quelques gouttes et faire pénétrer en tapotant.",
    actifs: ["Heartleaf", "Centella asiatica"], problemes: ["Sensibilité & rougeurs"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Sérum", KB],
  },
  {
    photo: "28 (1)", nom: "Niacinamide 20 Serum", marque: "Jumiso", categorie: "Sérums & ampoules", contenance: null,
    description: "Sérum concentré en niacinamide qui cible les taches et l'hyperpigmentation pour un teint plus uniforme.",
    mode_emploi: "Le soir, après le tonique, appliquer quelques gouttes. Concentration élevée : commencer un jour sur deux. Protection solaire le matin.",
    actifs: ["Niacinamide"], problemes: ["Taches pigmentaires"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "28 (2)", nom: "Radiance Cream", marque: "Maycheer", categorie: "Corps", contenance: "50 g",
    description: "Crème corps à la vitamine C, à la centella et à la camomille, pour les zones qui foncent (aisselles, aine, intérieur des cuisses). Usage externe uniquement.",
    mode_emploi: "Appliquer une fine couche sur la zone propre et sèche, une à deux fois par jour. Ne pas utiliser sur une peau irritée.",
    actifs: ["Vitamine C", "Centella asiatica"], problemes: ["Taches pigmentaires"], types_peau: ["Tous types de peau"], tags: ["Lait"],
  },
  {
    photo: "28 (3)", nom: "Deep Vita C Capsule Cream", marque: "Medicube", categorie: "Crèmes & hydratants", contenance: "55 g",
    description: "Crème à capsules à l'eau de vitamine (50 %), aux dérivés de vitamine C et à 5 % de niacinamide. Elle ravive l'éclat et unifie le teint.",
    mode_emploi: "Matin et soir, en dernière étape. Protection solaire le matin.",
    actifs: ["Vitamine C", "Niacinamide"], problemes: ["Éclat & teint terne", "Taches pigmentaires"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "28 (4)", nom: "Seoul 1988 Serum Retinal Liposome 2% + Black Ginseng", marque: "K-Secret", categorie: "Sérums & ampoules", contenance: null,
    description: "Sérum au rétinal liposomal (2 %) et au ginseng noir. Il lisse les ridules et améliore la fermeté de la peau.",
    mode_emploi: "Le soir uniquement, appliquer une petite quantité après le tonique. Commencer deux à trois fois par semaine. Protection solaire le matin.",
    actifs: ["Rétinal", "Ginseng noir"], problemes: ["Anti-âge"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "28 (5)", nom: "Seoul 1988 Eye Cream Retinal Liposome 4% + Fermented Bean", marque: "K-Secret", categorie: "Soins des yeux", contenance: null,
    description: "Crème contour des yeux au rétinal liposomal (4 %) et au soja fermenté. Elle cible ridules et perte de fermeté autour des yeux.",
    mode_emploi: "Le soir, tapoter une petite quantité sur le contour de l'œil, en évitant les paupières mobiles. Protection solaire le matin.",
    actifs: ["Rétinal", "Soja"], problemes: ["Soin du regard", "Anti-âge"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "28", nom: "Dépiwhite Lait corporel éclaircissant", marque: "ACM", categorie: "Corps", contenance: "200 ml",
    description: "Lait corps du laboratoire ACM. Il hydrate les peaux sèches et aide à unifier le teint du corps.",
    mode_emploi: "Appliquer sur la peau propre, une à deux fois par jour, en massant jusqu'à absorption.",
    actifs: [], problemes: ["Taches pigmentaires", "Hydratation & confort"], types_peau: ["Peau sèche"], tags: ["Lait"],
  },
  {
    photo: "29 (1)", nom: "Skin Lightening Soap", marque: "Kojie San", categorie: "Corps", contenance: "65 g",
    description: "Savon à l'acide kojique pour le visage et le corps, qui aide à unifier le teint.",
    mode_emploi: "Faire mousser sur peau humide, laisser agir quelques secondes puis rincer. Peut dessécher : appliquer ensuite un soin hydratant, et une protection solaire le jour.",
    actifs: ["Acide kojique"], problemes: ["Taches pigmentaires"], types_peau: ["Peau normale", "Peau grasse"], tags: ["Gel"],
  },
  {
    photo: "29 (2)", nom: "Dive-In Soothing Cream", marque: "Torriden", categorie: "Crèmes & hydratants", contenance: null,
    description: "Crème apaisante à l'acide hyaluronique. Légère et rafraîchissante, elle hydrate et calme les peaux sensibles.",
    mode_emploi: "Matin et soir, en dernière étape de la routine.",
    actifs: ["Acide hyaluronique"], problemes: ["Sensibilité & rougeurs", "Hydratation & confort"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Crème", KB],
  },
  {
    photo: "29 (3)", nom: "PDRN Pink Peptide Serum", marque: "Medicube", categorie: "Sérums & ampoules", contenance: "30 ml",
    description: "Sérum au PDRN et à un complexe de peptides. Il hydrate, redonne de l'éclat et améliore l'élasticité de la peau.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes.",
    actifs: ["PDRN", "Peptides"], problemes: ["Anti-âge", "Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "29 (4)", nom: "Heartleaf 77 Clear Pad", marque: "Anua", categorie: "Pads", contenance: "160 ml",
    description: "Pads toniques au heartleaf. Ils apaisent, éliminent les cellules mortes en douceur et resserrent l'apparence des pores.",
    mode_emploi: "Après le nettoyage, passer un pad sur le visage. Il peut aussi être laissé quelques minutes sur les zones à apaiser.",
    actifs: ["Heartleaf"], problemes: ["Imperfections & pores", "Sensibilité & rougeurs"], types_peau: ["Tous types de peau"], tags: ["Tonique", KB],
  },
  {
    photo: "29 (5)", nom: "Low pH Good Morning Gel Cleanser", marque: "COSRX", categorie: "Nettoyants", contenance: "150 ml",
    description: "Gel nettoyant au pH faible, idéal le matin. Il nettoie sans tirailler et respecte la barrière cutanée.",
    mode_emploi: "Faire mousser avec de l'eau, masser le visage humide puis rincer.",
    actifs: [], problemes: ["Imperfections & pores"], types_peau: ["Tous types de peau", "Peau grasse"], tags: ["Nettoyant", KB],
  },
  {
    photo: "29 (6)", nom: "Salicylic Acid Daily Gentle Cleanser", marque: "COSRX", categorie: "Nettoyants", contenance: "150 ml",
    description: "Nettoyant quotidien à 0,5 % d'acide salicylique. Il élimine impuretés et excès de sébum pour une peau plus nette.",
    mode_emploi: "Faire mousser avec de l'eau, masser le visage humide quelques secondes puis rincer.",
    actifs: ["Acide salicylique (BHA)"], problemes: ["Imperfections & pores"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Nettoyant", KB],
  },
  {
    photo: "29", nom: "90X Power of Moonlight Soap", marque: "Jennie Moon", categorie: "Corps", contenance: null,
    description: "Savon de soin Jennie Moon pour un teint plus lumineux.",
    mode_emploi: "Faire mousser sur peau humide puis rincer. Appliquer ensuite un soin hydratant, et une protection solaire le jour.",
    actifs: [], problemes: ["Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Gel"],
  },
  {
    photo: "30 (1)", nom: "Rice 70 Glow Milky Toner", marque: "Anua", categorie: "Toniques & brumes", contenance: "250 ml",
    description: "Tonique lacté au riz et aux céramides. Il hydrate, renforce la barrière cutanée et donne de l'éclat avec un fini frais.",
    mode_emploi: "Matin et soir, après le nettoyage, appliquer avec les mains et tapoter jusqu'à absorption.",
    actifs: ["Riz", "Céramides"], problemes: ["Éclat & teint terne", "Hydratation & confort"], types_peau: ["Tous types de peau", "Peau sèche"], tags: ["Tonique", KB],
  },
  {
    photo: "30 (2)", nom: "Heartleaf Quercetinol Pore Deep Cleansing Foam", marque: "Anua", categorie: "Nettoyants", contenance: "150 ml",
    description: "Mousse nettoyante au heartleaf et au BHA. Elle nettoie les pores en profondeur et apaise la peau.",
    mode_emploi: "Faire mousser avec de l'eau, masser le visage humide puis rincer.",
    actifs: ["Heartleaf", "Acide salicylique (BHA)"], problemes: ["Imperfections & pores"], types_peau: ["Tous types de peau", "Peau grasse"], tags: ["Nettoyant", KB],
  },
  {
    photo: "30 (3)", nom: "Niacinamide 10 + TXA 4 Serum", marque: "Anua", categorie: "Sérums & ampoules", contenance: "30 ml",
    description: "Sérum à 10 % de niacinamide et 4 % d'acide tranexamique. Il atténue l'apparence des taches et ravive l'éclat du teint.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes. Protection solaire le matin.",
    actifs: ["Niacinamide", "Acide tranexamique"], problemes: ["Taches pigmentaires", "Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "30 (4)", nom: "Mighty Bamboo Panthenol Cream", marque: "Purito Seoul", categorie: "Crèmes & hydratants", contenance: "100 ml",
    description: "Crème hydratante au panthénol et au bambou. Elle apaise et hydrate durablement les peaux sensibles et déshydratées.",
    mode_emploi: "Matin et soir, en dernière étape de la routine.",
    actifs: ["Panthénol"], problemes: ["Hydratation & confort", "Sensibilité & rougeurs"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Crème", KB],
  },
  {
    photo: "30 (5)", nom: "Dynasty Cream", marque: "Beauty of Joseon", categorie: "Crèmes & hydratants", contenance: null,
    description: "Crème nourrissante au riz et au squalane, inspirée des soins de la dynastie Joseon. Elle hydrate et laisse la peau souple et lumineuse.",
    mode_emploi: "Matin et soir, en dernière étape, appliquer sur le visage et le cou.",
    actifs: ["Riz", "Squalane"], problemes: ["Hydratation & confort", "Éclat & teint terne"], types_peau: ["Peau sèche", "Peau normale"], tags: ["Crème", KB],
  },
  {
    photo: "30", nom: "Heartleaf Pore Control Cleansing Oil Mild", marque: "Anua", categorie: "Huiles démaquillantes", contenance: "200 ml",
    description: "Version douce de l'huile démaquillante au heartleaf, formulée pour les peaux sensibles. Elle démaquille et nettoie les pores sans irriter.",
    mode_emploi: "Sur peau sèche, masser une à deux pressions, émulsionner avec de l'eau puis rincer.",
    actifs: ["Heartleaf"], problemes: ["Sensibilité & rougeurs", "Imperfections & pores"], types_peau: ["Peau sensible"], tags: ["Nettoyant", KB],
  },
  {
    photo: "31 (1)", nom: "Relief Sun : Rice + Probiotics SPF50+ PA++++", marque: "Beauty of Joseon", categorie: "Protection solaire", contenance: null,
    description: "Protection solaire très haute au riz et aux probiotiques. Sa texture crème légère ne laisse pas de traces blanches et hydrate la peau.",
    mode_emploi: "Le matin, en dernière étape, appliquer généreusement. Renouveler toutes les deux heures en cas d'exposition.",
    actifs: ["Riz", "Probiotiques"], problemes: ["Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Solaire", KB],
  },
  {
    photo: "31 (2)", nom: "Relief Sun Aqua-Fresh : Rice + B5 SPF50+ PA++++", marque: "Beauty of Joseon", categorie: "Protection solaire", contenance: null,
    description: "Protection solaire très haute à texture aqueuse, au riz et à la vitamine B5. Fraîche et légère, elle convient aux peaux mixtes à grasses.",
    mode_emploi: "Le matin, en dernière étape, appliquer généreusement. Renouveler toutes les deux heures en cas d'exposition.",
    actifs: ["Riz", "Panthénol"], problemes: ["Hydratation & confort"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Solaire", KB],
  },
  {
    photo: "31 (3)", nom: "AHA/BHA Clarifying Treatment Toner", marque: "COSRX", categorie: "Toniques & brumes", contenance: "150 ml",
    description: "Tonique exfoliant doux à l'AHA et au BHA. Il élimine les cellules mortes, désincruste les pores et affine le grain de peau.",
    mode_emploi: "Après le nettoyage, appliquer avec un coton ou en vaporisation. Commencer une fois par jour. Protection solaire le matin.",
    actifs: ["AHA", "Acide salicylique (BHA)"], problemes: ["Imperfections & pores", "Éclat & teint terne"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Tonique", KB],
  },
  {
    photo: "31 (4)", nom: "Retinal Shot Tightening Booster", marque: "Celimax", categorie: "Sérums & ampoules", contenance: "15 ml",
    description: "Booster au rétinal (0,1 %), au panthénol (1 %) et au Matrixyl 3000 (3 %). Il raffermit la peau et cible les ridules.",
    mode_emploi: "Le soir, appliquer une petite quantité sur les zones ciblées. Commencer deux à trois fois par semaine. Protection solaire le matin.",
    actifs: ["Rétinal", "Panthénol", "Peptides"], problemes: ["Anti-âge"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "31 (5)", nom: "Madagascar Centella Light Cleansing Oil", marque: "SKIN1004", categorie: "Huiles démaquillantes", contenance: "200 ml",
    description: "Huile démaquillante légère à la centella de Madagascar. Elle retire maquillage et impuretés tout en apaisant la peau.",
    mode_emploi: "Sur peau sèche, masser, émulsionner avec un peu d'eau puis rincer. Poursuivre avec un nettoyant moussant.",
    actifs: ["Centella asiatica"], problemes: ["Sensibilité & rougeurs"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Nettoyant", KB],
  },
  {
    photo: "31 (6)", nom: "Dark Spot Correcting Glow Serum", marque: "Axis-Y", categorie: "Sérums & ampoules", contenance: null,
    description: "Sérum éclat à 5 % de niacinamide, au squalane végétal et à l'argousier. Il atténue l'apparence des taches et garde la peau hydratée toute la journée.",
    mode_emploi: "Matin et soir, après le tonique. Protection solaire le matin.",
    actifs: ["Niacinamide", "Squalane", "Argousier"], problemes: ["Taches pigmentaires", "Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "31", nom: "Glow Deep Serum : Rice + Alpha-Arbutin", marque: "Beauty of Joseon", categorie: "Sérums & ampoules", contenance: null,
    description: "Sérum au riz et à l'alpha-arbutine. Il cible les taches et le teint terne pour une peau plus lumineuse.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes. Protection solaire le matin.",
    actifs: ["Riz", "Arbutine"], problemes: ["Taches pigmentaires", "Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "32 (1)", nom: "AZ Azelaic Acid 10 Serum", marque: "Cos De BAHA", categorie: "Sérums & ampoules", contenance: "30 ml",
    description: "Sérum à 10 % d'acide azélaïque, avec acide hyaluronique et vitamines B3 et B5. Il cible imperfections, rougeurs et marques.",
    mode_emploi: "Le soir, après le tonique, appliquer quelques gouttes. Un léger picotement est possible au début. Protection solaire le matin.",
    actifs: ["Acide azélaïque", "Acide hyaluronique", "Niacinamide"], problemes: ["Imperfections & pores", "Sensibilité & rougeurs", "Taches pigmentaires"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Sérum", KB],
  },
  {
    photo: "32 (2)", nom: "Madagascar Centella Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++", marque: "SKIN1004", categorie: "Protection solaire", contenance: "50 ml",
    description: "Sérum solaire très haute protection à la centella et à l'acide hyaluronique. Texture aqueuse invisible, idéale sous le maquillage.",
    mode_emploi: "Le matin, en dernière étape, appliquer généreusement. Renouveler toutes les deux heures en cas d'exposition.",
    actifs: ["Centella asiatica", "Acide hyaluronique"], problemes: ["Hydratation & confort", "Sensibilité & rougeurs"], types_peau: ["Tous types de peau"], tags: ["Solaire", KB],
  },
  {
    photo: "32 (3)", nom: "Madagascar Centella Probio-Cica Intensive Ampoule", marque: "SKIN1004", categorie: "Sérums & ampoules", contenance: "50 ml",
    description: "Ampoule intensive à la centella et aux probiotiques. Elle renforce la barrière cutanée et améliore la fermeté de la peau.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes.",
    actifs: ["Centella asiatica", "Probiotiques"], problemes: ["Sensibilité & rougeurs", "Anti-âge"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "32 (4)", nom: "Madagascar Centella Tone Brightening Capsule Ampoule", marque: "SKIN1004", categorie: "Sérums & ampoules", contenance: "100 ml",
    description: "Ampoule éclat à capsules, à la centella de Madagascar. Elle unifie le teint et ravive la luminosité de la peau.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes. Protection solaire le matin.",
    actifs: ["Centella asiatica"], problemes: ["Éclat & teint terne", "Taches pigmentaires"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "32 (5)", nom: "Madagascar Centella Ampoule", marque: "SKIN1004", categorie: "Sérums & ampoules", contenance: "55 ml",
    description: "Ampoule à l'extrait pur de centella de Madagascar. Légère comme de l'eau, elle apaise et hydrate les peaux sensibles et réactives.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes et tapoter.",
    actifs: ["Centella asiatica"], problemes: ["Sensibilité & rougeurs", "Hydratation & confort"], types_peau: ["Tous types de peau", "Peau sensible"], tags: ["Sérum", KB],
  },
  {
    photo: "32", nom: "VA Vitamin C 15 Serum", marque: "Cos De BAHA", categorie: "Sérums & ampoules", contenance: "30 ml",
    description: "Sérum à 15 % de vitamine C pure (acide ascorbique), avec vitamine B5 et acide hyaluronique. Il ravive l'éclat et atténue les taches.",
    mode_emploi: "Le matin, après le tonique, appliquer quelques gouttes, puis la protection solaire. Conserver à l'abri de la lumière.",
    actifs: ["Vitamine C", "Panthénol", "Acide hyaluronique"], problemes: ["Éclat & teint terne", "Taches pigmentaires"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "33 (1)", nom: "Retinol Cica Repair Ampoule", marque: "Innisfree", categorie: "Sérums & ampoules", contenance: "30 ml",
    description: "Ampoule au rétinol et à la cica. Elle lisse le grain de peau, atténue les marques d'imperfections et apaise.",
    mode_emploi: "Le soir, après le tonique, appliquer une petite quantité. Commencer deux à trois fois par semaine. Protection solaire le matin.",
    actifs: ["Rétinol", "Centella asiatica"], problemes: ["Imperfections & pores", "Anti-âge"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "33 (2)", nom: "TXA Niacinamide Capsule Cream", marque: "Medicube", categorie: "Crèmes & hydratants", contenance: "55 g",
    description: "Crème à capsules à l'acide tranexamique et à la niacinamide (5 %). Elle hydrate et aide à atténuer les taches.",
    mode_emploi: "Matin et soir, en dernière étape. Protection solaire le matin.",
    actifs: ["Acide tranexamique", "Niacinamide"], problemes: ["Taches pigmentaires", "Hydratation & confort"], types_peau: ["Tous types de peau"], tags: ["Crème", KB],
  },
  {
    photo: "33 (3)", nom: "TXA Niacinamide 15 Serum", marque: "Medicube", categorie: "Sérums & ampoules", contenance: "30 ml",
    description: "Sérum à 15 % d'acide tranexamique et de niacinamide. Il cible les taches et unifie le teint.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes. Protection solaire le matin.",
    actifs: ["Acide tranexamique", "Niacinamide"], problemes: ["Taches pigmentaires", "Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  {
    photo: "33 (4)", nom: "The Niacinamide 15 Serum", marque: "COSRX", categorie: "Sérums & ampoules", contenance: null,
    description: "Sérum à la niacinamide, à l'acétyl-glucosamine et au zinc PCA. Il régule le sébum et resserre l'apparence des pores.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes.",
    actifs: ["Niacinamide", "Zinc"], problemes: ["Imperfections & pores"], types_peau: ["Peau grasse", "Peau mixte"], tags: ["Sérum", KB],
  },
  {
    photo: "33 (5)", nom: "Vitamin C Brightening Serum 30150", marque: "Mediheal", categorie: "Sérums & ampoules", contenance: null,
    description: "Sérum éclat à la vitamine C et à la niacinamide. Il illumine, hydrate et unifie le teint.",
    mode_emploi: "Matin et soir, après le tonique, appliquer quelques gouttes. Protection solaire le matin.",
    actifs: ["Vitamine C", "Niacinamide"], problemes: ["Éclat & teint terne"], types_peau: ["Tous types de peau"], tags: ["Sérum", KB],
  },
  // 33 = doublon de la Centella Ampoule (32 (5)) : non importé
  {
    photo: "34 (1)", nom: "Intensive Care Dry Skin Repair", marque: "Vaseline", categorie: "Corps", contenance: "400 ml",
    description: "Lotion corps à l'extrait d'avoine pour les peaux sèches. Elle hydrate longtemps et laisse la peau douce, sans effet gras.",
    mode_emploi: "Appliquer chaque jour sur l'ensemble du corps, de préférence après la douche.",
    actifs: ["Avoine"], problemes: ["Hydratation & confort"], types_peau: ["Peau sèche"], tags: ["Lait"],
  },
  {
    photo: "34 (2)", nom: "Ceramide Ato Concentrate Cream", marque: "Illiyoon", categorie: "Corps", contenance: null,
    description: "Crème visage et corps aux céramides pour les peaux sèches et sensibles. Sans parfum, elle renforce la barrière cutanée et apaise les tiraillements.",
    mode_emploi: "Appliquer sur le visage et le corps autant que nécessaire, en particulier après la douche.",
    actifs: ["Céramides"], problemes: ["Hydratation & confort", "Sensibilité & rougeurs"], types_peau: ["Peau sèche", "Peau sensible"], tags: ["Lait", KB],
  },
  // 34 (3) = doublon de la Ceramide Ato Concentrate Cream : non importé
  {
    photo: "34 (4)", nom: "Fresh Moisture Lotion", marque: "Illiyoon", categorie: "Corps", contenance: null,
    description: "Lotion corps légère à la vitamine C et à la niacinamide, pour les peaux normales à grasses. Elle hydrate sans coller.",
    mode_emploi: "Appliquer sur l'ensemble du corps après la douche.",
    actifs: ["Vitamine C", "Niacinamide"], problemes: ["Hydratation & confort"], types_peau: ["Peau normale", "Peau grasse"], tags: ["Lait", KB],
  },
  {
    photo: "34 (5)", nom: "Ultra Repair Lotion", marque: "Illiyoon", categorie: "Corps", contenance: null,
    description: "Lotion corps au panthénol (5 %) et à la provitamine D pour les peaux très sèches. Elle nourrit et répare la peau qui tiraille.",
    mode_emploi: "Appliquer sur l'ensemble du corps après la douche, en insistant sur les zones les plus sèches.",
    actifs: ["Panthénol"], problemes: ["Hydratation & confort"], types_peau: ["Peau sèche"], tags: ["Lait", KB],
  },
  {
    photo: "34", nom: "Almond Smooth Body Lotion", marque: "Vaseline", categorie: "Corps", contenance: "600 ml",
    description: "Lotion corps à l'huile d'amande et à la provitamine B5 pour les peaux sèches et rugueuses. Elle hydrate durablement et adoucit la peau.",
    mode_emploi: "Appliquer chaque jour sur l'ensemble du corps, de préférence après la douche.",
    actifs: ["Huile d'amande", "Panthénol"], problemes: ["Hydratation & confort"], types_peau: ["Peau sèche"], tags: ["Lait"],
  },
  {
    photo: "35", nom: "Ceramide Ato 6.0 Top to Toe Wash", marque: "Illiyoon", categorie: "Corps", contenance: null,
    description: "Gel lavant doux des cheveux aux pieds, aux céramides et sans parfum, pour les peaux normales à sèches. Il nettoie sans dessécher.",
    mode_emploi: "Faire mousser sur la peau et les cheveux mouillés puis rincer abondamment.",
    actifs: ["Céramides"], problemes: ["Hydratation & confort", "Sensibilité & rougeurs"], types_peau: ["Peau normale", "Peau sèche"], tags: ["Gel", KB],
  },
];

// ---- Kits (créés désactivés : composition et remise à valider par la cliente) ----
export const KITS = [
  {
    nom: "Rituel double nettoyage",
    description: "Les deux étapes du nettoyage à la coréenne : une huile qui dissout maquillage et crème solaire, puis une mousse douce qui purifie sans dessécher.",
    produits: ["Madagascar Centella Light Cleansing Oil", "1025 Dokdo Cleanser"],
  },
  {
    nom: "Routine apaisante Centella",
    description: "Une routine courte autour de la centella de Madagascar pour les peaux sensibles : apaiser, hydrater, protéger.",
    produits: ["Madagascar Centella Ampoule", "Madagascar Centella Soothing Cream", "Madagascar Centella Air-Fit Suncream Light SPF30 PA++++"],
  },
  {
    nom: "Routine éclat anti-taches",
    description: "Un tonique éclat, un sérum ciblé contre les taches et la protection solaire indispensable pour que les résultats tiennent.",
    produits: ["Rice 70 Glow Milky Toner", "Niacinamide 10 + TXA 4 Serum", "Relief Sun : Rice + Probiotics SPF50+ PA++++"],
  },
];

// ---- Articles du Journal (brouillons : publie = false) ----
// image : nom du produit dont la photo illustre l'article
export const ARTICLES = [
  {
    titre: "Le double nettoyage, la base de la routine coréenne",
    type: "rituel",
    image: "Heartleaf Pore Control Cleansing Oil",
    contenu: [
      "Le double nettoyage est la première étape de la routine coréenne, et sans doute la plus importante. Le principe est simple : deux nettoyants complémentaires, l'un après l'autre.",
      "D'abord, une huile démaquillante sur peau sèche. Elle dissout ce que l'eau seule ne retire pas : maquillage, crème solaire, excès de sébum. Massez une minute, ajoutez un peu d'eau pour l'émulsionner, puis rincez.",
      "Ensuite, un nettoyant moussant ou en gel, doux et au pH faible. Il élimine les résidus restants et la transpiration, et prépare la peau aux soins.",
      "Le soir, le double nettoyage est recommandé dès que vous portez de la crème solaire ou du maquillage. Le matin, un seul nettoyant doux suffit.",
    ],
  },
  {
    titre: "Routine du matin : quatre gestes suffisent",
    type: "rituel",
    image: "Relief Sun : Rice + Probiotics SPF50+ PA++++",
    contenu: [
      "Une routine efficace n'a pas besoin d'être longue. Le matin, quatre gestes couvrent l'essentiel.",
      "1. Nettoyer avec un nettoyant doux, ou simplement à l'eau si votre peau est sèche.",
      "2. Hydrater avec un tonique ou une essence, appliqués en tapotant.",
      "3. Traiter avec un sérum adapté à votre préoccupation : vitamine C pour l'éclat, niacinamide pour les pores et les taches.",
      "4. Protéger avec une crème solaire, la vraie étape anti-âge et anti-taches. Sans elle, les autres soins perdent une grande partie de leur effet.",
    ],
  },
  {
    titre: "La protection solaire, tous les jours",
    type: "conseil",
    image: "Madagascar Centella Air-Fit Suncream Light SPF30 PA++++",
    contenu: [
      "Sous le soleil de Bamako, la protection solaire n'est pas réservée aux vacances : c'est un soin quotidien, quelle que soit la couleur de peau.",
      "Les UV accentuent les taches, marquent davantage les cicatrices d'imperfections et accélèrent le vieillissement de la peau. Ils traversent aussi les nuages et les vitres.",
      "Appliquez votre crème solaire en dernière étape le matin, en quantité généreuse (l'équivalent de deux doigts pour le visage et le cou). Renouvelez toutes les deux heures si vous êtes à l'extérieur.",
      "Les protections solaires coréennes ont des textures légères qui ne laissent pas de traces blanches, même sur les peaux foncées.",
    ],
  },
  {
    titre: "Taches pigmentaires : patience et régularité",
    type: "conseil",
    image: "Niacinamide 10 + TXA 4 Serum",
    contenu: [
      "Les taches brunes, marques d'imperfections et zones plus foncées sont une préoccupation fréquente, en particulier sur les peaux mates et noires.",
      "Plusieurs actifs aident à les atténuer : niacinamide, acide tranexamique, arbutine, vitamine C, acide azélaïque. Ils agissent progressivement : comptez au moins huit à douze semaines d'utilisation régulière.",
      "La protection solaire est indispensable. Sans elle, les taches reviennent ou foncent à nouveau, quel que soit le sérum utilisé.",
      "Évitez de multiplier les actifs forts en même temps : une peau irritée peut développer de nouvelles taches. Introduisez un produit à la fois.",
    ],
  },
  {
    titre: "Rétinal et rétinol : les introduire sans irriter",
    type: "conseil",
    image: "Seoul 1988 Serum Retinal Liposome 2% + Black Ginseng",
    contenu: [
      "Le rétinol et le rétinal sont des dérivés de la vitamine A. Ils lissent le grain de peau, atténuent les ridules et les marques. Le rétinal agit plus rapidement que le rétinol.",
      "Ils s'utilisent le soir uniquement. Commencez deux à trois soirs par semaine avec une petite quantité, puis augmentez selon la tolérance de votre peau.",
      "Des tiraillements ou de légères desquamations sont possibles les premières semaines. Une crème hydratante apaisante aide à les limiter.",
      "Ils rendent la peau plus sensible au soleil : la protection solaire le matin est obligatoire. Ils sont déconseillés pendant la grossesse et l'allaitement.",
    ],
  },
  {
    titre: "La centella asiatica, l'apaisante",
    type: "ingredient",
    image: "Madagascar Centella Ampoule",
    contenu: [
      "La centella asiatica est une plante utilisée depuis longtemps en médecine traditionnelle asiatique. En cosmétique, on la retrouve souvent sous le nom de « cica ».",
      "Elle apaise les rougeurs, aide la peau à se réparer et renforce la barrière cutanée. C'est un actif de choix pour les peaux sensibles, réactives ou fragilisées par des actifs plus forts.",
      "On la trouve dans tous les types de soins : huiles démaquillantes, ampoules, crèmes et même protections solaires.",
    ],
  },
  {
    titre: "La niacinamide, l'actif polyvalent",
    type: "ingredient",
    image: "The Niacinamide 15 Serum",
    contenu: [
      "La niacinamide, ou vitamine B3, est l'un des actifs les plus polyvalents : elle régule le sébum, resserre l'apparence des pores, renforce la barrière cutanée et aide à atténuer les taches.",
      "Elle est bien tolérée par la plupart des peaux et s'associe facilement aux autres soins.",
      "Les sérums très concentrés (15 à 20 %) sont à introduire progressivement. Une concentration autour de 5 à 10 % suffit souvent pour un usage quotidien.",
    ],
  },
  {
    titre: "Le heartleaf, star des peaux sensibles",
    type: "ingredient",
    image: "Heartleaf 77% Soothing Toner",
    contenu: [
      "Le heartleaf (Houttuynia cordata) est une plante aux feuilles en forme de cœur, très utilisée en Corée.",
      "Apaisant et purifiant, il calme les rougeurs, aide à réguler l'excès de sébum et convient aux peaux sensibles comme aux peaux à imperfections.",
      "On le retrouve dans des toniques, des pads, des huiles démaquillantes et des sérums.",
    ],
  },
];
