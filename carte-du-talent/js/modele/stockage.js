/*
 * Persistance : localStorage + export / import JSON.
 */
(function (CT) {
  'use strict';

  const CLE = 'carteDuTalent.v1';
  const CLE_BROUILLON = 'carteDuTalent.brouillon';

  function charger() {
    try {
      const brut = localStorage.getItem(CLE);
      return brut ? CT.schema.normaliser(JSON.parse(brut)) : null;
    } catch (e) {
      return null;
    }
  }

  function sauvegarder(carte) {
    try {
      localStorage.setItem(CLE, JSON.stringify(carte));
      return true;
    } catch (e) {
      return false;
    }
  }

  function effacer() {
    try { localStorage.removeItem(CLE); } catch (e) { /* stockage indisponible */ }
  }

  function exporter(carte) {
    const json = JSON.stringify(Object.assign({ exporteLe: new Date().toISOString() }, carte), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carte-du-talent-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Lit un fichier JSON et renvoie une carte normalisée (rejette si le fichier n'est pas une carte).
  function importer(fichier) {
    return fichier.text().then((txt) => {
      const brut = JSON.parse(txt);
      if (!brut || !Array.isArray(brut.competences) || !brut.talent) {
        throw new Error('Ce fichier ne ressemble pas à une Carte du Talent.');
      }
      return CT.schema.normaliser(brut);
    });
  }

  // Brouillon de la création guidée : rien n'est perdu si la page se ferme en cours de route.
  function chargerBrouillon() {
    try {
      const brut = localStorage.getItem(CLE_BROUILLON);
      return brut ? CT.creation.normaliserBrouillon(JSON.parse(brut)) : null;
    } catch (e) {
      return null;
    }
  }

  function sauvegarderBrouillon(brouillon) {
    try { localStorage.setItem(CLE_BROUILLON, JSON.stringify(brouillon)); } catch (e) { /* stockage indisponible */ }
  }

  function effacerBrouillon() {
    try { localStorage.removeItem(CLE_BROUILLON); } catch (e) { /* stockage indisponible */ }
  }

  CT.stockage = { charger, sauvegarder, effacer, exporter, importer, chargerBrouillon, sauvegarderBrouillon, effacerBrouillon };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
