/*
 * Point d'entrée : charge la carte, calcule la géographie, branche l'interface.
 */
(function (CT) {
  'use strict';

  const etat = {
    carte: null,
    placement: null
  };

  const $ = (id) => document.getElementById(id);

  function toast(message) {
    const t = $('toast');
    t.textContent = message;
    t.classList.add('visible');
    clearTimeout(toast.minuteur);
    toast.minuteur = setTimeout(() => t.classList.remove('visible'), 2800);
  }

  // Recalcule le placement et mémorise les positions dans le modèle.
  function recalculer() {
    etat.placement = CT.placement.placer(etat.carte);
    etat.carte.competences.forEach((c) => {
      const p = etat.placement.positions[c.id];
      if (p) c.position = { q: p.q, r: p.r };
    });
    const problemes = CT.placement.verifier(etat.placement);
    if (problemes.length && globalThis.console) console.warn('Placement :', problemes);
  }

  function enregistrer() {
    if (!CT.stockage.sauvegarder(etat.carte)) toast('Impossible d\'enregistrer dans ce navigateur. Pense à exporter ta carte.');
  }

  function rendre() {
    $('talent-nom').textContent = etat.carte.talent.nom || 'Mon talent';
    $('talent-fil').textContent = etat.carte.talent.filRouge ? 'Fil rouge : ' + etat.carte.talent.filRouge : '';
    CT.vueCarte.rendre($('carte'), etat.carte, etat.placement);
    CT.vueLegende.rendre($('legende-contenu'), etat.carte);
  }

  function changerCarte(carte) {
    etat.carte = carte;
    recalculer();
    enregistrer();
    rendre();
  }

  function brancher() {
    $('btn-exporter').addEventListener('click', () => {
      CT.stockage.exporter(etat.carte);
      toast('Carte exportée. Garde ce fichier précieusement.');
    });
    $('btn-importer').addEventListener('click', () => $('fichier-import').click());
    $('fichier-import').addEventListener('change', (e) => {
      const fichier = e.target.files[0];
      e.target.value = '';
      if (!fichier) return;
      CT.stockage.importer(fichier)
        .then((carte) => {
          if (!confirm('Remplacer ta carte actuelle par celle du fichier « ' + fichier.name + ' » ?')) return;
          changerCarte(carte);
          toast('Carte importée.');
        })
        .catch((err) => toast(err.message || 'Fichier illisible.'));
    });
    $('btn-reinitialiser').addEventListener('click', () => {
      if (!confirm('Revenir à la carte de démonstration ? Ta carte actuelle sera remplacée (exporte-la d\'abord si tu veux la garder).')) return;
      changerCarte(CT.demo.creer());
      toast('Carte de démonstration restaurée.');
    });
    $('legende-bascule').addEventListener('click', () => {
      const ouverte = $('legende').classList.toggle('fermee') === false;
      $('legende-bascule').setAttribute('aria-expanded', String(ouverte));
    });
  }

  function demarrer() {
    etat.carte = CT.stockage.charger() || CT.demo.creer();
    recalculer();
    enregistrer();
    rendre();
    brancher();
    CT.outils.rafraichirIcones();
    if (window.matchMedia('(max-width: 640px)').matches) $('legende').classList.add('fermee');
  }

  CT.app = { etat };
  document.addEventListener('DOMContentLoaded', demarrer);
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
