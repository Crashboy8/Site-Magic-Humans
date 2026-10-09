/*
 * Lien Carte du Talent vers Le Cibleur (Node, sans dépendance) :
 *   node carte-du-talent/tests/cibleur.test.js
 */
'use strict';

const path = require('path');
const assert = require('assert');
['i18n.js', 'modele/cibleur.js'].forEach((f) => {
  require(path.join(__dirname, '..', 'js', f));
});
const CT = globalThis.CarteTalent;

let echecs = 0;
function test(nom, fn) {
  try { fn(); console.log('  ok  ' + nom); } catch (e) { echecs++; console.log('  ÉCHEC  ' + nom + '\n        ' + e.message); }
}

function decoder(href) {
  const charge = String(href).split('#cible=')[1];
  assert.ok(charge, 'ancre absente');
  assert.match(charge, /^[A-Za-z0-9_-]+$/, 'base64url sans remplissage');
  const b64 = charge.replace(/-/g, '+').replace(/_/g, '/');
  const binaire = Buffer.from(b64, 'base64');
  return JSON.parse(new TextDecoder().decode(binaire));
}

test('aller retour : talent, régions, pistes visées et compétences à déléguer', () => {
  const href = CT.cibleur.url({
    talent: { nom: '  Faire grandir les équipes ', filRouge: ' La confiance en mouvement ' },
    regions: [{ nom: 'Écouter' }, { nom: 'Fédérer' }, { nom: '' }],
    competences: [
      { nom: 'Comptabilité', statut: 'a_deleguer' },
      { nom: 'Excel', statut: 'conquise' },
      { nom: '  Relances  ', statut: 'a_deleguer' }
    ]
  }, ['Formateur·rice', '   ', 'Coach']);
  assert.ok(href.startsWith('/boussole-decision/ma-cible/#cible='));
  assert.deepStrictEqual(decoder(href), {
    v: 1,
    src: 'carte',
    lang: 'fr',
    nom: 'Faire grandir les équipes',
    contexte: 'La confiance en mouvement',
    sousTalents: ['Écouter', 'Fédérer'],
    pistes: ['Formateur·rice', 'Coach'],
    aDeleguer: ['Comptabilité', 'Relances']
  });
});

test('limites : 6 régions × 60, 5 pistes × 80, 6 compétences × 60, champs vides retirés', () => {
  const long = (n) => 'é'.repeat(n);
  const href = CT.cibleur.url({
    talent: { nom: '', filRouge: '   ' },
    regions: Array.from({ length: 8 }, (_, i) => ({ nom: long(80) + i })),
    competences: Array.from({ length: 8 }, (_, i) => ({ nom: long(70) + i, statut: 'a_deleguer' }))
  }, Array.from({ length: 7 }, (_, i) => long(100) + i));
  const lu = decoder(href);
  assert.strictEqual(lu.nom, undefined);
  assert.strictEqual(lu.contexte, undefined);
  assert.strictEqual(lu.sousTalents.length, 6);
  assert.ok(lu.sousTalents.every((n) => n.length === 60));
  assert.strictEqual(lu.pistes.length, 5);
  assert.ok(lu.pistes.every((n) => n.length === 80));
  assert.strictEqual(lu.aDeleguer.length, 6);
  assert.ok(lu.aDeleguer.every((n) => n.length === 60));
  assert.deepStrictEqual(Object.keys(lu), ['v', 'src', 'lang', 'sousTalents', 'pistes', 'aDeleguer']);
});

test('carte vide : seulement la source, sans ancre illisible', () => {
  const lu = decoder(CT.cibleur.url({}, []));
  assert.deepStrictEqual(lu, { v: 1, src: 'carte', lang: 'fr' });
});

console.log(echecs ? '\n' + echecs + ' échec(s)' : '\nTout est vert.');
process.exitCode = echecs ? 1 : 0;
