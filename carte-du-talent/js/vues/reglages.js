/*
 * Réglages : brouillard de guerre et gestion des données (démonstration).
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;

  // Choix de la langue (le même sélecteur que dans l'en-tête).
  function choixLangue() {
    return '<div class="choix-langue" role="group" aria-label="' + O.echapper(T('Langue')) + '">' +
      CT.i18n.LANGUES.map((l) => '<button type="button" data-langue="' + l + '" lang="' + l + '" aria-pressed="' + (CT.i18n.langue === l) + '">' +
        ({ fr: 'Français', en: 'English', es: 'Español' }[l]) + '</button>').join('') + '</div>';
  }

  function creer(racine, rappels) {
    let ouvert = false;
    let dernierFocus = null;

    racine.innerHTML =
      '<div class="flow-fond" data-action="fermer"></div>' +
      '<div class="flow-fiche reglages-fiche" role="dialog" aria-modal="true" aria-labelledby="reglages-titre">' +
        '<header class="flow-tete reglages-tete"><div><p class="surtitre"><i data-lucide="settings"></i> ' + T('Réglages') + '</p>' +
        '<h2 id="reglages-titre">' + T('Ta carte, à ta façon') + '</h2></div>' +
        '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>' +
        '<div class="flow-corps">' +
          '<section class="flow-bloc" aria-labelledby="reglages-affichage">' +
            '<h3 class="sous-titre" id="reglages-affichage">' + T('Affichage de la carte') + '</h3>' +
            '<label class="interrupteur"><span class="interrupteur-texte"><strong>' + T('Brouillard de guerre') + '</strong>' +
            '<span class="aide">' + T('Cache les territoires à conquérir tant que tu ne les as pas explorés. Touche un nuage pour l\'explorer.') + '</span></span>' +
            '<input type="checkbox" role="switch" id="reglage-brouillard"><span class="glissiere" aria-hidden="true"></span></label>' +
            '<label class="interrupteur"><span class="interrupteur-texte"><strong>' + T('Terres à découvrir') + '</strong>' +
            '<span class="aide">' + T('Afficher autour de ta carte les compétences que tu n\'as pas encore explorées.') + '</span></span>' +
            '<input type="checkbox" role="switch" id="reglage-horizon"><span class="glissiere" aria-hidden="true"></span></label>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="toutes"><i data-lucide="layout-grid"></i>' + T('Voir toutes les compétences') + '</button>' +
          '</section>' +
          '<section class="flow-bloc" aria-labelledby="reglages-langue">' +
            '<h3 class="sous-titre" id="reglages-langue">' + T('Langue') + '</h3>' + choixLangue() +
          '</section>' +
          '<section class="flow-bloc" aria-labelledby="reglages-progres">' +
            '<h3 class="sous-titre" id="reglages-progres">' + T('Progrès') + '</h3>' +
            '<label class="interrupteur" for="reglage-seuil"><span class="interrupteur-texte"><strong>' + T('Seuil de conquête') + '</strong>' +
            '<span class="aide">' + T('Nombre de moments de flow sur une frontière avant que l\'appli te propose de la passer en territoire conquis. C\'est toujours toi qui confirmes.') + '</span></span>' +
            '<input type="number" class="champ-nombre" id="reglage-seuil" min="1" max="100" inputmode="numeric"></label>' +
          '</section>' +
          '<section class="flow-bloc" aria-labelledby="reglages-suggestions">' +
            '<h3 class="sous-titre" id="reglages-suggestions">' + T('Suggestions') + '</h3>' +
            '<p class="aide" id="reglage-refusees"></p>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="retablir"><i data-lucide="undo-2"></i>' + T('Proposer à nouveau les suggestions écartées') + '</button>' +
          '</section>' +
          '<section class="flow-bloc" aria-labelledby="reglages-sauvegarde">' +
            '<h3 class="sous-titre" id="reglages-sauvegarde">' + T('Sauvegarde') + '</h3>' +
            '<p class="aide">' + T('Ta carte est enregistrée dans ce navigateur. Exporte-la de temps en temps pour ne jamais la perdre, ou pour la retrouver sur un autre appareil.') + '</p>' +
            '<div class="reglages-donnees"><button type="button" class="bouton bouton-secondaire" data-action="exporter"><i data-lucide="download"></i>' + T('Exporter ma carte') + '</button>' +
            '<button type="button" class="bouton bouton-secondaire" data-action="importer"><i data-lucide="upload"></i>' + T('Importer une carte') + '</button></div>' +
          '</section>' +
          '<section class="flow-bloc" aria-labelledby="reglages-nouvelle">' +
            '<h3 class="sous-titre" id="reglages-nouvelle">' + T('Repartir d\'une autre carte') + '</h3>' +
            '<p class="aide">' + T('Ces deux choix remplacent ta carte actuelle, après confirmation. Pense à l\'exporter avant.') + '</p>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="creer"><i data-lucide="sparkles"></i>' + T('Créer ma carte (parcours guidé)') + '</button>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="importer-pdf"><i data-lucide="file-up"></i>' + T('Importer mon résultat QCM (PDF)') + '</button>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="demo"><i data-lucide="rotate-ccw"></i>' + T('Revenir à la carte de démonstration') + '</button>' +
          '</section>' +
        '</div>' +
      '</div>';

    const brouillard = racine.querySelector('#reglage-brouillard');

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      const l = e.target.closest('[data-langue]');
      if (l) { rappels.changerLangue(l.getAttribute('data-langue')); return; }
      if (!b) return;
      if (b.getAttribute('data-action') === 'fermer') fermer();
      if (b.getAttribute('data-action') === 'importer-pdf') { fermer(); rappels.importerPdf(); }
      if (b.getAttribute('data-action') === 'toutes') { fermer(); rappels.toutes(); }
      if (b.getAttribute('data-action') === 'demo') { fermer(); rappels.reinitialiser(); }
      if (b.getAttribute('data-action') === 'exporter') rappels.exporter();
      if (b.getAttribute('data-action') === 'creer') { fermer(); rappels.creer(); }
      if (b.getAttribute('data-action') === 'importer') { fermer(); rappels.importer(); }
      if (b.getAttribute('data-action') === 'retablir') { rappels.retablirSuggestions(); majRefusees(); }
    });
    brouillard.addEventListener('change', () => rappels.changerPreference('brouillardDeGuerre', brouillard.checked));
    const horizon = racine.querySelector('#reglage-horizon');
    horizon.addEventListener('change', () => rappels.changerPreference('horizon', horizon.checked));
    const seuil = racine.querySelector('#reglage-seuil');
    seuil.addEventListener('change', () => {
      rappels.changerPreference('seuilConquete', seuil.value);
      seuil.value = rappels.carte().preferences.seuilConquete;
    });
    racine.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } });

    function majRefusees() {
      const n = rappels.carte().suggestionsRefusees.length;
      racine.querySelector('#reglage-refusees').textContent = n
        ? CT.i18n.Tn(n, '{n} suggestion écartée ne t\'est plus proposée.', '{n} suggestions écartées ne te sont plus proposées.')
        : T('Aucune suggestion écartée pour l\'instant.');
      racine.querySelector('[data-action="retablir"]').hidden = n === 0;
    }

    function ouvrir() {
      majRefusees();
      brouillard.checked = Boolean(rappels.carte().preferences.brouillardDeGuerre);
      horizon.checked = rappels.carte().preferences.horizon !== false;
      seuil.value = rappels.carte().preferences.seuilConquete;
      dernierFocus = document.activeElement;
      racine.hidden = false;
      ouvert = true;
      requestAnimationFrame(() => racine.classList.add('visible'));
      brouillard.focus({ preventScroll: true });
    }

    function fermer() {
      if (!ouvert) return;
      ouvert = false;
      racine.classList.remove('visible');
      setTimeout(() => { if (!ouvert) racine.hidden = true; }, 250);
      if (dernierFocus && dernierFocus.focus) dernierFocus.focus({ preventScroll: true });
    }

    CT.outils.rafraichirIcones(racine);
    return { ouvrir, fermer };
  }

  CT.vueReglages = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
