/*
 * Légende discrète : régions de la carte et statuts des hexagones.
 */
(function (CT) {
  'use strict';

  const O = CT.outils;

  function pastille(fond, contour, pointilles, opacite) {
    return '<svg class="pastille" viewBox="-12 -12 24 24" aria-hidden="true"><polygon points="' +
      CT.hex.coins(0, 0, 10).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + '" fill="' + fond +
      '" stroke="' + contour + '" stroke-width="1.6"' + (pointilles ? ' stroke-dasharray="' + pointilles + '"' : '') +
      ' opacity="' + (opacite || 1) + '"/></svg>';
  }

  function rendre(conteneur, carte) {
    const base = '#E5738E';
    const regions = carte.regions.map((r) =>
      '<li>' + pastille(r.couleur, O.nuance(r.couleur, -0.2)) + O.echapper(r.nom) + '</li>').join('');
    const statuts = [
      [pastille('#F4C95D', '#B9862A'), 'Capitale : ton talent'],
      [pastille(base, O.nuance(base, -0.2)), 'Territoire natal'],
      [pastille(O.nuance(base, 0.16), O.nuance(base, -0.18)), 'Territoire conquis'],
      [pastille(O.nuance(base, 0.6), O.nuance(base, -0.3), '3 2'), 'Frontière (en cours)'],
      [pastille(O.nuance(base, 0.84), O.nuance(base, -0.05), '1.5 2', 0.85), 'À conquérir'],
      [pastille('#86A9C9', '#6C8BA8'), 'Province éloignée'],
      [pastille('#7DCDAE', '#5FA98C'), 'Île de flow'],
      [pastille('#B4BAC2', '#8D949C'), 'À déléguer']
    ].map(([p, t]) => '<li>' + p + t + '</li>').join('');
    const reperes = '<li><svg class="pastille" viewBox="-12 -12 24 24" aria-hidden="true"><circle r="11" fill="#FFD866" opacity=".55"/>' +
      '<circle r="6" fill="#FFE9A8"/></svg>Éclat : flow des 30 derniers jours</li>' +
      (carte.preferences.brouillardDeGuerre ? '<li>' + pastille('#E9EFF1', '#C9D5DA', '1.5 2') + 'Brouillard : territoire inexploré</li>' : '');
    conteneur.innerHTML =
      '<h2>Régions</h2><ul>' + regions + '</ul>' +
      '<h2>Statuts</h2><ul>' + statuts + '</ul>' +
      '<h2>Repères</h2><ul>' + reperes + '</ul>';
  }

  CT.vueLegende = { rendre };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
