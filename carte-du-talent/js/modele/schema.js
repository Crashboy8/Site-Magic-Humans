/*
 * Modèle de données de la Carte du Talent : constantes, création et normalisation.
 * Aucun accès au DOM. Toute donnée entrante (localStorage, import JSON) passe par normaliser().
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const VERSION = 1;

  const STATUTS = ['natale', 'conquise', 'frontiere', 'a_conquerir', 'a_deleguer', 'ile'];

  const LIBELLES_STATUT = {
    natale: T('Territoire natal'),
    conquise: T('Territoire conquis'),
    frontiere: T('Frontière'),
    a_conquerir: T('À conquérir'),
    a_deleguer: T('À déléguer'),
    ile: T('Île de flow')
  };

  // Domaines de compétences : servent à regrouper les provinces éloignées et la bibliothèque.
  const DOMAINES = {
    relation: { nom: T('Relation'), couleur: '#E9A48C' },
    animation: { nom: T('Animation'), couleur: '#EFC66A' },
    scene: { nom: T('Scène'), couleur: '#E58FA6' },
    pedagogie: { nom: T('Pédagogie'), couleur: '#A99BE0' },
    communication: { nom: T('Communication'), couleur: '#8FC3D6' },
    numerique: { nom: T('Numérique'), couleur: '#86A9C9' },
    langues: { nom: T('Langues'), couleur: '#C7A47E' },
    business: { nom: T('Business'), couleur: '#A9C27A' },
    corps: { nom: T('Corps'), couleur: '#E6A86B' },
    creation: { nom: T('Création'), couleur: '#C99AD0' },
    organisation: { nom: T('Organisation'), couleur: '#A8B0B8' },
    analyse: { nom: T('Analyse'), couleur: '#7FB7B0' },
    nature: { nom: T('Nature'), couleur: '#8DBE7E' },
    technique: { nom: T('Technique'), couleur: '#B59A8A' }
  };

  const PREFERENCES_DEFAUT = { brouillardDeGuerre: false, seuilConquete: 10 };

  function nouvelId(prefixe) {
    return (prefixe || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function creerCarteVide() {
    return {
      version: VERSION,
      talent: { nom: '', filRouge: '' },
      regions: [],
      competences: [],
      iles: [],
      momentsDeFlow: [],
      objectifs: [],
      suggestionsRefusees: [],
      preferences: Object.assign({}, PREFERENCES_DEFAUT)
    };
  }

  function texte(v, defaut) {
    return typeof v === 'string' ? v.trim() : (defaut || '');
  }

  function entre(v, min, max, defaut) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : defaut;
  }

  function liste(v) {
    return Array.isArray(v) ? v : [];
  }

  function position(p) {
    if (!p || !Number.isFinite(Number(p.q)) || !Number.isFinite(Number(p.r))) return null;
    return { q: Math.round(Number(p.q)), r: Math.round(Number(p.r)) };
  }

  // Rend une carte toujours valide, quelle que soit la source. Les références cassées sont retirées.
  function normaliser(brut) {
    const src = brut && typeof brut === 'object' ? brut : {};
    const carte = creerCarteVide();

    carte.talent = {
      nom: texte(src.talent && src.talent.nom),
      filRouge: texte(src.talent && src.talent.filRouge)
    };

    carte.regions = liste(src.regions)
      .filter((r) => r && r.id)
      .map((r) => ({
        id: String(r.id),
        nom: texte(r.nom, T('Région')),
        couleur: /^#[0-9a-f]{6}$/i.test(r.couleur) ? r.couleur : '#9DB8A0',
        icone: texte(r.icone, 'map'),
        voisines: liste(r.voisines).map(String)
      }));
    const idsRegions = new Set(carte.regions.map((r) => r.id));
    carte.regions.forEach((r) => {
      r.voisines = r.voisines.filter((v) => v !== r.id && idsRegions.has(v));
    });

    carte.iles = liste(src.iles)
      .filter((i) => i && i.id)
      .map((i) => ({ id: String(i.id), nom: texte(i.nom, 'Île') }));
    const idsIles = new Set(carte.iles.map((i) => i.id));

    carte.competences = liste(src.competences)
      .filter((c) => c && c.id && texte(c.nom))
      .map((c) => {
        const statut = STATUTS.includes(c.statut) ? c.statut : 'a_conquerir';
        return {
          id: String(c.id),
          nom: texte(c.nom),
          icone: texte(c.icone, 'circle'),
          statut,
          regionId: idsRegions.has(c.regionId) ? c.regionId : null,
          regionJonctionId: idsRegions.has(c.regionJonctionId) && c.regionJonctionId !== c.regionId
            ? c.regionJonctionId : null,
          ileId: idsIles.has(c.ileId) ? c.ileId : null,
          domaine: DOMAINES[c.domaine] ? c.domaine : null,
          distance: c.distance === 'eloignee' ? 'eloignee' : 'proche',
          voisines: liste(c.voisines).map(String),
          position: position(c.position),
          positionManuelle: Boolean(c.positionManuelle) && position(c.position) !== null,
          priorite: c.priorite ? entre(c.priorite, 1, 99, null) : null,
          exploree: Boolean(c.exploree),
          reportConquete: Number.isFinite(Number(c.reportConquete)) && c.reportConquete !== null ? Math.max(0, Math.round(Number(c.reportConquete))) : null,
          bibliothequeId: c.bibliothequeId ? String(c.bibliothequeId) : null
        };
      });
    const idsComp = new Set(carte.competences.map((c) => c.id));
    carte.competences.forEach((c) => {
      c.voisines = c.voisines.filter((v) => v !== c.id && idsComp.has(v));
      // Une compétence d'île sans île connue est rattachée à une île par défaut.
      if (c.statut === 'ile' && !c.ileId) {
        if (!carte.iles.length) carte.iles.push({ id: 'ile-flow', nom: T('Île de flow') });
        c.ileId = carte.iles[0].id;
      }
    });

    carte.momentsDeFlow = liste(src.momentsDeFlow)
      .filter((m) => m && m.id && !Number.isNaN(Date.parse(m.date)))
      .map((m) => ({
        id: String(m.id),
        date: new Date(m.date).toISOString(),
        competenceIds: liste(m.competenceIds).map(String).filter((id) => idsComp.has(id)),
        intensite: entre(m.intensite, 1, 5, 3),
        defi: entre(m.defi, 1, 5, 3),
        maitrise: entre(m.maitrise, 1, 5, 3),
        note: texte(m.note).slice(0, 280),
        partiesADeleguer: liste(m.partiesADeleguer).map(String).filter((id) => idsComp.has(id))
      }))
      .filter((m) => m.competenceIds.length > 0);

    carte.objectifs = liste(src.objectifs)
      .filter((o) => o && o.id && idsComp.has(o.competenceId))
      .map((o) => ({
        id: String(o.id),
        competenceId: o.competenceId,
        description: texte(o.description),
        frequence: {
          fois: entre(o.frequence && o.frequence.fois, 1, 99, 1),
          periode: o.frequence && o.frequence.periode === 'mois' ? 'mois' : 'semaine'
        },
        progression: liste(o.progression).filter((d) => !Number.isNaN(Date.parse(d)))
      }));

    const prefs = src.preferences || {};
    carte.suggestionsRefusees = [...new Set(liste(src.suggestionsRefusees).map(String))];

    carte.preferences = {
      brouillardDeGuerre: Boolean(prefs.brouillardDeGuerre),
      seuilConquete: entre(prefs.seuilConquete, 1, 100, PREFERENCES_DEFAUT.seuilConquete)
    };

    return carte;
  }

  CT.schema = { VERSION, STATUTS, LIBELLES_STATUT, DOMAINES, PREFERENCES_DEFAUT, nouvelId, creerCarteVide, normaliser };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
