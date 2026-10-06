/*
 * Réglages : brouillard de guerre et gestion des données (démonstration).
 */
(function (CT) {
  'use strict';

  function creer(racine, rappels) {
    let ouvert = false;
    let dernierFocus = null;

    racine.innerHTML =
      '<div class="flow-fond" data-action="fermer"></div>' +
      '<div class="flow-fiche reglages-fiche" role="dialog" aria-modal="true" aria-labelledby="reglages-titre">' +
        '<header class="flow-tete reglages-tete"><div><p class="surtitre"><i data-lucide="settings"></i> Réglages</p>' +
        '<h2 id="reglages-titre">Ta carte, à ta façon</h2></div>' +
        '<button type="button" class="fermer" data-action="fermer" aria-label="Fermer"><i data-lucide="x"></i></button></header>' +
        '<div class="flow-corps">' +
          '<section class="flow-bloc">' +
            '<label class="interrupteur"><span class="interrupteur-texte"><strong>Brouillard de guerre</strong>' +
            '<span class="aide">Cache les territoires à conquérir tant que tu ne les as pas explorés. Touche un nuage pour l\'explorer.</span></span>' +
            '<input type="checkbox" role="switch" id="reglage-brouillard"><span class="glissiere" aria-hidden="true"></span></label>' +
          '</section>' +
          '<section class="flow-bloc">' +
            '<label class="interrupteur" for="reglage-seuil"><span class="interrupteur-texte"><strong>Seuil de conquête</strong>' +
            '<span class="aide">Nombre de moments de flow sur une frontière avant que l\'appli te propose de la passer en territoire conquis.</span></span>' +
            '<input type="number" class="champ-nombre" id="reglage-seuil" min="1" max="100" inputmode="numeric"></label>' +
          '</section>' +
          '<section class="flow-bloc">' +
            '<p class="sous-titre">Suggestions</p>' +
            '<p class="aide" id="reglage-refusees"></p>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="retablir"><i data-lucide="undo-2"></i>Proposer à nouveau les suggestions écartées</button>' +
          '</section>' +
          '<section class="flow-bloc">' +
            '<p class="sous-titre">Données</p>' +
            '<p class="aide">Ta carte est enregistrée dans ce navigateur. Exporte-la de temps en temps pour ne jamais la perdre.</p>' +
            '<div class="reglages-donnees"><button type="button" class="bouton bouton-secondaire" data-action="exporter"><i data-lucide="download"></i>Exporter ma carte</button>' +
            '<button type="button" class="bouton bouton-secondaire" data-action="importer"><i data-lucide="upload"></i>Importer une carte</button></div>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="creer"><i data-lucide="sparkles"></i>Créer ma carte (parcours guidé)</button>' +
            '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="demo"><i data-lucide="rotate-ccw"></i>Revenir à la carte de démonstration</button>' +
          '</section>' +
        '</div>' +
      '</div>';

    const brouillard = racine.querySelector('#reglage-brouillard');

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) return;
      if (b.getAttribute('data-action') === 'fermer') fermer();
      if (b.getAttribute('data-action') === 'demo') { fermer(); rappels.reinitialiser(); }
      if (b.getAttribute('data-action') === 'exporter') rappels.exporter();
      if (b.getAttribute('data-action') === 'creer') { fermer(); rappels.creer(); }
      if (b.getAttribute('data-action') === 'importer') { fermer(); rappels.importer(); }
      if (b.getAttribute('data-action') === 'retablir') { rappels.retablirSuggestions(); majRefusees(); }
    });
    brouillard.addEventListener('change', () => rappels.changerPreference('brouillardDeGuerre', brouillard.checked));
    const seuil = racine.querySelector('#reglage-seuil');
    seuil.addEventListener('change', () => {
      rappels.changerPreference('seuilConquete', seuil.value);
      seuil.value = rappels.carte().preferences.seuilConquete;
    });
    racine.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } });

    function majRefusees() {
      const n = rappels.carte().suggestionsRefusees.length;
      racine.querySelector('#reglage-refusees').textContent = n
        ? n + (n > 1 ? ' suggestions écartées ne te sont plus proposées.' : ' suggestion écartée ne t\'est plus proposée.')
        : 'Aucune suggestion écartée pour l\'instant.';
      racine.querySelector('[data-action="retablir"]').hidden = n === 0;
    }

    function ouvrir() {
      majRefusees();
      brouillard.checked = Boolean(rappels.carte().preferences.brouillardDeGuerre);
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
