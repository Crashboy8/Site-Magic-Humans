/*
 * Création guidée : brouillon des réponses (saisies en vrac) et génération de la carte.
 * Aucun accès au DOM.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const COULEURS = ['#F2A65A', '#5DB88A', '#9A8CDB', '#E5738E', '#F2C53D', '#6FB7D6', '#C99AD0', '#B5C97F'];
  const ICONES_REGION = ['heart-handshake', 'sprout', 'graduation-cap', 'drama', 'zap', 'compass', 'star', 'sun'];
  const MAX_REGIONS = 8;
  const TERRITOIRES_PAR_REGION = 3;

  // Indices pour deviner le domaine d'une compétence saisie librement.
  const MOTS_DOMAINE = [
    ['numerique', ['excel', 'powerpoint', 'word', 'ia', 'informatique', 'numerique', 'code', 'logiciel', 'canva', 'notion', 'site', 'web']],
    ['langues', ['anglais', 'espagnol', 'allemand', 'italien', 'portugais', 'chinois', 'arabe', 'langue']],
    ['organisation', ['compta', 'administratif', 'admin', 'factur', 'planning', 'gestion']],
    ['corps', ['sport', 'danse', 'yoga', 'course', 'jonglage', 'escalade', 'natation', 'velo', 'arts martiaux', 'musculation']],
    ['business', ['vente', 'negociation', 'prospection', 'marketing', 'commercial', 'business']],
    ['scene', ['theatre', 'impro', 'scene', 'chant', 'musique', 'clown']],
    ['pedagogie', ['former', 'formation', 'enseigner', 'pedagogie', 'cours']],
    ['communication', ['ecrire', 'redaction', 'reseaux', 'podcast', 'video', 'parole']]
  ].concat(CT.i18n.langue === 'en' ? [
    // Mots anglais : seulement pour une carte en anglais (« ai » ne doit pas attraper « aider »).
    ['numerique', ['ai', 'software', 'digital', 'website', 'coding', 'computer', 'spreadsheet']],
    ['langues', ['english', 'spanish', 'german', 'italian', 'portuguese', 'chinese', 'arabic', 'language']],
    ['organisation', ['accounting', 'bookkeeping', 'invoic', 'paperwork', 'scheduling', 'management']],
    ['corps', ['dance', 'dancing', 'running', 'juggling', 'climbing', 'swimming', 'cycling', 'martial arts', 'fitness']],
    ['business', ['sales', 'selling', 'negotiat', 'prospecting']],
    ['scene', ['theater', 'theatre', 'stage', 'singing', 'music', 'clown']],
    ['pedagogie', ['teach', 'training', 'course', 'lesson']],
    ['communication', ['writing', 'social media', 'speaking']]
  ] : []);

  // Icône devinée d'après un début de mot (le premier qui correspond l'emporte).
  const MOTS_ICONE = [
    ['coach', 'compass'], ['mentor', 'sprout'], ['ecout', 'ear'], ['accueil', 'hand-heart'], ['sourire', 'smile'], ['rire', 'laugh'], ['humour', 'laugh'],
    ['anim', 'party-popper'], ['dynamis', 'zap'], ['energ', 'zap'], ['federe', 'users'], ['equipe', 'users'], ['communaut', 'users-round'], ['troupe', 'users'],
    ['impro', 'drama'], ['theatre', 'drama'], ['scene', 'clapperboard'], ['chant', 'mic-vocal'], ['music', 'music'], ['rime', 'feather'], ['dans', 'footprints'],
    ['jongl', 'orbit'], ['sport', 'dumbbell'], ['yoga', 'flower-2'], ['marche', 'footprints'], ['course', 'person-standing'],
    ['transmet', 'graduation-cap'], ['enseign', 'graduation-cap'], ['pedago', 'graduation-cap'], ['form', 'clipboard-list'], ['atelier', 'lightbulb'], ['seminaire', 'presentation'],
    ['parole', 'mic'], ['message', 'megaphone'], ['ecri', 'pen-line'], ['redact', 'pen-line'], ['podcast', 'podcast'], ['video', 'video'], ['reseau', 'share-2'],
    ['excel', 'sheet'], ['powerpoint', 'presentation'], ['ia', 'bot'], ['code', 'code'], ['site', 'globe'],
    ['anglais', 'languages'], ['espagnol', 'languages'], ['allemand', 'languages'], ['italien', 'languages'], ['langue', 'languages'],
    ['vente', 'handshake'], ['negoci', 'scale'], ['compta', 'calculator'], ['budget', 'wallet'], ['admin', 'folder-open'], ['factur', 'receipt'],
    ['organis', 'calendar-check'], ['projet', 'kanban'], ['revel', 'gem'], ['talent', 'gem'], ['conseil', 'message-circle'], ['discut', 'messages-square']
  ].concat(CT.i18n.langue === 'en' ? [
    ['listen', 'ear'], ['welcom', 'hand-heart'], ['smil', 'smile'], ['laugh', 'laugh'], ['humor', 'laugh'], ['humour', 'laugh'], ['facilitat', 'party-popper'],
    ['energ', 'zap'], ['team', 'users'], ['communit', 'users-round'], ['stage', 'clapperboard'], ['sing', 'mic-vocal'], ['rhym', 'feather'], ['danc', 'footprints'],
    ['juggl', 'orbit'], ['walk', 'footprints'], ['run', 'person-standing'], ['teach', 'graduation-cap'], ['train', 'clipboard-list'], ['workshop', 'lightbulb'],
    ['speak', 'mic'], ['writ', 'pen-line'], ['social', 'share-2'], ['ai', 'bot'], ['website', 'globe'], ['english', 'languages'], ['spanish', 'languages'],
    ['german', 'languages'], ['language', 'languages'], ['sell', 'handshake'], ['sales', 'handshake'], ['negotiat', 'scale'], ['accounting', 'calculator'],
    ['invoic', 'receipt'], ['project', 'kanban'], ['reveal', 'gem'], ['advice', 'message-circle'], ['conversation', 'messages-square']
  ] : []);

  const N = (s) => CT.regles.normaliserTexte(s);

  const LONGUEUR_ELEMENT = 60;
  const LONGUEUR_REGION = 40;

  function nouvelElement(texte) {
    return { id: CT.schema.nouvelId('el'), texte: String(texte).trim().slice(0, LONGUEUR_ELEMENT) };
  }

  // Longueur maximale d'un élément saisi (un nom de région est plus court).
  function longueurMax(liste) {
    return liste === 'regions' ? LONGUEUR_REGION : LONGUEUR_ELEMENT;
  }

  // Éléments d'une saisie en vrac qui dépassent la longueur permise (à raccourcir avant l'ajout).
  function tropLongs(liste, texte) {
    return decouper(texte).filter((t) => t.length > longueurMax(liste));
  }

  function nouveauBrouillon() {
    return {
      version: 1,
      etape: 1,
      talent: { nom: '', filRouge: '' },
      regions: [],
      moments: [], // { id, texte, zone } : zone = id de région, 'ile' ou null
      conquises: [], // { id, texte, distance, elargit, zone }
      frontieres: [], // { id, texte, zone }
      deleguer: [], // { id, texte }
      boussole: null // textes reçus de la Boussole, affichés en rappel (voir boussole.js)
    };
  }

  // « Accueillir, animer ; coacher » ou une ligne par élément → éléments distincts.
  function decouper(texte) {
    const vus = new Set();
    return String(texte || '').split(/[\n,;•]+/).map((t) => t.replace(/^[-*\s]+/, '').trim()).filter((t) => {
      const n = N(t);
      if (!n || vus.has(n)) return false;
      vus.add(n);
      return true;
    });
  }

  // Ajoute des éléments à une liste du brouillon, sans doublon.
  function ajouter(brouillon, liste, texte, extra) {
    const existants = new Set(brouillon[liste].map((x) => N(x.texte || x.nom)));
    const ajoutes = [];
    decouper(texte).forEach((t) => {
      if (existants.has(N(t))) return;
      if (liste === 'regions') {
        if (brouillon.regions.length >= MAX_REGIONS) return;
        const i = brouillon.regions.length;
        brouillon.regions.push({ id: CT.schema.nouvelId('reg'), nom: t.slice(0, 40), couleur: COULEURS[i % COULEURS.length], icone: ICONES_REGION[i % ICONES_REGION.length] });
      } else {
        brouillon[liste].push(Object.assign(nouvelElement(t), { zone: null }, extra || {}));
      }
      existants.add(N(t));
      ajoutes.push(t);
    });
    return ajoutes;
  }

  // Déplace une région d'un cran : deux régions qui se suivent seront voisines sur la carte.
  function deplacerRegion(brouillon, id, sens) {
    const i = brouillon.regions.findIndex((r) => r.id === id);
    const j = i + (sens < 0 ? -1 : 1);
    if (i < 0 || j < 0 || j >= brouillon.regions.length) return false;
    const [r] = brouillon.regions.splice(i, 1);
    brouillon.regions.splice(j, 0, r);
    return true;
  }

  function retirer(brouillon, liste, id) {
    brouillon[liste] = brouillon[liste].filter((x) => x.id !== id);
    if (liste === 'regions') {
      ['moments', 'conquises', 'frontieres'].forEach((l) => brouillon[l].forEach((x) => { if (x.zone === id) x.zone = null; }));
    }
  }

  // Éléments à ranger dans une région (les conquises écartées par le filtre n'en font pas partie).
  function aRanger(brouillon) {
    return [].concat(
      brouillon.moments.map((x) => ({ liste: 'moments', el: x })),
      brouillon.conquises.filter((x) => x.elargit !== false).map((x) => ({ liste: 'conquises', el: x })),
      brouillon.frontieres.map((x) => ({ liste: 'frontieres', el: x }))
    );
  }

  function ranger(brouillon, liste, id, zone) {
    const el = brouillon[liste].find((x) => x.id === id);
    if (!el) return false;
    const valide = zone === null || zone === 'ile' || brouillon.regions.some((r) => r.id === zone);
    if (!valide) return false;
    el.zone = zone;
    el.raison = '';
    el.suggere = true;
    return true;
  }

  /*
   * Pré-rangement à l'arrivée sur le regroupement : chaque élément va dans la région la plus proche
   * (mots communs avec son nom, même grand domaine), avec une courte explication. La personne valide
   * ou déplace. Un moment de flow qui ne colle à aucune région devient une île ; les autres éléments
   * restent à ranger. Un élément n'est évalué qu'une fois, pour ne pas défaire un choix.
   */
  function preRanger(brouillon) {
    const idees = CT.idees;
    const regions = brouillon.regions.map((r) => ({ r, racines: idees.racines(r.nom), grands: idees.domainesDe(r.nom) }));
    const nomDomaine = (cle) => { const d = idees.DOMAINES.find((x) => x[0] === cle); return d ? T(d[1]) : cle; };
    let changes = 0;
    aRanger(brouillon).forEach(({ liste, el }) => {
      if (el.suggere || el.zone) return;
      el.suggere = true;
      changes++;
      const mots = idees.racines(el.texte);
      const grands = idees.domainesDe(el.texte);
      let meilleur = null;
      regions.forEach((p) => {
        // Les éléments déjà rangés à la main dans la région comptent aussi comme indices.
        const freres = aRanger(brouillon).filter((x) => x.el.zone === p.r.id && !x.el.raison);
        const communs = [...mots].filter((m) => p.racines.has(m)).length;
        const domaine = [...grands].filter((d) => p.grands.has(d));
        const parentes = freres.filter((f) => [...idees.racines(f.el.texte)].some((m) => mots.has(m))).length;
        const score = 3 * communs + 2 * (domaine.length ? 1 : 0) + parentes;
        if (score >= 2 && (!meilleur || score > meilleur.score)) meilleur = { p, score, communs, domaine, parentes };
      });
      if (meilleur) {
        el.zone = meilleur.p.r.id;
        el.raison = meilleur.communs ? T('Même idée que « {nom} »', { nom: meilleur.p.r.nom })
          : meilleur.domaine.length ? T('Même univers que « {nom} » ({domaine})', { nom: meilleur.p.r.nom, domaine: nomDomaine(meilleur.domaine[0]).toLowerCase() })
            : T('Proche d\'éléments de « {nom} »', { nom: meilleur.p.r.nom });
      } else if (liste === 'moments') {
        el.zone = 'ile';
        el.raison = T('Ne colle à aucune région : une île de flow');
      }
    });
    return changes;
  }

  // Icône et domaine : d'abord la bibliothèque, puis quelques mots-clés.
  function deviner(texte) {
    const n = N(texte);
    const entree = CT.bibliotheque ? CT.bibliotheque.ENTREES.find((x) => [x.nom].concat(x.alias).some((a) => N(a) === n)) : null;
    if (entree) return { icone: entree.icone, domaine: entree.domaine, bibliothequeId: entree.id };
    const trouve = MOTS_DOMAINE.find(([, mots]) => mots.some((m) => (' ' + n + ' ').includes(' ' + m)));
    const mots = n.split(/[^a-z0-9]+/).filter(Boolean);
    const icone = MOTS_ICONE.find(([debut]) => mots.some((m) => m.startsWith(debut)));
    return { icone: icone ? icone[1] : 'sparkles', domaine: trouve ? trouve[0] : null, bibliothequeId: null };
  }

  /*
   * Génère une carte complète à partir du brouillon.
   * - moments rangés dans une région → territoire natal ; « hors de mon talent » → île ;
   * - conquises (sauf celles écartées par le filtre) → territoires conquis, proches ou éloignés ;
   * - frontières → frontières ; à déléguer → zone à déléguer ;
   * - un élément non rangé rejoint la première région ;
   * - une région sans territoire natal reçoit son propre nom comme cœur.
   */
  function genererCarte(brouillon) {
    const regions = brouillon.regions.map((r, i) => ({
      id: r.id, nom: r.nom, couleur: r.couleur || COULEURS[i % COULEURS.length], icone: r.icone || ICONES_REGION[i % ICONES_REGION.length],
      // Sans autre indication, chaque région est voisine des régions saisies juste avant et juste après.
      voisines: brouillon.regions.length > 1 ? [brouillon.regions[(i + 1) % brouillon.regions.length].id, brouillon.regions[(i - 1 + brouillon.regions.length) % brouillon.regions.length].id] : []
    }));
    const premiere = regions[0] ? regions[0].id : null;
    const regionDe = (zone) => (zone && zone !== 'ile' ? zone : premiere);
    const competences = [];
    const ile = { id: 'ile-flow', nom: T('Îles de flow') };
    let avecIle = false;
    const vus = new Set();

    function comp(texte, statut, champs) {
      const n = N(texte);
      if (!n || vus.has(n)) return;
      vus.add(n);
      const g = deviner(texte);
      competences.push(Object.assign({
        id: CT.schema.nouvelId('comp'), nom: texte, icone: g.icone, statut, domaine: g.domaine, distance: 'proche',
        voisines: [], exploree: true, bibliothequeId: g.bibliothequeId
      }, champs));
    }

    brouillon.moments.forEach((m) => {
      if (m.zone === 'ile') { avecIle = true; comp(m.texte, 'ile', { ileId: ile.id }); } else comp(m.texte, 'natale', { regionId: regionDe(m.zone) });
    });
    regions.forEach((r) => {
      if (!competences.some((c) => c.statut === 'natale' && c.regionId === r.id)) comp(r.nom, 'natale', { regionId: r.id, icone: r.icone });
    });
    brouillon.conquises.filter((x) => x.elargit !== false).forEach((x) => {
      if (x.zone === 'ile') { avecIle = true; comp(x.texte, 'ile', { ileId: ile.id }); return; }
      comp(x.texte, 'conquise', { regionId: regionDe(x.zone), distance: x.distance === 'eloignee' ? 'eloignee' : 'proche' });
    });
    brouillon.frontieres.forEach((x) => {
      if (x.zone === 'ile') { avecIle = true; comp(x.texte, 'ile', { ileId: ile.id }); return; }
      comp(x.texte, 'frontiere', { regionId: regionDe(x.zone) });
    });
    brouillon.deleguer.forEach((x) => comp(x.texte, 'a_deleguer', {}));

    const carte = CT.schema.normaliser({
      talent: { nom: brouillon.talent.nom, filRouge: brouillon.talent.filRouge },
      regions,
      iles: avecIle ? [ile] : [],
      competences,
      momentsDeFlow: [],
      objectifs: [],
      preferences: Object.assign({}, CT.schema.PREFERENCES_DEFAUT)
    });
    // Territoires à conquérir autour de la carte (brouillard de guerre) : trois par région, proches de ses sous-talents.
    if (CT.suggestions && regions.length) {
      CT.suggestions.pourRegions(carte, TERRITOIRES_PAR_REGION).forEach((c) => carte.competences.push(c));
      return CT.schema.normaliser(carte);
    }
    return carte;
  }

  function normaliserBrouillon(brut) {
    const b = nouveauBrouillon();
    if (!brut || typeof brut !== 'object') return b;
    b.etape = Math.min(9, Math.max(1, Math.round(Number(brut.etape)) || 1));
    b.talent = { nom: String((brut.talent && brut.talent.nom) || '').slice(0, 120), filRouge: String((brut.talent && brut.talent.filRouge) || '').slice(0, 160) };
    const liste = (v) => (Array.isArray(v) ? v.filter((x) => x && x.id) : []);
    b.regions = liste(brut.regions).slice(0, MAX_REGIONS).map((r) => ({ id: String(r.id), nom: String(r.nom || '').slice(0, 40), couleur: r.couleur, icone: r.icone }));
    const ids = new Set(b.regions.map((r) => r.id));
    const zone = (z) => (z === 'ile' || ids.has(z) ? z : null);
    const suggestion = (x) => ({ suggere: Boolean(x.suggere), raison: typeof x.raison === 'string' ? x.raison.slice(0, 200) : '' });
    b.moments = liste(brut.moments).map((x) => Object.assign({ id: String(x.id), texte: String(x.texte || ''), zone: zone(x.zone) }, suggestion(x)));
    b.conquises = liste(brut.conquises).map((x) => Object.assign({ id: String(x.id), texte: String(x.texte || ''), zone: zone(x.zone),
      distance: x.distance === 'eloignee' ? 'eloignee' : 'proche', elargit: x.elargit === false ? false : x.elargit === true ? true : null }, suggestion(x)));
    b.frontieres = liste(brut.frontieres).map((x) => Object.assign({ id: String(x.id), texte: String(x.texte || ''), zone: zone(x.zone) }, suggestion(x)));
    b.deleguer = liste(brut.deleguer).map((x) => ({ id: String(x.id), texte: String(x.texte || '') }));
    const bo = brut.boussole;
    if (bo && typeof bo === 'object') {
      const t = (v) => (typeof v === 'string' ? v.slice(0, 1000) : '');
      const phrases = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.slice(0, 1000)).slice(0, 12) : []);
      b.boussole = { mecanisme: t(bo.mecanisme), contexte: t(bo.contexte), benefice: t(bo.benefice), antiContexte: t(bo.antiContexte),
        reussites: phrases(bo.reussites), echecs: phrases(bo.echecs), source: bo.source === 'quiz' ? 'quiz' : '' };
    }
    return b;
  }

  CT.creation = { MAX_REGIONS, longueurMax, tropLongs, nouveauBrouillon, decouper, ajouter, deplacerRegion, retirer, aRanger, ranger, preRanger, deviner, genererCarte, normaliserBrouillon };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
