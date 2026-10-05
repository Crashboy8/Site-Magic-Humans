/*
 * Suggestions de territoires à conquérir, tirées de la bibliothèque.
 * Une suggestion se rapproche de ce qui existe déjà sur la carte (liens, domaine)
 * et un peu plus de ce qui met dans le flow. Une suggestion refusée ne revient pas.
 */
(function (CT) {
  'use strict';

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
      raison = 'Prolonge ta province ' + (d ? d.nom.toLowerCase() : 'éloignée');
    } else if (appuis.length) {
      raison = 'Proche de ' + appuis.slice(0, 2).map((a) => '« ' + a.c.nom + ' »').join(' et ');
    } else {
      const r = CT.regles.regionDe(carte, regionId);
      raison = r ? 'Dans le prolongement de ' + r.nom : 'Une piste à explorer';
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

  CT.suggestions = { disponibles, profil, proposer, versCompetence, accepter, refuser, retablirRefusees, dejaSurLaCarte };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
