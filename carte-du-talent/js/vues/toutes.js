/*
 * Écran « Toutes les compétences » : toute la bibliothèque, regroupée par domaine comme une carte.
 * Sert surtout avec le brouillard de guerre : on peut conquérir n'importe quel hexagone,
 * pas seulement ceux que la carte propose.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;
  const H = CT.hex;
  const S = CT.schema;

  const TAILLE = 40; // rayon d'un hexagone

  const N = (s) => CT.regles.normaliserTexte(s);

  // Compétence de la carte qui correspond à une entrée de la bibliothèque, ou null.
  function surLaCarte(carte, entree) {
    const noms = [entree.nom].concat(entree.alias).map(N);
    return carte.competences.find((c) => c.bibliothequeId === entree.id || noms.includes(N(c.nom))) || null;
  }

  // Cellules en spirale autour de (0, 0) : le premier hexagone au centre, puis les anneaux.
  function spirale(n) {
    const cases = [];
    for (let r = 0; cases.length < n; r++) H.anneau({ q: 0, r: 0 }, r).forEach((c) => cases.push(c));
    return cases.slice(0, n);
  }

  function nomStatut(c) {
    return c ? S.LIBELLES_STATUT[c.statut] : T('Pas encore sur ta carte');
  }

  function tuile(entree, cel, couleur, existante, choisie) {
    const p = H.versPixel(cel.q, cel.r, TAILLE);
    const x = p.x;
    const y = p.y;
    const statut = existante ? existante.statut : 'absente';
    let fond = O.nuance(couleur, 0.82);
    let contour = O.nuance(couleur, -0.05);
    let tirets = '3 5';
    let encre = O.nuance(couleur, -0.4);
    if (existante) {
      tirets = null;
      if (statut === 'natale') { fond = couleur; contour = O.nuance(couleur, -0.18); }
      else if (statut === 'conquise') { fond = O.nuance(couleur, 0.16); contour = O.nuance(couleur, -0.18); }
      else if (statut === 'frontiere') { fond = O.nuance(couleur, 0.55); contour = O.nuance(couleur, -0.3); tirets = '7 5'; }
      else if (statut === 'a_conquerir') { fond = O.nuance(couleur, 0.78); tirets = '3 5'; }
      else { fond = '#E7E9EC'; contour = '#B4BAC2'; encre = '#5D636B'; }
    }
    const lignes = O.couperTexte(entree.nom, 11, 3);
    const hauteur = 11.5;
    const y0 = y + 12 - (lignes.length - 1) * hauteur / 2;
    const texte = '<text class="nom-toutes" fill="#33312D">' + lignes.map((l, i) => '<tspan x="' + x.toFixed(1) + '" y="' + (y0 + i * hauteur).toFixed(1) + '">' + O.echapper(l) + '</tspan>').join('') + '</text>';
    const points = H.coins(x, y, TAILLE * 0.94).map((q) => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' ');
    return '<g class="tuile-toutes tuile-toutes-' + statut + (choisie ? ' choisie' : '') + '" data-action="choisir" data-valeur="' + O.echapper(entree.id) + '" tabindex="0" role="button" aria-pressed="' + choisie +
      '" aria-label="' + O.echapper(entree.nom + ' — ' + nomStatut(existante)) + '">' +
      '<polygon points="' + points + '" fill="' + fond + '" stroke="' + contour + '" stroke-width="' + (choisie ? 3.5 : 1.6) + '"' + (tirets ? ' stroke-dasharray="' + tirets + '"' : '') + '/>' +
      O.iconeSvg(entree.icone, x, y - 15, 18, encre, 2) + texte + '</g>';
  }

  function province(carte, cle, entrees, choix) {
    const d = S.DOMAINES[cle];
    const cases = spirale(entrees.length);
    const px = cases.map((c) => H.versPixel(c.q, c.r, TAILLE));
    const marge = TAILLE + 4;
    const x0 = Math.min(...px.map((p) => p.x)) - marge;
    const y0 = Math.min(...px.map((p) => p.y)) - marge;
    const l = Math.max(...px.map((p) => p.x)) + marge - x0;
    const h = Math.max(...px.map((p) => p.y)) + marge - y0;
    const surCarte = entrees.filter((e) => surLaCarte(carte, e)).length;
    return '<section class="carte-progres province" aria-labelledby="dom-' + cle + '">' +
      '<h3 id="dom-' + cle + '"><span class="puce" style="background:' + d.couleur + '"></span>' + O.echapper(d.nom) +
      '<span class="discret compte-province">' + T('{n} sur {total} sur ta carte', { n: surCarte, total: entrees.length }) + '</span></h3>' +
      '<svg class="nid" viewBox="' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + l.toFixed(1) + ' ' + h.toFixed(1) + '" style="max-width:' + Math.round(l * 1.15) + 'px" role="group" aria-label="' + O.echapper(d.nom) + '">' +
      entrees.map((e, i) => tuile(e, cases[i], d.couleur, surLaCarte(carte, e), choix === e.id)).join('') + '</svg></section>';
  }

  // Barre d'action pour l'hexagone choisi.
  function barreChoix(carte, entree) {
    if (!entree) return '<p class="discret barre-aide">' + T('Touche un hexagone pour le conquérir ou le voir sur ta carte.') + '</p>';
    const c = surLaCarte(carte, entree);
    const bouton = (action, valeur, icone, libelle, principal) => '<button type="button" class="bouton ' + (principal ? 'bouton-principal' : 'bouton-secondaire') + ' bouton-compact" data-action="' + action +
      '" data-valeur="' + O.echapper(valeur) + '"><i data-lucide="' + icone + '"></i>' + libelle + '</button>';
    let actions = '';
    if (!c) {
      actions = bouton('ajouter', entree.id + '|frontiere', 'mountain', T('J\'y vais : en conquête'), true) +
        bouton('ajouter', entree.id + '|a_conquerir', 'plus', T('À conquérir plus tard')) +
        bouton('ajouter', entree.id + '|conquise', 'trophy', T('Je l\'ai déjà conquis'));
    } else {
      if (c.statut === 'a_conquerir') {
        actions = bouton('statut', c.id + '|frontiere', 'mountain', T('J\'y vais : en conquête'), true) + bouton('statut', c.id + '|conquise', 'trophy', T('Je l\'ai déjà conquis'));
      } else if (c.statut === 'frontiere') {
        actions = bouton('statut', c.id + '|conquise', 'trophy', T('Je l\'ai conquis'), true);
      }
      actions += bouton('voir', c.id, 'map-pin', T('Voir sur ma carte'));
    }
    return '<div class="barre-choix"><div class="barre-texte"><strong>' + O.echapper(entree.nom) + '</strong><span class="discret">' +
      O.echapper(S.DOMAINES[entree.domaine].nom + ' · ' + nomStatut(c)) + '</span></div><div class="barre-actions">' + actions + '</div></div>';
  }

  function contenu(carte, etat) {
    const tete = '<header class="progres-tete"><div><p class="surtitre"><i data-lucide="layout-grid"></i> ' + T('Toutes les compétences') + '</p>' +
      '<h2 id="toutes-titre">' + T('Tout ce que tu peux explorer') + '</h2>' +
      '<p class="discret">' + T('La bibliothèque entière, par domaine. Tu peux conquérir n\'importe quel hexagone, pas seulement ceux que ta carte te propose.') + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>';
    const parDomaine = {};
    CT.bibliotheque.ENTREES.forEach((e) => { (parDomaine[e.domaine] = parDomaine[e.domaine] || []).push(e); });
    const provinces = Object.keys(S.DOMAINES).filter((k) => parDomaine[k]).map((k) => province(carte, k, parDomaine[k], etat.choix)).join('');
    const entree = etat.choix ? CT.bibliotheque.trouver(etat.choix) : null;
    return tete + '<div class="toutes-corps">' + provinces + '</div><footer class="toutes-pied">' + barreChoix(carte, entree) + '</footer>';
  }

  function creer(racine, rappels) {
    const etat = { choix: null };
    let ouvert = false;
    let dernierFocus = null;

    function rendre() {
      if (!ouvert) return;
      const page = racine.querySelector('.progres-page');
      const defilement = page ? page.scrollTop : 0;
      racine.innerHTML = '<div class="progres-page" role="dialog" aria-modal="true" aria-labelledby="toutes-titre">' + contenu(rappels.carte(), etat) + '</div>';
      racine.querySelector('.progres-page').scrollTop = defilement;
      O.rafraichirIcones(racine);
    }

    function agir(el) {
      const action = el.getAttribute('data-action');
      const valeur = el.getAttribute('data-valeur');
      if (action === 'fermer') { fermer(); return; }
      if (action === 'choisir') { etat.choix = etat.choix === valeur ? null : valeur; rendre(); return; }
      if (action === 'voir') fermer();
      rappels.action(action, valeur);
    }

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (b) agir(b);
    });
    racine.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); fermer(); return; }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.tuile-toutes')) { e.preventDefault(); agir(e.target); }
    });

    function ouvrir() {
      dernierFocus = document.activeElement;
      ouvert = true;
      etat.choix = null;
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

  CT.vueToutes = { creer, surLaCarte };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
