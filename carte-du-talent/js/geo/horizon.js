/*
 * Terres à découvrir : les compétences de la bibliothèque qui ne sont pas encore sur la carte,
 * disposées en couronne au large, au-delà de toutes les terres (îles et zones comprises),
 * par secteurs de domaine. Le secteur d'un domaine se place du côté où ce domaine existe déjà sur la carte.
 *
 * Fonction pure et déterministe : elle lit la carte et le résultat du placement, ne modifie rien.
 * Les cases de l'horizon ne font jamais partie du placement (CT.placement.verifier ne les voit pas).
 */
(function (CT) {
  'use strict';

  const H = CT.hex;
  const ECART = 3; // la première couronne laisse 2 cases d'eau entre l'horizon et la terre la plus au large
  const ANNEAUX_MAX = 14;

  const tour = (a) => { let x = a % (2 * Math.PI); if (x <= -Math.PI) x += 2 * Math.PI; if (x > Math.PI) x -= 2 * Math.PI; return x; };

  /*
   * disposer(carte, placement) → { tuiles: [{ id: 'hor:<id>', entreeId, domaine, q, r, anneau }], etiquettes: [{ domaine, nom, q, r }], debut }
   * options.max : nombre maximal de tuiles (400 par défaut).
   */
  function disposer(carte, placement, options) {
    const o = options || {};
    const max = o.max || 400;
    const entrees = CT.suggestions.disponibles(carte).slice();
    if (!entrees.length) return { tuiles: [], etiquettes: [], debut: 0 };

    // Rayon de la terre la plus au large.
    let rayon = 0;
    placement.cases.forEach((c) => { rayon = Math.max(rayon, H.distance(c, { q: 0, r: 0 })); });
    const debut = rayon + ECART;

    // Entrées par domaine, les plus proches de la carte d'abord (elles prennent la couronne intérieure).
    const scores = new Map(entrees.map((x) => [x.id, CT.suggestions.profil(carte, x).score]));
    const parDomaine = {};
    entrees.forEach((x) => { (parDomaine[x.domaine] = parDomaine[x.domaine] || []).push(x); });
    const domaines = Object.keys(CT.schema.DOMAINES).filter((d) => parDomaine[d]);
    domaines.forEach((d) => parDomaine[d].sort((a, b) => scores.get(b.id) - scores.get(a.id) || a.nom.localeCompare(b.nom, 'fr')));

    // Angle souhaité : là où le domaine est déjà présent sur le continent ; sinon réparti régulièrement.
    const parId = {};
    carte.competences.forEach((c) => { parId[c.id] = c; });
    const souhait = {};
    domaines.forEach((d, i) => {
      const angles = placement.cases.filter((cs) => cs.zone === 'continent' && parId[cs.id] && parId[cs.id].domaine === d && (cs.q || cs.r))
        .map((cs) => H.angle(cs.q, cs.r));
      souhait[d] = angles.length ? H.moyenneAngles(angles) : -Math.PI / 2 + i * 2 * Math.PI / domaines.length;
    });
    domaines.sort((a, b) => tour(souhait[a]) - tour(souhait[b]) || a.localeCompare(b));

    // Secteurs contigus, larges selon le nombre d'entrées ; le premier est centré sur son angle souhaité.
    const total = domaines.reduce((s, d) => s + parDomaine[d].length, 0);
    const secteurs = {};
    let curseur = souhait[domaines[0]] - Math.PI * parDomaine[domaines[0]].length / total;
    domaines.forEach((d) => {
      const largeur = 2 * Math.PI * parDomaine[d].length / total;
      secteurs[d] = { debut: curseur, fin: curseur + largeur, centre: curseur + largeur / 2 };
      curseur += largeur;
    });
    const domaineDe = (a) => {
      const base = secteurs[domaines[0]].debut;
      const rel = ((a - base) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      return domaines.find((d) => rel < secteurs[d].fin - base) || domaines[domaines.length - 1];
    };

    // Remplissage couronne par couronne, chaque domaine dans son secteur, du centre du secteur vers ses bords.
    const restes = {};
    domaines.forEach((d) => { restes[d] = parDomaine[d].slice(); });
    const tuiles = [];
    const derniere = {};
    for (let a = 0; a < ANNEAUX_MAX && tuiles.length < max && domaines.some((d) => restes[d].length); a++) {
      const parSecteur = {};
      H.anneau({ q: 0, r: 0 }, debut + a).forEach((cel) => {
        const d = domaineDe(H.angle(cel.q, cel.r));
        (parSecteur[d] = parSecteur[d] || []).push(cel);
      });
      domaines.forEach((d) => {
        const cellules = (parSecteur[d] || []).sort((x, y) =>
          H.ecartAngle(H.angle(x.q, x.r), secteurs[d].centre) - H.ecartAngle(H.angle(y.q, y.r), secteurs[d].centre) || x.q - y.q || x.r - y.r);
        cellules.forEach((cel) => {
          if (!restes[d].length || tuiles.length >= max) return;
          const x = restes[d].shift();
          tuiles.push({ id: 'hor:' + x.id, entreeId: x.id, domaine: d, q: cel.q, r: cel.r, anneau: a });
          derniere[d] = a;
        });
      });
    }

    // Nom de chaque domaine, juste au-delà de sa dernière couronne, au centre de son secteur.
    const etiquettes = domaines.filter((d) => derniere[d] !== undefined).map((d) => {
      const dist = (debut + derniere[d] + 1.6) * Math.sqrt(3);
      const cel = H.depuisPixel(Math.cos(secteurs[d].centre) * dist, Math.sin(secteurs[d].centre) * dist, 1);
      return { domaine: d, nom: CT.schema.DOMAINES[d].nom, q: cel.q, r: cel.r };
    });

    return { tuiles, etiquettes, debut };
  }

  CT.horizon = { disposer, ECART };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
