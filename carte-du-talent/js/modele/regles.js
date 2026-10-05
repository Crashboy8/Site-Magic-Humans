/*
 * Règles métier : changements de statut, déplacements, lectures du flow et des objectifs.
 * Modifie la carte en place, sans jamais toucher au DOM.
 */
(function (CT) {
  'use strict';

  const JOUR = 24 * 3600 * 1000;

  function trouver(carte, id) {
    return carte.competences.find((c) => c.id === id) || null;
  }

  // Oublie la position d'une compétence pour que le placement automatique la repose.
  function liberer(c) {
    c.position = null;
    c.positionManuelle = false;
  }

  function changerStatut(carte, id, statut) {
    const c = trouver(carte, id);
    if (!c || !CT.schema.STATUTS.includes(statut) || c.statut === statut) return null;
    const avant = CT.placement.groupeDe(c);
    const ancien = c.statut;
    c.statut = statut;
    if (statut === 'ile' && !c.ileId) {
      if (!carte.iles.length) carte.iles.push({ id: CT.schema.nouvelId('ile'), nom: 'Île de flow' });
      c.ileId = carte.iles[0].id;
    }
    if (statut !== 'ile') c.ileId = null;
    // Un hexagone qui change de zone (province, île, zone à déléguer…) est reposé ailleurs.
    if (CT.placement.groupeDe(c) !== avant) liberer(c);
    return { ancien, nouveau: statut };
  }

  function changerDistance(carte, id, distance) {
    const c = trouver(carte, id);
    if (!c || (distance !== 'proche' && distance !== 'eloignee') || c.distance === distance) return false;
    const avant = CT.placement.groupeDe(c);
    c.distance = distance;
    if (CT.placement.groupeDe(c) !== avant) liberer(c);
    return true;
  }

  function changerRegion(carte, id, regionId) {
    const c = trouver(carte, id);
    if (!c || !carte.regions.some((r) => r.id === regionId) || c.regionId === regionId) return false;
    c.regionId = regionId;
    if (c.regionJonctionId === regionId) c.regionJonctionId = null;
    liberer(c);
    return true;
  }

  function changerIle(carte, id, ileId) {
    const c = trouver(carte, id);
    if (!c || c.statut !== 'ile' || !carte.iles.some((i) => i.id === ileId) || c.ileId === ileId) return false;
    c.ileId = ileId;
    liberer(c);
    return true;
  }

  /*
   * Déplace une compétence vers une case. Si la case est occupée par une autre compétence,
   * les deux échangent leur place. Renvoie 'deplace', 'echange' ou null (refus).
   */
  function deplacer(carte, id, cible, cases) {
    const c = trouver(carte, id);
    if (!c || !c.position) return null;
    const occupant = cases.find((cs) => cs.q === cible.q && cs.r === cible.r);
    if (occupant && occupant.id === 'capitale') return null;
    if (occupant && occupant.id === id) return null;
    const depart = { q: c.position.q, r: c.position.r };
    c.position = { q: cible.q, r: cible.r };
    c.positionManuelle = true;
    if (occupant) {
      const autre = trouver(carte, occupant.id);
      if (autre) {
        autre.position = depart;
        autre.positionManuelle = true;
        return 'echange';
      }
    }
    return 'deplace';
  }

  function remettreAuto(carte, id) {
    const c = trouver(carte, id);
    if (c) liberer(c);
  }

  // Avant une réorganisation complète : seules les positions choisies à la main restent.
  function preparerReorganisation(carte) {
    carte.competences.forEach((c) => { if (!c.positionManuelle) c.position = null; });
  }

  function momentsDe(carte, id) {
    return carte.momentsDeFlow
      .filter((m) => m.competenceIds.includes(id))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function momentsRecents(carte, id, jours, maintenant) {
    const limite = (maintenant || Date.now()) - (jours || 30) * JOUR;
    return momentsDe(carte, id).filter((m) => Date.parse(m.date) >= limite);
  }

  function objectifDe(carte, id) {
    return carte.objectifs.find((o) => o.competenceId === id) || null;
  }

  function regionDe(carte, id) {
    return carte.regions.find((r) => r.id === id) || null;
  }

  CT.regles = {
    trouver, changerStatut, changerDistance, changerRegion, changerIle, deplacer, remettreAuto,
    preparerReorganisation, momentsDe, momentsRecents, objectifDe, regionDe
  };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
