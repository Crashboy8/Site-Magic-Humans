/*
 * Tests du placement automatique (Node, sans dépendance) :
 *   node carte-du-talent/tests/placement.test.js          → vérifications
 *   node carte-du-talent/tests/placement.test.js --carte  → affiche aussi la carte en texte
 */
'use strict';

const path = require('path');
const assert = require('assert');
['geo/hex.js', 'modele/schema.js', 'modele/demo.js', 'geo/placement.js'].forEach((f) => {
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

console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTout est vert.');
process.exitCode = echecs ? 1 : 0;
