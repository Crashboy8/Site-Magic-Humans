/*
 * Tests du lot « orientation pro » (Node, sans dépendance) :
 *   node carte-du-talent/tests/orientation.test.js
 */
'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
['langues/en.js', 'langues/en-orientation.js', 'langues/es.js', 'langues/es-orientation.js', 'i18n.js', 'geo/hex.js', 'modele/schema.js', 'modele/demo.js', 'geo/placement.js', 'modele/regles.js',
  'modele/stats.js', 'modele/bibliotheque.js', 'modele/bibliotheque-plus.js', 'modele/idees.js', 'modele/suggestions.js', 'modele/pistes.js',
  'modele/creation.js', 'modele/boussole.js', 'modele/orientation-donnees.js', 'modele/orientation.js', 'geo/horizon.js'].forEach((f) => {
  require(path.join(__dirname, '..', 'js', f));
});
const CT = globalThis.CarteTalent;
const O = CT.orientation;
const D = CT.orientationDonnees;
const MAINTENANT = Date.parse('2026-10-06T10:00:00Z');
const JOUR = 24 * 3600 * 1000;

let echecs = 0;
function test(nom, fn) {
  try { fn(); console.log('  ok  ' + nom); } catch (e) { echecs++; console.log('  ÉCHEC  ' + nom + '\n        ' + e.message); }
}

// Carte de démonstration placée, positions enregistrées (comme dans l'appli).
function cartePlacee() {
  const carte = CT.demo.creer();
  const res = CT.placement.placer(carte);
  carte.competences.forEach((c) => { const p = res.positions[c.id]; if (p) c.position = { q: p.q, r: p.r }; });
  return { carte, res };
}
function replacer(carte) {
  const res = CT.placement.placer(carte);
  carte.competences.forEach((c) => { const p = res.positions[c.id]; if (p) c.position = { q: p.q, r: p.r }; });
  return res;
}
function aucunNeBouge(avant, apres) {
  Object.keys(avant.positions).forEach((id) => assert.deepStrictEqual(apres.positions[id], avant.positions[id], id + ' a bougé'));
}
function carteCreee() {
  const C = CT.creation;
  const b = C.nouveauBrouillon();
  b.talent = { nom: 'Faire grandir les équipes', filRouge: 'La confiance en mouvement' };
  C.ajouter(b, 'regions', 'Écouter, Fédérer, Transmettre');
  C.ajouter(b, 'moments', 'Coacher un manager, animer un séminaire, Préparer un cours');
  C.ajouter(b, 'conquises', 'Excel, Anglais');
  C.ajouter(b, 'deleguer', 'Comptabilité');
  C.ajouter(b, 'ressources', 'Marcher en forêt');
  C.preRanger(b);
  const carte = C.genererCarte(b);
  replacer(carte);
  return carte;
}

console.log('Bibliothèque et données');

test('la bibliothèque compte environ 300 compétences, sans doublon de nom', () => {
  const E = CT.bibliotheque.ENTREES;
  assert.ok(E.length >= 280 && E.length <= 330, E.length + ' entrées');
  assert.strictEqual(new Set(E.map((x) => x.id)).size, E.length);
  const noms = new Map();
  E.forEach((x) => [x.nom].concat(x.alias).forEach((a) => {
    const n = CT.regles.normaliserTexte(a);
    assert.ok(!noms.has(n) || noms.get(n) === x.id, '« ' + a + ' » : ' + noms.get(n) + ' et ' + x.id);
    noms.set(n, x.id);
  }));
  E.forEach((x) => assert.ok(CT.schema.DOMAINES[x.domaine], x.id + ' : domaine inconnu'));
  assert.strictEqual(CT.bibliotheque.trouver('animer-formation').nom, 'Animer une formation');
  assert.ok(CT.bibliotheque.trouver('conception-cours').alias.includes('preparer un cours'));
});

