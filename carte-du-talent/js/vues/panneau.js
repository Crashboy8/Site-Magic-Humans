/*
 * Panneau latéral (bas de l'écran sur téléphone) : détail d'un hexagone et actions.
 * Les actions remontent à l'application via surAction(action, valeur).
 */
(function (CT) {
  'use strict';

  const O = CT.outils;
  const S = CT.schema;

  // Actions proposées selon le statut actuel : [nouveau statut, libellé, icône, principale ?]
  const ACTIONS = {
    natale: [],
    conquise: [
      ['frontiere', 'Je le travaille encore', 'mountain', false],
      ['a_deleguer', 'À déléguer', 'send', false]
    ],
    frontiere: [
      ['conquise', 'Je l\'ai conquis', 'trophy', true],
      ['a_conquerir', 'Pas pour maintenant', 'pause', false],
      ['a_deleguer', 'À déléguer', 'send', false]
    ],
    a_conquerir: [
      ['frontiere', 'J\'y vais : c\'est une frontière', 'mountain', true],
      ['conquise', 'Je l\'ai déjà conquis', 'trophy', false],
      ['a_deleguer', 'À déléguer', 'send', false]
    ],
    a_deleguer: [
      ['conquise', 'Finalement, je le garde', 'trophy', false],
      ['frontiere', 'Je veux l\'apprendre', 'mountain', false]
    ],
    ile: [
      ['conquise', 'Rattacher au continent', 'link', false]
    ]
  };

  const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

  function pastilleTuile(c, carte) {
    const couleur = c ? CT.vueCarte.couleurDe(c, carte) : '#F4C95D';
    const icone = c ? c.icone : 'crown';
    const pts = CT.hex.coins(0, 0, 26).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
    return '<svg class="panneau-hex" viewBox="-30 -30 60 64" aria-hidden="true">' +
      '<polygon points="' + CT.hex.coins(0, 4, 26).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + '" fill="' + O.nuance(couleur, -0.28) + '"/>' +
      '<polygon points="' + pts + '" fill="' + couleur + '"/>' + O.iconeSvg(icone, 0, 0, 26, O.nuance(couleur, -0.6), 2) + '</svg>';
  }

  function lieuDe(c, carte) {
    const R = (id) => { const r = CT.regles.regionDe(carte, id); return r ? r.nom : ''; };
    if (c.statut === 'ile') {
      const ile = carte.iles.find((i) => i.id === c.ileId);
      return 'Île « ' + (ile ? ile.nom : 'de flow') + ' », hors du talent principal';
    }
    if (c.statut === 'a_deleguer') return 'Zone à déléguer';
    if (c.distance === 'eloignee' && c.statut !== 'natale') {
      const d = S.DOMAINES[c.domaine];
      return 'Province ' + (d ? d.nom.toLowerCase() : 'éloignée') + (c.regionId ? ', du côté de ' + R(c.regionId) : '');
    }
    if (!c.regionId) return '';
    return c.regionJonctionId ? 'Entre ' + R(c.regionId) + ' et ' + R(c.regionJonctionId) : 'Région ' + R(c.regionId);
  }

  function sectionFlow(c, carte) {
    const tous = CT.regles.momentsDe(carte, c.id);
    const recents = CT.regles.momentsRecents(carte, c.id, 30);
    let html = '<section class="panneau-section"><h3><i data-lucide="waves"></i> Moments de flow</h3>';
    if (!tous.length) {
      html += '<p class="vide">Aucun moment de flow enregistré ici pour l\'instant.</p>';
    } else {
      html += '<p class="chiffres"><strong>' + recents.length + '</strong> sur les 30 derniers jours · ' + tous.length + ' au total</p><ul class="liste-moments">' +
        tous.slice(0, 5).map((m) => '<li><span class="date">' + dateCourte.format(new Date(m.date)) + '</span>' +
          '<span class="intensite" title="Intensité ' + m.intensite + ' sur 5">' + '●'.repeat(m.intensite) + '<span class="pale">' + '●'.repeat(5 - m.intensite) + '</span></span>' +
          (m.note ? '<span class="note">' + O.echapper(m.note) + '</span>' : '') + '</li>').join('') + '</ul>';
    }
    return html + '</section>';
  }

  function sectionObjectif(c, carte) {
    const o = CT.regles.objectifDe(carte, c.id);
    if (!o && c.statut !== 'frontiere') return '';
    let html = '<section class="panneau-section"><h3><i data-lucide="target"></i> Objectif</h3>';
    if (o) {
      html += '<p class="objectif"><strong>' + O.echapper(o.description || c.nom) + '</strong><br><span class="discret">' +
        o.frequence.fois + ' fois par ' + o.frequence.periode + '</span></p>';
    } else {
      html += '<p class="vide">Pas encore d\'objectif sur cette frontière.</p>';
    }
    return html + '</section>';
  }

  function sectionStatut(c, carte) {
    const actions = ACTIONS[c.statut] || [];
    let html = '<section class="panneau-section"><h3><i data-lucide="flag"></i> Statut</h3>';
    if (actions.length) {
      html += '<div class="actions">' + actions.map(([statut, libelle, icone, principale]) =>
        '<button type="button" class="bouton ' + (principale ? 'bouton-principal' : 'bouton-secondaire') +
        '" data-action="statut" data-valeur="' + statut + '"><i data-lucide="' + icone + '"></i>' + libelle + '</button>').join('') + '</div>';
    }
    html += '<label class="champ"><span>Autre statut</span><select data-action="statut">' +
      S.STATUTS.map((s) => '<option value="' + s + '"' + (s === c.statut ? ' selected' : '') + '>' + S.LIBELLES_STATUT[s] + '</option>').join('') +
      '</select></label>';

    if (c.statut !== 'ile' && c.statut !== 'a_deleguer') {
      html += '<label class="champ"><span>Région la plus proche</span><select data-action="region">' +
        carte.regions.map((r) => '<option value="' + O.echapper(r.id) + '"' + (r.id === c.regionId ? ' selected' : '') + '>' + O.echapper(r.nom) + '</option>').join('') +
        '</select></label>';
    }
    if (c.statut === 'ile' && carte.iles.length > 1) {
      html += '<label class="champ"><span>Île</span><select data-action="ile">' +
        carte.iles.map((i) => '<option value="' + O.echapper(i.id) + '"' + (i.id === c.ileId ? ' selected' : '') + '>' + O.echapper(i.nom) + '</option>').join('') +
        '</select></label>';
    }
    if (c.statut !== 'natale' && c.statut !== 'ile' && c.statut !== 'a_deleguer') {
      html += '<div class="champ"><span>Distance au talent</span><div class="segments" role="group" aria-label="Distance au talent">' +
        [['proche', 'Proche'], ['eloignee', 'Éloignée']].map(([v, l]) => '<button type="button" data-action="distance" data-valeur="' + v +
          '" aria-pressed="' + (c.distance === v) + '">' + l + '</button>').join('') + '</div></div>';
    }
    return html + '</section>';
  }

  function sectionPosition(c) {
    let html = '<section class="panneau-section panneau-astuce">';
    if (c.positionManuelle) {
      html += '<p><i data-lucide="hand"></i> Tu as placé cet hexagone à la main.</p>' +
        '<button type="button" class="bouton bouton-lien" data-action="remettre"><i data-lucide="undo-2"></i>Le remettre à sa place automatique</button>';
    } else {
      html += '<p><i data-lucide="move"></i> Astuce : maintiens appuyé un hexagone pour le déplacer.</p>';
    }
    return html + '</section>';
  }

  function contenuCompetence(c, carte) {
    const couleur = CT.vueCarte.couleurDe(c, carte);
    return '<header class="panneau-tete" style="--teinte:' + O.nuance(couleur, 0.75) + '">' + pastilleTuile(c, carte) +
      '<div class="panneau-titre"><span class="badge badge-' + c.statut + '">' + S.LIBELLES_STATUT[c.statut] +
      (c.priorite === 1 ? ' · priorité n°1' : '') + '</span>' +
      '<h2 id="panneau-titre">' + O.echapper(c.nom) + '</h2><p class="lieu">' + O.echapper(lieuDe(c, carte)) + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="Fermer"><i data-lucide="x"></i></button></header>' +
      '<div class="panneau-corps">' + sectionFlow(c, carte) + sectionObjectif(c, carte) + sectionStatut(c, carte) + sectionPosition(c) + '</div>';
  }

  function contenuCapitale(carte) {
    const compte = {};
    carte.competences.forEach((c) => { compte[c.statut] = (compte[c.statut] || 0) + 1; });
    const regions = carte.regions.map((r) => {
      const n = carte.competences.filter((c) => c.regionId === r.id && c.distance === 'proche' && ['natale', 'conquise'].includes(c.statut)).length;
      return '<li><span class="puce" style="background:' + r.couleur + '"></span>' + O.echapper(r.nom) + '<span class="discret">' + n + '</span></li>';
    }).join('');
    return '<header class="panneau-tete" style="--teinte:#FFF1C9">' + pastilleTuile(null, carte) +
      '<div class="panneau-titre"><span class="badge badge-capitale">Capitale · ton talent</span>' +
      '<h2 id="panneau-titre">' + O.echapper(carte.talent.nom || 'Mon talent') + '</h2>' +
      (carte.talent.filRouge ? '<p class="lieu">Fil rouge : ' + O.echapper(carte.talent.filRouge) + '</p>' : '') + '</div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="Fermer"><i data-lucide="x"></i></button></header>' +
      '<div class="panneau-corps"><section class="panneau-section"><h3><i data-lucide="map"></i> Ton territoire</h3>' +
      '<ul class="bilan">' + S.STATUTS.filter((s) => compte[s]).map((s) => '<li>' + S.LIBELLES_STATUT[s] + '<strong>' + compte[s] + '</strong></li>').join('') + '</ul></section>' +
      '<section class="panneau-section"><h3><i data-lucide="layers"></i> Régions</h3><ul class="bilan">' + regions + '</ul></section></div>';
  }

  function creer(racine, surAction) {
    let ouvert = null;

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-action]');
      if (b) surAction(b.getAttribute('data-action'), b.getAttribute('data-valeur'));
    });
    racine.addEventListener('change', (e) => {
      const s = e.target.closest('select[data-action]');
      if (s) surAction(s.getAttribute('data-action'), s.value);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ouvert) surAction('fermer'); });

    return {
      afficher(id, carte) {
        const c = id === 'capitale' ? null : CT.regles.trouver(carte, id);
        if (id !== 'capitale' && !c) { this.fermer(); return; }
        const premier = !ouvert;
        ouvert = id;
        racine.innerHTML = c ? contenuCompetence(c, carte) : contenuCapitale(carte);
        racine.hidden = false;
        document.body.classList.add('panneau-ouvert');
        O.rafraichirIcones(racine);
        if (premier) {
          requestAnimationFrame(() => racine.classList.add('visible'));
          const fermer = racine.querySelector('.fermer');
          if (fermer) fermer.focus({ preventScroll: true });
        } else {
          racine.classList.add('visible');
        }
      },
      fermer() {
        ouvert = null;
        racine.classList.remove('visible');
        document.body.classList.remove('panneau-ouvert');
        setTimeout(() => { if (!ouvert) racine.hidden = true; }, 250);
      },
      get ouvert() { return ouvert; }
    };
  }

  CT.vuePanneau = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
