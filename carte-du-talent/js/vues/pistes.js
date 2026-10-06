/*
 * Écran « Mes pistes » : des métiers, activités et offres indépendantes qui collent au talent,
 * avec le pourcentage de correspondance, les hexagones qui la justifient et ce qui manque.
 * « Viser cette piste » transforme les compétences manquantes en territoires en conquête, classés par priorité.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;
  const P = CT.pistes;

  function lienHexagone(c) {
    return '<button type="button" class="lien-carte puce-hex" data-action="voir" data-valeur="' + O.echapper(c.id) + '">' +
      '<i data-lucide="' + O.echapper(c.icone) + '"></i>' + O.echapper(c.nom) + '</button>';
  }

  function carteDePiste(carte, e) {
    const type = P.TYPES[e.piste.type];
    const justifient = e.hexagones.map((id) => CT.regles.trouver(carte, id)).filter(Boolean);
    const manquantes = e.manquantes;
    const nom = O.echapper(e.piste.nom);
    return '<article class="carte-progres piste' + (e.visee ? ' piste-visee' : '') + '" data-piste="' + O.echapper(e.piste.id) + '">' +
      '<header class="piste-tete"><div><span class="puce-etat"><i data-lucide="' + type.icone + '"></i>' + type.nom + '</span>' +
      '<h3>' + nom + '</h3></div>' +
      '<div class="piste-score" role="img" aria-label="' + O.echapper(T('Correspondance : {n} %', { n: e.pourcentage })) + '"><strong>' + e.pourcentage + '</strong><span>%</span></div></header>' +
      '<div class="progression" aria-hidden="true"><span style="width:' + e.pourcentage + '%"></span></div>' +
      '<div class="piste-bloc"><h4>' + T('Ce qui la justifie') + '</h4>' +
      (justifient.length ? '<p class="puces-hex">' + justifient.map(lienHexagone).join('') + '</p>'
        : '<p class="vide">' + T('Pas encore d\'hexagone sur ta carte : c\'est une piste à explorer.') + '</p>') + '</div>' +
      '<div class="piste-bloc"><h4>' + T('Compétences manquantes') + '</h4>' +
      (manquantes.length ? '<ul class="puces-manquantes">' + manquantes.map((m) => '<li><i data-lucide="' + O.echapper(m.icone) + '"></i>' + O.echapper(m.nom) + '</li>').join('') + '</ul>'
        : '<p class="discret">' + T('Rien ne manque : tu as déjà tout ce qu\'il faut pour cette piste.') + '</p>') + '</div>' +
      (e.visee
        ? '<div class="piste-actions"><span class="puce-etat puce-prete"><i data-lucide="flag"></i>' + T('Piste visée') + '</span>' +
          '<button type="button" class="bouton-lien bouton-lien-discret" data-action="abandonner" data-valeur="' + O.echapper(e.piste.id) + '">' + T('Ne plus viser') + '</button></div>'
        : (manquantes.length
          ? '<div class="piste-actions"><button type="button" class="bouton bouton-principal bouton-compact" data-action="viser" data-valeur="' + O.echapper(e.piste.id) + '">' +
            '<i data-lucide="flag"></i>' + T('Viser cette piste') + '</button></div>'
          : '')) +
      '</article>';
  }

  // Territoires en conquête, dans l'ordre de priorité, avec les flèches pour changer l'ordre.
  function sectionPriorites(carte) {
    const liste = CT.regles.frontieres(carte);
    if (!liste.length) return '';
    return '<section class="carte-progres carte-large"><h3><i data-lucide="flag"></i> ' + T('Mes priorités') + '</h3>' +
      '<p class="discret">' + T('Le n°1 est le territoire que tu attaques d\'abord. Change l\'ordre avec les flèches : il est enregistré.') + '</p>' +
      '<ol class="priorites">' + liste.map((c, i) => {
        const pour = P.pistesDe(c).map((p) => p.nom);
        return '<li><span class="rang">' + (i + 1) + '</span>' + lienHexagone(c) +
          (pour.length ? '<span class="discret pour-piste">' + O.echapper(T('pour : {pistes}', { pistes: pour.join(T(', ')) })) + '</span>' : '') +
          '<span class="fleches">' +
          '<button type="button" class="fleche" data-action="priorite" data-valeur="' + O.echapper(c.id) + '|-1"' + (i === 0 ? ' disabled' : '') +
          ' aria-label="' + O.echapper(T('Monter {nom}', { nom: c.nom })) + '"><i data-lucide="arrow-up"></i></button>' +
          '<button type="button" class="fleche" data-action="priorite" data-valeur="' + O.echapper(c.id) + '|1"' + (i === liste.length - 1 ? ' disabled' : '') +
          ' aria-label="' + O.echapper(T('Descendre {nom}', { nom: c.nom })) + '"><i data-lucide="arrow-down"></i></button></span></li>';
      }).join('') + '</ol></section>';
  }

  function contenu(carte) {
    const entetes = '<header class="progres-tete"><div><p class="surtitre"><i data-lucide="compass"></i> ' + T('Mes pistes') + '</p>' +
      '<h2 id="pistes-titre">' + T('Des pistes qui collent à ton talent') + '</h2>' +
      '<p class="discret">' + T('Calculé sur ta carte : tes territoires, tes régions et tes moments de flow. Une piste est une idée à explorer, pas un verdict.') + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>';
    const pistes = P.proposer(carte);
    return entetes + '<div class="progres-corps">' + sectionPriorites(carte) + pistes.map((e) => carteDePiste(carte, e)).join('') + '</div>';
  }

  function creer(racine, rappels) {
    let ouvert = false;
    let dernierFocus = null;

    function rendre() {
      if (!ouvert) return;
      const page = racine.querySelector('.progres-page');
      const defilement = page ? page.scrollTop : 0;
      racine.innerHTML = '<div class="progres-page" role="dialog" aria-modal="true" aria-labelledby="pistes-titre">' + contenu(rappels.carte()) + '</div>';
      racine.querySelector('.progres-page').scrollTop = defilement;
      O.rafraichirIcones(racine);
    }

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b || b.disabled) return;
      const action = b.getAttribute('data-action');
      const valeur = b.getAttribute('data-valeur');
      if (action === 'fermer') { fermer(); return; }
      if (action === 'voir') fermer();
      rappels.action(action, valeur);
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

  CT.vuePistes = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