test('les données d\'orientation ne citent que des compétences et des pistes connues', () => {
  const ids = new Set(CT.bibliotheque.ENTREES.map((x) => x.id));
  Object.keys(D.DUREE).forEach((id) => assert.ok(ids.has(id), 'DUREE : ' + id));
  Object.keys(D.ACTIONS).forEach((id) => { assert.ok(ids.has(id), 'ACTIONS : ' + id); assert.strictEqual(D.ACTIONS[id].length, 3, id); });
  Object.keys(CT.schema.DOMAINES).forEach((d) => { assert.strictEqual(D.ACTIONS_DOMAINE[d].length, 3, d); assert.ok(D.DUREES[D.DUREE_DOMAINE[d]], d); });
  const bilan = [].concat(...D.BILAN.map((g) => g.ids));
  assert.strictEqual(bilan.length, 30);
  assert.strictEqual(new Set(bilan).size, 30);
  bilan.forEach((id) => assert.ok(ids.has(id), 'BILAN : ' + id));
  CT.pistes.PISTES.forEach((p) => {
    const info = D.PISTES_INFOS[p.id];
    assert.ok(info, 'infos manquantes : ' + p.id);
    assert.ok(D.STATUTS_PISTE[info[0]], p.id + ' : statut');
    assert.ok(info[1] === null || (info[1] >= 0 && info[2] > info[1]), p.id + ' : revenu');
    assert.ok(info[3].length <= 160, p.id + ' : exemple trop long');
  });
  assert.strictEqual(Object.keys(D.PISTES_INFOS).length, CT.pistes.PISTES.length);
  assert.ok(/^https:\/\/calendly\.com\/pierre-j-sarazin\?/.test(D.APPEL_DECOUVERTE));
});

test('la bibliothèque (suite) et toutes les données d\'orientation ont leurs traductions anglaise et espagnole', () => {
  const manquants = new Set();
  const verifier = (t) => { const k = CT.i18n.cle(t); if (!(k in CT.EN && k in CT.ES)) manquants.add(k); };
  const lit = "'((?:[^'\\\\]|\\\\.)*)'";
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'modele', 'bibliotheque-plus.js'), 'utf8');
  for (const m of src.matchAll(new RegExp("\\be\\('[a-z0-9-]+', " + lit, 'g'))) verifier(m[1].replace(/\\'/g, "'"));
  Object.values(D.DUREES).forEach((d) => verifier(d.libelle));
  Object.values(D.ACTIONS_DOMAINE).concat(Object.values(D.ACTIONS)).forEach((l) => l.forEach(verifier));
  D.PLAN_SEMAINES.forEach((s) => { verifier(s.titre); (s.actions || []).forEach(verifier); });
  D.BILAN.forEach((g) => verifier(g.titre));
  Object.values(D.STATUTS_PISTE).concat(Object.values(D.NOTES_REVENU), [D.SOURCE_REVENU]).forEach(verifier);
  Object.values(D.PISTES_INFOS).forEach((i) => verifier(i[3]));
  assert.deepStrictEqual([...manquants], []);
});

console.log('\nFiche d\'apprentissage (temps, facilité, premières actions)');

test('chaque compétence a un temps estimé, une facilité et 3 premières actions', () => {
  const { carte } = cartePlacee();
  CT.bibliotheque.ENTREES.forEach((e) => {
    const f = O.fiche(carte, e.id);
    assert.ok(['court', 'moyen', 'long', 'tres_long'].includes(f.duree.cle), e.id);
    assert.ok(['facile', 'accessible', 'exigeant'].includes(f.facilite.cle), e.id);
    assert.strictEqual(f.actions.length, 3, e.id);
    f.actions.forEach((a) => assert.ok(!/\{nom\}/.test(a), e.id + ' : {nom} non remplacé'));
    assert.ok(f.facilite.raison, e.id);
  });
  assert.strictEqual(O.fiche(carte, 'inconnue'), null);
  assert.strictEqual(O.duree(CT.bibliotheque.trouver('japonais')).cle, 'tres_long');
  assert.strictEqual(O.duree(CT.bibliotheque.trouver('reseaux')).cle, 'court');
});

