/*
 * Langue de l'interface (français, anglais ou espagnol). Les textes sont écrits en français dans le code et
 * passent par la fonction T : en anglais ou en espagnol, T cherche la traduction dans CT.EN (js/langues/en.js)
 * ou CT.ES (js/langues/es.js).
 * La langue est fixée au chargement de la page ; en changer recharge la page.
 * Ordre de priorité : le lien (#lang=en, venu de la Boussole), le choix enregistré, la langue du navigateur.
 */
(function (CT) {
  'use strict';

  const CLE = 'carteDuTalent.langue';
  const LANGUES = ['fr', 'en', 'es'];

  function depuisLien() {
    const m = typeof location !== 'undefined' && /(?:^#|&)lang=(fr|en|es)\b/.exec(location.hash || '');
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

  // Le dictionnaire de la langue courante (null en français).
  const dictionnaire = () => (langue === 'en' ? CT.EN : langue === 'es' ? CT.ES : null) || null;

  function T(fr, vars) {
    let t = fr;
    const dico = dictionnaire();
    if (dico && Object.prototype.hasOwnProperty.call(dico, cle(fr))) t = dico[cle(fr)];
    // Anglais et espagnol : pas d'espace avant : ? ! (l'espace français du modèle est retiré, pas le texte inséré).
    if (langue !== 'fr') t = t.replace(/[\u00a0\u202f ]+([?!:])/g, '$1');
    if (vars) t = t.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    return t;
  }

  // Accord simple : T(n > 1 ? pluriel : singulier).
  function Tn(n, singulier, pluriel, vars) {
    return T(n > 1 ? pluriel : singulier, Object.assign({ n }, vars));
  }

  // Textes de la page HTML statique (index.html) : nœuds texte et attributs title / aria-label.
  function traduirePage(racine) {
    const dico = dictionnaire();
    if (!dico) return;
    const marcheur = document.createTreeWalker(racine || document.body, NodeFilter.SHOW_TEXT);
    const noeuds = [];
    while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
    noeuds.forEach((n) => {
      const brut = n.nodeValue.trim();
      if (brut && dico[cle(brut)]) n.nodeValue = n.nodeValue.replace(brut, dico[cle(brut)]);
    });
    (racine || document).querySelectorAll('[title], [aria-label]').forEach((el) => {
      ['title', 'aria-label'].forEach((a) => { const v = el.getAttribute(a); if (v && dico[cle(v)]) el.setAttribute(a, dico[cle(v)]); });
    });
    const desc = document.querySelector('meta[name="description"]');
    if (desc && dico[cle(desc.content)]) desc.content = dico[cle(desc.content)];
    if (dico[cle(document.title)]) document.title = dico[cle(document.title)];
  }

  function choisir(l) {
    if (!LANGUES.includes(l) || l === langue) return false;
    enregistrer(l);
    return true;
  }

  // Format des dates et des nombres dans la langue courante.
  const LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };

  CT.i18n = { LANGUES, LOCALES, cle, get langue() { return langue; }, get locale() { return LOCALES[langue]; }, dictionnaire, T, Tn, traduirePage, choisir, depuisLien };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
