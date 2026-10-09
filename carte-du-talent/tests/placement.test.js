/*
 * Tests du placement automatique (Node, sans dépendance) :
 *   node carte-du-talent/tests/placement.test.js          → vérifications
 *   node carte-du-talent/tests/placement.test.js --carte  → affiche aussi la carte en texte
 */
'use strict';

const path = require('path');
const assert = require('assert');
['langues/en.js', 'langues/en-orientation.js', 'langues/es.js', 'langues/es-orientation.js', 'i18n.js', 'geo/hex.js', 'modele/schema.js', 'modele/demo.js', 'geo/placement.js', 'modele/regles.js', 'modele/stats.js', 'modele/bibliotheque.js', 'modele/bibliotheque-plus.js', 'modele/idees.js', 'modele/suggestions.js', 'modele/pistes.js', 'modele/creation.js', 'modele/boussole.js', 'modele/orientation-donnees.js', 'modele/orientation.js', 'geo/horizon.js'].forEach((f) => {
  require(path.join(__dirname, '..', 'js', f));
});
const CT = globalThis.CarteTalent;

let echecs = 0;
function test(nom, fn) {
  try {
    fn();
    console.log('  ok  ' + nom);
  } catch (e) {
    echecs++;
    console.log('  ÉCHEC  ' + nom + '\n        ' + e.message);
  }
}

// Affichage texte : chaque case = 3 premières lettres de son groupe.
function dessiner(res) {
  const parCle = new Map(res.cases.map((c) => [c.q + ',' + c.r, c]));
  const rs = res.cases.map((c) => c.r);
  const xs = res.cases.map((c) => 2 * c.q + c.r);
  const lignes = [];
  for (let r = Math.min(...rs); r <= Math.max(...rs); r++) {
    let ligne = '';
    for (let x = Math.min(...xs); x <= Math.max(...xs); x++) {
      if ((x - r) % 2 !== 0) { ligne += '  '; continue; }
      const c = parCle.get((x - r) / 2 + ',' + r);
      ligne += c ? (c.groupe === 'capitale' ? '★★' : c.groupe.replace(/^[a-z]:/, '').slice(0, 2).toUpperCase()) : ' ·';
      ligne += '  ';
    }
    lignes.push(ligne.replace(/\s+$/, ''));
  }
  return lignes.join('\n');
}

const carte = CT.demo.creer();
const res = CT.placement.placer(carte);

if (process.argv.includes('--carte')) console.log('\n' + dessiner(res) + '\n');

console.log('Placement de la carte de démonstration');

test('toutes les compétences ont une position unique', () => {
  const vues = new Set();
  carte.competences.forEach((c) => {
    const p = res.positions[c.id];
    assert.ok(p, 'sans position : ' + c.nom);
    const k = p.q + ',' + p.r;
    assert.ok(!vues.has(k), 'case partagée : ' + k);
    vues.add(k);
  });
});

test('aucun problème géographique (régions coupées, trous, îles collées, cases isolées)', () => {
  const problemes = CT.placement.verifier(res);
  assert.deepStrictEqual(problemes, []);
});

test('le placement est déterministe', () => {
  const bis = CT.placement.placer(CT.demo.creer());
  assert.deepStrictEqual(bis.positions, res.positions);
});

test('les régions voisines se touchent', () => {
  const parCle = new Map(res.cases.map((c) => [c.q + ',' + c.r, c]));
  carte.regions.forEach((r) => r.voisines.forEach((v) => {
    const touche = res.cases.some((c) => c.groupe === 'r:' + r.id && CT.hex.voisins(c.q, c.r)
      .some((n) => { const o = parCle.get(n.q + ',' + n.r); return o && o.groupe === 'r:' + v; }));
    assert.ok(touche, r.id + ' ne touche pas ' + v);
  }));
});

test('les jonctions touchent leurs deux régions', () => {
  const parCle = new Map(res.cases.map((c) => [c.q + ',' + c.r, c]));
  carte.competences.filter((c) => c.regionJonctionId && c.distance === 'proche').forEach((c) => {
    const p = res.positions[c.id];
    const groupes = CT.hex.voisins(p.q, p.r).map((n) => (parCle.get(n.q + ',' + n.r) || {}).groupe);
    assert.ok(groupes.includes('r:' + c.regionJonctionId), c.nom + ' ne touche pas ' + c.regionJonctionId);
  });
});

test('chaque province touche sa région d\'ancrage', () => {
  const parCle = new Map(res.cases.map((c) => [c.q + ',' + c.r, c]));
  Object.keys(res.ancresProvinces).forEach((g) => {
    const ancre = 'r:' + res.ancresProvinces[g];
    const touche = res.cases.some((c) => c.groupe === g && CT.hex.voisins(c.q, c.r)
      .some((n) => (parCle.get(n.q + ',' + n.r) || {}).groupe === ancre));
    assert.ok(touche, g + ' ne touche pas ' + ancre);
  });
});

test('les natales sont au cœur (rayon ≤ 3)', () => {
  carte.competences.filter((c) => c.statut === 'natale').forEach((c) => {
    assert.ok(CT.hex.distance(res.positions[c.id], { q: 0, r: 0 }) <= 3, c.nom + ' trop loin du centre');
  });
});

test('une position manuelle est respectée', () => {
  const autre = CT.demo.creer();
  const vente = autre.competences.find((c) => c.id === 'vente');
  vente.position = { q: 9, r: -2 };
  vente.positionManuelle = true;
  const r2 = CT.placement.placer(autre);
  assert.deepStrictEqual(r2.positions.vente, { q: 9, r: -2 });
});

test('une carte vide ou minimale ne plante pas', () => {
  CT.placement.placer(CT.schema.creerCarteVide());
  const mini = CT.schema.normaliser({
    talent: { nom: 'T' },
    regions: [{ id: 'a', nom: 'A' }],
    competences: [{ id: 'x', nom: 'X', statut: 'natale', regionId: 'a' }, { id: 'y', nom: 'Y', statut: 'ile' }]
  });
  const r = CT.placement.placer(mini);
  assert.ok(r.positions.x && r.positions.y);
});


// Carte placée puis positions mémorisées, comme le fait l'application.
function cartePlacee() {
  const c = CT.demo.creer();
  const r = CT.placement.placer(c);
  c.competences.forEach((x) => { x.position = r.positions[x.id]; });
  return { carte: c, res: r };
}

console.log('\nStabilité et règles');

test('conquérir une frontière ne déplace aucun hexagone', () => {
  const { carte: c, res: r } = cartePlacee();
  CT.regles.changerStatut(c, 'vente', 'conquise');
  const r2 = CT.placement.placer(c);
  assert.deepStrictEqual(r2.positions, r.positions);
});

test('passer une compétence à déléguer l\'envoie dans la zone grise, sans laisser de trou', () => {
  const { carte: c } = cartePlacee();
  CT.regles.changerStatut(c, 'excel', 'a_deleguer');
  const r2 = CT.placement.placer(c);
  const cs = r2.cases.find((x) => x.id === 'excel');
  assert.strictEqual(cs.zone, 'deleguer');
  assert.deepStrictEqual(CT.placement.verifier(r2).filter((p) => /Trou/.test(p)), []);
});

test('déposer sur une case occupée échange les deux hexagones', () => {
  const { carte: c, res: r } = cartePlacee();
  const pv = r.positions.vente;
  const pn = r.positions.negociation;
  assert.strictEqual(CT.regles.deplacer(c, 'vente', pn, r.cases), 'echange');
  const r2 = CT.placement.placer(c);
  assert.deepStrictEqual(r2.positions.vente, pn);
  assert.deepStrictEqual(r2.positions.negociation, pv);
});

test('on ne peut pas déposer sur la capitale', () => {
  const { carte: c, res: r } = cartePlacee();
  assert.strictEqual(CT.regles.deplacer(c, 'vente', { q: 0, r: 0 }, r.cases), null);
});

test('réorganiser garde les positions manuelles', () => {
  const { carte: c, res: r } = cartePlacee();
  CT.regles.deplacer(c, 'podcast', { q: -8, r: 2 }, r.cases);
  CT.regles.preparerReorganisation(c);
  const r2 = CT.placement.placer(c, { reorganiser: true });
  assert.deepStrictEqual(r2.positions.podcast, { q: -8, r: 2 });
});

console.log('\nMoments de flow');

test('enregistrer un moment marque les compétences comme explorées et range les parties à déléguer', () => {
  const { carte: c } = cartePlacee();
  const m = CT.regles.ajouterMoment(c, {
    competenceIds: ['message', 'message', 'inconnue'], intensite: 9, defi: 4, maitrise: 0,
    note: '  Conception du message  ', partiesADeleguer: ['redaction', 'message'], rangerADeleguer: true
  });
  assert.deepStrictEqual(m.competenceIds, ['message']);
  assert.deepStrictEqual(m.partiesADeleguer, ['redaction']);
  assert.strictEqual(m.intensite, 5);
  assert.strictEqual(m.maitrise, 1);
  assert.strictEqual(m.note, 'Conception du message');
  assert.strictEqual(CT.regles.trouver(c, 'message').exploree, true);
  assert.strictEqual(c.momentsDeFlow.length, 1);
});

