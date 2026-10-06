/*
 * Orientation pro : fiche d'apprentissage d'une compétence (temps, facilité, premières actions),
 * « Je l'ai déjà », bilan d'acquis, prochaine compétence, plan sur 30 jours, lien avec le talent,
 * infos des pistes (statut, revenu indicatif, exemple) et synthèse d'une page.
 * Données : js/modele/orientation-donnees.js. Modifie la carte en place, sans jamais toucher au DOM.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;
  const D = CT.orientationDonnees;
  const N = (s) => CT.regles.normaliserTexte(s);
  const JOUR = 24 * 3600 * 1000;
  const ACQUIS = ['natale', 'conquise', 'ile'];
  const HORS_JEU = ['a_deleguer', 'ressource'];
  const TOTAL_PLAN = 12;
  const EFFORT_FACILITE = { facile: 0.7, accessible: 1, exigeant: 1.4 };
  const LIBELLES_FACILITE = { facile: T('Facile pour toi'), accessible: T('Accessible'), exigeant: T('Exigeant') };
  const LIBELLES_ALIGNEMENT = { fort: T('Très alignée avec ton talent'), moyen: T('En partie alignée avec ton talent'), faible: T('Peu alignée avec ton talent') };

  const iso = (maintenant) => new Date(maintenant || Date.now()).toISOString();

  // Compétence de la carte qui correspond à une entrée de la bibliothèque, ou null.
  function surLaCarte(carte, entree) {
    return carte.competences.find((c) => CT.pistes.memeEntree(c, entree)) || null;
  }

  // ---------- C. Fiche d'apprentissage ----------

  function duree(entree) {
    const cle = D.DUREE[entree.id] || D.DUREE_DOMAINE[entree.domaine] || 'moyen';
    return Object.assign({ cle }, D.DUREES[cle], { libelle: T(D.DUREES[cle].libelle) });
  }

  // Lien dans un sens (l'entrée cite la compétence) ou dans l'autre (l'entrée de la compétence cite l'entrée).
  function lie(c, entree) {
    const n = ' ' + N(c.nom) + ' ';
    if (entree.liens.some((l) => n.includes(' ' + l + ' '))) return true;
    const autre = c.bibliothequeId ? CT.bibliotheque.trouver(c.bibliothequeId) : null;
    if (!autre) return false;
    const noms = [entree.nom].concat(entree.alias).map(N);
    return autre.liens.some((l) => noms.includes(l));
  }

  /*
   * Facile, accessible ou exigeant pour cette personne :
   * points = 2 × min(3, appuis) + min(3, même domaine) − pénalité de durée (court 0, moyen 1, long 2, très long 3).
   * Appui : compétence liée déjà acquise (natale, conquise, île : 1) ou en conquête (0,5).
   * Facile si points ≥ 4, accessible de 1 à 3, exigeant en dessous.
   */
  function facilite(carte, entree) {
    const d = duree(entree);
    const appuis = [];
    let poids = 0;
    carte.competences.forEach((c) => {
      if (CT.pistes.memeEntree(c, entree)) return;
      const p = ACQUIS.includes(c.statut) ? 1 : c.statut === 'frontiere' ? 0.5 : 0;
      if (p && lie(c, entree)) { poids += p; appuis.push(c); }
    });
    const memeDomaine = carte.competences.filter((c) => c.domaine === entree.domaine && ['natale', 'conquise'].includes(c.statut) && !CT.pistes.memeEntree(c, entree)).length;
    const points = 2 * Math.min(3, poids) + Math.min(3, memeDomaine) - d.penalite;
    const cle = points >= 4 ? 'facile' : points >= 1 ? 'accessible' : 'exigeant';
    appuis.sort((a, b) => (ACQUIS.includes(b.statut) ? 1 : 0) - (ACQUIS.includes(a.statut) ? 1 : 0) || a.nom.localeCompare(b.nom, 'fr'));
    let raison;
    if (appuis.length) raison = T('Tu t\'appuies sur {noms}.', { noms: appuis.slice(0, 2).map((c) => T('« {nom} »', { nom: CT.bibliotheque.nomAffiche(c) })).join(T(' et ')) });
    else if (memeDomaine) raison = T('Tu connais déjà le domaine {domaine}.', { domaine: CT.schema.DOMAINES[entree.domaine].nom.toLowerCase() });
    else raison = T('Nouveau territoire pour toi : compte un peu plus de temps, c\'est normal.');
    return { cle, libelle: LIBELLES_FACILITE[cle], points, raison, appuis: appuis.map((c) => c.id) };
  }

  function actions(entree) {
    const source = D.ACTIONS[entree.id] || D.ACTIONS_DOMAINE[entree.domaine] || D.ACTIONS_DOMAINE.organisation;
    return source.map((t) => T(t, { nom: entree.nom }));
  }

  // Fiche complète : { entree, duree, facilite, actions } ou null.
  function fiche(carte, entreeId) {
    const entree = CT.bibliotheque.trouver(entreeId);
    return entree ? { entree, duree: duree(entree), facilite: facilite(carte, entree), actions: actions(entree) } : null;
  }

  // Points de pourcentage qu'une piste gagnerait si la compétence était conquise (approximation, avant bonus de flow).
  function gain(carte, piste, entree, maintenant) {
    const i = piste.requis.indexOf(entree.id);
    if (i < 0) return 0;
    const somme = piste.requis.reduce((s, x, k) => s + (k < 2 ? 2 : 1), 0);
    const niveau = CT.pistes.niveauSur(carte, entree, maintenant).niveau;
    return Math.round(100 * 0.85 * (i < 2 ? 2 : 1) / somme * (1 - niveau));
  }

  // Pistes qui demandent cette compétence, celles qu'elle fait le plus avancer d'abord.
  function pistesPour(carte, entreeId, nombre, maintenant) {
    const entree = CT.bibliotheque.trouver(entreeId);
    if (!entree) return [];
    return CT.pistes.PISTES.filter((p) => p.requis.includes(entree.id))
      .map((p) => { const e = CT.pistes.evaluer(carte, p.id, maintenant); return { piste: p, pourcentage: e.pourcentage, gain: gain(carte, p, entree, maintenant), visee: e.visee }; })
      .sort((a, b) => b.gain - a.gain || b.pourcentage - a.pourcentage || a.piste.nom.localeCompare(b.piste.nom, 'fr'))
      .slice(0, nombre || 3);
  }

  // ---------- A. « Je l'ai déjà » ----------

  /*
   * La compétence rejoint les territoires conquis. Déjà sur la carte (à conquérir ou en conquête) : elle change de statut,
   * sans bouger si elle reste dans le même groupe. Absente : elle est ajoutée là où la bibliothèque la rattache
   * (région de ses voisines, province de son domaine). Déléguée ou de ressourcement : rien ne change (null).
   * Renvoie { c, cree, deja } ou null.
   */
  function marquerAcquise(carte, entreeId, maintenant) {
    const entree = CT.bibliotheque.trouver(entreeId);
    if (!entree) return null;
    const existante = surLaCarte(carte, entree);
    if (existante) {
      if (HORS_JEU.includes(existante.statut)) return null;
      if (ACQUIS.includes(existante.statut)) return { c: existante, cree: false, deja: true };
      CT.regles.changerStatut(carte, existante.id, 'conquise');
      if (carte.plan && carte.plan.competenceId === existante.id && !carte.plan.fini) carte.plan.fini = iso(maintenant);
      return { c: existante, cree: false, deja: false };
    }
    const c = CT.suggestions.accepter(carte, entree.id, { statut: 'conquise' });
    return c ? { c, cree: true, deja: false } : null;
  }

  // ---------- D. Bilan d'acquis ----------

  // Les 30 compétences du bilan, par famille, avec ce qui est déjà acquis sur la carte.
  function bilan(carte) {
    return D.BILAN.map((g) => ({
      titre: T(g.titre),
      icone: g.icone,
      items: g.ids.map((id) => CT.bibliotheque.trouver(id)).filter(Boolean).map((entree) => {
        const c = surLaCarte(carte, entree);
        return { entree, acquis: Boolean(c && ACQUIS.includes(c.statut)), horsJeu: Boolean(c && HORS_JEU.includes(c.statut)) };
      })
    }));
  }

  /*
   * Applique le bilan en une fois (un seul placement ensuite) : chaque id coché rejoint les territoires conquis,
   * chaque idée libre (5 au plus, 60 caractères) devient un territoire conquis. Renvoie le nombre d'ajouts.
   */
  function appliquerBilan(carte, ids, libres, maintenant) {
    let n = 0;
    [...new Set(ids || [])].forEach((id) => { const r = marquerAcquise(carte, id, maintenant); if (r && !r.deja) n++; });
    (libres || []).map((t) => String(t).trim().slice(0, 60)).filter(Boolean).slice(0, 5).forEach((t) => {
      const avant = carte.competences.length;
      const c = CT.regles.ajouterCompetence(carte, t, 'conquise');
      if (!c || carte.competences.length === avant) return;
      if (CT.creation) { const g = CT.creation.deviner(t); c.icone = g.icone; c.domaine = g.domaine; c.bibliothequeId = g.bibliothequeId; }
      n++;
    });
    carte.bilan = { fait: iso(maintenant), reporte: null, n };
    return n;
  }

  function reporterBilan(carte, maintenant) {
    carte.bilan = { fait: null, reporte: iso(maintenant), n: 0 };
  }

  // Le bilan s'ouvre tout seul une seule fois, à la première ouverture de « Mes pistes ».
  function doitProposerBilan(carte) {
    return !carte.bilan;
  }

  // ---------- F. Ma prochaine compétence ----------

  /*
   * Candidates : les compétences manquantes des pistes proposées et des pistes visées.
   * score = Σ gain (× 1,5 sur une piste visée) / (effort de durée × facteur de facilité).
   * Effort : court 1, moyen 2, long 3, très long 5. Facteur : facile 0,7, accessible 1, exigeant 1,4.
   * Égalité : plus de pistes concernées, puis ordre alphabétique. ecartees : ids déjà proposés (« Une autre idée »).
   * Renvoie { entree, fiche, score, gainTotal, pistes: [{ piste, pourcentage, gain, visee }] } ou null.
   */
  function prochaine(carte, ecartees, maintenant) {
    const evaluations = new Map();
    CT.pistes.proposer(carte, 10, maintenant).forEach((e) => evaluations.set(e.piste.id, e));
    (carte.pistesVisees || []).forEach((id) => { const e = CT.pistes.evaluer(carte, id, maintenant); if (e) evaluations.set(id, e); });
    const exclues = new Set(ecartees || []);
    if (carte.plan && !carte.plan.fini) exclues.add(carte.plan.bibliothequeId);
    const candidats = new Map();
    evaluations.forEach((e) => e.manquantes.forEach((entree) => {
      const c = surLaCarte(carte, entree);
      if (exclues.has(entree.id) || (c && HORS_JEU.includes(c.statut))) return;
      if (!candidats.has(entree.id)) candidats.set(entree.id, { entree, pistes: [] });
      candidats.get(entree.id).pistes.push({ piste: e.piste, pourcentage: e.pourcentage, gain: gain(carte, e.piste, entree, maintenant), visee: e.visee });
    }));
    const liste = [...candidats.values()].map((x) => {
      const f = fiche(carte, x.entree.id);
      const gainTotal = x.pistes.reduce((s, p) => s + p.gain, 0);
      const pondere = x.pistes.reduce((s, p) => s + p.gain * (p.visee ? 1.5 : 1), 0);
      x.pistes.sort((a, b) => b.gain - a.gain || b.pourcentage - a.pourcentage || a.piste.nom.localeCompare(b.piste.nom, 'fr'));
      return Object.assign(x, { fiche: f, gainTotal, score: pondere / (f.duree.effort * EFFORT_FACILITE[f.facilite.cle]) });
    }).filter((x) => x.gainTotal > 0)
      .sort((a, b) => b.score - a.score || b.pistes.length - a.pistes.length || a.entree.nom.localeCompare(b.entree.nom, 'fr'));
    return liste[0] || null;
  }

  // ---------- G. Plan sur 30 jours ----------

  // Les 4 semaines du plan, avec leurs 3 actions (la semaine 1 reprend la fiche).
  function semainesPlan(entree) {
    const premieres = actions(entree);
    return D.PLAN_SEMAINES.map((s) => ({ titre: T(s.titre), actions: s.actions ? s.actions.map((t) => T(t, { nom: entree.nom })) : premieres }));
  }

  /*
   * Démarre un plan sur une compétence pas encore acquise : elle devient un territoire en conquête,
   * priorité n°1. Un seul plan à la fois : null si un plan est en cours (l'écran propose de le remplacer).
   */
  function demarrerPlan(carte, entreeId, maintenant) {
    if (carte.plan && !carte.plan.fini) return null;
    const entree = CT.bibliotheque.trouver(entreeId);
    if (!entree) return null;
    let c = surLaCarte(carte, entree);
    if (c && (ACQUIS.includes(c.statut) || HORS_JEU.includes(c.statut))) return null;
    if (c && c.statut === 'a_conquerir') CT.regles.changerStatut(carte, c.id, 'frontiere');
    if (!c) c = CT.suggestions.accepter(carte, entree.id, { statut: 'frontiere' });
    if (!c) return null;
    c.priorite = 0.5; // passe devant le n°1, puis le classement renumérote
    CT.regles.classerFrontieres(carte);
    carte.plan = { id: CT.schema.nouvelId('plan'), bibliothequeId: entree.id, competenceId: c.id, debut: iso(maintenant), faites: new Array(TOTAL_PLAN).fill(null), fini: null };
    return carte.plan;
  }

  // Coche ou décoche une action (0 à 11). À 12 sur 12, le plan est fini (la conquête reste proposée, jamais imposée).
  function cocherAction(carte, index, maintenant) {
    const p = carte.plan;
    if (!p || !Number.isInteger(index) || index < 0 || index >= TOTAL_PLAN) return null;
    p.faites[index] = p.faites[index] ? null : iso(maintenant);
    const faites = p.faites.filter(Boolean).length;
    const vientDeFinir = faites === TOTAL_PLAN && !p.fini;
    if (vientDeFinir) p.fini = iso(maintenant);
    const c = CT.regles.trouver(carte, p.competenceId);
    if (faites < TOTAL_PLAN && p.fini && c && c.statut === 'frontiere') p.fini = null; // décocher rouvre un plan pas encore conquis
    return { faites, total: TOTAL_PLAN, vientDeFinir };
  }

  function arreterPlan(carte) {
    if (!carte.plan) return false;
    carte.plan = null;
    return true;
  }

  // État lisible du plan, ou null (pas de plan, ou compétence retirée de la carte).
  function etatPlan(carte, maintenant) {
    const p = carte.plan;
    if (!p) return null;
    const c = CT.regles.trouver(carte, p.competenceId);
    const entree = CT.bibliotheque.trouver(p.bibliothequeId);
    if (!c || !entree) return null;
    const faites = p.faites.filter(Boolean).length;
    const jours = Math.max(0, Math.floor(((maintenant || Date.now()) - Date.parse(p.debut)) / JOUR));
    const semaines = semainesPlan(entree).map((s, i) => Object.assign(s, { faites: s.actions.map((t, k) => Boolean(p.faites[i * 3 + k])) }));
    return { plan: p, entree, competence: c, faites, total: TOTAL_PLAN, progression: faites / TOTAL_PLAN, jours,
      semaine: Math.min(4, Math.floor(jours / 7) + 1), depasse: jours >= 30 && !p.fini, fini: Boolean(p.fini), semaines };
  }

  // Avancement du drapeau sur la carte pour une compétence (0 à 1), ou null si elle n'a pas de plan en cours.
  function drapeauPlan(carte, competenceId) {
    const p = carte.plan;
    if (!p || p.competenceId !== competenceId) return null;
    return { faites: p.faites.filter(Boolean).length, total: TOTAL_PLAN };
  }

  // ---------- H. Lien avec le talent ----------

  /*
   * Comment une piste utilise le talent : sous-talents (régions) mobilisés et moment de flow qui s'y retrouve.
   * fort : un domaine de la piste est évoqué par le talent ou les régions, et un sous-talent ou un moment de flow s'y rattache ;
   * moyen : une seule de ces deux conditions ; faible : aucune.
   */
  function lienTalent(carte, evaluation) {
    const piste = evaluation.piste;
    const grands = new Set(piste.requis.map((id) => CT.bibliotheque.trouver(id)).filter(Boolean).map((e) => CT.idees.DOMAINE_BIBLIOTHEQUE[e.domaine]));
    const themes = CT.pistes.themesDe(carte);
    const theme = [...grands].some((d) => themes.has(d));
    const appuis = evaluation.hexagones.map((id) => CT.regles.trouver(carte, id)).filter(Boolean);
    const points = {};
    appuis.forEach((c) => { if (c.regionId && ['natale', 'conquise', 'frontiere'].includes(c.statut)) points[c.regionId] = (points[c.regionId] || 0) + 2; });
    carte.regions.forEach((r) => {
      const textes = [r.nom].concat(carte.competences.filter((c) => c.regionId === r.id && c.statut === 'natale').map((c) => c.nom));
      if (textes.some((t) => [...CT.idees.domainesDe(t)].some((d) => grands.has(d)))) points[r.id] = (points[r.id] || 0) + 1;
    });
    const ordre = carte.regions.map((r) => r.id);
    const regions = Object.keys(points).sort((a, b) => points[b] - points[a] || ordre.indexOf(a) - ordre.indexOf(b))
      .map((id) => CT.regles.regionDe(carte, id)).filter(Boolean).slice(0, 2);
    const idsRegions = new Set(regions.map((r) => r.id));
    const nomsRegions = new Set(carte.regions.map((r) => N(r.nom)));
    const moments = (c) => CT.regles.momentsDe(carte, c.id).length;
    const candidats = carte.competences.filter((c) => !HORS_JEU.includes(c.statut) && (appuis.includes(c) || idsRegions.has(c.regionId)) &&
      (c.statut === 'natale' || c.statut === 'ile' || moments(c) > 0));
    candidats.sort((a, b) => moments(b) - moments(a) || (nomsRegions.has(N(a.nom)) ? 1 : 0) - (nomsRegions.has(N(b.nom)) ? 1 : 0) ||
      (b.statut === 'natale' ? 1 : 0) - (a.statut === 'natale' ? 1 : 0) || a.nom.localeCompare(b.nom, 'fr'));
    const moment = candidats[0] || null;
    const appui = moment || regions.length;
    const niveau = theme && appui ? 'fort' : theme || appui ? 'moyen' : 'faible';
    return {
      niveau,
      libelle: LIBELLES_ALIGNEMENT[niveau],
      talent: carte.talent.nom,
      sousTalents: regions.map((r) => r.nom),
      moment: moment ? moment.nom : null,
      conseil: niveau === 'faible' ? T('Elle te demandera surtout des compétences, moins ton plaisir naturel. Vérifie qu\'elle te donne envie avant de foncer.') : ''
    };
  }

  // ---------- E. Infos des pistes ----------

  function montant(n) {
    return Number(n).toLocaleString(CT.i18n.langue === 'en' ? 'en-GB' : 'fr-FR');
  }

  // { statut, statutLibelle, revenu, note, exemple } ou null.
  function infosPiste(piste) {
    const brut = D.PISTES_INFOS[piste.id];
    if (!brut) return null;
    const [statut, min, max, exemple] = brut;
    let revenu;
    if (min === null) revenu = T('Bénévole : pas de revenu, mais du sens et du réseau');
    else if (piste.type === 'activite') revenu = min === 0 ? T('Jusqu\'à {max} € par mois en complément', { max: montant(max) }) : T('{min} à {max} € par mois en complément', { min: montant(min), max: montant(max) });
    else revenu = T('{min} à {max} € net par mois', { min: montant(min), max: montant(max) });
    return { statut, statutLibelle: T(D.STATUTS_PISTE[statut]), revenu, min, max, note: T(D.NOTES_REVENU[piste.type]), exemple: T(exemple) };
  }

  // ---------- I. Synthèse et appel découverte ----------

  function urlAppel(contenu) {
    return D.APPEL_DECOUVERTE + '&utm_content=' + encodeURIComponent(contenu || 'pistes');
  }

  // Les 3 pistes de la synthèse : les pistes visées d'abord (meilleur pourcentage en tête), puis les meilleures proposées.
  function troisPistes(carte, maintenant) {
    const visees = (carte.pistesVisees || []).map((id) => CT.pistes.evaluer(carte, id, maintenant)).filter(Boolean)
      .sort((a, b) => b.pourcentage - a.pourcentage);
    const autres = CT.pistes.proposer(carte, 10, maintenant).filter((e) => !visees.some((v) => v.piste.id === e.piste.id));
    return visees.concat(autres).slice(0, 3).map((e) => ({ evaluation: e, infos: infosPiste(e.piste), lien: lienTalent(carte, e) }));
  }

  function synthese(carte, maintenant) {
    const plan = etatPlan(carte, maintenant);
    return {
      talent: carte.talent.nom,
      filRouge: carte.talent.filRouge,
      date: new Date(maintenant || Date.now()),
      pistes: troisPistes(carte, maintenant),
      plan: plan && !plan.fini ? plan : null,
      prochaine: plan && !plan.fini ? null : prochaine(carte, [], maintenant),
      source: T(D.SOURCE_REVENU)
    };
  }

  CT.orientation = {
    TOTAL_PLAN, surLaCarte, duree, facilite, actions, fiche, gain, pistesPour,
    marquerAcquise, bilan, appliquerBilan, reporterBilan, doitProposerBilan,
    prochaine, semainesPlan, demarrerPlan, cocherAction, arreterPlan, etatPlan, drapeauPlan,
    lienTalent, infosPiste, urlAppel, troisPistes, synthese
  };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
