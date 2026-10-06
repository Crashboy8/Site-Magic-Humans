/*
 * Synthèse d'une page : la carte, trois pistes, la prochaine compétence (ou le plan en cours) et l'appel découverte.
 * Imprimable ou enregistrable en PDF depuis le navigateur.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;
  const OR = CT.orientation;

  function piste(x) {
    const manquantes = x.evaluation.manquantes.slice(0, 3).map((m) => m.nom);
    return '<li><strong>' + O.echapper(x.evaluation.piste.nom) + '</strong> · ' +
      O.echapper(T('Correspondance : {n} %', { n: x.evaluation.pourcentage })) + ' · ' + O.echapper(x.lien.libelle) +
      (x.infos ? '<br>' + O.echapper(x.infos.statutLibelle) + ' · ' + O.echapper(x.infos.revenu) + '*' : '') +
      (manquantes.length ? '<br><span class="discret">' + O.echapper(T('Compétences manquantes : {liste}', { liste: manquantes.join(T(', ')) })) + '</span>' : '') + '</li>';
  }

  function prochaine(carte, s) {
    if (s.plan) return '<p>' + O.echapper(T('Plan en cours : {nom}, {n} actions sur 12', { nom: CT.bibliotheque.nomAffiche(s.plan.competence), n: s.plan.faites })) + '</p>';
    if (!s.prochaine) return '';
    const p = s.prochaine;
    return '<p><strong>' + O.echapper(p.entree.nom) + '</strong> · ' +
      O.echapper(T('≈ {h} h · {niveau}', { h: p.fiche.duree.heures, niveau: p.fiche.facilite.libelle })) + '</p>' +
      '<ol class="premieres-actions">' + p.fiche.actions.map((a) => '<li>' + O.echapper(a) + '</li>').join('') + '</ol>';
  }

  function contenu(carte, maintenant) {
    const s = OR.synthese(carte, maintenant);
    const date = s.date.toLocaleDateString(CT.i18n.langue === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return '<header class="progres-tete synthese-actions"><div><p class="surtitre"><i data-lucide="file-text"></i> ' + T('Ma synthèse') + '</p></div>' +
      '<button type="button" class="bouton bouton-principal bouton-compact" data-action="imprimer"><i data-lucide="printer"></i>' + T('Imprimer ou enregistrer en PDF') + '</button>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>' +
      '<article class="synthese-page"><h1 id="synthese-titre">' + T('Ma Carte du Talent') + '</h1>' +
      '<p class="synthese-talent"><strong>' + O.echapper(s.talent || T('Mon talent')) + '</strong>' +
      (s.filRouge ? ' · ' + O.echapper(T('Fil rouge : {texte}', { texte: s.filRouge })) : '') + '</p>' +
      '<p class="discret">' + O.echapper(T('Fait le {date}', { date })) + '</p>' +
      '<svg class="synthese-carte" xmlns="http://www.w3.org/2000/svg" role="img"></svg>' +
      '<h2>' + T('Mes 3 pistes') + '</h2><ol class="synthese-pistes">' + s.pistes.map(piste).join('') + '</ol>' +
      '<h2>' + T('Ma prochaine compétence') + '</h2>' + prochaine(carte, s) +
      '<aside class="synthese-appel"><h2>' + T('Envie d\'en parler ?') + '</h2>' +
      '<p><strong>' + T('Appel découverte · 1 heure · offert') + '</strong></p>' +
      '<p>' + T('Tu arrives avec ta carte et tes pistes. On regarde ensemble celle qui te met vraiment dans le flow, et par où commencer.') + '</p>' +
      '<a class="bouton bouton-principal ecran-seul" href="' + O.echapper(OR.urlAppel('synthese')) + '" target="_blank" rel="noopener"><i data-lucide="calendar-check"></i>' + T('En parler avec Pierre') + '</a>' +
      '<p class="impression-seule">' + O.echapper(T('Réserve ton appel découverte : {url}', { url: 'calendly.com/pierre-j-sarazin' })) + '</p></aside>' +
      '<p class="note-source">* ' + O.echapper(s.source) + '</p>' +
      '<footer>' + T('Carte du Talent · Magic Humans · magichumans.com') + '</footer></article>';
  }

  function creer(racine, rappels) {
    let ouvert = false;
    let dernierFocus = null;

    function rendre() {
      if (!ouvert) return;
      const page = racine.querySelector('.progres-page');
      const defilement = page ? page.scrollTop : 0;
      racine.innerHTML = '<div class="progres-page synthese-ecran" role="dialog" aria-modal="true" aria-labelledby="synthese-titre">' + contenu(rappels.carte(), Date.now()) + '</div>';
      // Carte seule : pas d'horizon sur la synthèse.
      const svg = racine.querySelector('.synthese-carte');
      const { cadreTerres } = CT.vueCarte.rendre(svg, rappels.carte(), rappels.placement(), null);
      svg.setAttribute('viewBox', [cadreTerres.x, cadreTerres.y, cadreTerres.l, cadreTerres.h].join(' '));
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      racine.querySelector('.progres-page').scrollTop = defilement;
      O.rafraichirIcones(racine);
    }

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) return;
      const action = b.getAttribute('data-action');
      if (action === 'fermer') fermer();
      if (action === 'imprimer') window.print();
    });

    racine.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } });

    function ouvrir() {
      dernierFocus = document.activeElement;
      ouvert = true;
      racine.hidden = false;
      rendre();
      requestAnimationFrame(() => racine.classList.add('visible'));
      const f = racine.querySelector('.fermer');
      if (f) f.focus({ preventScroll: true });
    }

    function fermer() {
      if (!ouvert) return;
      ouvert = false;
      racine.classList.remove('visible');
      setTimeout(() => { if (!ouvert) racine.hidden = true; }, 250);
      if (dernierFocus && dernierFocus.focus) dernierFocus.focus({ preventScroll: true });
    }

    return { ouvrir, fermer, rendre, get ouvert() { return ouvert; } };
  }

  CT.vueSynthese = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