test('un moment sans compétence est refusé', () => {
  const { carte: c } = cartePlacee();
  assert.strictEqual(CT.regles.ajouterMoment(c, { competenceIds: [] }), null);
});

test('les compétences récentes viennent des derniers moments, puis des frontières', () => {
  const { carte: c } = cartePlacee();
  assert.strictEqual(CT.regles.competencesRecentes(c, 6).suggestions[0], 'vente');
  CT.regles.ajouterMoment(c, { competenceIds: ['chanter'], date: '2026-01-01T10:00:00Z' });
  CT.regles.ajouterMoment(c, { competenceIds: ['coacher', 'ecouter'], date: '2026-02-01T10:00:00Z' });
  assert.deepStrictEqual(CT.regles.competencesRecentes(c, 6).recentes, ['coacher', 'ecouter', 'chanter']);
});

test('la recherche ignore les accents et la casse', () => {
  const { carte: c } = cartePlacee();
  assert.strictEqual(CT.regles.rechercher(c, 'theatre')[0].id, 'theatre-impro');
  assert.strictEqual(CT.regles.rechercher(c, 'REDAC')[0].id, 'redaction');
});

test('une compétence ajoutée à la volée est placée sur le continent, sans doublon', () => {
  const { carte: c } = cartePlacee();
  const n = CT.regles.ajouterCompetence(c, 'Facilitation graphique', 'frontiere');
  assert.strictEqual(CT.regles.ajouterCompetence(c, 'facilitation GRAPHIQUE'), n);
  const r = CT.placement.placer(c);
  assert.ok(r.positions[n.id]);
  assert.deepStrictEqual(CT.placement.verifier(r).filter((p) => /Trou|coupé/.test(p)), []);
});

console.log('\nÉclat et brouillard');

test('l\'éclat grandit avec le flow récent et ignore les moments de plus de 30 jours', () => {
  const { carte: c } = cartePlacee();
  const maintenant = Date.parse('2026-10-05T12:00:00Z');
  assert.strictEqual(CT.regles.eclat(c, 'vente', maintenant).niveau, 0);
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], intensite: 5, date: '2026-08-01T10:00:00Z' });
  assert.strictEqual(CT.regles.eclat(c, 'vente', maintenant).niveau, 0);
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], intensite: 4, date: '2026-10-04T10:00:00Z' });
  assert.strictEqual(CT.regles.eclat(c, 'vente', maintenant).niveau, 1);
  for (let i = 0; i < 8; i++) CT.regles.ajouterMoment(c, { competenceIds: ['vente'], intensite: 5, date: '2026-10-0' + (1 + (i % 4)) + 'T10:00:00Z' });
  const e = CT.regles.eclat(c, 'vente', maintenant);
  assert.strictEqual(e.niveau, 4);
  assert.strictEqual(e.nombre, 9);
});

test('le brouillard ne cache que les territoires à conquérir non explorés, et seulement s\'il est activé', () => {
  const { carte: c } = cartePlacee();
  const nocode = CT.regles.trouver(c, 'nocode');
  assert.strictEqual(CT.regles.estCache(c, nocode), false);
  CT.regles.changerPreference(c, 'brouillardDeGuerre', true);
  assert.strictEqual(CT.regles.estCache(c, nocode), true);
  assert.strictEqual(CT.regles.estCache(c, CT.regles.trouver(c, 'vente')), false);
  CT.regles.explorer(c, 'nocode');
  assert.strictEqual(CT.regles.estCache(c, nocode), false);
  CT.regles.changerStatut(c, 'podcast', 'frontiere');
  CT.regles.changerStatut(c, 'podcast', 'a_conquerir');
  assert.strictEqual(CT.regles.estCache(c, CT.regles.trouver(c, 'podcast')), false);
});

test('activer le brouillard ou explorer ne déplace aucun hexagone', () => {
  const { carte: c, res: r } = cartePlacee();
  CT.regles.changerPreference(c, 'brouillardDeGuerre', true);
  CT.regles.explorer(c, 'storytelling');
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'] });
  assert.deepStrictEqual(CT.placement.placer(c).positions, r.positions);
});

console.log('\nProgrès et objectifs');

const LUNDI = Date.parse('2026-10-05T12:00:00'); // lundi 5 octobre 2026, heure locale

test('le flow par semaine compte les moments dans la bonne semaine (lundi → dimanche)', () => {
  const { carte: c } = cartePlacee();
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], date: new Date('2026-10-05T08:00:00').toISOString() });
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], date: new Date('2026-10-04T22:00:00').toISOString() });
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], date: new Date('2026-09-28T09:00:00').toISOString() });
  const s = CT.stats.fluxParSemaine(c, 4, LUNDI);
  assert.deepStrictEqual(s.map((x) => x.nombre), [0, 0, 2, 1]);
  assert.strictEqual(s[3].enCours, true);
});

test('les tops comptent un moment une seule fois par région', () => {
  const { carte: c } = cartePlacee();
  CT.regles.ajouterMoment(c, { competenceIds: ['ecouter', 'coacher'] });
  CT.regles.ajouterMoment(c, { competenceIds: ['coacher', 'jonglage'] });
  const comps = CT.stats.topCompetences(c);
  assert.strictEqual(comps[0].c.id, 'coacher');
  assert.strictEqual(comps[0].nombre, 2);
  const regions = CT.stats.topRegions(c);
  assert.strictEqual(regions[0].cle, 'r:reveler');
  assert.strictEqual(regions[0].nombre, 2);
  assert.ok(regions.some((r) => r.cle === 'i:corps-rythme'));
});

test('la grille défi / maîtrise range chaque moment dans sa case', () => {
  const { carte: c } = cartePlacee();
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], defi: 5, maitrise: 4 });
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], defi: 5, maitrise: 4 });
  assert.strictEqual(CT.stats.grilleDefiMaitrise(c)[4][3], 2);
});

test('la conquête est proposée au seuil, jamais appliquée automatiquement', () => {
  const { carte: c } = cartePlacee();
  for (let i = 0; i < 9; i++) CT.regles.ajouterMoment(c, { competenceIds: ['vente'] });
  assert.strictEqual(CT.stats.propositionsConquete(c).length, 0);
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'] });
  assert.deepStrictEqual(CT.stats.propositionsConquete(c).map((f) => f.c.id), ['vente']);
  assert.strictEqual(CT.regles.trouver(c, 'vente').statut, 'frontiere');
});

test('« pas encore » reporte la proposition de 5 moments', () => {
  const { carte: c } = cartePlacee();
  for (let i = 0; i < 10; i++) CT.regles.ajouterMoment(c, { competenceIds: ['vente'] });
  CT.regles.reporterConquete(c, 'vente');
  assert.strictEqual(CT.stats.propositionsConquete(c).length, 0);
  for (let i = 0; i < 5; i++) CT.regles.ajouterMoment(c, { competenceIds: ['vente'] });
  assert.strictEqual(CT.stats.propositionsConquete(c).length, 1);
});

test('le seuil de conquête est réglable', () => {
  const { carte: c } = cartePlacee();
  CT.regles.changerPreference(c, 'seuilConquete', 3);
  for (let i = 0; i < 3; i++) CT.regles.ajouterMoment(c, { competenceIds: ['calisthenie'] });
  assert.deepStrictEqual(CT.stats.propositionsConquete(c).map((f) => f.c.id), ['calisthenie']);
});

test('le suivi d\'objectif additionne sessions notées et moments de flow de la période', () => {
  const { carte: c } = cartePlacee();
  const o = CT.regles.objectifDe(c, 'vente');
  CT.regles.noterSession(c, o.id, new Date('2026-10-05T09:00:00'));
  CT.regles.ajouterMoment(c, { competenceIds: ['vente'], date: new Date('2026-10-05T10:00:00').toISOString() });
  CT.regles.noterSession(c, o.id, new Date('2026-09-30T09:00:00'));
  const s = CT.stats.suiviObjectif(c, o, LUNDI);
  assert.strictEqual(s.actuelle.fait, 2);
  assert.strictEqual(s.actuelle.cible, 2);
  assert.deepStrictEqual(s.periodes.map((p) => p.fait), [0, 0, 1, 2]);
  CT.regles.retirerSession(c, o.id);
  assert.strictEqual(CT.stats.suiviObjectif(c, o, LUNDI).actuelle.fait, 1);
});