test('la facilité vient des compétences voisines déjà acquises', () => {
  const vide = CT.schema.normaliser({ talent: { nom: 'X' } });
  assert.strictEqual(O.facilite(vide, CT.bibliotheque.trouver('animer-formation')).cle, 'exigeant');
  const c = CT.schema.normaliser({ talent: { nom: 'X' }, competences: [
    { id: 'a', nom: 'Préparer une formation', statut: 'conquise', bibliothequeId: 'preparer-formation', domaine: 'pedagogie' },
    { id: 'b', nom: 'Animer un groupe', statut: 'natale', bibliothequeId: 'animer-groupe', domaine: 'animation' },
    { id: 'c', nom: 'Prise de parole en public', statut: 'conquise', bibliothequeId: 'prise-parole', domaine: 'communication' }
  ] });
  const f = O.facilite(c, CT.bibliotheque.trouver('animer-formation'));
  assert.strictEqual(f.cle, 'facile');
  assert.ok(f.appuis.length >= 2 && /«/.test(f.raison));
});

console.log('\n« Je l\'ai déjà »');

test('« Je l\'ai déjà » ajoute la compétence en territoire conquis et fait monter la piste, sans bouger la carte', () => {
  const { carte, res } = cartePlacee();
  const avant = CT.pistes.evaluer(carte, 'formateur', MAINTENANT);
  const manquante = avant.manquantes[0];
  assert.ok(manquante, 'la piste formateur a une compétence manquante');
  const r = O.marquerAcquise(carte, manquante.id, MAINTENANT);
  assert.ok(r && r.cree && r.c.statut === 'conquise' && r.c.bibliothequeId === manquante.id);
  assert.ok(r.c.regionId, 'rattachée à une région');
  const apres = CT.pistes.evaluer(carte, 'formateur', MAINTENANT);
  assert.ok(apres.pourcentage > avant.pourcentage, avant.pourcentage + ' → ' + apres.pourcentage);
  assert.ok(!apres.manquantes.some((m) => m.id === manquante.id));
  aucunNeBouge(res, CT.placement.placer(carte));
  assert.strictEqual(O.marquerAcquise(carte, manquante.id, MAINTENANT).deja, true, 'deux fois : rien de plus');
});

test('« Je l\'ai déjà » sur un territoire en conquête le conquiert ; une compétence déléguée ne change pas', () => {
  const { carte } = cartePlacee();
  const front = carte.competences.find((c) => c.statut === 'frontiere' && c.bibliothequeId);
  if (front) {
    assert.ok(O.marquerAcquise(carte, front.bibliothequeId, MAINTENANT));
    assert.strictEqual(front.statut, 'conquise');
    assert.strictEqual(front.priorite, null);
  }
  const deleguee = CT.suggestions.accepter(carte, 'comptabilite', { statut: 'a_deleguer' }) || carte.competences.find((c) => c.statut === 'a_deleguer');
  if (deleguee && deleguee.bibliothequeId) {
    assert.strictEqual(O.marquerAcquise(carte, deleguee.bibliothequeId, MAINTENANT), null);
    assert.strictEqual(deleguee.statut, 'a_deleguer');
  }
});

console.log('\nBilan d\'acquis');

test('le bilan propose 30 compétences en 6 familles et repère ce qui est déjà acquis', () => {
  const { carte } = cartePlacee();
  const b = O.bilan(carte);
  assert.strictEqual(b.length, 6);
  assert.strictEqual([].concat(...b.map((g) => g.items)).length, 30);
  assert.ok(b.every((g) => g.titre && g.items.length === 5));
  assert.ok(O.doitProposerBilan(carte));
});

