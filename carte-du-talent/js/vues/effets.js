/*
 * Animations courtes et discrètes, dessinées sur un calque d'effets au-dessus de la carte.
 * Les tuiles elles-mêmes ne sont jamais transformées : aucun hexagone ne bouge.
 */
(function (CT) {
  'use strict';

  const O = CT.outils;
  const H = CT.hex;

  function calque(svg) {
    return svg.querySelector('.calque-interaction');
  }

  function centre(caseCarte) {
    return H.versPixel(caseCarte.q, caseCarte.r, CT.vueCarte.T);
  }

  // Ajoute un groupe d'effet et le retire après sa durée.
  function jouer(svg, html, duree) {
    const c = calque(svg);
    if (!c) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'effet');
    g.setAttribute('aria-hidden', 'true');
    g.innerHTML = html;
    c.appendChild(g);
    setTimeout(() => g.remove(), duree + 100);
  }

  // Moment de flow : une onde dorée et quelques étincelles qui s'envolent.
  function flow(svg, cases) {
    const T = CT.vueCarte.T;
    cases.forEach((cs, n) => {
      const { x, y } = centre(cs);
      let html = '<polygon class="effet-eclair" points="' + CT.vueCarte.polygone(x, y, T * 0.94) + '" fill="#FFF3C4"/>' +
        '<polygon class="effet-onde" points="' + CT.vueCarte.polygone(x, y, T * 0.98) + '"/>';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.45;
        const dx = Math.cos(a) * T * 0.9;
        const dy = Math.sin(a) * T * 0.9 - T * 0.2;
        html += '<circle class="effet-etincelle" cx="' + x.toFixed(1) + '" cy="' + (y - T * 0.2).toFixed(1) + '" r="' + (3 + (i % 2) * 1.5) +
          '" style="--dx:' + dx.toFixed(1) + 'px;--dy:' + dy.toFixed(1) + 'px;animation-delay:' + (60 * i) + 'ms" fill="#FFD866"/>';
      }
      setTimeout(() => jouer(svg, html, 1000), n * 90);
    });
  }

  // Conquête : éclair doré sur la tuile, onde, et un trophée qui apparaît puis s'efface.
  function conquete(svg, cs) {
    const T = CT.vueCarte.T;
    const { x, y } = centre(cs);
    const rayons = Array.from({ length: 8 }, (_, i) => {
      const a = i * Math.PI / 4;
      return '<line class="effet-rayon" x1="' + (x + Math.cos(a) * T * 1.05).toFixed(1) + '" y1="' + (y + Math.sin(a) * T * 1.05).toFixed(1) +
        '" x2="' + (x + Math.cos(a) * T * 1.35).toFixed(1) + '" y2="' + (y + Math.sin(a) * T * 1.35).toFixed(1) + '"/>';
    }).join('');
    const html = '<polygon class="effet-eclair effet-eclair-or" points="' + CT.vueCarte.polygone(x, y, T * 0.94) + '" fill="#FFE08A"/>' +
      '<polygon class="effet-onde" points="' + CT.vueCarte.polygone(x, y, T * 0.98) + '"/>' + rayons +
      '<g class="effet-trophee"><circle cx="' + x.toFixed(1) + '" cy="' + (y - T * 1.25).toFixed(1) + '" r="19" fill="#FFF8E1" stroke="#E9B23E" stroke-width="2.5"/>' +
      O.iconeSvg('trophy', x, y - T * 1.25, 20, '#B57F12', 2.2) + '</g>';
    jouer(svg, html, 1400);
  }

  // Exploration : la brume se dissipe.
  function exploration(svg, cs) {
    const T = CT.vueCarte.T;
    const { x, y } = centre(cs);
    jouer(svg, '<circle class="effet-dissipation" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (T * 1.05).toFixed(1) +
      '" fill="#F4F8FA" filter="url(#ct-brume)"/>', 1000);
  }

  CT.vueEffets = { flow, conquete, exploration };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