test('on peut créer, modifier et supprimer un objectif', () => {
  const { carte: c } = cartePlacee();
  const o = CT.regles.definirObjectif(c, 'calisthenie', { fois: 3, periode: 'semaine' });
  assert.strictEqual(o.description, 'Calisthénie : 3 sessions par semaine');
  CT.regles.definirObjectif(c, 'calisthenie', { fois: 1, periode: 'mois', description: 'Une séance découverte' });
  assert.strictEqual(CT.regles.objectifDe(c, 'calisthenie').frequence.periode, 'mois');
  assert.ok(CT.regles.supprimerObjectif(c, o.id));
  assert.strictEqual(CT.regles.objectifDe(c, 'calisthenie'), null);
});

console.log('\nBibliothèque et suggestions');

test('la bibliothèque compte environ 300 compétences valides', () => {
  const E = CT.bibliotheque.ENTREES;
  assert.ok(E.length >= 280 && E.length <= 330, E.length + ' entrées');
  assert.strictEqual(new Set(E.map((x) => x.id)).size, E.length);
  E.forEach((x) => assert.ok(CT.schema.DOMAINES[x.domaine], x.id + ' : domaine inconnu'));
});

test('les suggestions écartent ce qui est déjà sur la carte et varient les domaines', () => {
  const { carte: c } = cartePlacee();
  const sugg = CT.suggestions.proposer(c, 6);
  assert.strictEqual(sugg.length, 6);
  const ids = sugg.map((p) => p.entree.id);
  ['vente', 'negociation', 'storytelling', 'nocode', 'podcast', 'facilitation', 'reseaux'].forEach((id) => assert.ok(!ids.includes(id), id + ' déjà sur la carte'));
  const parDomaine = {};
  sugg.forEach((p) => { parDomaine[p.entree.domaine] = (parDomaine[p.entree.domaine] || 0) + 1; });
  Object.values(parDomaine).forEach((n) => assert.ok(n <= 2));
  sugg.forEach((p) => assert.ok(p.regionId && p.raison));
});

test('une suggestion refusée ne revient pas, même après export / import', () => {
  const { carte: c } = cartePlacee();
  const premiere = CT.suggestions.proposer(c, 6)[0].entree.id;
  assert.ok(CT.suggestions.refuser(c, premiere));
  const relue = CT.schema.normaliser(JSON.parse(JSON.stringify(c)));
  assert.ok(!CT.suggestions.proposer(relue, 59).some((p) => p.entree.id === premiere));
  assert.ok(!CT.suggestions.disponibles(relue).some((x) => x.id === premiere));
});

test('le flow récent rapproche les suggestions voisines', () => {
  const { carte: c } = cartePlacee();
  const avant = CT.suggestions.profil(c, CT.bibliotheque.trouver('slam')).score;
  for (let i = 0; i < 4; i++) CT.regles.ajouterMoment(c, { competenceIds: ['rimer'] });
  assert.ok(CT.suggestions.profil(c, CT.bibliotheque.trouver('slam')).score > avant);
});

test('une suggestion numérique prolonge la province numérique', () => {
  const { carte: c } = cartePlacee();
  const p = CT.suggestions.profil(c, CT.bibliotheque.trouver('analyse-donnees'));
  assert.strictEqual(p.distance, 'eloignee');
  assert.strictEqual(CT.placement.groupeDe(CT.suggestions.versCompetence(p)), 'p:numerique');
});

test('afficher les fantômes ne bouge aucun hexagone existant', () => {
  const { carte: c, res: r } = cartePlacee();
  const fantomes = CT.suggestions.proposer(c, 6).map((p) => CT.suggestions.versCompetence(p, 'a_conquerir', 'sugg:' + p.entree.id));
  const r2 = CT.placement.placer(Object.assign({}, c, { competences: c.competences.concat(fantomes) }), { figerExistants: true });
  Object.keys(r.positions).forEach((id) => assert.deepStrictEqual(r2.positions[id], r.positions[id], id + ' a bougé'));
  fantomes.forEach((f) => assert.ok(r2.positions[f.id], f.nom + ' sans place'));
});

test('accepter une suggestion la pose à la place du fantôme, sans bouger le reste', () => {
  const { carte: c, res: r } = cartePlacee();
  const sugg = CT.suggestions.proposer(c, 6);
  const fantomes = sugg.map((p) => CT.suggestions.versCompetence(p, 'a_conquerir', 'sugg:' + p.entree.id));
  const r2 = CT.placement.placer(Object.assign({}, c, { competences: c.competences.concat(fantomes) }), { figerExistants: true });
  const choix = sugg[2].entree.id;
  const nouvelle = CT.suggestions.accepter(c, choix, { position: r2.positions['sugg:' + choix] });
  assert.strictEqual(nouvelle.statut, 'a_conquerir');
  const r3 = CT.placement.placer(c);
  assert.deepStrictEqual(r3.positions[nouvelle.id], r2.positions['sugg:' + choix]);
  Object.keys(r.positions).forEach((id) => assert.deepStrictEqual(r3.positions[id], r.positions[id], id + ' a bougé'));
  assert.ok(!CT.suggestions.proposer(c, 59).some((p) => p.entree.id === choix));
});

test('ajouter depuis la bibliothèque, sans fantôme, ne bouge rien non plus', () => {
  const { carte: c, res: r } = cartePlacee();
  const nouvelle = CT.suggestions.accepter(c, 'yoga', { statut: 'frontiere' });
  const r3 = CT.placement.placer(c);
  assert.ok(r3.positions[nouvelle.id]);
  Object.keys(r.positions).forEach((id) => assert.deepStrictEqual(r3.positions[id], r.positions[id], id + ' a bougé'));
});

console.log('\nCréation guidée');

function brouillonExemple() {
  const C = CT.creation;
  const b = C.nouveauBrouillon();
  b.talent = { nom: 'Faire grandir les équipes', filRouge: 'La confiance en mouvement' };
  C.ajouter(b, 'regions', 'Écouter, Fédérer\nTransmettre');
  const [ecouter, federer, transmettre] = b.regions.map((r) => r.id);
  C.ajouter(b, 'moments', 'Coacher un manager, animer un séminaire, Escalade');
  C.ajouter(b, 'conquises', 'Excel, Anglais, Conduire, Facilitation d\'ateliers');
  C.ajouter(b, 'frontieres', 'Vente; Prise de parole en public');
  C.ajouter(b, 'deleguer', 'Comptabilité\nAdministratif');
  const t = (liste, texte) => b[liste].find((x) => x.texte === texte).id;
  C.ranger(b, 'moments', t('moments', 'Coacher un manager'), ecouter);
  C.ranger(b, 'moments', t('moments', 'animer un séminaire'), federer);
  C.ranger(b, 'moments', t('moments', 'Escalade'), 'ile');
  b.conquises.find((x) => x.texte === 'Excel').distance = 'eloignee';
  b.conquises.find((x) => x.texte === 'Anglais').distance = 'eloignee';
  b.conquises.find((x) => x.texte === 'Conduire').elargit = false;
  C.ranger(b, 'conquises', t('conquises', 'Excel'), transmettre);
  C.ranger(b, 'frontieres', t('frontieres', 'Vente'), federer);
  return { b, ecouter, federer, transmettre };
}

test('la saisie en vrac découpe, nettoie et évite les doublons', () => {
  assert.deepStrictEqual(CT.creation.decouper('- Accueillir, animer ;\n coacher\nAnimer'), ['Accueillir', 'animer', 'coacher']);
  const b = CT.creation.nouveauBrouillon();
  CT.creation.ajouter(b, 'regions', 'Un, Deux');
  CT.creation.ajouter(b, 'regions', 'deux, Trois');
  assert.deepStrictEqual(b.regions.map((r) => r.nom), ['Un', 'Deux', 'Trois']);
});

test('la carte générée respecte les réponses (natal, île, filtre, provinces, délégation)', () => {
  const { b, ecouter, federer, transmettre } = brouillonExemple();
  const c = CT.creation.genererCarte(b);
  const par = (nom) => c.competences.find((x) => x.nom === nom);
  assert.strictEqual(c.talent.nom, 'Faire grandir les équipes');
  assert.strictEqual(par('Coacher un manager').statut, 'natale');
  assert.strictEqual(par('Coacher un manager').regionId, ecouter);
  assert.strictEqual(par('Escalade').statut, 'ile');
  assert.strictEqual(par('Conduire'), undefined, 'écarté par le filtre');
  assert.strictEqual(par('Excel').distance, 'eloignee');
  assert.strictEqual(par('Excel').domaine, 'numerique');
  assert.strictEqual(par('Anglais').regionId, ecouter, 'non rangé : première région');
  assert.strictEqual(par('Vente').statut, 'frontiere');
  assert.strictEqual(par('Vente').regionId, federer);
  assert.strictEqual(par('Comptabilité').statut, 'a_deleguer');
  assert.strictEqual(par('Transmettre').statut, 'natale', 'une région sans cœur reçoit son nom');
  assert.strictEqual(par('Transmettre').regionId, transmettre);
  assert.strictEqual(par('Facilitation d\'ateliers').bibliothequeId, 'facilitation');
});

