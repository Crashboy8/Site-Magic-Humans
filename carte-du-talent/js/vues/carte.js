/*
 * Rendu SVG de la carte : mer, hauts-fonds, plages, hexagones en relief, icônes et noms.
 * Lit le modèle et le résultat du placement ; ne modifie jamais les données.
 */
(function (CT) {
  'use strict';

  const H = CT.hex;
  const O = CT.outils;
  const T = 56; // rayon d'un hexagone, en unités SVG
  const RELIEF = 7; // épaisseur de la tranche visible sous chaque tuile

  const COULEURS = {
    capitale: '#F4C95D',
    ile: '#7DCDAE',
    deleguer: '#B4BAC2',
    sable: '#F4E4BC',
    hautFond: '#BFE8EC'
  };

  function polygone(cx, cy, rayon) {
    return H.coins(cx, cy, rayon).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  }

  // Couleur de base d'une compétence selon son statut, sa région ou sa province.
  function couleurDe(c, carte) {
    if (c.statut === 'ile') return COULEURS.ile;
    if (c.statut === 'a_deleguer') return COULEURS.deleguer;
    if (c.distance === 'eloignee' && c.statut !== 'natale') {
      return (CT.schema.DOMAINES[c.domaine] || { couleur: '#B9A88F' }).couleur;
    }
    const r = carte.regions.find((x) => x.id === c.regionId);
    return r ? r.couleur : '#9DB8A0';
  }

  function couleurRegion(carte, id) {
    const r = carte.regions.find((x) => x.id === id);
    return r ? r.couleur : null;
  }

  // Aspect d'une tuile : remplissage, tranche, contour, texte.
  function aspect(c, carte) {
    const base = couleurDe(c, carte);
    const a = { fond: base, tranche: O.nuance(base, -0.28), contour: O.nuance(base, -0.18), texte: '#3B3A36',
      pointilles: null, relief: true, opacite: 1, encre: O.nuance(base, -0.55) };
    switch (c.statut) {
      case 'natale':
        break;
      case 'conquise':
        a.fond = O.nuance(base, 0.16);
        break;
      case 'frontiere':
        a.fond = O.nuance(base, 0.6);
        a.tranche = O.nuance(base, 0.15);
        a.contour = O.nuance(base, -0.3);
        a.pointilles = '7 5';
        break;
      case 'a_conquerir':
        a.fond = O.nuance(base, 0.84);
        a.contour = O.nuance(base, -0.05);
        a.pointilles = '3 5';
        a.relief = false;
        a.opacite = 0.85;
        a.texte = '#6E6A60';
        a.encre = O.nuance(base, -0.25);
        break;
      case 'a_deleguer':
        a.texte = '#4A4F55';
        a.encre = '#5D636B';
        break;
      default:
        break;
    }
    return a;
  }

  function texteTuile(nom, x, y, couleur, classe, lignesMax) {
    const lignes = O.couperTexte(nom, 13, lignesMax || 3);
    const hauteur = 13.5;
    const y0 = y + 14 - (lignes.length - 1) * hauteur / 2 + 8;
    return '<text class="' + classe + '" x="' + x.toFixed(1) + '" fill="' + couleur + '">' + lignes.map((l, i) =>
      '<tspan x="' + x.toFixed(1) + '" y="' + (y0 + i * hauteur).toFixed(1) + '">' + O.echapper(l) + '</tspan>').join('') + '</text>';
  }

  function rendre(svg, carte, placement) {
    const parId = {};
    carte.competences.forEach((c) => { parId[c.id] = c; });
    const cases = placement.cases.map((cs) => Object.assign({ p: H.versPixel(cs.q, cs.r, T) }, cs));

    // Cadre : toutes les terres + une marge de mer.
    const xs = cases.map((c) => c.p.x);
    const ys = cases.map((c) => c.p.y);
    const marge = T * 2.2;
    const cadre = {
      x: Math.min(...xs) - marge, y: Math.min(...ys) - marge,
      l: Math.max(...xs) - Math.min(...xs) + 2 * marge, h: Math.max(...ys) - Math.min(...ys) + 2 * marge + T
    };

    const defs = [];
    const hautsFonds = [];
    const plages = [];
    const tuiles = [];
    const etiquettes = [];

    defs.push(
      '<radialGradient id="ct-mer" cx="50%" cy="45%" r="75%">' +
        '<stop offset="0" stop-color="#BDE6EE"/><stop offset="1" stop-color="#8FCAD9"/></radialGradient>',
      '<pattern id="ct-vagues" width="90" height="46" patternUnits="userSpaceOnUse">' +
        '<path d="M8 14 q7 -6 14 0 t14 0" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M52 36 q7 -6 14 0 t14 0" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-linecap="round"/></pattern>',
      '<linearGradient id="ct-lumiere" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>',
      '<radialGradient id="ct-or" cx="50%" cy="35%" r="70%">' +
        '<stop offset="0" stop-color="#FFE7A3"/><stop offset="1" stop-color="#E9B23E"/></radialGradient>',
      '<filter id="ct-ombre" x="-20%" y="-20%" width="140%" height="150%">' +
        '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#2B4A55" flood-opacity=".22"/></filter>'
    );

    // Ordre de dessin : du haut vers le bas, pour que les tranches se recouvrent proprement.
    cases.sort((a, b) => a.p.y - b.p.y || a.p.x - b.p.x);

    cases.forEach((cs) => {
      const { x, y } = cs.p;
      hautsFonds.push('<polygon points="' + polygone(x, y, T * 1.5) + '"/>');
      plages.push('<polygon points="' + polygone(x, y + 3, T * 1.08) + '"/>');

      if (cs.id === 'capitale') {
        tuiles.push(
          '<g class="tuile tuile-capitale" data-id="capitale" tabindex="0" role="button" aria-label="' +
            O.echapper('Capitale : ' + (carte.talent.nom || 'Mon talent')) + '">' +
          '<polygon points="' + polygone(x, y + RELIEF, T * 0.94) + '" fill="#C48A1F"/>' +
          '<polygon class="dessus" points="' + polygone(x, y, T * 0.94) + '" fill="url(#ct-or)" stroke="#B9862A" stroke-width="2"/>' +
          '<polygon points="' + polygone(x, y, T * 0.8) + '" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>' +
          O.iconeSvg('crown', x, y - 27, 20, '#7A5310', 2) +
          texteTuile(carte.talent.nom || 'Mon talent', x, y - 4, '#5B3E0B', 'nom nom-capitale', 4) +
          '</g>'
        );
        return;
      }

      const c = parId[cs.id];
      if (!c) return;
      const a = aspect(c, carte);
      let fond = a.fond;
      // Compétence de jonction : la tuile mêle les couleurs de ses deux régions.
      const coulJonction = c.distance === 'proche' && c.regionJonctionId ? couleurRegion(carte, c.regionJonctionId) : null;
      if (coulJonction) {
        const gid = 'ct-j-' + c.id.replace(/[^a-z0-9-]/gi, '');
        const eclaircir = c.statut === 'natale' ? 0 : c.statut === 'conquise' ? 0.16 : c.statut === 'frontiere' ? 0.6 : 0.84;
        defs.push('<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset=".35" stop-color="' + a.fond + '"/><stop offset=".65" stop-color="' + O.nuance(coulJonction, eclaircir) + '"/></linearGradient>');
        fond = 'url(#' + gid + ')';
      }

      let g = '<g class="tuile tuile-' + c.statut + '" data-id="' + O.echapper(c.id) + '" opacity="' + a.opacite +
        '" tabindex="0" role="button" aria-label="' + O.echapper(c.nom + ' — ' + CT.schema.LIBELLES_STATUT[c.statut]) + '">';
      if (a.relief) g += '<polygon points="' + polygone(x, y + RELIEF, T * 0.94) + '" fill="' + a.tranche + '"/>';
      g += '<polygon class="dessus" points="' + polygone(x, y, T * 0.94) + '" fill="' + fond + '" stroke="' + a.contour +
        '" stroke-width="' + (a.pointilles ? 2.5 : 1.5) + '"' + (a.pointilles ? ' stroke-dasharray="' + a.pointilles + '"' : '') + '/>';
      if (a.relief) g += '<polygon points="' + polygone(x, y, T * 0.94) + '" fill="url(#ct-lumiere)" pointer-events="none"/>';
      if (c.statut === 'natale') {
        g += '<polygon points="' + polygone(x, y, T * 0.78) + '" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>';
      }
      if (c.priorite === 1) {
        g += '<g class="drapeau">' + O.iconeSvg('flag', x + 24, y - 30, 15, '#C2412D', 2.2) + '</g>';
      }
      g += O.iconeSvg(c.icone, x, y - 20, 22, a.encre, 2);
      g += texteTuile(c.nom, x, y - 6, a.texte, 'nom');
      g += '</g>';
      tuiles.push(g);
    });

    // Noms des régions, provinces, îles et zone à déléguer.
    const etiquettesMer = [];
    placement.etiquettes.forEach((e) => {
      const ex = e.x * T;
      if (e.type === 'ile' || e.type === 'deleguer') {
        // Sous le groupe, sur l'eau.
        etiquettesMer.push('<text class="etiquette etiquette-mer" x="' + ex.toFixed(1) + '" y="' + (e.yMax * T + T * 1.3).toFixed(1) +
          '" dy="0.8em">' + O.echapper(e.nom) + '</text>');
        return;
      }
      const couleur = e.type === 'region' ? O.nuance(couleurRegion(carte, e.id) || '#777777', -0.5) : '#3E5A63';
      const lignes = O.couperTexte(e.nom, 14, 3);
      etiquettes.push('<text class="etiquette etiquette-' + e.type + '" x="' + ex.toFixed(1) + '" y="' + (e.y * T).toFixed(1) +
        '" fill="' + couleur + '">' + lignes.map((l, i) => '<tspan x="' + ex.toFixed(1) + '" dy="' +
        (i === 0 ? (0.35 - (lignes.length - 1) * 0.55).toFixed(2) : '1.1') + 'em">' + O.echapper(l) + '</tspan>').join('') + '</text>');
    });

    // Rose des vents, en haut à gauche du cadre.
    const rx = cadre.x + T * 1.1;
    const ry = cadre.y + T * 1.3;
    const rose = '<g class="rose" transform="translate(' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ')" opacity=".55">' +
      '<circle r="30" fill="none" stroke="#2F6A78" stroke-width="1.2"/>' +
      '<path d="M0 -38 L7 0 L0 38 L-7 0 Z" fill="#2F6A78"/><path d="M-38 0 L0 -6 L38 0 L0 6 Z" fill="#2F6A78" opacity=".6"/>' +
      '<text y="-44" text-anchor="middle" class="rose-n">N</text></g>';

    svg.innerHTML =
      '<defs>' + defs.join('') + '</defs>' +
      '<rect class="mer" x="' + (cadre.x - 4000) + '" y="' + (cadre.y - 4000) + '" width="' + (cadre.l + 8000) + '" height="' + (cadre.h + 8000) + '" fill="url(#ct-mer)"/>' +
      '<rect x="' + (cadre.x - 4000) + '" y="' + (cadre.y - 4000) + '" width="' + (cadre.l + 8000) + '" height="' + (cadre.h + 8000) + '" fill="url(#ct-vagues)"/>' +
      '<g class="hauts-fonds" fill="' + COULEURS.hautFond + '" opacity=".75">' + hautsFonds.join('') + '</g>' +
      '<g class="plages" fill="' + COULEURS.sable + '">' + plages.join('') + '</g>' +
      '<g class="tuiles" filter="url(#ct-ombre)">' + tuiles.join('') + '</g>' +
      '<g class="etiquettes etiquettes-zones">' + etiquettes.join('') + '</g>' +
      '<g class="etiquettes etiquettes-mer">' + etiquettesMer.join('') + '</g>' + rose +
      '<g class="calque-interaction"></g>';

    return { cadre };
  }

  CT.vueCarte = { rendre, T, couleurDe, polygone };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
