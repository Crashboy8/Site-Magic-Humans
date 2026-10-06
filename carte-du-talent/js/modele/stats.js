/*
 * Statistiques de progrès : calculs purs sur la carte, sans DOM.
 * Elles servent à observer, jamais à juger.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const JOUR = 24 * 3600 * 1000;

  // Lundi 00:00 (heure locale) de la semaine contenant la date.
  function debutSemaine(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  function debutMois(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function debutPeriode(date, periode) {
    return periode === 'mois' ? debutMois(date) : debutSemaine(date);
  }

  function periodePrecedente(debut, periode) {
    const d = new Date(debut);
    if (periode === 'mois') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    return d;
  }

  function periodeSuivante(debut, periode) {
    const d = new Date(debut);
    if (periode === 'mois') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    return d;
  }

  // Moments des N derniers jours (null = tous).
  function momentsPeriode(carte, jours, maintenant) {
    if (!jours) return carte.momentsDeFlow.slice();
    const limite = (maintenant || Date.now()) - jours * JOUR;
    return carte.momentsDeFlow.filter((m) => Date.parse(m.date) >= limite);
  }

  // Nombre de moments par semaine, de la plus ancienne à la semaine en cours.
  function fluxParSemaine(carte, nombre, maintenant) {
    const t = maintenant || Date.now();
    const semaines = [];
    let debut = debutSemaine(t);
    for (let i = 0; i < (nombre || 8); i++) {
      semaines.unshift({ debut: new Date(debut), nombre: 0, enCours: i === 0 });
      debut = periodePrecedente(debut, 'semaine');
    }
    carte.momentsDeFlow.forEach((m) => {
      const d = Date.parse(m.date);
      const s = semaines.find((x) => d >= x.debut.getTime() && d < periodeSuivante(x.debut, 'semaine').getTime());
      if (s) s.nombre++;
    });
    return semaines;
  }

  function topCompetences(carte, options) {
    const o = options || {};
    const compte = {};
    momentsPeriode(carte, o.jours, o.maintenant).forEach((m) => {
      m.competenceIds.forEach((id) => { compte[id] = (compte[id] || 0) + 1; });
    });
    return Object.keys(compte)
      .map((id) => ({ c: CT.regles.trouver(carte, id), nombre: compte[id] }))
      .filter((x) => x.c)
      .sort((a, b) => b.nombre - a.nombre || a.c.nom.localeCompare(b.c.nom, 'fr'))
      .slice(0, o.n || 5);
  }

  // Zone d'une compétence pour les statistiques : région, province, île ou zone à déléguer.
  function zoneDe(carte, c) {
    if (c.statut === 'ile') {
      const ile = carte.iles.find((i) => i.id === c.ileId);
      return { cle: 'i:' + c.ileId, nom: ile ? T('Île {nom}', { nom: ile.nom }) : T('Île de flow'), couleur: '#7DCDAE' };
    }
    if (c.statut === 'ressource') return { cle: 'ressource', nom: T('Zone de ressourcement'), couleur: '#E8C9A0' };
    if (c.statut === 'a_deleguer') return { cle: 'deleguer', nom: T('Zone à déléguer'), couleur: '#B4BAC2' };
    if (c.distance === 'eloignee' && c.statut !== 'natale') {
      const d = CT.schema.DOMAINES[c.domaine] || { nom: T('Province'), couleur: '#B9A88F' };
      return { cle: 'p:' + (c.domaine || 'divers'), nom: T('Province {domaine}', { domaine: d.nom.toLowerCase() }), couleur: d.couleur };
    }
    const r = CT.regles.regionDe(carte, c.regionId);
    return r ? { cle: 'r:' + r.id, nom: r.nom, couleur: r.couleur } : { cle: 'autre', nom: T('Hors région'), couleur: '#B9A88F' };
  }

  // Un moment compte une seule fois par zone, même s'il touche plusieurs compétences de cette zone.
  function topRegions(carte, options) {
    const o = options || {};
    const zones = {};
    momentsPeriode(carte, o.jours, o.maintenant).forEach((m) => {
      const vues = new Set();
      m.competenceIds.forEach((id) => {
        const c = CT.regles.trouver(carte, id);
        if (!c) return;
        const z = zoneDe(carte, c);
        if (vues.has(z.cle)) return;
        vues.add(z.cle);
        if (!zones[z.cle]) zones[z.cle] = Object.assign({ nombre: 0 }, z);
        zones[z.cle].nombre++;
      });
    });
    return Object.values(zones).sort((a, b) => b.nombre - a.nombre || a.nom.localeCompare(b.nom, 'fr')).slice(0, o.n || 6);
  }

  // Grille 5×5 : grille[defi - 1][maitrise - 1] = nombre de moments.
  function grilleDefiMaitrise(carte, options) {
    const o = options || {};
    const grille = Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]);
    momentsPeriode(carte, o.jours, o.maintenant).forEach((m) => { grille[m.defi - 1][m.maitrise - 1]++; });
    return grille;
  }

  // Avancée de chaque frontière vers le seuil de conquête.
  function frontieres(carte) {
    const seuil = carte.preferences.seuilConquete;
    return carte.competences
      .filter((c) => c.statut === 'frontiere')
      .map((c) => {
        const nombre = CT.regles.momentsDe(carte, c.id).length;
        return { c, nombre, seuil, ratio: Math.min(1, nombre / seuil), pret: nombre >= seuil };
      })
      .sort((a, b) => (a.c.priorite || 99) - (b.c.priorite || 99) || b.ratio - a.ratio || a.c.nom.localeCompare(b.c.nom, 'fr'));
  }

  /*
   * Frontières à proposer comme conquises. Si la personne a répondu « pas encore »,
   * la proposition revient seulement après 5 nouveaux moments.
   */
  function propositionsConquete(carte) {
    return frontieres(carte).filter((f) => f.pret && (f.c.reportConquete == null || f.nombre >= f.c.reportConquete + 5));
  }

  // Suivi d'un objectif : sessions notées à la main + moments de flow sur la compétence.
  function suiviObjectif(carte, objectif, maintenant, nombrePeriodes) {
    const t = maintenant || Date.now();
    const periode = objectif.frequence.periode;
    const dates = objectif.progression.map((d) => ({ t: Date.parse(d), manuelle: true }))
      .concat(CT.regles.momentsDe(carte, objectif.competenceId).map((m) => ({ t: Date.parse(m.date), manuelle: false })));
    const periodes = [];
    let debut = debutPeriode(t, periode);
    for (let i = 0; i < (nombrePeriodes || 4); i++) {
      const fin = periodeSuivante(debut, periode);
      const dedans = dates.filter((d) => d.t >= debut.getTime() && d.t < fin.getTime());
      periodes.unshift({
        debut: new Date(debut),
        fait: dedans.length,
        manuelles: dedans.filter((d) => d.manuelle).length,
        cible: objectif.frequence.fois,
        enCours: i === 0
      });
      debut = periodePrecedente(debut, periode);
    }
    return { actuelle: periodes[periodes.length - 1], periodes };
  }

  CT.stats = {
    debutSemaine, debutPeriode, momentsPeriode, fluxParSemaine, topCompetences, topRegions, zoneDe,
    grilleDefiMaitrise, frontieres, propositionsConquete, suiviObjectif
  };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