test('la carte générée se place sans trou ni région coupée', () => {
  const c = CT.creation.genererCarte(brouillonExemple().b);
  const r = CT.placement.placer(c);
  assert.deepStrictEqual(CT.placement.verifier(r).filter((p) => /Trou|coupé|Continent/.test(p)), []);
  c.competences.forEach((x) => assert.ok(r.positions[x.id], x.nom + ' sans place'));
});

test('réordonner les régions change leurs voisines sur la carte générée', () => {
  const b = CT.creation.nouveauBrouillon();
  b.talent.nom = 'T';
  CT.creation.ajouter(b, 'regions', 'A, B, C, D');
  const id = (nom) => b.regions.find((r) => r.nom === nom).id;
  assert.ok(CT.creation.deplacerRegion(b, id('D'), -1));
  assert.deepStrictEqual(b.regions.map((r) => r.nom), ['A', 'B', 'D', 'C']);
  assert.ok(!CT.creation.deplacerRegion(b, id('A'), -1), 'déjà en tête');
  const c = CT.creation.genererCarte(b);
  const voisines = (nom) => c.regions.find((r) => r.nom === nom).voisines.map((v) => c.regions.find((r) => r.id === v).nom).sort();
  assert.deepStrictEqual(voisines('D'), ['B', 'C']);
  assert.deepStrictEqual(voisines('A'), ['B', 'C']);
});

test('un brouillon abîmé se relit sans planter', () => {
  const b = CT.creation.normaliserBrouillon({ etape: 42, regions: [{ id: 'a', nom: 'A' }], moments: [{ id: 'm', texte: 'x', zone: 'inconnue' }], conquises: 'n/a' });
  assert.strictEqual(b.etape, 9);
  assert.strictEqual(b.moments[0].zone, null);
  assert.deepStrictEqual(b.conquises, []);
});

// ---------- Arrivée depuis la Boussole ----------

