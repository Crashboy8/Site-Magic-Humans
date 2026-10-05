/*
 * Grille hexagonale en coordonnées axiales (q, r), hexagones « pointe en haut ».
 * Référence : https://www.redblobgames.com/grids/hexagons/
 * Aucun accès au DOM : utilisable dans le navigateur comme dans Node (tests).
 */
(function (CT) {
  'use strict';

  const SQRT3 = Math.sqrt(3);

  // Les six voisins, dans l'ordre des arêtes (est, nord-est, nord-ouest, ouest, sud-ouest, sud-est).
  const DIRECTIONS = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  function cle(q, r) {
    return q + ',' + r;
  }

  function depuisCle(k) {
    const [q, r] = k.split(',').map(Number);
    return { q, r };
  }

  function voisins(q, r) {
    return DIRECTIONS.map((d) => ({ q: q + d.q, r: r + d.r }));
  }

  function distance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }

  function versPixel(q, r, taille) {
    return { x: taille * SQRT3 * (q + r / 2), y: taille * 1.5 * r };
  }

  function arrondir(qf, rf) {
    const sf = -qf - rf;
    let q = Math.round(qf);
    let r = Math.round(rf);
    const s = Math.round(sf);
    const dq = Math.abs(q - qf);
    const dr = Math.abs(r - rf);
    const ds = Math.abs(s - sf);
    if (dq > dr && dq > ds) q = -r - s;
    else if (dr > ds) r = -q - s;
    return { q, r };
  }

  function depuisPixel(x, y, taille) {
    return arrondir((SQRT3 / 3 * x - y / 3) / taille, (2 / 3 * y) / taille);
  }

  // Angle (radians, -π..π) du centre de l'hexagone vu depuis l'origine, en repère écran (y vers le bas).
  function angle(q, r) {
    const p = versPixel(q, r, 1);
    return Math.atan2(p.y, p.x);
  }

  // Écart angulaire absolu entre deux angles, entre 0 et π.
  function ecartAngle(a, b) {
    let d = Math.abs(a - b) % (2 * Math.PI);
    return d > Math.PI ? 2 * Math.PI - d : d;
  }

  function moyenneAngles(angles) {
    let x = 0;
    let y = 0;
    angles.forEach((a) => { x += Math.cos(a); y += Math.sin(a); });
    return Math.atan2(y, x);
  }

  // Les six sommets d'un hexagone pointe en haut centré en (cx, cy).
  function coins(cx, cy, taille) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 30);
      pts.push({ x: cx + taille * Math.cos(a), y: cy + taille * Math.sin(a) });
    }
    return pts;
  }

  // Cellules d'un anneau de rayon donné autour d'un centre.
  function anneau(centre, rayon) {
    if (rayon === 0) return [{ q: centre.q, r: centre.r }];
    const res = [];
    let c = { q: centre.q + DIRECTIONS[4].q * rayon, r: centre.r + DIRECTIONS[4].r * rayon };
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < rayon; j++) {
        res.push(c);
        c = { q: c.q + DIRECTIONS[i].q, r: c.r + DIRECTIONS[i].r };
      }
    }
    return res;
  }

  CT.hex = {
    DIRECTIONS, cle, depuisCle, voisins, distance, versPixel, depuisPixel,
    arrondir, angle, ecartAngle, moyenneAngles, coins, anneau
  };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
