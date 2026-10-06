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
    ressource: '#E8C9A0',
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
    if (c.statut === 'ressource') return COULEURS.ressource;
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
      case 'ressource':
        a.texte = '#5A4630';
        a.encre = '#8A6A44';
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

  function rendre(svg, carte, placement, horizon) {
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

    // Cadre élargi aux terres à découvrir (la rose des vents et le cadrage d'ouverture restent sur les terres).
    const cadreTerres = cadre;
    const tuilesHorizon = [];
    const etiquettesHorizon = [];
    let cadreTotal = cadre;
    if (horizon && horizon.tuiles.length) {
      const pts = horizon.tuiles.map((t) => H.versPixel(t.q, t.r, T)).concat(horizon.etiquettes.map((t) => H.versPixel(t.q, t.r, T)));
      const x0 = Math.min(cadre.x, Math.min(...pts.map((p) => p.x)) - marge);
      const y0 = Math.min(cadre.y, Math.min(...pts.map((p) => p.y)) - marge);
      const x1 = Math.max(cadre.x + cadre.l, Math.max(...pts.map((p) => p.x)) + marge);
      const y1 = Math.max(cadre.y + cadre.h, Math.max(...pts.map((p) => p.y)) + marge + T);
      cadreTotal = { x: x0, y: y0, l: x1 - x0, h: y1 - y0 };
      horizon.tuiles.forEach((t) => {
        const e = CT.bibliotheque.trouver(t.entreeId);
        if (!e) return;
        const coul = CT.schema.DOMAINES[t.domaine].couleur;
        const { x, y } = H.versPixel(t.q, t.r, T);
        tuilesHorizon.push('<g class="tuile tuile-horizon" data-id="' + O.echapper(t.id) + '" tabindex="0" role="button" aria-label="' +
          O.echapper(CT.i18n.T('À découvrir : {nom}', { nom: e.nom })) + '">' +
          '<polygon class="dessus" points="' + polygone(x, y, T * 0.94) + '" fill="#FFFDF5" fill-opacity=".5" stroke="' + coul + '" stroke-width="1.5" stroke-dasharray="2 5"/>' +
          O.iconeSvg(e.icone, x, y - 20, 20, O.nuance(coul, -0.35), 2) +
          texteTuile(e.nom, x, y - 6, '#5F6B70', 'nom nom-horizon') + '</g>');
      });
      horizon.etiquettes.forEach((t) => {
        const { x, y } = H.versPixel(t.q, t.r, T);
        const coul = CT.schema.DOMAINES[t.domaine].couleur;
        etiquettesHorizon.push('<text class="etiquette etiquette-horizon" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" fill="' +
          O.nuance(coul, -0.45) + '">' + O.echapper(t.nom) + '</text>');
      });
    }

    const defs = [];
    const hautsFonds = [];
    const plages = [];
    const tuiles = [];
    const etiquettes = [];
    const eclats = [];
    const brumes = [];
    const maintenant = Date.now();

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
      '<radialGradient id="ct-eclat">' +
        '<stop offset="0" stop-color="#FFF4C2" stop-opacity="1"/><stop offset=".45" stop-color="#FFD866" stop-opacity=".75"/>' +
        '<stop offset="1" stop-color="#FFC93D" stop-opacity="0"/></radialGradient>',
      '<radialGradient id="ct-lueur" cx="50%" cy="45%" r="60%">' +
        '<stop offset="0" stop-color="#FFFBE6" stop-opacity="1"/><stop offset=".6" stop-color="#FFE58A" stop-opacity=".55"/>' +
        '<stop offset="1" stop-color="#FFD24D" stop-opacity=".15"/></radialGradient>',
      '<filter id="ct-brume" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>',
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
            O.echapper(CT.i18n.T('Capitale : {nom}', { nom: carte.talent.nom || CT.i18n.T('Mon talent') })) + '">' +
          '<polygon points="' + polygone(x, y + RELIEF, T * 0.94) + '" fill="#C48A1F"/>' +
          '<polygon class="dessus" points="' + polygone(x, y, T * 0.94) + '" fill="url(#ct-or)" stroke="#B9862A" stroke-width="2"/>' +
          '<polygon points="' + polygone(x, y, T * 0.8) + '" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>' +
          O.iconeSvg('crown', x, y - 27, 20, '#7A5310', 2) +
          texteTuile(carte.talent.nom || CT.i18n.T('Mon talent'), x, y - 4, '#5B3E0B', 'nom nom-capitale', 4) +
          '</g>'
        );
        return;
      }

      const c = parId[cs.id];
      if (!c) return;

      // Suggestion : hexagone fantôme, à l'endroit exact où il se poserait.
      if (c.fantome) {
        tuiles.push('<g class="tuile tuile-suggestion" data-id="' + O.echapper(c.id) + '" tabindex="0" role="button" aria-label="' +
          O.echapper(CT.i18n.T('Suggestion : {nom}', { nom: c.nom })) + '">' +
          '<polygon class="dessus" points="' + polygone(x, y, T * 0.94) + '" fill="#FFFDF5" fill-opacity=".72" stroke="#E9A400" stroke-width="2.5" stroke-dasharray="6 5"/>' +
          '<g class="plus-suggestion"><circle cx="' + (x + 25).toFixed(1) + '" cy="' + (y - 29).toFixed(1) + '" r="10" fill="#E9A400"/>' +
          O.iconeSvg('plus', x + 25, y - 29, 13, '#fff', 3) + '</g>' +
          O.iconeSvg(c.icone, x, y - 20, 22, '#8A6A2A', 2) +
          texteTuile(c.nom, x, y - 6, '#6E5A2E', 'nom nom-suggestion') + '</g>');
        return;
      }

      // Brouillard de guerre : territoire à conquérir pas encore exploré.
      if (CT.regles.estCache(carte, c)) {
        tuiles.push('<g class="tuile tuile-brouillard" data-id="' + O.echapper(c.id) +
          '" tabindex="0" role="button" aria-label="' + O.echapper(CT.i18n.T('Territoire inexploré')) + '">' +
          '<polygon class="dessus" points="' + polygone(x, y, T * 0.94) + '" fill="#E9EFF1" stroke="#C9D5DA" stroke-width="2" stroke-dasharray="3 6"/>' +
          O.iconeSvg('cloud', x, y - 4, 26, '#9FB2BA', 2) +
          '<text class="nom nom-brouillard" x="' + x.toFixed(1) + '" y="' + (y + 26).toFixed(1) + '" fill="#6B828B">?</text></g>');
        brumes.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (T * 0.95).toFixed(1) + '"/>');
        return;
      }

      // Éclat : halo doré selon le flow des 30 derniers jours (calque séparé, la tuile ne bouge pas).
      const e = CT.regles.eclat(carte, c.id, maintenant);
      if (e.niveau > 0) {
        eclats.push('<circle class="eclat eclat-' + e.niveau + '" data-id="' + O.echapper(c.id) + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) +
          '" r="' + (T * (1.05 + 0.13 * e.niveau)).toFixed(1) + '" fill="url(#ct-eclat)"/>');
      }

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

      const plan = c.statut === 'frontiere' ? CT.orientation.drapeauPlan(carte, c.id) : null;
      let g = '<g class="tuile tuile-' + c.statut + (e.niveau ? ' brille-' + e.niveau : '') + '" data-id="' + O.echapper(c.id) + '" opacity="' + a.opacite +
        '" tabindex="0" role="button" aria-label="' + O.echapper(plan ? CT.i18n.T('{nom}, plan sur 30 jours : {n} actions sur 12', { nom: c.nom, n: plan.faites }) : c.nom + ' — ' + CT.schema.LIBELLES_STATUT[c.statut]) + '">';
      if (a.relief) g += '<polygon points="' + polygone(x, y + RELIEF, T * 0.94) + '" fill="' + a.tranche + '"/>';
      g += '<polygon class="dessus" points="' + polygone(x, y, T * 0.94) + '" fill="' + fond + '" stroke="' + a.contour +
        '" stroke-width="' + (a.pointilles ? 2.5 : 1.5) + '"' + (a.pointilles ? ' stroke-dasharray="' + a.pointilles + '"' : '') + '/>';
      if (a.relief) g += '<polygon points="' + polygone(x, y, T * 0.94) + '" fill="url(#ct-lumiere)" pointer-events="none"/>';
      if (c.statut === 'natale') {
        g += '<polygon points="' + polygone(x, y, T * 0.78) + '" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>';
      }
      // Lumière intérieure et liseré doré : visibles même au milieu du continent.
      if (e.niveau > 0) {
        g += '<polygon class="lueur lueur-' + e.niveau + '" points="' + polygone(x, y, T * 0.94) + '" fill="url(#ct-lueur)" pointer-events="none"/>';
      }
      if (e.niveau >= 2) {
        g += '<polygon class="liseret-eclat liseret-' + e.niveau + '" points="' + polygone(x, y, T * 0.86) + '" fill="none" stroke="#FFD24D" stroke-width="' +
          (1 + e.niveau) + '" pointer-events="none"/>';
      }
      if (plan) {
        const hy = (y - 18) - 28 * plan.faites / plan.total;
        g += '<g class="drapeau drapeau-plan" aria-hidden="true">' +
          '<line x1="' + (x + 18).toFixed(1) + '" y1="' + (y - 8).toFixed(1) + '" x2="' + (x + 18).toFixed(1) + '" y2="' + (y - 50).toFixed(1) + '" stroke="#7A4A2A" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="M' + (x + 19).toFixed(1) + ' ' + hy.toFixed(1) + ' l16 5 l-16 5 Z" fill="#C2412D"/>' +
          '<text x="' + (x + 38).toFixed(1) + '" y="' + (y - 8).toFixed(1) + '" font-size="10" font-weight="800" fill="#C2412D">' + plan.faites + '/' + plan.total + '</text></g>';
      } else if (c.statut === 'frontiere') {
        g += '<g class="drapeau"><circle cx="' + (x + 24).toFixed(1) + '" cy="' + (y - 30).toFixed(1) + '" r="11" fill="#FFFDF5" stroke="#C2412D" stroke-width="1.5"/>' +
          O.iconeSvg('flag', x + 24, y - 30, 14, '#C2412D', 2.2) +
          (c.priorite ? '<text class="rang-priorite" x="' + (x + 24).toFixed(1) + '" y="' + (y - 14).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="800" fill="#C2412D">' + c.priorite + '</text>' : '') + '</g>';
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
      if (e.type === 'ile' || e.type === 'deleguer' || e.type === 'ressource') {
        // Sous le groupe, sur l'eau.
        etiquettesMer.push('<text class="etiquette etiquette-mer" x="' + ex.toFixed(1) + '" y="' + (e.yMax * T + T * 1.3).toFixed(1) +
          '" dy="0.8em">' + O.echapper(CT.i18n.T(e.nom)) + '</text>');
        return;
      }
      const couleur = e.type === 'region' ? O.nuance(couleurRegion(carte, e.id) || '#777777', -0.5) : '#3E5A63';
      // Les noms par défaut de la géographie (« Province », « Zone à déléguer »…) sont traduits ici.
      const lignes = O.couperTexte(e.type === 'region' ? e.nom : CT.i18n.T(e.nom), 14, 3);
      etiquettes.push('<text class="etiquette etiquette-' + e.type + '" x="' + ex.toFixed(1) + '" y="' + (e.y * T).toFixed(1) +
        '" fill="' + couleur + '">' + lignes.map((l, i) => '<tspan x="' + ex.toFixed(1) + '" dy="' +
        (i === 0 ? (0.35 - (lignes.length - 1) * 0.55).toFixed(2) : '1.1') + 'em">' + O.echapper(l) + '</tspan>').join('') + '</text>');
    });

    // Rose des vents, en haut à gauche du cadre.
    const rx = cadreTerres.x + T * 1.1;
    const ry = cadreTerres.y + T * 1.3;
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
      '<g class="horizon" aria-label="' + O.echapper(CT.i18n.T('Terres à découvrir autour de ta carte')) + '">' + tuilesHorizon.join('') + '</g>' +
      '<g class="eclats">' + eclats.join('') + '</g>' +
      '<g class="tuiles" filter="url(#ct-ombre)">' + tuiles.join('') + '</g>' +
      '<g class="brumes" fill="#F4F8FA" filter="url(#ct-brume)" pointer-events="none">' + brumes.join('') + '</g>' +
      '<g class="etiquettes etiquettes-zones">' + etiquettes.join('') + '</g>' +
      '<g class="etiquettes etiquettes-mer">' + etiquettesMer.join('') + '</g>' + etiquettesHorizon.join('') + rose +
      '<g class="calque-interaction"></g>';

    return { cadre: cadreTotal, cadreTerres };
  }

  CT.vueCarte = { rendre, T, couleurDe, polygone };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
