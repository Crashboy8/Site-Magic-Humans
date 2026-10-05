/*
 * Navigation dans la carte : zoom (molette, pincement, boutons), déplacement (glisser),
 * sélection d'un hexagone (clic, toucher, clavier) et glisser-déposer après un appui long.
 *
 * Le module ne connaît pas le modèle : il prévient l'application via des rappels.
 */
(function (CT) {
  'use strict';

  const H = CT.hex;
  const T = CT.vueCarte.T;
  const APPUI_LONG = 380; // ms avant de « soulever » un hexagone
  const SEUIL_MOUVEMENT = 7; // px avant de considérer qu'on fait glisser la carte
  const RAYON_ENSEMBLE = 30; // en dessous (px à l'écran), vue d'ensemble : noms des régions

  function creer(svg, rappels) {
    let cadre = null; // étendue des terres (unités SVG)
    let vue = null; // viewBox courante { x, y, l, h }
    let selection = null;
    const pointeurs = new Map();
    let geste = null;
    let minuteur = null;

    // ---------- Vue ----------

    function taille() {
      const r = svg.getBoundingClientRect();
      return { l: Math.max(1, r.width), h: Math.max(1, r.height), gauche: r.left, haut: r.top };
    }

    function echelle() {
      return taille().l / vue.l; // pixels écran par unité SVG
    }

    // Adapte la vue aux proportions de l'élément, autour d'un centre.
    function proportionner(cx, cy, largeur) {
      const t = taille();
      vue = { l: largeur, h: largeur * t.h / t.l };
      vue.x = cx - vue.l / 2;
      vue.y = cy - vue.h / 2;
    }

    function largeurPourCadre(c, marges) {
      const t = taille();
      const dispoL = Math.max(1, t.l - (marges ? marges.gauche + marges.droite : 0));
      const dispoH = Math.max(1, t.h - (marges ? marges.haut + marges.bas : 0));
      const ech = Math.min(dispoL / c.l, dispoH / c.h);
      return t.l / ech;
    }

    function limites() {
      const max = largeurPourCadre(cadre) * 1.8;
      const min = T * 5; // environ trois hexagones de large
      return { min, max: Math.max(max, min * 2) };
    }

    function contraindre() {
      const lim = limites();
      if (vue.l > lim.max || vue.l < lim.min) {
        const cx = vue.x + vue.l / 2;
        const cy = vue.y + vue.h / 2;
        proportionner(cx, cy, Math.min(lim.max, Math.max(lim.min, vue.l)));
      }
      // Le centre de la vue reste au-dessus des terres : on ne perd jamais la carte.
      const cx = Math.min(cadre.x + cadre.l, Math.max(cadre.x, vue.x + vue.l / 2));
      const cy = Math.min(cadre.y + cadre.h, Math.max(cadre.y, vue.y + vue.h / 2));
      vue.x = cx - vue.l / 2;
      vue.y = cy - vue.h / 2;
    }

    function appliquer() {
      contraindre();
      svg.setAttribute('viewBox', [vue.x, vue.y, vue.l, vue.h].map((v) => v.toFixed(2)).join(' '));
      const e = echelle();
      svg.classList.toggle('vue-ensemble', T * e < RAYON_ENSEMBLE);
      // Les noms de zones gardent une taille lisible à l'écran, quel que soit le zoom.
      const zones = svg.querySelector('.etiquettes-zones');
      const mer = svg.querySelector('.etiquettes-mer');
      if (zones) zones.style.fontSize = Math.min(60, Math.max(16, 12 / e)).toFixed(1) + 'px';
      if (mer) mer.style.fontSize = Math.min(48, Math.max(15, 12 / e)).toFixed(1) + 'px';
    }

    function ajuster(marges) {
      const largeur = largeurPourCadre(cadre, marges);
      const t = taille();
      const ech = t.l / largeur;
      // Décale le centre pour compenser des marges asymétriques (panneau ouvert, etc.).
      const dx = marges ? (marges.droite - marges.gauche) / 2 / ech : 0;
      const dy = marges ? (marges.bas - marges.haut) / 2 / ech : 0;
      proportionner(cadre.x + cadre.l / 2 + dx, cadre.y + cadre.h / 2 + dy, largeur);
      appliquer();
    }

    function versSvg(clientX, clientY) {
      const t = taille();
      const e = t.l / vue.l;
      return { x: vue.x + (clientX - t.gauche) / e, y: vue.y + (clientY - t.haut) / e };
    }

    function zoomer(facteur, clientX, clientY) {
      const t = taille();
      const cx = clientX === undefined ? t.gauche + t.l / 2 : clientX;
      const cy = clientY === undefined ? t.haut + t.h / 2 : clientY;
      const p = versSvg(cx, cy);
      const lim = limites();
      const largeur = Math.min(lim.max, Math.max(lim.min, vue.l / facteur));
      const f = vue.l / largeur;
      vue = { x: p.x - (p.x - vue.x) / f, y: p.y - (p.y - vue.y) / f, l: largeur, h: vue.h / f };
      appliquer();
    }

    // Recentre en douceur si un hexagone est caché (par ex. sous le panneau latéral).
    function rendreVisible(id, zoneLibre) {
      const g = tuile(id);
      if (!g) return;
      const box = g.getBoundingClientRect();
      const t = taille();
      const z = zoneLibre || { gauche: 0, haut: 0, droite: t.l, bas: t.h };
      const cx = box.left - t.gauche + box.width / 2;
      const cy = box.top - t.haut + box.height / 2;
      const marge = 40;
      let dx = 0;
      let dy = 0;
      if (cx < z.gauche + marge) dx = cx - (z.gauche + z.droite) / 2;
      if (cx > z.droite - marge) dx = cx - (z.gauche + z.droite) / 2;
      if (cy < z.haut + marge) dy = cy - (z.haut + z.bas) / 2;
      if (cy > z.bas - marge) dy = cy - (z.haut + z.bas) / 2;
      if (!dx && !dy) return;
      const e = echelle();
      vue.x += dx / e;
      vue.y += dy / e;
      appliquer();
    }

    // ---------- Sélection ----------

    function tuile(id) {
      return id ? svg.querySelector('.tuile[data-id="' + CSS.escape(id) + '"]') : null;
    }

    function dessinerSelection() {
      const calque = svg.querySelector('.calque-interaction');
      if (!calque) return;
      calque.querySelectorAll('.anneau-selection').forEach((n) => n.remove());
      const g = tuile(selection);
      if (!g) return;
      const p = centreTuile(selection);
      if (!p) return;
      calque.insertAdjacentHTML('afterbegin',
        '<polygon class="anneau-selection" points="' + CT.vueCarte.polygone(p.x, p.y, T * 1.02) + '"/>');
    }

    function centreTuile(id) {
      const cs = rappels.caseDe(id);
      return cs ? H.versPixel(cs.q, cs.r, T) : null;
    }

    function selectionner(id) {
      selection = id;
      dessinerSelection();
    }

    // ---------- Glisser-déposer d'un hexagone ----------

    function soulever() {
      const g = tuile(geste.tuileId);
      if (!g) return;
      const origine = centreTuile(geste.tuileId);
      geste.type = 'deplacement';
      geste.element = g;
      geste.origine = origine;
      geste.parentInitial = g.parentNode;
      geste.suivantInitial = g.nextSibling;
      const calque = svg.querySelector('.calque-interaction');
      calque.insertAdjacentHTML('beforeend',
        '<polygon class="case-origine" points="' + CT.vueCarte.polygone(origine.x, origine.y, T * 0.94) + '"/>' +
        '<polygon class="case-cible" points=""/>');
      calque.appendChild(g); // au-dessus de tout le reste
      g.classList.add('souleve');
      svg.classList.add('deplacement-en-cours');
      if (navigator.vibrate) navigator.vibrate(12);
      suivreDeplacement(geste.dernier.x, geste.dernier.y);
    }

    function suivreDeplacement(clientX, clientY) {
      const p = versSvg(clientX, clientY);
      const dx = p.x - geste.pointDepart.x;
      const dy = p.y - geste.pointDepart.y;
      geste.element.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' ' + (dy - 10).toFixed(1) + ')');
      const cel = H.depuisPixel(geste.origine.x + dx, geste.origine.y + dy, T);
      geste.cible = cel;
      const verdict = rappels.verdictDepot(geste.tuileId, cel);
      const poly = svg.querySelector('.case-cible');
      const c = H.versPixel(cel.q, cel.r, T);
      poly.setAttribute('points', CT.vueCarte.polygone(c.x, c.y, T * 0.94));
      poly.setAttribute('class', 'case-cible ' + (verdict || ''));
    }

    function terminerDeplacement(annule) {
      const g = geste.element;
      svg.classList.remove('deplacement-en-cours');
      svg.querySelectorAll('.case-cible, .case-origine').forEach((n) => n.remove());
      g.classList.remove('souleve');
      g.removeAttribute('transform');
      geste.parentInitial.insertBefore(g, geste.suivantInitial);
      if (!annule && geste.cible) rappels.deposer(geste.tuileId, geste.cible);
    }

    // ---------- Pointeurs ----------

    function annulerMinuteur() {
      clearTimeout(minuteur);
      minuteur = null;
    }

    function debutPincement() {
      const [a, b] = [...pointeurs.values()];
      geste = {
        type: 'pincement',
        distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        vue: Object.assign({}, vue),
        centre: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      };
    }

    function surAppui(e) {
      if (e.button !== undefined && e.button > 0) return;
      svg.setPointerCapture(e.pointerId);
      pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointeurs.size === 2) {
        annulerMinuteur();
        if (geste && geste.type === 'deplacement') terminerDeplacement(true);
        debutPincement();
        return;
      }
      if (pointeurs.size > 2) return;
      const g = e.target.closest ? e.target.closest('.tuile') : null;
      const id = g ? g.getAttribute('data-id') : null;
      geste = {
        type: 'attente',
        tuileId: id,
        depart: { x: e.clientX, y: e.clientY },
        dernier: { x: e.clientX, y: e.clientY },
        pointDepart: versSvg(e.clientX, e.clientY)
      };
      if (id && rappels.estDeplacable(id)) {
        minuteur = setTimeout(() => { if (geste && geste.type === 'attente') soulever(); }, APPUI_LONG);
      }
    }

    function surMouvement(e) {
      if (!pointeurs.has(e.pointerId) || !geste) return;
      const precedent = pointeurs.get(e.pointerId);
      pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (geste.type === 'pincement' && pointeurs.size >= 2) {
        const [a, b] = [...pointeurs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const centre = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const t = taille();
        const lim = limites();
        const largeur = Math.min(lim.max, Math.max(lim.min, geste.vue.l * geste.distance / d));
        // Le point de la carte sous le centre initial des doigts suit leur centre actuel.
        const e0 = t.l / geste.vue.l;
        const ancre = { x: geste.vue.x + (geste.centre.x - t.gauche) / e0, y: geste.vue.y + (geste.centre.y - t.haut) / e0 };
        const e1 = t.l / largeur;
        vue = { l: largeur, h: largeur * t.h / t.l, x: ancre.x - (centre.x - t.gauche) / e1, y: ancre.y - (centre.y - t.haut) / e1 };
        appliquer();
        return;
      }

      geste.dernier = { x: e.clientX, y: e.clientY };
      if (geste.type === 'attente') {
        if (Math.hypot(e.clientX - geste.depart.x, e.clientY - geste.depart.y) < SEUIL_MOUVEMENT) return;
        annulerMinuteur();
        geste.type = 'deplacer-vue';
        svg.classList.add('glisse');
      }
      if (geste.type === 'deplacer-vue') {
        const ech = echelle();
        vue.x -= (e.clientX - precedent.x) / ech;
        vue.y -= (e.clientY - precedent.y) / ech;
        appliquer();
      } else if (geste.type === 'deplacement') {
        suivreDeplacement(e.clientX, e.clientY);
      }
    }

    function surRelache(e, annule) {
      if (!pointeurs.has(e.pointerId)) return;
      pointeurs.delete(e.pointerId);
      annulerMinuteur();
      svg.classList.remove('glisse');
      if (!geste) return;
      if (geste.type === 'pincement') {
        // Un doigt reste posé : on continue en simple déplacement, sans saut.
        if (pointeurs.size === 1) {
          const [p] = [...pointeurs.values()];
          geste = { type: 'deplacer-vue', depart: p, dernier: p };
        } else if (!pointeurs.size) geste = null;
        return;
      }
      if (geste.type === 'deplacement') terminerDeplacement(annule);
      else if (geste.type === 'attente' && !annule) rappels.clic(geste.tuileId);
      geste = null;
    }

    function surMolette(e) {
      e.preventDefault();
      // Pincement sur pavé tactile = molette avec ctrlKey : plus sensible.
      const intensite = e.ctrlKey ? 0.012 : 0.0018;
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomer(Math.exp(-delta * intensite), e.clientX, e.clientY);
    }

    function surClavier(e) {
      const g = e.target.closest ? e.target.closest('.tuile') : null;
      if (g && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        rappels.clic(g.getAttribute('data-id'));
        return;
      }
      const pas = 60 / echelle();
      const fleches = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
      if (fleches[e.key] && !g) {
        e.preventDefault();
        vue.x += fleches[e.key][0];
        vue.y += fleches[e.key][1];
        appliquer();
      } else if (e.key === '+' || e.key === '=') zoomer(1.3);
      else if (e.key === '-') zoomer(1 / 1.3);
    }

    svg.addEventListener('pointerdown', surAppui);
    svg.addEventListener('pointermove', surMouvement);
    svg.addEventListener('pointerup', (e) => surRelache(e, false));
    svg.addEventListener('pointercancel', (e) => surRelache(e, true));
    svg.addEventListener('wheel', surMolette, { passive: false });
    svg.addEventListener('keydown', surClavier);
    svg.addEventListener('contextmenu', (e) => { if (geste) e.preventDefault(); });
    window.addEventListener('resize', () => {
      if (!vue) return;
      proportionner(vue.x + vue.l / 2, vue.y + vue.h / 2, vue.l);
      appliquer();
    });

    return {
      // Appelé après chaque rendu : garde la vue courante, ou cadre toute la carte au premier rendu.
      majCadre(nouveauCadre, opts) {
        cadre = nouveauCadre;
        if (!vue || (opts && opts.ajuster)) ajuster(opts && opts.marges);
        else appliquer();
        dessinerSelection();
      },
      ajuster,
      zoomer,
      selectionner,
      rendreVisible,
      get selection() { return selection; }
    };
  }

  CT.navigation = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
