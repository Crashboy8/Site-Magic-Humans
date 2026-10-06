/*
 * Langue de l'interface (français ou anglais). Les textes sont écrits en français dans le code et
 * passent par la fonction T : en anglais, T cherche la traduction dans CT.EN (js/langues/en.js).
 * La langue est fixée au chargement de la page ; en changer recharge la page.
 * Ordre de priorité : le lien (#lang=en, venu de la Boussole), le choix enregistré, la langue du navigateur.
 */
(function (CT) {
  'use strict';

  const CLE = 'carteDuTalent.langue';
  const LANGUES = ['fr', 'en'];

  function depuisLien() {
    const m = typeof location !== 'undefined' && /(?:^#|&)lang=(fr|en)\b/.exec(location.hash || '');
    return m ? m[1] : null;
  }

  function enregistree() {
    try { return LANGUES.includes(localStorage.getItem(CLE)) ? localStorage.getItem(CLE) : null; } catch (e) { return null; }
  }

  function duNavigateur() {
    const liste = typeof navigator !== 'undefined' ? (navigator.languages || [navigator.language]) : [];
    const trouvee = liste.map((l) => String(l || '').slice(0, 2).toLowerCase()).find((l) => LANGUES.includes(l));
    return trouvee || 'fr';
  }

  function enregistrer(l) {
    try { localStorage.setItem(CLE, l); } catch (e) { /* stockage indisponible */ }
  }

  let langue = 'fr';
  if (typeof window !== 'undefined') {
    const lien = depuisLien();
    if (lien) enregistrer(lien); // venue de la Boussole : la carte suit sa langue
    langue = lien || enregistree() || duNavigateur();
  }

  // Traduit un texte français ; {cle} est remplacé par vars.cle. Sans traduction, le français reste.
  // Les clés du dictionnaire n'ont pas d'espaces insécables (le français, lui, les garde).
  const cle = (fr) => String(fr).replace(/[\u00a0\u202f]/g, ' ');

  function T(fr, vars) {
    let t = fr;
    if (langue === 'en' && CT.EN && Object.prototype.hasOwnProperty.call(CT.EN, cle(fr))) t = CT.EN[cle(fr)];
    if (vars) t = t.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    return t;
  }

  // Accord simple : T(n > 1 ? pluriel : singulier).
  function Tn(n, singulier, pluriel, vars) {
    return T(n > 1 ? pluriel : singulier, Object.assign({ n }, vars));
  }

  // Textes de la page HTML statique (index.html) : nœuds texte et attributs title / aria-label.
  function traduirePage(racine) {
    if (langue === 'fr') return;
    const marcheur = document.createTreeWalker(racine || document.body, NodeFilter.SHOW_TEXT);
    const noeuds = [];
    while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
    noeuds.forEach((n) => {
      const brut = n.nodeValue.trim();
      if (brut && CT.EN[cle(brut)]) n.nodeValue = n.nodeValue.replace(brut, CT.EN[cle(brut)]);
    });
    (racine || document).querySelectorAll('[title], [aria-label]').forEach((el) => {
      ['title', 'aria-label'].forEach((a) => { const v = el.getAttribute(a); if (v && CT.EN[cle(v)]) el.setAttribute(a, CT.EN[cle(v)]); });
    });
    const desc = document.querySelector('meta[name="description"]');
    if (desc && CT.EN[cle(desc.content)]) desc.content = CT.EN[cle(desc.content)];
    if (CT.EN[cle(document.title)]) document.title = CT.EN[cle(document.title)];
  }

  function choisir(l) {
    if (!LANGUES.includes(l) || l === langue) return false;
    enregistrer(l);
    return true;
  }

  CT.i18n = { LANGUES, cle, get langue() { return langue; }, T, Tn, traduirePage, choisir, depuisLien };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
