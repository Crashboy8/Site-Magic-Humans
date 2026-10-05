/*
 * Tests du placement automatique (Node, sans dépendance) :
 *   node carte-du-talent/tests/placement.test.js          → vérifications
 *   node carte-du-talent/tests/placement.test.js --carte  → affiche aussi la carte en texte
 */
'use strict';

const path = require('path');
const assert = require('assert');
['geo/hex.js', 'modele/schema.js', 'modele/demo.js', 'geo/placement.js', 'modele/regles.js'].forEach((f) => {
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

console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTout est vert.');
process.exitCode = echecs ? 1 : 0;
