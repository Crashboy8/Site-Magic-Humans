/*
 * Petits outils partagés par les vues : échappement, couleurs, icônes Lucide.
 */
(function (CT) {
  'use strict';

  function echapper(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // Mélange une couleur #rrggbb avec du blanc (t > 0) ou du noir (t < 0).
  function nuance(hex, t) {
    const n = parseInt(hex.slice(1), 16);
    const canaux = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const cible = t > 0 ? 255 : 0;
    const a = Math.abs(t);
    return '#' + canaux.map((v) => Math.round(v + (cible - v) * a).toString(16).padStart(2, '0')).join('');
  }

  function pascal(nom) {
    return String(nom).split('-').map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join('');
  }

  // Nœuds SVG d'une icône Lucide (tableau [balise, attributs]) ou null si indisponible.
  function noeudsIcone(nom) {
    const lib = globalThis.lucide;
    if (!lib || !lib.icons) return null;
    return lib.icons[pascal(nom)] || null;
  }

  function existeIcone(nom) {
    return Boolean(noeudsIcone(nom));
  }

  // Icône dessinée dans un SVG existant, centrée en (x, y). Repli : un petit cercle.
  function iconeSvg(nom, x, y, taille, couleur, epaisseur) {
    const noeuds = noeudsIcone(nom) || [['circle', { cx: 12, cy: 12, r: 6 }]];
    const echelle = taille / 24;
    const enfants = noeuds.map(([balise, attrs]) => '<' + balise + ' ' + Object.keys(attrs)
      .map((a) => a + '="' + echapper(attrs[a]) + '"').join(' ') + '/>').join('');
    return '<g class="icone" transform="translate(' + (x - taille / 2).toFixed(1) + ' ' + (y - taille / 2).toFixed(1) +
      ') scale(' + echelle.toFixed(3) + ')" fill="none" stroke="' + couleur + '" stroke-width="' + (epaisseur || 2) +
      '" stroke-linecap="round" stroke-linejoin="round">' + enfants + '</g>';
  }

  // Remplace les <i data-lucide="..."> de l'interface HTML.
  function rafraichirIcones(racine) {
    if (globalThis.lucide && globalThis.lucide.createIcons) {
      globalThis.lucide.createIcons({ root: racine || document });
    }
  }

  // Découpe un nom en lignes courtes pour tenir dans un hexagone.
  function couperTexte(texte, max, lignesMax) {
    const mots = String(texte).split(/\s+/);
    const lignes = [];
    let courante = '';
    mots.forEach((m) => {
      if (!courante) courante = m;
      else if ((courante + ' ' + m).length <= max) courante += ' ' + m;
      else { lignes.push(courante); courante = m; }
    });
    if (courante) lignes.push(courante);
    if (lignes.length > lignesMax) {
      const gardees = lignes.slice(0, lignesMax);
      gardees[lignesMax - 1] = gardees[lignesMax - 1].replace(/.{0,1}$/, '') + '…';
      return gardees;
    }
    return lignes;
  }

  CT.outils = { echapper, nuance, iconeSvg, existeIcone, rafraichirIcones, couperTexte };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