function lienBoussole(data) {
  return '#b=' + Buffer.from(JSON.stringify(data), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const PROFIL = {
  v: 1,
  mecanisme: 'raconte des histoires qui donnent envie d\'agir',
  contexte: 'un projet porteur de sens doit embarquer des personnes très différentes',
  benefice: 'transformer l\'adhésion en passage à l\'action',
  antiContexte: 'Une communication descendante et aseptisée.',
  success: 'Quand j\'anime un atelier avec des bénévoles et que je vois les gens repartir motivés. Quand je recueille des témoignages.\nÉcrire',
  failure: 'Quand je reformule des communiqués validés par cinq personnes.'
};

test('le lien de la Boussole se décode (UTF-8, base64url) et refuse le reste', () => {
  const d = CT.boussole.lire(lienBoussole(PROFIL));
  assert.strictEqual(d.mecanisme, PROFIL.mecanisme);
  assert.strictEqual(d.contexte, PROFIL.contexte);
  assert.strictEqual(CT.boussole.lire('#b=@@@'), null);
  assert.strictEqual(CT.boussole.lire(''), null);
  assert.strictEqual(CT.boussole.lire(lienBoussole({ v: 2, mecanisme: 'x' })), null, 'version inconnue');
  assert.strictEqual(CT.boussole.lire(lienBoussole({ v: 1 })), null, 'rien de rempli');
  assert.strictEqual(CT.boussole.lire(lienBoussole({ v: 1, mecanisme: 'x'.repeat(5000) })).mecanisme.length, 400, 'textes bornés');
});

test('les contextes vécus se découpent en phrases, sans doublon', () => {
  assert.deepStrictEqual(CT.boussole.phrases('Un. Deux ! Trois…\n- Quatre\nun'), ['Un', 'Deux !', 'Trois…', 'Quatre']);
  assert.deepStrictEqual(CT.boussole.phrases(''), []);
});

test('le brouillon pré-rempli garde les textes entiers, sans coupe automatique', () => {
  const b = CT.boussole.versBrouillon(CT.boussole.lire(lienBoussole(PROFIL)));
  assert.strictEqual(b.talent.nom, 'Raconte des histoires qui donnent envie d\'agir');
  assert.strictEqual(b.talent.filRouge, 'Dans un environnement où ' + PROFIL.contexte + ', afin de ' + PROFIL.benefice);
  const long = CT.boussole.versBrouillon(Object.assign({}, PROFIL, { contexte: PROFIL.contexte + ' et '.repeat(10) + 'encore' }));
  assert.strictEqual(long.talent.filRouge, '', 'fil rouge trop long : laissé vide, montré dans l\'encart');
  assert.strictEqual(b.boussole.reussites.length, 3);
  assert.strictEqual(b.boussole.reussites[0], 'Quand j\'anime un atelier avec des bénévoles et que je vois les gens repartir motivés');
  assert.deepStrictEqual(b.moments, [], 'rien n\'est ajouté sans la personne');
  assert.deepStrictEqual(b.deleguer, []);
  const court = CT.boussole.versBrouillon({ mecanisme: 'fédère', contexte: 'ça bouge', benefice: 'avancer', antiContexte: '', success: '', failure: '' });
  assert.strictEqual(court.talent.filRouge, 'Dans un environnement où ça bouge, afin de avancer');
  // Le brouillon (avec ses rappels) survit à l'enregistrement.
  const relu = CT.creation.normaliserBrouillon(JSON.parse(JSON.stringify(b)));
  assert.deepStrictEqual(relu.boussole, b.boussole);
  assert.strictEqual(CT.creation.normaliserBrouillon({}).boussole, null);
});

test('une saisie trop longue est signalée au lieu d\'être coupée', () => {
  assert.deepStrictEqual(CT.creation.tropLongs('moments', 'Court, ' + 'x'.repeat(61)), ['x'.repeat(61)]);
  assert.deepStrictEqual(CT.creation.tropLongs('regions', 'y'.repeat(41)), ['y'.repeat(41)]);
  assert.deepStrictEqual(CT.creation.tropLongs('deleguer', 'Compta'), []);
});

test('la carte générée depuis un brouillon de la Boussole se place sans trou', () => {
  const b = CT.boussole.versBrouillon(CT.boussole.lire(lienBoussole(PROFIL)));
  CT.creation.ajouter(b, 'regions', 'Raconter, Fédérer, Animer');
  CT.creation.ajouter(b, 'moments', 'Animer un atelier, Recueillir des témoignages');
  CT.creation.ajouter(b, 'deleguer', 'Reformuler des communiqués');
  const c = CT.creation.genererCarte(b);
  assert.strictEqual(c.talent.nom, b.talent.nom);
  assert.ok(c.competences.some((x) => x.statut === 'a_deleguer'));
  const res = CT.placement.placer(c);
  assert.strictEqual(res.cases.length, new Set(res.cases.map((x) => x.q + ',' + x.r)).size, 'aucune case en double');
  assert.deepStrictEqual(CT.placement.verifier(res), []);
});

// ---------- Retours de test : idées, brouillard, pré-rangement, import du quiz ----------

console.log('\nIdées, territoires à conquérir, pré-rangement, quiz');

test('chaque question propose au moins 30 idées par domaine, à la bonne longueur', () => {
  ['regions', 'moments', 'conquises', 'frontieres'].forEach((l) => {
    const groupes = CT.idees.proposer(l, []);
    const tout = [].concat(...groupes.map((g) => g.idees.map((i) => i.texte)));
    assert.ok(tout.length >= 30, l + ' : ' + tout.length + ' idées');
    assert.ok(groupes.length >= 8, l + ' : ' + groupes.length + ' domaines');
    assert.strictEqual(new Set(tout.map((t) => CT.regles.normaliserTexte(t))).size, tout.length, l + ' : doublons');
    tout.forEach((t) => assert.ok(t.length <= CT.creation.longueurMax(l), t));
    assert.ok(groupes.every((g) => g.idees.filter((i) => !i.plus).length <= 3), 'trois idées visibles par domaine');
  });
  assert.ok(!CT.idees.proposer('regions', ['accueillir']).some((g) => g.idees.some((i) => i.texte === 'Accueillir')), 'une idée saisie disparaît');
});

test('une carte créée propose au moins 2 territoires à conquérir par région, tirés de la bibliothèque', () => {
  const { b } = brouillonExemple();
  const c = CT.creation.genererCarte(b);
  c.regions.forEach((r) => {
    const n = c.competences.filter((x) => x.statut === 'a_conquerir' && x.regionId === r.id && !x.exploree && x.bibliothequeId).length;
    assert.ok(n >= 2, r.nom + ' : ' + n);
  });
  assert.deepStrictEqual(CT.placement.verifier(CT.placement.placer(c)), []);
});

test('les territoires à conquérir se rapprochent des sous-talents saisis', () => {
  const b = CT.creation.nouveauBrouillon();
  b.talent.nom = 'Test';
  CT.creation.ajouter(b, 'regions', 'Transmettre, Bricoler');
  const [transmettre, bricoler] = b.regions.map((r) => r.id);
  CT.creation.ajouter(b, 'moments', 'Préparer un cours, Réparer un objet');
  CT.creation.ranger(b, 'moments', b.moments[0].id, transmettre);
  CT.creation.ranger(b, 'moments', b.moments[1].id, bricoler);
  const c = CT.creation.genererCarte(b);
  const dom = (rid) => c.competences.filter((x) => x.statut === 'a_conquerir' && x.regionId === rid).map((x) => x.domaine);
  assert.ok(dom(transmettre).includes('pedagogie'), dom(transmettre).join());
  assert.ok(dom(bricoler).includes('technique'), dom(bricoler).join());
});

test('le regroupement pré-range chaque moment avec une raison, et crée une île pour ce qui ne colle pas', () => {
  const b = CT.creation.nouveauBrouillon();
  CT.creation.ajouter(b, 'regions', 'Écouter, Transmettre, Mettre en scène');
  const [ecouter, transmettre, scene] = b.regions.map((r) => r.id);
  CT.creation.ajouter(b, 'moments', 'Écouter quelqu\'un, Former un groupe, Jouer la comédie, Grimper');
  CT.creation.preRanger(b);
  const zone = (t) => b.moments.find((m) => m.texte === t);
  assert.strictEqual(zone('Écouter quelqu\'un').zone, ecouter);
  assert.strictEqual(zone('Former un groupe').zone, transmettre);
  assert.strictEqual(zone('Jouer la comédie').zone, scene);
  assert.strictEqual(zone('Grimper').zone, 'ile');
  b.moments.forEach((m) => assert.ok(m.raison, m.texte + ' sans raison'));
  // Déplacer efface la raison ; un second passage ne défait rien.
  CT.creation.ranger(b, 'moments', zone('Grimper').id, transmettre);
  CT.creation.preRanger(b);
  assert.strictEqual(zone('Grimper').zone, transmettre);
  assert.strictEqual(zone('Grimper').raison, '');
  const relu = CT.creation.normaliserBrouillon(JSON.parse(JSON.stringify(b)));
  assert.strictEqual(relu.moments.find((m) => m.texte === 'Former un groupe').raison, zone('Former un groupe').raison);
});

test('l\'import du quiz (#q=) pré-remplit le talent et les sous-talents, même encodage que pour la Boussole', () => {
  const data = { v: 1, lang: 'fr', archetypes: ['analyste', 'catalyseur'], name: 'Mon Talent Unique : Analyste Fédérateur', mecanisme: 'sais aller au fond des choses avec méthode',
    contexte: 'il y a des problèmes complexes', benefice: 'aider les équipes à décider', success: 'Auditer un problème. Construire un outil.', failure: 'Sur-cogitation : trop de données.',
    fertile: ['a'], toxic: ['b'], soustalents: ['Fiabiliser', 'Diagnostiquer', 'Fédérer'] };
  const b64 = Buffer.from(JSON.stringify(data), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const d = CT.boussole.lire('#q=' + b64 + '&lang=fr');
  assert.ok(d && d.source === 'quiz');
  const b = CT.boussole.versBrouillon(d);
  assert.strictEqual(b.talent.nom, 'Aller au fond des choses avec méthode');
  assert.deepStrictEqual(b.regions.map((r) => r.nom), ['Fiabiliser', 'Diagnostiquer', 'Fédérer']);
  assert.strictEqual(CT.creation.normaliserBrouillon(JSON.parse(JSON.stringify(b))).boussole.source, 'quiz');
  assert.strictEqual(CT.boussole.lire('#q=!!!'), null);
});

test('les territoires en conquête se classent par priorité, et le classement est enregistré', () => {
  const { carte: c } = cartePlacee();
  ['slam', 'mentorat', 'photographie'].forEach((id) => CT.suggestions.accepter(c, id, { statut: 'frontiere' }));
  const f = CT.regles.frontieres(c);
  assert.deepStrictEqual(f.map((x) => x.priorite), f.map((_, i) => i + 1));
  const dernier = f[f.length - 1];
  assert.ok(CT.regles.deplacerPriorite(c, dernier.id, -1));
  assert.strictEqual(dernier.priorite, f.length - 1);
  assert.ok(!CT.regles.deplacerPriorite(c, CT.regles.frontieres(c)[0].id, -1), 'déjà en tête');
  const relue = CT.schema.normaliser(JSON.parse(JSON.stringify(c)));
  assert.deepStrictEqual(CT.regles.frontieres(relue).map((x) => x.id), CT.regles.frontieres(c).map((x) => x.id));
  // Un territoire du brouillard qu'on choisit devient une frontière en dernière position ; en sortir libère son rang.
  const neuf = CT.suggestions.accepter(c, 'yoga', { statut: 'a_conquerir' });
  CT.regles.changerStatut(c, neuf.id, 'frontiere');
  assert.strictEqual(neuf.statut, 'frontiere');
  assert.strictEqual(neuf.priorite, CT.regles.frontieres(c).length);
  CT.regles.changerStatut(c, CT.regles.frontieres(c)[0].id, 'conquise');
  assert.deepStrictEqual(CT.regles.frontieres(c).map((x) => x.priorite), CT.regles.frontieres(c).map((_, i) => i + 1));
});

// ---------- Traductions ----------

test('chaque texte passé à T() a sa traduction anglaise et espagnole', () => {
  const fs = require('fs');
  const racine = path.join(__dirname, '..');
  const fichiers = ['index.html'].concat(...['js', 'js/geo', 'js/modele', 'js/vues'].map((d) =>
    fs.readdirSync(path.join(racine, d)).filter((f) => f.endsWith('.js')).map((f) => d + '/' + f)));
  const lit = "'((?:[^'\\\\]|\\\\.)*)'";
  const deLitteral = (s) => s.replace(/\\'/g, "'").replace(/\\u00a0/g, ' ');
  const manquants = new Set();
  const verifier = (fr) => { const k = CT.i18n.cle(deLitteral(fr)); if (k && !(k in CT.EN && k in CT.ES)) manquants.add(k); };
  fichiers.forEach((f) => {
    const src = fs.readFileSync(path.join(racine, f), 'utf8');
    for (const m of src.matchAll(new RegExp('\\bT\\(' + lit, 'g'))) verifier(m[1]);
    for (const m of src.matchAll(new RegExp('\\bTn\\([^,]+, ' + lit + ', ' + lit, 'g'))) { verifier(m[1]); verifier(m[2]); }
    // Textes traduits après coup (questions de la création, curseurs du flow, pluriels du Progrès).
    const blocs = [/const QUESTIONS = \{[\s\S]*?\n  \};/, /const CURSEURS = \[[\s\S]*?\n  \]/];
    blocs.forEach((b) => {
      const bloc = (src.match(b) || [''])[0];
      for (const m of bloc.matchAll(new RegExp(lit, 'g'))) {
        if (/[a-zà-ÿ]{2,}/i.test(m[1]) && !/^(regions|moments|conquises|frontieres|deleguer|intensite|defi|maitrise)$/.test(m[1])) verifier(m[1]);
      }
    });
    for (const m of src.matchAll(new RegExp('pluriel\\([^,]+, ' + lit + ', ' + lit, 'g'))) { verifier(m[1]); verifier(m[2]); }
  });
  // Textes visibles de la page HTML statique, traduits au chargement (CT.i18n.traduirePage).
  const html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  for (const m of html.matchAll(/>([^<>]*[A-Za-zÀ-ÿ]{2,}[^<>]*)</g)) {
    const t = m[1].trim();
    if (t && !/^(FR|EN|ES)$/.test(t)) verifier(t);
  }
  for (const m of html.matchAll(/\b(?:title|aria-label|content)="([^"]*[a-zà-ÿ]{3,} [^"]*)"/g)) verifier(m[1]);
  assert.deepStrictEqual([...manquants], []);
});

test('la bibliothèque, les idées et les pistes ont leurs traductions anglaise et espagnole', () => {
  const fs = require('fs');
  const lire = (f) => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
  const lit = "'((?:[^'\\\\]|\\\\.)*)'";
  const dec = (t) => t.replace(/\\'/g, "'");
  const manquants = new Set();
  const verifier = (t) => { const k = CT.i18n.cle(dec(t)); if (!(k in CT.EN && k in CT.ES)) manquants.add(k); };
  for (const m of lire('modele/bibliotheque.js').matchAll(new RegExp("\\be\\('[a-z0-9-]+', " + lit, 'g'))) verifier(m[1]);
  const idees = lire('modele/idees.js');
  const bloc = idees.slice(idees.indexOf('const IDEES = {'), idees.indexOf('const COMPTE_PAR_DOMAINE')).replace(/\/\/.*$/gm, '');
  for (const m of bloc.matchAll(new RegExp(lit, 'g'))) if (/[a-zà-ÿ]{3,}/i.test(m[1]) && !/^[a-z_]+$/.test(m[1])) verifier(m[1]);
  for (const m of idees.matchAll(new RegExp("\\['[a-z]+', " + lit + "\\]", 'g'))) verifier(m[1]);
  for (const m of lire('modele/pistes.js').matchAll(new RegExp("\\['[a-z0-9-]+', " + lit + ", '(?:metier|activite|offre)'", 'g'))) verifier(m[1]);
  assert.deepStrictEqual([...manquants], []);
});

test('T() garde le français par défaut et remplace les variables', () => {
  assert.strictEqual(CT.i18n.langue, 'fr');
  assert.strictEqual(CT.i18n.T('Entre {a} et {b}', { a: 'X', b: 'Y' }), 'Entre X et Y');
  assert.strictEqual(CT.i18n.cle('Capitale : x'), 'Capitale : x');
  assert.ok(CT.EN['Capitale : {nom}'], 'clé sans espace insécable');
});

test('le dictionnaire espagnol a les mêmes clés que l\'anglais, les mêmes variables et aucun reste de français', () => {
  const cles = Object.keys(CT.EN);
  assert.deepStrictEqual(Object.keys(CT.ES).sort(), cles.slice().sort(), 'mêmes clés en anglais et en espagnol');
  const variables = (t) => (t.match(/\{\w+\}|<\/?\w+>/g) || []).sort().join('|');
  const FRANCAIS = /[èêàùçœâîôûëï]|(?<![\p{L}])(est|pour|avec|vous|votre|tes|ton|ta|mon|ma|dans|pas|cette|ces|aux|et|ou|où|qui|du|il|elle|je|nous|quand|mais|comme|chez|aussi|tout|tous|ça)(?![\p{L}])|(?<![\p{L}])(l|d|j|n|qu|c|s)['’]\p{L}/iu;
  // Ce qui reste volontairement identique au français : sigles, marques, termes déjà espagnols.
  const identiques = [];
  const restes = [];
  cles.forEach((k) => {
    const es = CT.ES[k];
    assert.strictEqual(variables(es), variables(k), 'variables différentes : ' + k);
    assert.ok(!/[–—]/.test(es), 'tiret long : ' + k);
    assert.ok(es.trim() !== '' || k.trim() === '', 'traduction vide : ' + k);
    if (es === k && /[a-zà-ÿ]{3,}/i.test(k)) identiques.push(k);
    if (FRANCAIS.test(es.replace(/\{\w+\}/g, ''))) restes.push(k + ' => ' + es);
  });
  assert.deepStrictEqual(restes, [], 'texte resté en français');
  // Seuls des mots qui s'écrivent pareil dans les deux langues peuvent rester identiques.
  const permis = new Set(['Excel', 'PowerPoint', 'Python', 'SQL', 'Yoga', 'Pilates', 'Storytelling', 'Networking', 'Marketing', 'Copywriting', 'Slam', 'Stand-up', 'E-commerce', 'Social selling', 'Community manager', 'Business developer', 'Team building', 'Merchandising', 'Coaching', 'Repair café', 'Freelance', 'Piano', 'Total', 'Blind test', 'Podcast', 'flow', 'de flow', 'IA (LLM)', '≈ {h} h · {niveau}', '{piste} (+{gain} %)']);
  assert.deepStrictEqual(identiques.filter((k) => !permis.has(k)), [], 'traductions identiques au français');
});

test('T() en espagnol : traduit, remplace les variables et retire l\'espace avant : ? !', () => {
  const ancienne = CT.i18n.langue;
  const dico = CT.ES;
  assert.ok(dico['Ajouter'] === 'Añadir');
  // La langue est fixée au chargement : on vérifie le dictionnaire sans recharger la page.
  assert.strictEqual(dico['Capitale : {nom}'], 'Capital: {nom}');
  assert.strictEqual(dico['Entre {a} et {b}'], 'Entre {a} y {b}');
  assert.strictEqual(ancienne, 'fr');
  assert.deepStrictEqual(CT.i18n.LANGUES, ['fr', 'en', 'es']);
  assert.strictEqual(CT.i18n.locale, 'fr-FR');
});

test('glossaire espagnol de la méthode', () => {
  assert.strictEqual(CT.ES['Carte du Talent'], 'Mapa del Talento');
  assert.strictEqual(CT.ES['Ton Anti-Contexte :'], 'Tu Anti-Contexto:');
  assert.strictEqual(CT.ES['Brouillard de guerre'], 'Niebla de guerra');
  assert.ok(CT.ES['Trouver mes clients avec Le Cibleur'].includes('El Buscador de Clientes'));
});

test('le lien de retour vers la Boussole n\'accepte que les adresses de la Boussole', () => {
  const ok = (u) => CT.boussole.retourValide(u);
  assert.strictEqual(ok('https://www.magichumans.com/boussole-decision/profils/abc/'), 'https://www.magichumans.com/boussole-decision/profils/abc/');
  assert.strictEqual(ok('https://boussole-decision-git-claude-zm-retour-magic-humans.vercel.app/boussole-decision/'), 'https://boussole-decision-git-claude-zm-retour-magic-humans.vercel.app/boussole-decision/');
  assert.strictEqual(ok('https://www.magichumans.com/boussole-decision/x/#ancre'), 'https://www.magichumans.com/boussole-decision/x/', 'ancre retirée');
  assert.strictEqual(ok('https://evil.example/boussole-decision/'), null, 'autre site');
  assert.strictEqual(ok('https://www.magichumans.com.evil.example/boussole-decision/'), null, 'faux sous-domaine');
  assert.strictEqual(ok('https://www.magichumans.com/quiz/'), null, 'autre page du site');
  assert.strictEqual(ok('http://www.magichumans.com/boussole-decision/'), null, 'http');
  assert.strictEqual(ok('javascript:alert(1)'), null);
  assert.strictEqual(ok('https://user:pw@www.magichumans.com/boussole-decision/'), null);
  const lien = '#b=xyz&lang=fr&retour=' + encodeURIComponent('https://www.magichumans.com/boussole-decision/profils/abc/');
  assert.strictEqual(CT.boussole.lireRetour(lien), 'https://www.magichumans.com/boussole-decision/profils/abc/');
  assert.strictEqual(CT.boussole.lire(lien), null, 'b invalide, sans effet sur le retour');
  assert.strictEqual(CT.boussole.lireRetour('#lang=fr'), null);
});

// ---------- Mes pistes, toutes les compétences, ressourcement, import du PDF ----------

console.log('\nMes pistes, bibliothèque entière, ressourcement, PDF du quiz');

const attentes = [];
function testAsync(nom, fn) {
  attentes.push(fn().then(() => console.log('  ok  ' + nom), (e) => { echecs++; console.log('  ÉCHEC  ' + nom + '\n        ' + e.message); }));
}

test('la base de pistes compte environ 80 pistes valides, de trois types', () => {
  const P = CT.pistes.PISTES;
  assert.ok(P.length >= 75 && P.length <= 90, P.length + ' pistes');
  assert.strictEqual(new Set(P.map((x) => x.id)).size, P.length, 'identifiants uniques');
  const ids = new Set(CT.bibliotheque.ENTREES.map((e) => e.id));
  P.forEach((x) => {
    assert.ok(CT.pistes.TYPES[x.type], x.id + ' : type');
    assert.ok(x.requis.length >= 4 && x.requis.length <= 6, x.id + ' : ' + x.requis.length + ' compétences');
    assert.strictEqual(new Set(x.requis).size, x.requis.length, x.id + ' : doublon');
    x.requis.forEach((r) => assert.ok(ids.has(r), x.id + ' : compétence inconnue ' + r));
  });
  ['metier', 'activite', 'offre'].forEach((t) => assert.ok(P.filter((x) => x.type === t).length >= 10, t));
});

test('Mes pistes propose 5 à 10 pistes avec pourcentage, hexagones justificatifs et compétences manquantes', () => {
  const { carte: c } = cartePlacee();
  const liste = CT.pistes.proposer(c);
  assert.ok(liste.length >= 5 && liste.length <= 10, liste.length + ' pistes');
  liste.forEach((e, i) => {
    assert.ok(e.pourcentage >= 0 && e.pourcentage <= 98, e.piste.id + ' : ' + e.pourcentage);
    if (i) assert.ok(liste[i - 1].pourcentage >= e.pourcentage, 'tri par correspondance');
    e.hexagones.forEach((id) => assert.ok(CT.regles.trouver(c, id), 'hexagone existant'));
    e.manquantes.forEach((m) => assert.ok(CT.bibliotheque.trouver(m.id)));
  });
  assert.ok(liste[0].pourcentage >= 40, 'la meilleure piste colle vraiment : ' + liste[0].pourcentage);
  assert.ok(liste[0].hexagones.length > 0, 'la meilleure piste est justifiée par des hexagones');
  assert.ok(liste.some((e) => e.manquantes.length), 'au moins une piste a des compétences manquantes');
  // Au plus 5 par type, pour garder de la variété.
  ['metier', 'activite', 'offre'].forEach((t) => assert.ok(liste.filter((e) => e.piste.type === t).length <= 5, t));
});

test('une carte vide reçoit tout de même des pistes à explorer, sans planter', () => {
  const liste = CT.pistes.proposer(CT.schema.creerCarteVide());
  assert.ok(liste.length >= 5);
  liste.forEach((e) => assert.ok(e.pourcentage <= 20, 'rien d\'acquis, correspondance faible'));
});

test('le pourcentage monte quand un territoire est conquis ou travaillé, et les moments de flow le renforcent', () => {
  const { carte: c } = cartePlacee();
  const avant = CT.pistes.evaluer(c, 'conferencier', Date.now());
  CT.regles.changerStatut(c, CT.regles.rechercher(c, 'Prise de parole', [])[0] ? CT.regles.rechercher(c, 'Prise de parole', [])[0].id : 'prise-parole', 'conquise');
  const ajoute = CT.suggestions.accepter(c, 'prise-parole', { statut: 'conquise' }) || CT.regles.rechercher(c, 'Prise de parole en public', [])[0];
  assert.ok(ajoute);
  const apres = CT.pistes.evaluer(c, 'conferencier', Date.now());
  assert.ok(apres.pourcentage > avant.pourcentage, avant.pourcentage + ' → ' + apres.pourcentage);
  assert.ok(apres.hexagones.includes(ajoute.id));
  assert.ok(!apres.manquantes.some((m) => m.id === 'prise-parole'));
  CT.regles.ajouterMoment(c, { competenceIds: [ajoute.id], intensite: 4, defi: 3, maitrise: 3 });
  assert.ok(CT.pistes.evaluer(c, 'conferencier', Date.now()).pourcentage > apres.pourcentage, 'le flow renforce la piste');
});

test('Viser une piste : les compétences manquantes deviennent des territoires en conquête classés par priorité', () => {
  const { carte: c } = cartePlacee();
  const avant = CT.pistes.evaluer(c, 'conferencier', Date.now());
  assert.ok(avant.manquantes.length >= 2);
  const nbFrontieres = CT.regles.frontieres(c).length;
  const r = CT.pistes.viser(c, 'conferencier', Date.now());
  assert.strictEqual(r.ajoutes.length + r.convertis.length, avant.manquantes.length);
  const apres = CT.pistes.evaluer(c, 'conferencier', Date.now());
  assert.deepStrictEqual(apres.manquantes, [], 'plus rien ne manque : tout est en conquête');
  assert.ok(apres.visee && c.pistesVisees.includes('conferencier'));
  const f = CT.regles.frontieres(c);
  assert.strictEqual(f.length, nbFrontieres + r.ajoutes.length + r.convertis.length);
  assert.deepStrictEqual(f.map((x) => x.priorite), f.map((_, i) => i + 1), 'priorités 1, 2, 3…');
  r.lies.forEach((id) => assert.ok(CT.regles.trouver(c, id).pistes.includes('conferencier')));
  // Idempotent : viser deux fois n'ajoute rien.
  const n = c.competences.length;
  const r2 = CT.pistes.viser(c, 'conferencier', Date.now());
  assert.strictEqual(c.competences.length, n);
  assert.strictEqual(r2.ajoutes.length + r2.convertis.length, 0);
  assert.deepStrictEqual(CT.placement.verifier(CT.placement.placer(c)), []);
});

test('l\'ordre de priorité des territoires visés est modifiable et enregistré', () => {
  const { carte: c } = cartePlacee();
  CT.pistes.viser(c, 'offre-formation-ligne', Date.now());
  const f = CT.regles.frontieres(c);
  const dernier = f[f.length - 1];
  assert.ok(CT.regles.deplacerPriorite(c, dernier.id, -1));
  assert.strictEqual(CT.regles.trouver(c, dernier.id).priorite, f.length - 1);
  // Aller-retour par l'enregistrement (JSON) : priorités, drapeaux et lien avec la piste sont gardés.
  const relue = CT.schema.normaliser(JSON.parse(JSON.stringify(c)));
  assert.deepStrictEqual(CT.regles.frontieres(relue).map((x) => x.id), CT.regles.frontieres(c).map((x) => x.id));
  assert.deepStrictEqual(CT.regles.frontieres(relue).map((x) => x.priorite), CT.regles.frontieres(c).map((x) => x.priorite));
  assert.deepStrictEqual(relue.pistesVisees, ['offre-formation-ligne']);
  assert.ok(relue.competences.some((x) => x.pistes.includes('offre-formation-ligne')));
});

test('Ne plus viser retire le lien avec la piste mais garde les territoires en conquête', () => {
  const { carte: c } = cartePlacee();
  CT.pistes.viser(c, 'podcasteur', Date.now());
  const n = CT.regles.frontieres(c).length;
  assert.ok(CT.pistes.abandonner(c, 'podcasteur'));
  assert.strictEqual(CT.regles.frontieres(c).length, n);
  assert.deepStrictEqual(c.pistesVisees, []);
  assert.ok(c.competences.every((x) => !x.pistes.length));
  assert.strictEqual(CT.pistes.abandonner(c, 'podcasteur'), false);
});

test('les cartes enregistrées avant « Mes pistes » restent lisibles', () => {
  const c = CT.schema.normaliser({ talent: { nom: 'X' }, competences: [{ id: 'a', nom: 'A', statut: 'conquise' }] });
  assert.deepStrictEqual(c.pistesVisees, []);
  assert.deepStrictEqual(c.competences[0].pistes, []);
  assert.ok(CT.pistes.proposer(c).length >= 5);
});

test('on peut conquérir n\'importe quelle compétence de la bibliothèque, brouillard ou non', () => {
  const { carte: c } = cartePlacee();
  c.preferences.brouillardDeGuerre = true;
  const libres = CT.bibliotheque.ENTREES.filter((e) => !CT.suggestions.dejaSurLaCarte(c, e));
  assert.ok(libres.length > 100);
  const statuts = ['frontiere', 'a_conquerir', 'conquise'];
  libres.forEach((e, i) => {
    const x = CT.suggestions.accepter(c, e.id, { statut: statuts[i % 3] });
    assert.ok(x && x.statut === statuts[i % 3], e.id);
    assert.ok(!CT.regles.estCache(c, x), e.id + ' : un hexagone choisi n\'est pas sous le brouillard');
  });
  assert.strictEqual(CT.bibliotheque.ENTREES.filter((e) => !CT.suggestions.dejaSurLaCarte(c, e)).length, 0);
  assert.doesNotThrow(() => CT.placement.placer(c), 'même toute la bibliothèque ne fait pas planter le placement');
  // Une poignée de conquêtes (une quarantaine) laisse une carte géographiquement propre.
  const { carte: d } = cartePlacee();
  libres.slice(0, 40).forEach((e, i) => CT.suggestions.accepter(d, e.id, { statut: statuts[i % 3] }));
  assert.deepStrictEqual(CT.placement.verifier(CT.placement.placer(d)), []);
});

test('un territoire sous le brouillard se conquiert sans passer par l\'exploration', () => {
  const b = brouillonExemple().b;
  const c = CT.creation.genererCarte(b);
  c.preferences.brouillardDeGuerre = true;
  const cache = c.competences.find((x) => CT.regles.estCache(c, x));
  assert.ok(cache, 'il y a des territoires sous le brouillard');
  assert.ok(CT.regles.changerStatut(c, cache.id, 'conquise'));
  assert.ok(!CT.regles.estCache(c, cache) && cache.exploree);
});

test('au moins 15 tâches à déléguer et 15 compétences de vente sont proposées en exemples', () => {
  const deleguer = [].concat(...CT.idees.proposer('deleguer', []).map((g) => g.idees.map((i) => i.texte)));
  assert.ok(deleguer.length >= 15, deleguer.length + ' tâches');
  assert.strictEqual(new Set(deleguer.map((t) => CT.regles.normaliserTexte(t))).size, deleguer.length, 'doublons');
  deleguer.forEach((t) => assert.ok(t.length <= CT.creation.longueurMax('deleguer'), t));
  const vente = CT.idees.proposer('conquises', []).find((g) => g.cle === 'vente');
  assert.ok(vente && vente.idees.length >= 15, 'compétences de vente : ' + (vente ? vente.idees.length : 0));
  const biblio = CT.bibliotheque.ENTREES.filter((e) => e.domaine === 'business');
  vente.idees.forEach((i) => assert.ok(biblio.some((e) => CT.regles.normaliserTexte(e.nom) === CT.regles.normaliserTexte(i.texte)), i.texte + ' : absent de la bibliothèque'));
  assert.ok(CT.idees.proposer('frontieres', []).find((g) => g.cle === 'vente').idees.length >= 15);
  assert.ok(CT.idees.proposer('deleguer', []).every((g) => g.idees.filter((i) => !i.plus).length <= 3), 'trois idées visibles par domaine');
});

test('la zone de ressourcement se pose à l\'écart, sans trou ni île collée', () => {
  const { carte: c } = cartePlacee();
  ['Marcher en forêt', 'Lire un roman', 'Cuisiner en musique'].forEach((nom) => {
    c.competences.push({ id: 'r-' + nom, nom, icone: 'sprout', statut: 'ressource', exploree: true });
  });
  const norm = CT.schema.normaliser(c);
  assert.strictEqual(norm.competences.filter((x) => x.statut === 'ressource').length, 3);
  const res = CT.placement.placer(norm);
  assert.deepStrictEqual(CT.placement.verifier(res), []);
  const cases = res.cases.filter((x) => norm.competences.find((y) => y.id === x.id && y.statut === 'ressource'));
  assert.strictEqual(cases.length, 3);
  cases.forEach((x) => assert.strictEqual(x.zone, 'ressource'));
  assert.ok(res.etiquettes.some((e) => e.type === 'ressource' && /ressourcement/i.test(e.nom)), 'étiquette de la zone');
  const clefs = new Set(res.cases.map((x) => x.q + ',' + x.r));
  assert.strictEqual(clefs.size, res.cases.length, 'positions uniques');
  // Elle ne prend pas la place de la zone à déléguer.
  const deleg = res.cases.filter((x) => x.zone === 'deleguer');
  assert.ok(deleg.length);
  cases.forEach((a) => deleg.forEach((b2) => assert.ok(CT.hex.distance(a, b2) >= 3)));
});

test('le quiz transmet ses ressourcements : la création les range dans la zone de ressourcement', () => {
  const data = { v: 1, mecanisme: 'sais aller au fond des choses', ressources: ['Marcher en forêt, sans téléphone', 'Une soirée entre proches ; sans parler boulot', ''], rechargeTitre: 'Recharge Solitaire' };
  const d = CT.boussole.lire('#q=' + Buffer.from(JSON.stringify(data)).toString('base64url'));
  assert.deepStrictEqual(d.ressources, ['Marcher en forêt  sans téléphone', 'Une soirée entre proches   sans parler boulot']);
  assert.strictEqual(d.rechargeTitre, 'Recharge Solitaire');
  const b = CT.boussole.versBrouillon(d);
  assert.strictEqual(b.ressources.length, 2);
  b.talent.nom = 'Aller au fond des choses';
  CT.creation.ajouter(b, 'regions', 'Analyser, Comprendre');
  const carte = CT.creation.genererCarte(b);
  const zone = carte.competences.filter((x) => x.statut === 'ressource');
  assert.deepStrictEqual(zone.map((x) => x.nom), ['Marcher en forêt  sans téléphone', 'Une soirée entre proches   sans parler boulot'].map((t) => t.trim()));
  assert.deepStrictEqual(CT.placement.verifier(CT.placement.placer(carte)), []);
  // Le brouillon enregistré garde la zone, un ancien brouillon (sans zone) reste lisible.
  assert.strictEqual(CT.creation.normaliserBrouillon(JSON.parse(JSON.stringify(b))).ressources.length, 2);
  assert.deepStrictEqual(CT.creation.normaliserBrouillon({ etape: 2 }).ressources, []);
  // Idées trop nombreuses ou en double : bornées, sans doublon.
  const c2 = CT.creation.nouveauBrouillon();
  CT.creation.ajouter(c2, 'ressources', Array.from({ length: 20 }, (_, i) => 'Idée ' + i).join(';') + ';idée 1');
  assert.strictEqual(c2.ressources.length, CT.creation.MAX_RESSOURCES);
});

// PDF du quiz : une image, donc les données sont dans ses métadonnées (mot-clé « CTQ1:… », même encodage que #q=).
const donneesQuiz = { v: 1, mecanisme: 'sais relier les gens', contexte: 'il y a du lien', benefice: 'aider les équipes à avancer', ressources: ['Jardiner'], soustalents: ['Relier'] };
const jetonQuiz = Buffer.from(JSON.stringify(donneesQuiz)).toString('base64url');
const pdfAvecMeta = Buffer.from('%PDF-1.3\n1 0 obj\n<</Producer (jsPDF 2.5.1) /Subject (Talent Unique) /Keywords (CTQ1:' + jetonQuiz + ')>>\nendobj\ntrailer\n<<>>\n%%EOF', 'latin1');

testAsync('« Importer mon résultat QCM (PDF) » lit le résultat dans les métadonnées du PDF du quiz', async () => {
  const d = await CT.boussole.lirePdf(pdfAvecMeta);
  assert.strictEqual(d.source, 'quiz');
  assert.strictEqual(d.mecanisme, 'relier les gens');
  assert.deepStrictEqual(d.ressources, ['Jardiner']);
  assert.deepStrictEqual(d.soustalents, ['Relier']);
  // Même résultat que via le lien #q=.
  assert.deepStrictEqual(d, CT.boussole.lire('#q=' + jetonQuiz));
  // Accepte aussi un ArrayBuffer (File.arrayBuffer()) et une chaîne UTF-16 de PDF.
  const ab = pdfAvecMeta.buffer.slice(pdfAvecMeta.byteOffset, pdfAvecMeta.byteOffset + pdfAvecMeta.byteLength);
  assert.strictEqual((await CT.boussole.lirePdf(ab)).mecanisme, 'relier les gens');
  const utf16 = Buffer.concat([Buffer.from('%PDF-1.3\n/Keywords <FEFF'), Buffer.from(Array.from('CTQ1:' + jetonQuiz).map((ch) => '\0' + ch).join(''), 'latin1'), Buffer.from('>\n%%EOF')]);
  assert.strictEqual((await CT.boussole.lirePdf(utf16)).mecanisme, 'relier les gens');
});

testAsync('le résultat du quiz est aussi retrouvé dans un flux compressé du PDF', async () => {
  const zlib = require('zlib');
  const pdf = Buffer.concat([Buffer.from('%PDF-1.4\n4 0 obj\n<</Filter /FlateDecode /Length 99>>\nstream\n'), zlib.deflateSync(Buffer.from('BT (CTQ1:' + jetonQuiz + ') Tj ET')),
    Buffer.from('\nendstream\nendobj\n%%EOF')]);
  assert.strictEqual((await CT.boussole.lirePdf(pdf)).mecanisme, 'relier les gens');
});

testAsync('un PDF sans résultat du quiz, un autre fichier ou un fichier vide donnent « rien », jamais une erreur', async () => {
  assert.strictEqual(await CT.boussole.lirePdf(Buffer.from('%PDF-1.3\n/Title (Facture)\n%%EOF')), null);
  assert.strictEqual(await CT.boussole.lirePdf(Buffer.from('pas un pdf CTQ1:' + jetonQuiz)), null, 'sans en-tête PDF');
  assert.strictEqual(await CT.boussole.lirePdf(Buffer.alloc(0)), null);
  assert.strictEqual(await CT.boussole.lirePdf(Buffer.from('%PDF-1.3\n/Keywords (CTQ1:@@@@@@@@@@@)')), null, 'jeton illisible');
  assert.strictEqual(await CT.boussole.lirePdf(Buffer.from('%PDF-1.3\n/Keywords (CTQ1:' + Buffer.from('{"v":2}').toString('base64url') + ')')), null, 'version inconnue');
});

test('le quiz écrit le résultat de la carte dans les métadonnées de son PDF', () => {
  const fs = require('fs');
  const quiz = fs.readFileSync(path.join(__dirname, '..', '..', 'quiz', 'index.html'), 'utf8');
  assert.ok(/function carteData\(/.test(quiz) && /function carteJeton\(/.test(quiz));
  assert.ok(/const PDF_CARTE_MARQUE = "CTQ1:"/.test(quiz), 'marque lue par la carte');
  assert.ok(/\.toPdf\(\)\.get\("pdf"\)\.then\(pdf => \{[\s\S]*?setProperties\(\{[^}]*keywords: carteJeton\(p, lang\)/.test(quiz), 'jeton dans le mot-clé du PDF');
  assert.ok(/data\.ressources = /.test(quiz), 'ressourcements dans les données de la carte');
});

Promise.all(attentes).then(() => {
  console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTout est vert.');
  process.exitCode = echecs ? 1 : 0;
});
