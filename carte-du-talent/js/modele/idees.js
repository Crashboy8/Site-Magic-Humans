/*
 * Idées proposées pendant la création guidée : de quoi se reconnaître, regroupées par grands domaines.
 * Chaque question a sa liste (sous-talents, moments de flow, compétences apprises).
 * Aucun accès au DOM.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const DOMAINES = [
    ['sport', 'Sport et corps'],
    ['art', 'Art et scène'],
    ['relationnel', 'Relationnel'],
    ['creation', 'Création'],
    ['analyse', 'Analyse et réflexion'],
    ['organisation', 'Organisation'],
    ['nature', 'Nature'],
    ['technique', 'Technique et numérique'],
    ['communication', 'Communication'],
    ['transmission', 'Transmission']
  ];

  const IDEES = {
    // Sous-talents (régions) : 40 caractères au plus.
    regions: {
      sport: ['Bouger', 'Se dépasser', 'Entraîner', 'Danser', 'Prendre soin du corps'],
      art: ['Mettre en scène', 'Jouer', 'Faire rire', 'Chanter', 'Émouvoir'],
      relationnel: ['Accueillir', 'Écouter', 'Fédérer', 'Révéler les gens', 'Réconcilier'],
      creation: ['Créer', 'Imaginer', 'Inventer', 'Embellir', 'Faire de ses mains'],
      analyse: ['Analyser', 'Comprendre', 'Chercher', 'Simplifier', 'Décider'],
      organisation: ['Organiser', 'Coordonner', 'Structurer', 'Planifier', 'Fiabiliser'],
      nature: ['Cultiver', 'Explorer la nature', 'Protéger le vivant', 'Prendre l\'air', 'Observer'],
      technique: ['Bricoler', 'Réparer', 'Automatiser', 'Construire', 'Programmer'],
      communication: ['Raconter', 'Convaincre', 'Écrire', 'Parler en public', 'Faire connaître'],
      transmission: ['Transmettre', 'Former', 'Accompagner', 'Vulgariser', 'Inspirer']
    },
    // Moments de flow : 60 caractères au plus.
    moments: {
      sport: ['Courir', 'Nager', 'Faire du vélo', 'Grimper', 'Danser', 'Faire du yoga', 'Randonner', 'Jouer en équipe'],
      art: ['Improviser sur scène', 'Chanter', 'Jouer de la musique', 'Jongler', 'Faire de la magie', 'Jouer la comédie', 'Faire rire un groupe'],
      relationnel: ['Écouter quelqu\'un', 'Coacher quelqu\'un', 'Accueillir des gens', 'Aider à débloquer une situation', 'Réconcilier deux personnes', 'Discuter pendant des heures', 'Rencontrer des inconnus'],
      creation: ['Dessiner', 'Peindre', 'Cuisiner', 'Écrire un texte', 'Prendre des photos', 'Monter une vidéo', 'Composer', 'Coudre ou fabriquer', 'Imaginer un jeu'],
      analyse: ['Résoudre un problème complexe', 'Analyser des chiffres', 'Faire une recherche approfondie', 'Faire une synthèse', 'Comprendre un système', 'Monter une stratégie'],
      organisation: ['Organiser un événement', 'Planifier un projet', 'Mettre de l\'ordre', 'Coordonner une équipe', 'Optimiser un process', 'Préparer un voyage'],
      nature: ['Jardiner', 'Marcher en forêt', 'Observer les oiseaux', 'Camper', 'Soigner des plantes', 'Regarder les étoiles'],
      technique: ['Bricoler', 'Réparer un objet', 'Programmer', 'Automatiser une tâche', 'Construire quelque chose', 'Démonter pour comprendre'],
      communication: ['Animer un atelier', 'Prendre la parole en public', 'Raconter une histoire', 'Enregistrer un podcast', 'Rédiger un article', 'Débattre'],
      transmission: ['Expliquer simplement', 'Former un groupe', 'Préparer un cours', 'Mentorer quelqu\'un', 'Animer un séminaire', 'Faire découvrir une passion']
    },
    // Compétences apprises ou à apprendre : 60 caractères au plus.
    conquises: {
      sport: ['Natation', 'Vélo', 'Yoga', 'Arts martiaux', 'Musculation', 'Randonnée', 'Escalade', 'Danse'],
      art: ['Théâtre', 'Chant', 'Guitare', 'Piano', 'Magie', 'Improvisation', 'Percussions'],
      relationnel: ['Écoute active', 'Communication non violente', 'Gestion des conflits', 'Médiation', 'Networking', 'Relation client', 'Leadership'],
      creation: ['Dessin', 'Peinture', 'Photographie', 'Montage vidéo', 'Cuisine', 'Couture', 'Écriture créative', 'Design graphique (Canva…)'],
      analyse: ['Analyse de données', 'Statistiques', 'Recherche et documentation', 'Stratégie', 'Résolution de problèmes', 'Synthèse'],
      organisation: ['Gestion de projet', 'Gestion du temps', 'Planification', 'Comptabilité', 'Gérer un budget', 'Administratif', 'Logistique'],
      nature: ['Jardinage', 'Permaculture', 'Observation de la nature', 'Apiculture', 'Cueillette et plantes'],
      technique: ['Excel', 'Programmation', 'Python', 'Créer un site web', 'IA générative', 'Bricolage', 'Électronique', 'Mécanique'],
      communication: ['Anglais', 'Espagnol', 'Prise de parole en public', 'Storytelling', 'Réseaux sociaux', 'Rédaction', 'Podcast', 'Négociation'],
      transmission: ['Préparer une formation', 'Facilitation d\'ateliers', 'Mentorat', 'Coaching', 'Animer en visio', 'Concevoir un cours', 'Ludopédagogie']
    }
  };
  // Ce que tu aimerais apprendre : mêmes idées que ce que tu as appris.
  IDEES.frontieres = IDEES.conquises;

  const COMPTE_PAR_DOMAINE = 3; // idées visibles par domaine avant « Voir plus »

  // Idées d'une question, pas encore saisies, par domaine : { cle, nom, idees: [{ texte, plus }] }.
  function proposer(liste, dejaSaisis) {
    const source = IDEES[liste];
    if (!source) return [];
    const pris = new Set((dejaSaisis || []).map((t) => CT.regles.normaliserTexte(t)));
    return DOMAINES.map(([cle, nom]) => ({
      cle,
      nom: T(nom),
      idees: (source[cle] || []).map((t) => T(t)).filter((t) => !pris.has(CT.regles.normaliserTexte(t)))
        .map((texte, i) => ({ texte, plus: i >= COMPTE_PAR_DOMAINE }))
    })).filter((g) => g.idees.length);
  }

  function compter(liste) {
    const source = IDEES[liste] || {};
    return Object.values(source).reduce((n, l) => n + l.length, 0);
  }

  // Domaine de la bibliothèque → grand domaine des idées.
  const DOMAINE_BIBLIOTHEQUE = {
    corps: 'sport', scene: 'art', animation: 'art', relation: 'relationnel', creation: 'creation', analyse: 'analyse', organisation: 'organisation',
    nature: 'nature', technique: 'technique', numerique: 'technique', communication: 'communication', langues: 'communication', business: 'communication',
    pedagogie: 'transmission'
  };

  const MOTS_VIDES = new Set(['dans', 'avec', 'pour', 'sans', 'chez', 'sur', 'des', 'les', 'une', 'aux', 'son', 'ses', 'mes', 'ton', 'tes', 'qui', 'que', 'tout', 'tous', 'plus', 'faire', 'quelqu', 'quelque', 'chose', 'gens']);

  // Racines (5 lettres) des mots utiles d'un texte : « coacher » et « coaching » se rejoignent.
  function racines(texte) {
    return new Set(CT.regles.normaliserTexte(texte).split(/[^a-z0-9]+/).filter((m) => m.length >= 4 && !MOTS_VIDES.has(m)).map((m) => m.slice(0, 5)));
  }

  let indexIdees = null;
  function index() {
    if (indexIdees) return indexIdees;
    indexIdees = [];
    Object.keys(IDEES).forEach((liste) => Object.keys(IDEES[liste]).forEach((cle) => IDEES[liste][cle].forEach((t) => indexIdees.push({ cle, racines: racines(T(t)) }))));
    return indexIdees;
  }

  // Grands domaines d'un texte libre : par la bibliothèque (nom exact), puis par mots communs avec les idées.
  // Seuls les domaines qui ont le plus de mots en commun sont gardés (« Préparer un cours » : transmission).
  function domainesDe(texte) {
    const points = {};
    const n = CT.regles.normaliserTexte(texte);
    const entree = CT.bibliotheque && CT.bibliotheque.ENTREES.find((x) => [x.nom].concat(x.alias).some((a) => CT.regles.normaliserTexte(a) === n));
    if (entree && DOMAINE_BIBLIOTHEQUE[entree.domaine]) points[DOMAINE_BIBLIOTHEQUE[entree.domaine]] = 100;
    const r = racines(texte);
    if (r.size) {
      index().forEach((i) => {
        const communs = [...i.racines].filter((x) => r.has(x)).length;
        if (communs) points[i.cle] = Math.max(points[i.cle] || 0, communs);
      });
    }
    const max = Math.max(0, ...Object.values(points));
    return new Set(Object.keys(points).filter((k) => points[k] === max));
  }

  CT.idees = { DOMAINES, IDEES, DOMAINE_BIBLIOTHEQUE, proposer, compter, racines, domainesDe };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
