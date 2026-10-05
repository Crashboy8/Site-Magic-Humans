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
    if (statut !== 'a_conquerir') c.exploree = true;
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

  // ---------- Moments de flow ----------

  function entre1et5(v) {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 3;
  }

  /*
   * Enregistre un moment de flow. Les parties à déléguer peuvent, sur demande,
   * rejoindre la zone à déléguer. Renvoie le moment créé, ou null s'il est vide.
   */
  function ajouterMoment(carte, saisie) {
    const ids = new Set(carte.competences.map((c) => c.id));
    const competenceIds = [...new Set(saisie.competenceIds || [])].filter((id) => ids.has(id));
    if (!competenceIds.length) return null;
    const parties = [...new Set(saisie.partiesADeleguer || [])].filter((id) => ids.has(id) && !competenceIds.includes(id));
    const date = saisie.date && !Number.isNaN(Date.parse(saisie.date)) ? new Date(saisie.date) : new Date();
    const moment = {
      id: CT.schema.nouvelId('flow'),
      date: date.toISOString(),
      competenceIds,
      intensite: entre1et5(saisie.intensite),
      defi: entre1et5(saisie.defi),
      maitrise: entre1et5(saisie.maitrise),
      note: String(saisie.note || '').trim().slice(0, 280),
      partiesADeleguer: parties
    };
    carte.momentsDeFlow.push(moment);
    competenceIds.forEach((id) => { trouver(carte, id).exploree = true; });
    if (saisie.rangerADeleguer) parties.forEach((id) => changerStatut(carte, id, 'a_deleguer'));
    return moment;
  }

  function supprimerMoment(carte, id) {
    const avant = carte.momentsDeFlow.length;
    carte.momentsDeFlow = carte.momentsDeFlow.filter((m) => m.id !== id);
    return carte.momentsDeFlow.length !== avant;
  }

  // Compétences des derniers moments (plus récentes d'abord), complétées par les frontières.
  function competencesRecentes(carte, nombre) {
    const res = [];
    [...carte.momentsDeFlow].sort((a, b) => b.date.localeCompare(a.date)).forEach((m) => {
      m.competenceIds.forEach((id) => { if (!res.includes(id)) res.push(id); });
    });
    const recentes = res.slice(0, nombre);
    const complements = carte.competences
      .filter((c) => c.statut === 'frontiere' && !recentes.includes(c.id))
      .sort((a, b) => (a.priorite || 99) - (b.priorite || 99))
      .map((c) => c.id);
    return { recentes, suggestions: complements.slice(0, Math.max(0, nombre - recentes.length)) };
  }

  // Ajoute une compétence saisie à la volée ; le placement automatique la posera.
  function ajouterCompetence(carte, nom, statut) {
    const propre = String(nom || '').trim().slice(0, 60);
    if (!propre) return null;
    const existante = carte.competences.find((c) => normaliserTexte(c.nom) === normaliserTexte(propre));
    if (existante) return existante;
    const c = {
      id: CT.schema.nouvelId('comp'),
      nom: propre,
      icone: 'sparkles',
      statut: CT.schema.STATUTS.includes(statut) ? statut : 'frontiere',
      regionId: null,
      regionJonctionId: null,
      ileId: null,
      domaine: null,
      distance: 'proche',
      voisines: [],
      position: null,
      positionManuelle: false,
      priorite: null,
      exploree: true
    };
    carte.competences.push(c);
    return c;
  }

  // Minuscules sans accents, pour la recherche.
  function normaliserTexte(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  function rechercher(carte, texte, exclure) {
    const q = normaliserTexte(texte);
    if (!q) return [];
    return carte.competences
      .filter((c) => !(exclure || []).includes(c.id))
      .map((c) => {
        const n = normaliserTexte(c.nom);
        const rang = n.startsWith(q) ? 0 : n.split(/[\s'/()-]+/).some((m) => m.startsWith(q)) ? 1 : n.includes(q) ? 2 : -1;
        return { c, rang };
      })
      .filter((x) => x.rang >= 0)
      .sort((a, b) => a.rang - b.rang || a.c.nom.localeCompare(b.c.nom, 'fr'))
      .map((x) => x.c);
  }

  // ---------- Éclat et brouillard ----------

  /*
   * Éclat d'une compétence : flow des 30 derniers jours, pondéré par l'intensité,
   * les moments récents comptant un peu plus. Niveau de 0 (aucun) à 4 (rayonnant).
   */
  function eclat(carte, id, maintenant) {
    const t = maintenant || Date.now();
    const moments = momentsRecents(carte, id, 30, t);
    let score = 0;
    moments.forEach((m) => {
      const age = Math.max(0, (t - Date.parse(m.date)) / JOUR);
      score += (m.intensite / 5) * (1 - Math.min(age, 30) / 60);
    });
    const niveau = score <= 0 ? 0 : score < 1.5 ? 1 : score < 3.5 ? 2 : score < 6 ? 3 : 4;
    return { niveau, nombre: moments.length, score };
  }

  // Un territoire à conquérir reste dans le brouillard tant qu'on ne l'a pas exploré.
  function estCache(carte, c) {
    return Boolean(carte.preferences.brouillardDeGuerre && c && c.statut === 'a_conquerir' && !c.exploree);
  }

  function explorer(carte, id) {
    const c = trouver(carte, id);
    if (!c || c.exploree) return false;
    c.exploree = true;
    return true;
  }

  function changerPreference(carte, cle, valeur) {
    if (!(cle in CT.schema.PREFERENCES_DEFAUT)) return false;
    carte.preferences[cle] = valeur;
    return true;
  }

  CT.regles = {
    trouver, changerStatut, changerDistance, changerRegion, changerIle, deplacer, remettreAuto,
    preparerReorganisation, momentsDe, momentsRecents, objectifDe, regionDe,
    ajouterMoment, supprimerMoment, competencesRecentes, ajouterCompetence, normaliserTexte, rechercher,
    eclat, estCache, explorer, changerPreference
  };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
