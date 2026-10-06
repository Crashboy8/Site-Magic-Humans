/*
 * Tests du placement automatique (Node, sans dépendance) :
 *   node carte-du-talent/tests/placement.test.js          → vérifications
 *   node carte-du-talent/tests/placement.test.js --carte  → affiche aussi la carte en texte
 */
'use strict';

const path = require('path');
const assert = require('assert');
['geo/hex.js', 'modele/schema.js', 'modele/demo.js', 'geo/placement.js', 'modele/regles.js', 'modele/stats.js', 'modele/bibliotheque.js', 'modele/suggestions.js', 'modele/creation.js'].forEach((f) => {
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

test('la bibliothèque compte une cinquantaine de compétences valides', () => {
  const E = CT.bibliotheque.ENTREES;
  assert.ok(E.length >= 45 && E.length <= 65, E.length + ' entrées');
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

test('un brouillon abîmé se relit sans planter', () => {
  const b = CT.creation.normaliserBrouillon({ etape: 42, regions: [{ id: 'a', nom: 'A' }], moments: [{ id: 'm', texte: 'x', zone: 'inconnue' }], conquises: 'n/a' });
  assert.strictEqual(b.etape, 9);
  assert.strictEqual(b.moments[0].zone, null);
  assert.deepStrictEqual(b.conquises, []);
});

console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTout est vert.');
process.exitCode = echecs ? 1 : 0;
