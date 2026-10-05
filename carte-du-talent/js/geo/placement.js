/*
 * Placement automatique des hexagones : transforme une carte (modèle) en géographie.
 *
 * Principes :
 *  - la capitale (le talent) est au centre ; chaque région reçoit un secteur angulaire,
 *    dans un ordre circulaire qui respecte ses régions « voisines » ;
 *  - les compétences sont posées une à une sur la case libre du bord du continent qui
 *    obtient le meilleur score (même région, compacité, bon secteur, voisines, jonctions) ;
 *  - les compétences éloignées forment des provinces par domaine, ancrées du côté de leur région ;
 *  - une passe de réparation comble les trous, puis on pose la zone à déléguer et les îles au large.
 *
 * Fonction pure : aucune dépendance au DOM, résultat déterministe pour une carte donnée.
 */
(function (CT) {
  'use strict';

  const H = CT.hex;
  const ECART_ILES = 3; // distance minimale (en cases) entre une île et toute autre terre : 2 cases d'eau.

  // ---------- Groupes ----------

  function groupeDe(c) {
    if (c.statut === 'ile') return 'i:' + c.ileId;
    if (c.statut === 'a_deleguer') return 'deleguer';
    if (c.distance === 'eloignee' && c.statut !== 'natale') return 'p:' + (c.domaine || 'divers');
    return 'r:' + c.regionId;
  }

  // Région de rattachement d'une compétence sans région : celle qui partage le plus son domaine.
  function regionParDefaut(c, carte) {
    if (!carte.regions.length) return null;
    const compte = {};
    carte.competences.forEach((o) => {
      if (o.regionId && o.domaine && o.domaine === c.domaine) compte[o.regionId] = (compte[o.regionId] || 0) + 1;
    });
    let meilleure = carte.regions[0].id;
    Object.keys(compte).forEach((id) => { if (compte[id] > (compte[meilleure] || 0)) meilleure = id; });
    return meilleure;
  }

  // ---------- Ordre circulaire des régions ----------

  function ordonnerRegions(regions) {
    if (!regions.length) return [];
    const liens = {};
    regions.forEach((r) => { liens[r.id] = new Set(); });
    regions.forEach((r) => r.voisines.forEach((v) => {
      if (liens[v]) { liens[r.id].add(v); liens[v].add(r.id); }
    }));
    // Commence par une extrémité de chaîne s'il y en a une (moins de voisins), sinon par la première.
    let depart = regions[0];
    regions.forEach((r) => { if (liens[r.id].size < liens[depart.id].size) depart = r; });
    const ordre = [depart.id];
    const vus = new Set(ordre);
    while (ordre.length < regions.length) {
      const dernier = ordre[ordre.length - 1];
      const nonVus = (ids) => ids.filter((id) => !vus.has(id));
      let candidats = nonVus([...liens[dernier]]);
      if (!candidats.length) {
        // Pas de voisine libre : la région la plus liée au chemin déjà construit.
        candidats = nonVus(regions.map((r) => r.id))
          .sort((a, b) => [...liens[b]].filter((x) => vus.has(x)).length - [...liens[a]].filter((x) => vus.has(x)).length);
      } else {
        // Préfère la voisine qui a le moins d'autres options, pour suivre la chaîne sans la couper.
        candidats.sort((a, b) => nonVus([...liens[a]]).length - nonVus([...liens[b]]).length);
      }
      ordre.push(candidats[0]);
      vus.add(candidats[0]);
    }
    return ordre;
  }

  // ---------- Placement ----------

  function placer(carte, options) {
    options = options || {};
    const occ = new Map(); // clé -> { id, groupe, zone }
    const cellulesGroupe = new Map(); // groupe -> Set(clés)
    const positions = {};
    const comps = carte.competences.map((c) => Object.assign({}, c, {
      regionId: c.regionId || (c.statut === 'ile' || c.statut === 'a_deleguer' ? null : regionParDefaut(c, carte))
    }));
    const parId = {};
    comps.forEach((c) => { parId[c.id] = c; });

    function occuper(cellule, id, groupe, zone) {
      const k = H.cle(cellule.q, cellule.r);
      occ.set(k, { id, groupe, zone });
      if (!cellulesGroupe.has(groupe)) cellulesGroupe.set(groupe, new Set());
      cellulesGroupe.get(groupe).add(k);
      if (id !== 'capitale') positions[id] = { q: cellule.q, r: cellule.r };
    }

    function liberer(k) {
      const o = occ.get(k);
      if (!o) return;
      occ.delete(k);
      cellulesGroupe.get(o.groupe).delete(k);
    }

    function cellulesDe(groupe) {
      return cellulesGroupe.get(groupe) || new Set();
    }

    // --- Secteurs angulaires des régions ---
    const ordre = ordonnerRegions(carte.regions);
    const poids = {};
    ordre.forEach((id) => { poids[id] = 1; });
    comps.forEach((c) => {
      if (c.statut === 'ile' || c.statut === 'a_deleguer' || c.distance === 'eloignee') return;
      if (poids[c.regionId] !== undefined) poids[c.regionId] += c.regionJonctionId ? 0.6 : 1;
      if (c.regionJonctionId && poids[c.regionJonctionId] !== undefined) poids[c.regionJonctionId] += 0.4;
    });
    const total = ordre.reduce((s, id) => s + poids[id], 0) || 1;
    const angles = {};
    let curseur = -Math.PI / 2 - (poids[ordre[0]] || 0) / total * Math.PI; // première région centrée en haut
    ordre.forEach((id) => {
      const part = poids[id] / total * 2 * Math.PI;
      angles[id] = curseur + part / 2;
      curseur += part;
    });

    function angleCible(c) {
      if (c.regionJonctionId && angles[c.regionJonctionId] !== undefined && angles[c.regionId] !== undefined) {
        return H.moyenneAngles([angles[c.regionId], angles[c.regionId], angles[c.regionJonctionId]]);
      }
      return angles[c.regionId] !== undefined ? angles[c.regionId] : 0;
    }

    // --- Capitale et positions déjà connues ---
    // Par défaut, toute position mémorisée est conservée (carte stable) ; avec
    // { reorganiser: true }, seules les positions déplacées à la main sont gardées.
    occuper({ q: 0, r: 0 }, 'capitale', 'capitale', 'continent');
    comps.forEach((c) => {
      if (!c.position || (options.reorganiser && !c.positionManuelle)) return;
      const k = H.cle(c.position.q, c.position.r);
      if (occ.has(k)) return;
      const zone = c.statut === 'ile' ? 'ile' : c.statut === 'a_deleguer' ? 'deleguer' : 'continent';
      occuper(c.position, c.id, groupeDe(c), zone);
    });
    const aPlacer = (c) => !positions[c.id];

    // --- Mesures d'une case candidate ---
    function mesurer(cellule, c, groupe, autorises) {
      let nMeme = 0; let nJonc = 0; let nOcc = 0; let nAutres = 0; let nVois = 0; let nCapitale = 0;
      const groupeJonc = c.regionJonctionId ? 'r:' + c.regionJonctionId : null;
      H.voisins(cellule.q, cellule.r).forEach((v) => {
        const o = occ.get(H.cle(v.q, v.r));
        if (!o || o.zone !== 'continent') return;
        nOcc++;
        if (o.groupe === groupe) nMeme++;
        else if (o.groupe === groupeJonc) nJonc++;
        else if (o.groupe === 'capitale') nCapitale++;
        else if (!autorises || !autorises.has(o.groupe)) nAutres++;
        if (c.voisines.includes(o.id)) nVois++;
      });
      return {
        nMeme, nJonc, nOcc, nAutres, nVois, nCapitale,
        rayon: H.distance(cellule, { q: 0, r: 0 }),
        dAngle: H.ecartAngle(H.angle(cellule.q, cellule.r), c._angle)
      };
    }

    // Cases libres touchant le continent, dans un ordre stable.
    function bordContinent() {
      const vues = new Set();
      const res = [];
      occ.forEach((o, k) => {
        if (o.zone !== 'continent') return;
        const p = H.depuisCle(k);
        H.voisins(p.q, p.r).forEach((v) => {
          const kv = H.cle(v.q, v.r);
          if (!occ.has(kv) && !vues.has(kv)) { vues.add(kv); res.push(v); }
        });
      });
      return res;
    }

    function poser(c, groupe, scoreFn, exigeMeme, autorises) {
      const groupeVide = cellulesDe(groupe).size === 0;
      let meilleur = null;
      let meilleurScore = -Infinity;
      const essayer = (strict) => {
        bordContinent().forEach((cel) => {
          const m = mesurer(cel, c, groupe, autorises);
          if (strict && exigeMeme && !groupeVide && m.nMeme === 0) return;
          const s = scoreFn(m, groupeVide);
          if (s > meilleurScore) { meilleurScore = s; meilleur = cel; }
        });
      };
      essayer(true);
      if (!meilleur) essayer(false);
      occuper(meilleur, c.id, groupe, 'continent');
    }

    // Score commun aux compétences rattachées à une région.
    function scoreRegion(c, profil) {
      const jonction = Boolean(c.regionJonctionId);
      return (m, vide) => {
        if (vide) return -7 * m.dAngle - 3 * m.rayon + 2 * m.nOcc + 3 * m.nCapitale;
        let s = profil.meme * m.nMeme + profil.occ * m.nOcc - profil.autres * m.nAutres
          - profil.angle * m.dAngle + profil.rayon * m.rayon + profil.vois * m.nVois;
        if (jonction) s += 4 * m.nJonc + (m.nMeme > 0 && m.nJonc > 0 ? 14 : 0);
        return s;
      };
    }

    const PROFILS = {
      natale: { meme: 10, occ: 3, autres: 2, angle: 7, rayon: -3, vois: 4 },
      conquise: { meme: 8, occ: 3, autres: 4, angle: 6, rayon: -1, vois: 5 },
      frontiere: { meme: 7, occ: 2.5, autres: 4, angle: 6, rayon: 2, vois: 5 },
      a_conquerir: { meme: 6, occ: 2, autres: 3, angle: 5, rayon: 3, vois: 6 }
    };

    function poserRegion(c) {
      c._angle = angleCible(c);
      poser(c, groupeDe(c), scoreRegion(c, PROFILS[c.statut] || PROFILS.conquise), true);
    }

    // Round-robin par région pour que les régions grandissent ensemble.
    function tourParRegion(liste) {
      const files = {};
      ordre.forEach((id) => { files[id] = []; });
      const sansRegion = [];
      liste.forEach((c) => { (files[c.regionId] || sansRegion).push(c); });
      // Les jonctions passent après les autres, quand les deux régions existent déjà.
      Object.values(files).forEach((f) => f.sort((a, b) => (a.regionJonctionId ? 1 : 0) - (b.regionJonctionId ? 1 : 0)));
      let reste = true;
      while (reste) {
        reste = false;
        ordre.forEach((id) => {
          const c = files[id].shift();
          if (c) { poserRegion(c); reste = true; }
        });
      }
      sansRegion.forEach((c) => { c._angle = 0; poser(c, groupeDe(c), scoreRegion(c, PROFILS.conquise), true); });
    }

    const surContinent = (c) => c.statut !== 'ile' && c.statut !== 'a_deleguer';
    const estProvince = (c) => surContinent(c) && c.statut !== 'natale' && c.distance === 'eloignee';
    const libres = comps.filter(aPlacer);

    // 1. Cœur : territoire natal.
    tourParRegion(libres.filter((c) => c.statut === 'natale'));
    // 2. Conquêtes proches, collées à leur région.
    tourParRegion(libres.filter((c) => c.statut === 'conquise' && !estProvince(c)));

    // 3. Provinces éloignées, regroupées par domaine et ancrées du côté de leur région.
    const provinces = {};
    libres.filter((c) => estProvince(c) && c.statut === 'conquise').forEach((c) => {
      const g = groupeDe(c);
      (provinces[g] = provinces[g] || []).push(c);
    });
    const ancres = {};
    Object.keys(provinces).forEach((g) => {
      const compte = {};
      provinces[g].forEach((c) => { compte[c.regionId] = (compte[c.regionId] || 0) + 1; });
      ancres[g] = Object.keys(compte).sort((a, b) => compte[b] - compte[a])[0] || null;
    });
    // Plusieurs provinces sur la même région : on les écarte un peu de part et d'autre.
    const parAncre = {};
    Object.keys(provinces).forEach((g) => { (parAncre[ancres[g]] = parAncre[ancres[g]] || []).push(g); });
    const anglesProvince = {};
    Object.keys(parAncre).forEach((a) => {
      const gs = parAncre[a];
      const base = angles[a] !== undefined ? angles[a] : 0;
      gs.forEach((g, i) => { anglesProvince[g] = base + (i - (gs.length - 1) / 2) * 0.55; });
    });

    function poserProvince(c, g, ancre) {
      c._angle = anglesProvince[g] !== undefined ? anglesProvince[g] : (angles[c.regionId] || 0);
      const autorises = new Set(ancre ? ['r:' + ancre] : []);
      const nAncre = (cel) => H.voisins(cel.q, cel.r).filter((v) => {
        const o = occ.get(H.cle(v.q, v.r));
        return o && ancre && o.groupe === 'r:' + ancre;
      }).length;
      const exterieur = c.statut === 'conquise' ? 0 : 2;
      let meilleur = null;
      let meilleurScore = -Infinity;
      const vide = cellulesDe(g).size === 0;
      bordContinent().forEach((cel) => {
        const m = mesurer(cel, c, g, autorises);
        if (!vide && m.nMeme === 0) return;
        const s = vide
          ? 8 * Math.min(1, nAncre(cel)) + 2 * m.nOcc + 2 * m.rayon - 7 * m.dAngle - 3 * m.nAutres
          : 10 * m.nMeme + 3 * m.nOcc - 3 * m.dAngle - 3 * m.nAutres + 5 * m.nVois + nAncre(cel) + exterieur * m.rayon;
        if (s > meilleurScore) { meilleurScore = s; meilleur = cel; }
      });
      if (!meilleur) { poser(c, g, () => 0, false); return; }
      occuper(meilleur, c.id, g, 'continent');
    }

    Object.keys(provinces).forEach((g) => provinces[g].forEach((c) => poserProvince(c, g, ancres[g])));

    // 4. Frontières puis 5. territoires à conquérir, en périphérie.
    ['frontiere', 'a_conquerir'].forEach((statut) => {
      const lot = libres.filter((c) => c.statut === statut && aPlacer(c));
      lot.filter(estProvince).forEach((c) => {
        const g = groupeDe(c);
        if (!(g in ancres)) ancres[g] = c.regionId;
        poserProvince(c, g, ancres[g]);
      });
      tourParRegion(lot.filter((c) => !estProvince(c)));
    });

    // 6. Réparation : aucun trou dans le continent.
    reparerTrous();

    // 7. Zone à déléguer dans un coin, puis 8. îles au large.
    const deleguees = comps.filter((c) => c.statut === 'a_deleguer' && aPlacer(c));
    let angleDeleguer = null;
    if (deleguees.length || cellulesDe('deleguer').size) {
      const coins = [Math.PI / 4, -Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4]; // bas-droite d'abord
      angleDeleguer = coins.reduce((best, a) => (etendue(a) < etendue(best) - 0.5 ? a : best), coins[0]);
      poserArchipel(deleguees, 'deleguer', 'deleguer', angleDeleguer);
    }

    const anglesPris = angleDeleguer === null ? [] : [angleDeleguer];
    carte.iles.forEach((ile) => {
      const membres = comps.filter((c) => c.statut === 'ile' && c.ileId === ile.id && aPlacer(c));
      if (!membres.length) return;
      let meilleur = 0;
      let meilleurCout = Infinity;
      for (let i = 0; i < 24; i++) {
        const a = -Math.PI + i * Math.PI / 12;
        let cout = etendue(a);
        anglesPris.forEach((p) => { if (H.ecartAngle(a, p) < Math.PI / 3) cout += 6; });
        if (cout < meilleurCout) { meilleurCout = cout; meilleur = a; }
      }
      anglesPris.push(meilleur);
      poserArchipel(membres, 'i:' + ile.id, 'ile', meilleur);
    });

    // --- Outils des étapes 6 à 8 ---

    // Rayon maximal des terres dans un cône autour d'un angle.
    function etendue(a) {
      let max = 0;
      occ.forEach((o, k) => {
        const p = H.depuisCle(k);
        if ((p.q || p.r) && H.ecartAngle(H.angle(p.q, p.r), a) < Math.PI / 5) {
          max = Math.max(max, H.distance(p, { q: 0, r: 0 }));
        }
      });
      return max;
    }

    function distanceAuxAutres(cel, groupe) {
      let min = Infinity;
      occ.forEach((o, k) => {
        if (o.groupe === groupe) return;
        min = Math.min(min, H.distance(cel, H.depuisCle(k)));
      });
      return min;
    }

    // Petit groupe de terres séparé de tout le reste par de l'eau.
    function poserArchipel(membres, groupe, zone, a) {
      if (!membres.length) return;
      let graine = null;
      if (cellulesDe(groupe).size === 0) {
        for (let d = 2; d < 60 && !graine; d += 0.5) {
          const cel = H.depuisPixel(Math.cos(a) * d * Math.sqrt(3), Math.sin(a) * d * Math.sqrt(3), 1);
          if (!occ.has(H.cle(cel.q, cel.r)) && distanceAuxAutres(cel, groupe) >= ECART_ILES) graine = cel;
        }
        occuper(graine, membres[0].id, groupe, zone);
        membres = membres.slice(1);
      } else {
        graine = H.depuisCle([...cellulesDe(groupe)][0]);
      }
      membres.forEach((c) => {
        let meilleur = null;
        let meilleurScore = -Infinity;
        cellulesDe(groupe).forEach((k) => {
          const p = H.depuisCle(k);
          H.voisins(p.q, p.r).forEach((v) => {
            if (occ.has(H.cle(v.q, v.r)) || distanceAuxAutres(v, groupe) < ECART_ILES) return;
            const nMeme = H.voisins(v.q, v.r).filter((w) => cellulesDe(groupe).has(H.cle(w.q, w.r))).length;
            const s = 4 * nMeme - H.distance(v, graine) + 0.01 * H.ecartAngle(H.angle(v.q, v.r), a);
            if (s > meilleurScore) { meilleurScore = s; meilleur = v; }
          });
        });
        if (meilleur) occuper(meilleur, c.id, groupe, zone);
      });
    }

    // Cases vides du continent qu'on ne peut pas rejoindre par la mer.
    function trouverTrous() {
      let rayonMax = 0;
      occ.forEach((o, k) => {
        if (o.zone === 'continent') rayonMax = Math.max(rayonMax, H.distance(H.depuisCle(k), { q: 0, r: 0 }));
      });
      const limite = rayonMax + 1;
      const mer = new Set();
      const file = H.anneau({ q: 0, r: 0 }, limite).filter((c) => !occ.has(H.cle(c.q, c.r)));
      file.forEach((c) => mer.add(H.cle(c.q, c.r)));
      while (file.length) {
        const c = file.pop();
        H.voisins(c.q, c.r).forEach((v) => {
          const k = H.cle(v.q, v.r);
          if (mer.has(k) || occ.has(k) || H.distance(v, { q: 0, r: 0 }) > limite) return;
          mer.add(k);
          file.push(v);
        });
      }
      const trous = [];
      for (let rr = 1; rr <= rayonMax; rr++) {
        H.anneau({ q: 0, r: 0 }, rr).forEach((c) => {
          const k = H.cle(c.q, c.r);
          if (!occ.has(k) && !mer.has(k)) trous.push(c);
        });
      }
      return trous;
    }

    function groupeConnexe(groupe) {
      const cells = [...cellulesDe(groupe)];
      if (cells.length <= 1) return true;
      const vus = new Set([cells[0]]);
      const file = [cells[0]];
      while (file.length) {
        const p = H.depuisCle(file.pop());
        H.voisins(p.q, p.r).forEach((v) => {
          const k = H.cle(v.q, v.r);
          if (!vus.has(k) && cellulesDe(groupe).has(k)) { vus.add(k); file.push(k); }
        });
      }
      return vus.size === cells.length;
    }

    // Comble chaque trou en y déplaçant la case la plus exposée d'un groupe qui le borde.
    function reparerTrous() {
      const ORDRE_STATUT = { a_conquerir: 4, frontiere: 3, conquise: 2, natale: 0 };
      for (let essai = 0; essai < 30; essai++) {
        const trous = trouverTrous();
        if (!trous.length) return;
        const trou = trous[0];
        const kTrou = H.cle(trou.q, trou.r);
        const groupesBord = new Set();
        H.voisins(trou.q, trou.r).forEach((v) => {
          const o = occ.get(H.cle(v.q, v.r));
          if (o && o.zone === 'continent' && o.groupe !== 'capitale') groupesBord.add(o.groupe);
        });
        let meilleur = null;
        let meilleurScore = -Infinity;
        occ.forEach((o, k) => {
          if (!groupesBord.has(o.groupe) || k === kTrou) return;
          const c = parId[o.id];
          // figerExistants : seules les compétences encore sans position peuvent combler un trou.
          if (!c || c.positionManuelle || (options.figerExistants && c.position)) return;
          const p = H.depuisCle(k);
          const vides = H.voisins(p.q, p.r).filter((v) => !occ.has(H.cle(v.q, v.r))).length;
          const s = 3 * vides + (ORDRE_STATUT[c.statut] || 0) + H.distance(p, { q: 0, r: 0 }) * 0.5;
          if (s <= meilleurScore) return;
          // Simule le déplacement : le groupe doit rester d'un seul tenant.
          liberer(k);
          occuper(trou, o.id, o.groupe, o.zone);
          const ok = groupeConnexe(o.groupe);
          liberer(kTrou);
          occuper(p, o.id, o.groupe, o.zone);
          if (ok) { meilleurScore = s; meilleur = k; }
        });
        if (!meilleur) return;
        const o = occ.get(meilleur);
        liberer(meilleur);
        occuper(trou, o.id, o.groupe, o.zone);
      }
    }

    // --- Résultat ---
    const cases = [];
    occ.forEach((o, k) => {
      const p = H.depuisCle(k);
      cases.push({ q: p.q, r: p.r, id: o.id, groupe: o.groupe, zone: o.zone });
    });

    return {
      positions,
      cases,
      ordreRegions: ordre,
      anglesRegions: angles,
      ancresProvinces: ancres,
      etiquettes: calculerEtiquettes(carte, cellulesGroupe)
    };
  }

  // Centre (en unités pixel, taille 1) de chaque groupe nommé, pour y poser son nom.
  function calculerEtiquettes(carte, cellulesGroupe) {
    const res = [];
    cellulesGroupe.forEach((cells, groupe) => {
      if (!cells.size || groupe === 'capitale') return;
      let x = 0; let y = 0; let yMax = -Infinity;
      cells.forEach((k) => {
        const p = H.depuisCle(k);
        const px = H.versPixel(p.q, p.r, 1);
        x += px.x; y += px.y; yMax = Math.max(yMax, px.y);
      });
      x /= cells.size; y /= cells.size;
      const [type, id] = groupe.includes(':') ? groupe.split(':') : [groupe, groupe];
      let nom = '';
      if (type === 'r') { const r = carte.regions.find((x2) => x2.id === id); nom = r ? r.nom : ''; }
      if (type === 'p') nom = CT.schema.DOMAINES[id] ? CT.schema.DOMAINES[id].nom : 'Province';
      if (type === 'i') { const i = carte.iles.find((x2) => x2.id === id); nom = i ? i.nom : 'Île'; }
      if (type === 'deleguer') nom = 'Zone à déléguer';
      res.push({ type: { r: 'region', p: 'province', i: 'ile', deleguer: 'deleguer' }[type], id, nom, x, y, yMax, taille: cells.size });
    });
    return res;
  }

  // ---------- Vérifications (tests et contrôle visuel) ----------

  function verifier(resultat) {
    const problemes = [];
    const parCle = new Map(resultat.cases.map((c) => [H.cle(c.q, c.r), c]));
    const groupes = {};
    resultat.cases.forEach((c) => { (groupes[c.groupe] = groupes[c.groupe] || []).push(c); });

    Object.keys(groupes).forEach((g) => {
      const cells = groupes[g];
      const vus = new Set([H.cle(cells[0].q, cells[0].r)]);
      const file = [cells[0]];
      while (file.length) {
        const c = file.pop();
        H.voisins(c.q, c.r).forEach((v) => {
          const k = H.cle(v.q, v.r);
          const o = parCle.get(k);
          if (o && o.groupe === g && !vus.has(k)) { vus.add(k); file.push(o); }
        });
      }
      if (vus.size !== cells.length) problemes.push('Groupe coupé en morceaux : ' + g);
    });

    // Trous : cases vides du continent entourées de terre.
    const continent = resultat.cases.filter((c) => c.zone === 'continent');
    const rayonMax = Math.max(...continent.map((c) => H.distance(c, { q: 0, r: 0 })));
    const mer = new Set();
    const file = H.anneau({ q: 0, r: 0 }, rayonMax + 1).filter((c) => !parCle.has(H.cle(c.q, c.r)));
    file.forEach((c) => mer.add(H.cle(c.q, c.r)));
    while (file.length) {
      const c = file.pop();
      H.voisins(c.q, c.r).forEach((v) => {
        const k = H.cle(v.q, v.r);
        if (mer.has(k) || parCle.has(k) || H.distance(v, { q: 0, r: 0 }) > rayonMax + 1) return;
        mer.add(k); file.push(v);
      });
    }
    for (let rr = 1; rr <= rayonMax; rr++) {
      H.anneau({ q: 0, r: 0 }, rr).forEach((c) => {
        const k = H.cle(c.q, c.r);
        if (!parCle.has(k) && !mer.has(k)) problemes.push('Trou dans le continent en ' + k);
      });
    }

    // Continent d'un seul tenant, îles et zone à déléguer séparées par l'eau.
    const autres = resultat.cases.filter((c) => c.zone !== 'continent');
    autres.forEach((a) => {
      resultat.cases.forEach((b) => {
        if (b.groupe !== a.groupe && H.distance(a, b) < 2) problemes.push('Terre collée à ' + a.groupe + ' en ' + H.cle(a.q, a.r));
      });
    });
    const vusC = new Set();
    const fileC = [continent[0]];
    vusC.add(H.cle(continent[0].q, continent[0].r));
    while (fileC.length) {
      const c = fileC.pop();
      H.voisins(c.q, c.r).forEach((v) => {
        const k = H.cle(v.q, v.r);
        const o = parCle.get(k);
        if (o && o.zone === 'continent' && !vusC.has(k)) { vusC.add(k); fileC.push(o); }
      });
    }
    if (vusC.size !== continent.length) problemes.push('Continent en plusieurs morceaux');

    // Cases du continent qui ne tiennent que par un seul côté (excroissances).
    continent.forEach((c) => {
      const n = H.voisins(c.q, c.r).filter((v) => {
        const o = parCle.get(H.cle(v.q, v.r));
        return o && o.zone === 'continent';
      }).length;
      if (n <= 1) problemes.push('Case isolée en ' + H.cle(c.q, c.r));
    });

    return problemes;
  }

  CT.placement = { placer, verifier, ordonnerRegions, groupeDe };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