test('appliquer le bilan en une fois ajoute les compétences cochées, sans bouger la carte ni la casser', () => {
  [cartePlacee().carte, carteCreee()].forEach((carte) => {
    const avant = CT.placement.placer(carte);
    const ids = [].concat(...D.BILAN.map((g) => g.ids));
    const n = O.appliquerBilan(carte, ids, ['Animer une conférence', 'Préparer un cours', ''], MAINTENANT);
    assert.ok(n >= 20, n + ' ajouts');
    const apres = CT.placement.placer(carte);
    aucunNeBouge(avant, apres);
    assert.deepStrictEqual(CT.placement.verifier(apres), []);
    assert.ok(carte.bilan.fait && carte.bilan.n === n);
    assert.ok(!O.doitProposerBilan(carte));
    const relue = CT.schema.normaliser(JSON.parse(JSON.stringify(carte)));
    assert.deepStrictEqual(relue.bilan, carte.bilan);
  });
});

test('« Plus tard » ne repropose plus le bilan automatiquement', () => {
  const { carte } = cartePlacee();
  O.reporterBilan(carte, MAINTENANT);
  assert.ok(!O.doitProposerBilan(CT.schema.normaliser(JSON.parse(JSON.stringify(carte)))));
});

console.log('\nMa prochaine compétence');

test('la prochaine compétence fait avancer au moins une piste, et « Une autre idée » en propose une autre', () => {
  const { carte } = cartePlacee();
  const p = O.prochaine(carte, [], MAINTENANT);
  assert.ok(p && p.entree && p.fiche && p.pistes.length >= 1 && p.gainTotal > 0);
  assert.ok(p.pistes.every((x, i, l) => i === 0 || l[i - 1].gain >= x.gain), 'pistes triées par gain');
  const autre = O.prochaine(carte, [p.entree.id], MAINTENANT);
  assert.ok(autre && autre.entree.id !== p.entree.id);
  assert.deepStrictEqual(O.prochaine(carte, [], MAINTENANT).entree.id, p.entree.id, 'déterministe');
});

test('une piste visée pèse plus lourd dans le choix de la prochaine compétence', () => {
  const { carte } = cartePlacee();
  CT.pistes.viser(carte, 'developpeur', MAINTENANT);
  const p = O.prochaine(carte, [], MAINTENANT);
  assert.ok(p.pistes.some((x) => x.visee) || p.score > 0);
});

test('une carte vide reçoit tout de même une proposition, sans planter', () => {
  const vide = CT.schema.normaliser({ talent: { nom: 'X' } });
  assert.doesNotThrow(() => O.prochaine(vide, [], MAINTENANT));
});

console.log('\nPlan sur 30 jours');

test('démarrer un plan met la compétence en conquête, priorité n°1, avec 12 actions en 4 semaines', () => {
  const { carte, res } = cartePlacee();
  const p = O.prochaine(carte, [], MAINTENANT);
  const plan = O.demarrerPlan(carte, p.entree.id, MAINTENANT);
  assert.ok(plan);
  const c = CT.regles.trouver(carte, plan.competenceId);
  assert.strictEqual(c.statut, 'frontiere');
  assert.strictEqual(c.priorite, 1);
  assert.strictEqual(CT.regles.frontieres(carte)[0].id, c.id);
  const e = O.etatPlan(carte, MAINTENANT);
  assert.strictEqual(e.semaines.length, 4);
  assert.ok(e.semaines.every((s) => s.actions.length === 3 && s.titre));
  assert.deepStrictEqual(e.semaines[0].actions, O.fiche(carte, p.entree.id).actions, 'semaine 1 = premières actions');
  assert.strictEqual(O.demarrerPlan(carte, 'japonais', MAINTENANT), null, 'un seul plan à la fois');
  aucunNeBouge(res, CT.placement.placer(carte));
});

