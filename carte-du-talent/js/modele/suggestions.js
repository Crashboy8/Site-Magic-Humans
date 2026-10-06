/*
 * Suggestions de territoires à conquérir, tirées de la bibliothèque.
 * Une suggestion se rapproche de ce qui existe déjà sur la carte (liens, domaine)
 * et un peu plus de ce qui met dans le flow. Une suggestion refusée ne revient pas.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const POIDS_STATUT = { natale: 1, conquise: 1, frontiere: 1.3, a_conquerir: 0.6, ile: 0.5, a_deleguer: 0 };
  const DOMAINES_ELOIGNES = ['numerique', 'langues', 'organisation'];

  const N = (s) => CT.regles.normaliserTexte(s);

  // Le nom (ou un alias) de l'entrée figure-t-il déjà sur la carte ?
  function dejaSurLaCarte(carte, entree) {
    const noms = [entree.nom].concat(entree.alias).map(N);
    return carte.competences.some((c) => c.bibliothequeId === entree.id || noms.includes(N(c.nom)));
  }

  function disponibles(carte) {
    const refusees = new Set(carte.suggestionsRefusees);
    return CT.bibliotheque.ENTREES.filter((x) => !refusees.has(x.id) && !dejaSurLaCarte(carte, x));
  }

  // Un lien correspond à une compétence si c'est son nom, ou un groupe de mots entier de son nom.
  function correspond(nomCompetence, lien) {
    const n = ' ' + N(nomCompetence) + ' ';
    return n.includes(' ' + lien + ' ');
  }

  // Comment une entrée se rattache à la carte : compétences voisines, région, distance, raison.
  function profil(carte, entree, maintenant) {
    const appuis = [];
    carte.competences.forEach((c) => {
      const poids = POIDS_STATUT[c.statut] || 0;
      if (!poids) return;
      if (!entree.liens.some((l) => correspond(c.nom, l))) return;
      const flow = Math.min(1.5, 0.3 * CT.regles.momentsRecents(carte, c.id, 30, maintenant).length);
      appuis.push({ c, poids: poids + flow });
    });
    appuis.sort((a, b) => b.poids - a.poids || a.c.nom.localeCompare(b.c.nom, 'fr'));

    const domainePresent = carte.competences.some((c) => c.domaine === entree.domaine && ['natale', 'conquise', 'frontiere'].includes(c.statut));
    const score = appuis.reduce((s, a) => s + a.poids, 0) * 3 + (domainePresent ? 0.8 : 0);

    const ancrables = appuis.filter((a) => a.c.regionId && a.c.statut !== 'ile' && a.c.statut !== 'a_deleguer');
    const meilleur = ancrables[0] ? ancrables[0].c : null;
    let regionId = meilleur ? meilleur.regionId : null;
    if (!regionId) {
      const memeDomaine = carte.competences.find((c) => c.domaine === entree.domaine && c.regionId);
      regionId = memeDomaine ? memeDomaine.regionId : (carte.regions[0] ? carte.regions[0].id : null);
    }

    let distance = 'proche';
    if (meilleur && meilleur.distance === 'eloignee' && meilleur.domaine === entree.domaine) distance = 'eloignee';
    else if (!ancrables.some((a) => a.c.distance === 'proche') && DOMAINES_ELOIGNES.includes(entree.domaine)) distance = 'eloignee';

    // Deux appuis dans deux régions différentes : la suggestion se place à leur jonction.
    let regionJonctionId = null;
    if (distance === 'proche') {
      const autre = ancrables.find((a) => a.c.distance === 'proche' && a.c.regionId !== regionId);
      if (autre && ancrables[0].c.distance === 'proche') regionJonctionId = autre.c.regionId;
    }

    let raison;
    if (distance === 'eloignee') {
      const d = CT.schema.DOMAINES[entree.domaine];
      raison = d ? T('Prolonge ta province {domaine}', { domaine: d.nom.toLowerCase() }) : T('Prolonge ta province éloignée');
    } else if (appuis.length) {
      raison = T('Proche de {noms}', { noms: appuis.slice(0, 2).map((a) => T('« {nom} »', { nom: a.c.nom })).join(T(' et ')) });
    } else {
      const r = CT.regles.regionDe(carte, regionId);
      raison = r ? T('Dans le prolongement de {nom}', { nom: r.nom }) : T('Une piste à explorer');
    }

    return { entree, score, appuis: appuis.map((a) => a.c.id), regionId, regionJonctionId, distance, raison };
  }

  // Les meilleures suggestions, au plus deux par domaine pour garder de la variété.
  function proposer(carte, nombre, maintenant) {
    const parDomaine = {};
    return disponibles(carte)
      .map((x) => profil(carte, x, maintenant))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score || a.entree.nom.localeCompare(b.entree.nom, 'fr'))
      .filter((p) => {
        parDomaine[p.entree.domaine] = (parDomaine[p.entree.domaine] || 0) + 1;
        return parDomaine[p.entree.domaine] <= 2;
      })
      .slice(0, nombre || 6);
  }

  /*
   * Territoires à conquérir autour d'une carte qui vient d'être créée : au moins `parRegion` par région,
   * choisis dans la bibliothèque selon les sous-talents et les moments de flow de la région
   * (liens, domaine, mots communs). Une entrée n'est proposée qu'une fois.
   */
  function pourRegions(carte, parRegion) {
    const idees = CT.idees;
    const libres = disponibles(carte);
    const profils = carte.regions.map((r) => {
      const comps = carte.competences.filter((c) => c.regionId === r.id && ['natale', 'conquise', 'frontiere'].includes(c.statut));
      const grands = new Set(idees ? idees.domainesDe(r.nom) : []);
      comps.forEach((c) => (idees ? idees.domainesDe(c.nom) : []).forEach((d) => grands.add(d)));
      return { r, comps, grands };
    });
    const score = (p, x) => {
      let s = 0;
      p.comps.forEach((c) => {
        if (x.liens.some((l) => correspond(c.nom, l))) s += 3;
        if (c.domaine && c.domaine === x.domaine) s += 2;
      });
      if (idees && p.grands.has(idees.DOMAINE_BIBLIOTHEQUE[x.domaine])) s += 1.5;
      // Mots communs entre le nom de l'entrée et la région ou ses compétences (« Bricoler » ~ « Bricolage »).
      if (idees) {
        const mots = idees.racines(x.nom);
        const communs = (t) => [...idees.racines(t)].some((m) => mots.has(m));
        if (communs(p.r.nom)) s += 2.5;
        p.comps.forEach((c) => { if (communs(c.nom)) s += 2.5; });
      }
      return s;
    };
    const pris = new Set();
    const retenues = [];
    for (let tour = 0; tour < parRegion; tour++) {
      profils.forEach((p) => {
        const meilleur = libres.filter((x) => !pris.has(x.id)).map((x) => ({ x, s: score(p, x) }))
          .sort((a, b) => b.s - a.s || a.x.nom.localeCompare(b.x.nom, 'fr'))[0];
        if (!meilleur) return;
        pris.add(meilleur.x.id);
        const eloignee = p.comps.some((c) => c.distance === 'eloignee' && c.domaine === meilleur.x.domaine);
        const proche = p.comps.find((c) => meilleur.x.liens.some((l) => correspond(c.nom, l)));
        const comp = versCompetence({ entree: meilleur.x, regionId: p.r.id, regionJonctionId: null, distance: eloignee ? 'eloignee' : 'proche',
          appuis: proche ? [proche.id] : [] });
        comp.exploree = false;
        retenues.push(comp);
      });
    }
    return retenues;
  }

  // Compétence prête à être ajoutée (ou à être montrée en fantôme sur la carte).
  function versCompetence(p, statut, id) {
    return {
      id: id || CT.schema.nouvelId('comp'),
      nom: p.entree.nom,
      icone: p.entree.icone,
      statut: statut || 'a_conquerir',
      regionId: p.regionId,
      regionJonctionId: p.regionJonctionId,
      ileId: null,
      domaine: p.entree.domaine,
      distance: p.distance,
      voisines: p.appuis.slice(0, 3),
      position: null,
      positionManuelle: false,
      priorite: null,
      exploree: true,
      reportConquete: null,
      bibliothequeId: p.entree.id
    };
  }

  /*
   * Ajoute une entrée de la bibliothèque à la carte. Si une position est donnée
   * (celle du fantôme affiché), la compétence la reprend : rien d'autre ne bouge.
   */
  function accepter(carte, entreeId, options) {
    const o = options || {};
    const entree = CT.bibliotheque.trouver(entreeId);
    if (!entree || dejaSurLaCarte(carte, entree)) return null;
    const c = versCompetence(profil(carte, entree), o.statut);
    if (o.position && !carte.competences.some((x) => x.position && x.position.q === o.position.q && x.position.r === o.position.r) &&
        (o.position.q || o.position.r)) {
      c.position = { q: o.position.q, r: o.position.r };
    }
    carte.competences.push(c);
    if (c.statut === 'frontiere') { c.priorite = 99; CT.regles.classerFrontieres(carte); }
    return c;
  }

  function refuser(carte, entreeId) {
    if (!CT.bibliotheque.trouver(entreeId) || carte.suggestionsRefusees.includes(entreeId)) return false;
    carte.suggestionsRefusees.push(entreeId);
    return true;
  }

  function retablirRefusees(carte) {
    const n = carte.suggestionsRefusees.length;
    carte.suggestionsRefusees = [];
    return n;
  }

  CT.suggestions = { pourRegions, disponibles, profil, proposer, versCompetence, accepter, refuser, retablirRefusees, dejaSurLaCarte };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
