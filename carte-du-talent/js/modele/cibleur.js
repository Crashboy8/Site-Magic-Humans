/*
 * Lien vers Le Cibleur : le talent, le fil rouge, les régions, les pistes visées
 * et les compétences à déléguer voyagent dans l'ancre (#cible=, JSON en base64url).
 * Rien n'est envoyé au serveur. Aucun accès au DOM.
 */
(function (CT) {
  'use strict';

  function couper(v, max) {
    return (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '').slice(0, max);
  }

  function noms(liste, n, max, lire) {
    const sortie = [];
    (liste || []).some((item) => {
      const t = couper(lire(item), max);
      if (t) sortie.push(t);
      return sortie.length >= n;
    });
    return sortie;
  }

  function encoder(data) {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // { v, src, lang, nom, contexte, sousTalents, pistes, aDeleguer }, sans les champs vides.
  function url(carte, nomsPistes) {
    const source = carte && typeof carte === 'object' ? carte : {};
    const talent = source.talent || {};
    const langue = CT.i18n && (CT.i18n.langue === 'en' || CT.i18n.langue === 'es') ? CT.i18n.langue : 'fr';
    const brut = {
      v: 1,
      src: 'carte',
      lang: langue,
      nom: couper(talent.nom, 120),
      contexte: couper(talent.filRouge, 600),
      sousTalents: noms(source.regions, 6, 60, (r) => r && r.nom),
      pistes: noms(Array.isArray(nomsPistes) ? nomsPistes : [], 5, 80, (nom) => nom),
      aDeleguer: noms((source.competences || []).filter((c) => c && c.statut === 'a_deleguer'), 6, 60, (c) => c.nom)
    };
    const charge = { v: brut.v, src: brut.src };
    ['lang', 'nom', 'contexte', 'sousTalents', 'pistes', 'aDeleguer'].forEach((cle) => {
      const v = brut[cle];
      if (Array.isArray(v) ? v.length : v) charge[cle] = v;
    });
    return '/boussole-decision/ma-cible/#cible=' + encoder(charge);
  }

  CT.cibleur = { url };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