test('cocher les actions fait monter le drapeau ; à 12 sur 12 le plan est fini, sans conquête automatique', () => {
  const { carte } = cartePlacee();
  const plan = O.demarrerPlan(carte, O.prochaine(carte, [], MAINTENANT).entree.id, MAINTENANT);
  assert.deepStrictEqual(O.drapeauPlan(carte, plan.competenceId), { faites: 0, total: 12 });
  for (let i = 0; i < 11; i++) O.cocherAction(carte, i, MAINTENANT + i * JOUR);
  assert.strictEqual(O.drapeauPlan(carte, plan.competenceId).faites, 11);
  const r = O.cocherAction(carte, 11, MAINTENANT + 20 * JOUR);
  assert.ok(r.vientDeFinir && carte.plan.fini);
  assert.strictEqual(CT.regles.trouver(carte, plan.competenceId).statut, 'frontiere', 'la conquête reste un choix');
  O.cocherAction(carte, 11, MAINTENANT + 21 * JOUR);
  assert.strictEqual(carte.plan.fini, null, 'décocher rouvre le plan');
  assert.strictEqual(O.cocherAction(carte, 12, MAINTENANT), null);
  const relue = CT.schema.normaliser(JSON.parse(JSON.stringify(carte)));
  assert.deepStrictEqual(relue.plan, carte.plan, 'le plan est enregistré tel quel');
});

test('après 30 jours le plan reste ouvert ; l\'arrêter garde le territoire en conquête', () => {
  const { carte } = cartePlacee();
  const plan = O.demarrerPlan(carte, O.prochaine(carte, [], MAINTENANT).entree.id, MAINTENANT);
  const e = O.etatPlan(carte, MAINTENANT + 31 * JOUR);
  assert.ok(e.depasse && e.semaine === 4 && e.jours === 31);
  assert.ok(O.arreterPlan(carte));
  assert.strictEqual(carte.plan, null);
  assert.strictEqual(CT.regles.trouver(carte, plan.competenceId).statut, 'frontiere');
});

test('un plan dont la compétence a disparu est oublié à la relecture', () => {
  const { carte } = cartePlacee();
  const plan = O.demarrerPlan(carte, O.prochaine(carte, [], MAINTENANT).entree.id, MAINTENANT);
  carte.competences = carte.competences.filter((c) => c.id !== plan.competenceId);
  assert.strictEqual(CT.schema.normaliser(JSON.parse(JSON.stringify(carte))).plan, null);
});

console.log('\nLien avec le talent, infos des pistes, synthèse');

test('chaque piste dit comment elle utilise le talent (sous-talents, moment de flow, niveau)', () => {
  const { carte } = cartePlacee();
  const pistes = CT.pistes.proposer(carte, 10, MAINTENANT);
  pistes.forEach((e) => {
    const l = O.lienTalent(carte, e);
    assert.ok(['fort', 'moyen', 'faible'].includes(l.niveau), e.piste.id);
    assert.ok(l.libelle && l.talent === carte.talent.nom);
    assert.ok(l.sousTalents.length <= 2);
    assert.ok(l.niveau !== 'faible' || l.conseil);
  });
  assert.ok(pistes.some((e) => O.lienTalent(carte, e).niveau === 'fort'), 'les meilleures pistes de la démo sont alignées');
  const vide = CT.schema.normaliser({ talent: { nom: '' } });
  assert.strictEqual(O.lienTalent(vide, CT.pistes.evaluer(vide, 'comptable', MAINTENANT)).niveau, 'faible');
});

