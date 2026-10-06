/*
 * Bilan d'acquis : 30 compétences courantes à cocher, en 6 familles, plus 5 idées libres.
 * Tout est ajouté d'un coup (un seul placement ensuite). Fermer sans valider revient à « Plus tard ».
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;
  const Tn = CT.i18n.Tn;
  const O = CT.outils;

  function choix(item) {
    const e = item.entree;
    const icone = '<i data-lucide="' + O.echapper(e.icone) + '"></i>';
    if (item.acquis) {
      return '<label class="choix-bilan acquis"><input type="checkbox" checked disabled> ' + icone + '<span>' + O.echapper(e.nom) +
        ' <span class="discret">' + T('Déjà sur ta carte') + '</span></span></label>';
    }
    return '<label class="choix-bilan"><input type="checkbox" name="bilan" value="' + O.echapper(e.id) + '"> ' + icone + '<span>' + O.echapper(e.nom) + '</span></label>';
  }

  function famille(f) {
    const items = f.items.filter((i) => !i.horsJeu);
    if (!items.length) return '';
    return '<fieldset class="bilan-famille"><legend><i data-lucide="' + O.echapper(f.icone) + '"></i>' + O.echapper(f.titre) + '</legend>' +
      '<div class="choix-grille">' + items.map(choix).join('') + '</div></fieldset>';
  }

  function contenu(carte) {
    return '<header class="progres-tete"><div><p class="surtitre"><i data-lucide="list-checks"></i> ' + T('Bilan d\'acquis') + '</p>' +
      '<h2 id="bilan-titre">' + T('Ce que tu sais déjà faire') + '</h2>' +
      '<p class="discret">' + T('Coche tout ce que tu as déjà fait plusieurs fois, au travail, en association ou dans ta vie perso. Pas besoin d\'être expert·e : si tu sais le faire, ça compte.') + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>' +
      '<div class="bilan-corps">' + CT.orientation.bilan(carte).map(famille).join('') +
      '<div class="bilan-libre"><label for="bilan-libre">' + T('Autre chose que tu sais faire ?') + '</label>' +
      '<input id="bilan-libre" type="text" maxlength="200" placeholder="' + O.echapper(T('Ex. : Animer une formation, Préparer un cours')) + '">' +
      '<p class="aide">' + T('Sépare par des virgules (5 au plus).') + '</p></div></div>' +
      '<footer class="bilan-pied"><span class="bilan-compte" aria-live="polite"></span><div class="barre-actions">' +
      '<button type="button" class="bouton bouton-secondaire" data-action="plus-tard">' + T('Plus tard') + '</button>' +
      '<button type="button" class="bouton bouton-principal" data-action="ajouter" disabled>' + T('Ajouter à ma carte') + '</button></div></footer>';
  }

  function creer(racine, rappels) {
    let ouvert = false;
    let dernierFocus = null;

    function rendre() {
      if (!ouvert) return;
      const page = racine.querySelector('.progres-page');
      const defilement = page ? page.scrollTop : 0;
      racine.innerHTML = '<div class="progres-page" role="dialog" aria-modal="true" aria-labelledby="bilan-titre">' + contenu(rappels.carte()) + '</div>';
      racine.querySelector('.progres-page').scrollTop = defilement;
      O.rafraichirIcones(racine);
      majPied();
    }

    function coches() {
      return [...racine.querySelectorAll('input[name="bilan"]:checked')].map((i) => i.value);
    }

    function libres() {
      const champ = racine.querySelector('#bilan-libre');
      return champ ? champ.value.split(',').map((t) => t.trim()).filter(Boolean) : [];
    }

    // Compteur et bouton : mis à jour sans redessiner la page.
    function majPied() {
      const n = coches().length + Math.min(5, libres().length);
      const compte = racine.querySelector('.bilan-compte');
      if (compte) compte.textContent = Tn(n, '{n} compétence cochée', '{n} compétences cochées');
      const b = racine.querySelector('[data-action="ajouter"]');
      if (b) b.disabled = n === 0;
    }

    racine.addEventListener('change', majPied);
    racine.addEventListener('input', majPied);

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b || b.disabled) return;
      const action = b.getAttribute('data-action');
      if (action === 'fermer' || action === 'plus-tard') { plusTard(); return; }
      if (action === 'ajouter') {
        const ids = coches();
        const texte = racine.querySelector('#bilan-libre').value.split(',');
        fermer();
        rappels.ajouter(ids, texte);
      }
    });

    racine.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); plusTard(); } });

    // Fermer sans valider (croix, Échap, « Plus tard ») : le bilan est reporté.
    function plusTard() {
      if (!ouvert) return;
      fermer();
      rappels.plusTard();
    }

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

  CT.vueBilan = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