test('chaque piste a un statut, un revenu indicatif lisible et un exemple de profil', () => {
  CT.pistes.PISTES.forEach((p) => {
    const i = O.infosPiste(p);
    assert.ok(i && i.statutLibelle && i.revenu && i.note && i.exemple, p.id);
    assert.ok(/€|Bénévole/.test(i.revenu), p.id + ' : ' + i.revenu);
  });
  assert.ok(/^1\u202f900 à 3\u202f500 € net par mois$|^1[\s\u00a0\u202f]900 à 3[\s\u00a0\u202f]500 € net par mois$/.test(O.infosPiste(CT.pistes.trouver('formateur')).revenu));
  assert.ok(/Bénévole/.test(O.infosPiste(CT.pistes.trouver('repair-cafe')).revenu));
  assert.ok(/^Jusqu'à/.test(O.infosPiste(CT.pistes.trouver('podcasteur')).revenu));
});

test('la synthèse rassemble 3 pistes (les visées d\'abord) et la prochaine compétence ; le lien d\'appel porte sa source', () => {
  const { carte } = cartePlacee();
  CT.pistes.viser(carte, 'podcasteur', MAINTENANT);
  const s = O.synthese(carte, MAINTENANT);
  assert.strictEqual(s.pistes.length, 3);
  assert.strictEqual(s.pistes[0].evaluation.piste.id, 'podcasteur');
  assert.ok(s.pistes.every((x) => x.infos && x.lien));
  assert.ok(s.prochaine && !s.plan);
  O.demarrerPlan(carte, s.prochaine.entree.id, MAINTENANT);
  const s2 = O.synthese(carte, MAINTENANT);
  assert.ok(s2.plan && !s2.prochaine);
  assert.ok(/utm_medium=carte-du-talent/.test(O.urlAppel('synthese')) && /utm_content=synthese$/.test(O.urlAppel('synthese')));
});

console.log('\nTerres à découvrir (horizon)');

test('l\'horizon pose chaque compétence absente une seule fois, au large, sans toucher à la carte', () => {
  [cartePlacee().carte, carteCreee(), CT.schema.normaliser({ talent: { nom: 'X' } })].forEach((carte) => {
    const res = CT.placement.placer(carte);
    const alertes = CT.placement.verifier(res);
    const h = CT.horizon.disposer(carte, res);
    const dispo = CT.suggestions.disponibles(carte);
    assert.strictEqual(h.tuiles.length, dispo.length);
    assert.strictEqual(new Set(h.tuiles.map((t) => t.entreeId)).size, h.tuiles.length);
    const cles = new Set(h.tuiles.map((t) => t.q + ',' + t.r));
    assert.strictEqual(cles.size, h.tuiles.length, 'cases uniques');
    h.tuiles.forEach((t) => res.cases.forEach((c) => assert.ok(CT.hex.distance(t, c) >= CT.horizon.ECART, t.id + ' trop près de ' + c.id)));
    assert.deepStrictEqual(CT.horizon.disposer(carte, res), h, 'déterministe');
    assert.deepStrictEqual(CT.placement.verifier(res), alertes, 'le placement ne voit pas l\'horizon');
    assert.ok(h.etiquettes.length >= 10);
  });
});

test('chaque domaine de l\'horizon forme un seul secteur, du côté où il existe déjà sur la carte', () => {
  const { carte, res } = cartePlacee();
  const h = CT.horizon.disposer(carte, res);
  const parDomaine = {};
  h.tuiles.forEach((t) => { (parDomaine[t.domaine] = parDomaine[t.domaine] || []).push(t); });
  Object.keys(parDomaine).forEach((d) => {
    const cells = parDomaine[d];
    const cles = new Set(cells.map((t) => t.q + ',' + t.r));
    const vus = new Set([cells[0].q + ',' + cells[0].r]);
    const file = [cells[0]];
    while (file.length) {
      const c = file.pop();
      CT.hex.voisins(c.q, c.r).forEach((v) => { const k = v.q + ',' + v.r; if (cles.has(k) && !vus.has(k)) { vus.add(k); file.push(v); } });
    }
    assert.strictEqual(vus.size, cells.length, d + ' coupé en morceaux');
  });
});

test('accepter une terre à découvrir la pose sur le continent (pas au large) et la retire de l\'horizon', () => {
  const { carte, res } = cartePlacee();
  const h = CT.horizon.disposer(carte, res);
  const t = h.tuiles.find((x) => x.domaine === 'pedagogie');
  const c = CT.suggestions.accepter(carte, t.entreeId, { statut: 'frontiere' });
  const res2 = CT.placement.placer(carte);
  aucunNeBouge(res, res2);
  const p = res2.positions[c.id];
  assert.ok(CT.hex.distance(p, { q: 0, r: 0 }) < h.debut, 'posée près de la carte, pas sur la case de l\'horizon');
  assert.ok(!CT.horizon.disposer(carte, res2).tuiles.some((x) => x.entreeId === t.entreeId));
});

test('un appui enregistré dans l\'autre langue s\'affiche dans la langue courante', () => {
  const f = O.facilite(CT.schema.normaliser({ talent: { nom: 'X' }, competences: [
    { id: 'a', nom: 'Preparing a training course', statut: 'conquise', bibliothequeId: 'preparer-formation', domaine: 'pedagogie' }
  ] }), CT.bibliotheque.trouver('facilitation'));
  assert.ok(f.raison.includes('Préparer une formation'), f.raison);
  assert.ok(!f.raison.includes('Preparing'), f.raison);
  assert.strictEqual(CT.bibliotheque.nomAffiche({ nom: 'Préparer un cours', bibliothequeId: 'conception-cours' }), 'Préparer un cours');
  assert.strictEqual(CT.bibliotheque.nomAffiche({ nom: 'Donner du feedback', bibliothequeId: 'feedback' }), 'Donner du feedback');
});

test('en anglais, une compétence de bibliothèque ajoutée par le bilan s\'affiche en anglais', () => {
  const { spawnSync } = require('child_process');
  const dir = path.join(__dirname, '..', 'js');
  const fichiers = ['langues/en.js', 'langues/en-orientation.js', 'langues/es.js', 'langues/es-orientation.js', 'i18n.js', 'geo/hex.js', 'modele/schema.js', 'modele/demo.js', 'geo/placement.js', 'modele/regles.js',
    'modele/stats.js', 'modele/bibliotheque.js', 'modele/bibliotheque-plus.js', 'modele/idees.js', 'modele/suggestions.js', 'modele/pistes.js',
    'modele/creation.js', 'modele/boussole.js', 'modele/orientation-donnees.js', 'modele/orientation.js'];
  const script = `
    global.window = {};
    global.location = { hash: '#lang=en' };
    global.localStorage = { getItem() { return null; }, setItem() {} };
    global.navigator = { language: 'en', languages: ['en'] };
    const path = require('path');
    const assert = require('assert');
    const dir = ${JSON.stringify(dir)};
    ${JSON.stringify(fichiers)}.forEach((f) => require(path.join(dir, f)));
    const CT = globalThis.CarteTalent;
    assert.strictEqual(CT.i18n.langue, 'en');
    const carte = CT.schema.normaliser({ talent: { nom: 'X' }, regions: [{ id: 'r', nom: 'Accueil', couleur: '#F2A65A' }] });
    const n = CT.orientation.appliquerBilan(carte, ['feedback', 'ecoute-active', 'animer-groupe', 'prise-parole', 'accompagnement-individuel', 'conflits', 'vulgarisation', 'redaction', 'conception-cours', 'facilitation', 'mentorat'], ['Mon truc à moi', 'Préparer un cours'], Date.now());
    assert.ok(n >= 11, n + ' ajouts');
    const aff = (id) => CT.bibliotheque.nomAffiche(carte.competences.find((c) => c.bibliothequeId === id));
    assert.strictEqual(aff('feedback'), 'Giving feedback');
    assert.strictEqual(aff('ecoute-active'), 'Active listening');
    assert.strictEqual(aff('animer-groupe'), 'Leading a group');
    assert.strictEqual(aff('prise-parole'), 'Public speaking');
    assert.strictEqual(aff('accompagnement-individuel'), 'One-to-one support');
    assert.strictEqual(aff('conflits'), 'Conflict management');
    assert.strictEqual(aff('vulgarisation'), 'Making things accessible');
    assert.strictEqual(aff('redaction'), 'Writing');
    assert.strictEqual(aff('conception-cours'), 'Designing a course');
    assert.strictEqual(aff('facilitation'), 'Workshop facilitation');
    assert.strictEqual(aff('mentorat'), 'Mentoring');
    assert.strictEqual(CT.bibliotheque.nomAffiche({ nom: ${JSON.stringify('Donner du feedback')}, bibliothequeId: 'feedback' }), 'Giving feedback');
    assert.strictEqual(CT.bibliotheque.nomAffiche({ nom: ${JSON.stringify('Mentorat')}, bibliothequeId: 'mentorat' }), 'Mentoring');
    assert.strictEqual(CT.bibliotheque.nomAffiche({ nom: ${JSON.stringify('Préparer une formation')}, bibliothequeId: 'preparer-formation' }), 'Preparing a training course');
    const libre = carte.competences.find((c) => c.nom === ${JSON.stringify('Mon truc à moi')});
    assert.ok(libre && !libre.bibliothequeId);
    assert.strictEqual(CT.bibliotheque.nomAffiche(libre), ${JSON.stringify('Mon truc à moi')});
    const alias = carte.competences.find((c) => c.nom === ${JSON.stringify('Préparer un cours')});
    assert.ok(alias && alias.bibliothequeId, 'rapproché de la bibliothèque');
    assert.strictEqual(CT.bibliotheque.nomAffiche(alias), ${JSON.stringify('Préparer un cours')});
    const appui = CT.schema.normaliser({ talent: { nom: 'X' }, competences: [
      { id: 'a', nom: ${JSON.stringify('Préparer une formation')}, statut: 'conquise', bibliothequeId: 'preparer-formation', domaine: 'pedagogie' }
    ] });
    const raison = CT.orientation.facilite(appui, CT.bibliotheque.trouver('animer-formation')).raison;
    assert.ok(raison.includes('Preparing a training course'), raison);
    assert.ok(!/Préparer une formation/.test(raison), raison);
    assert.strictEqual(CT.i18n.T('Compétences manquantes : {liste}', { liste: 'Writing' }), 'Missing skills: Writing');
    assert.strictEqual(CT.i18n.T('Plan : {nom}', { nom: 'Mentoring' }), 'Plan: Mentoring');
    assert.strictEqual(CT.i18n.T('Plan en cours : {nom}, {n} actions sur 12', { nom: 'Mentoring', n: 2 }), 'Plan in progress: Mentoring, 2 of 12 actions');
  `;
  const r = spawnSync(process.execPath, ['-e', script], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, (r.stderr || r.stdout || 'échec du sous-processus').slice(0, 1500));
});

console.log('\nCompatibilité');

test('les cartes enregistrées avant l\'orientation pro restent lisibles', () => {
  const c = CT.schema.normaliser({ talent: { nom: 'X' }, competences: [{ id: 'a', nom: 'A', statut: 'conquise' }], preferences: { brouillardDeGuerre: true } });
  assert.strictEqual(c.bilan, null);
  assert.strictEqual(c.plan, null);
  assert.strictEqual(c.preferences.horizon, true);
  assert.strictEqual(CT.schema.normaliser({ preferences: { horizon: false } }).preferences.horizon, false);
  assert.strictEqual(CT.schema.normaliser({ bilan: { fait: 'pas une date' }, plan: { competenceId: 'x' } }).plan, null);
  assert.strictEqual(CT.schema.normaliser({ bilan: { fait: 'pas une date' } }).bilan, null);
});

console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTout est vert.');
process.exitCode = echecs ? 1 : 0;
