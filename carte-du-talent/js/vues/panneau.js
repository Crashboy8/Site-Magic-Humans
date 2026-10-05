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

  const NIVEAUX_ECLAT = ['', 'une lueur', 'ça brille', 'lumineux', 'rayonnant'];

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
    if (c.statut !== 'a_deleguer') {
      html += '<button type="button" class="bouton bouton-flow-ici" data-action="flow"><i data-lucide="waves"></i>J\'étais dans le flow ici</button>';
    }
    if (!tous.length) {
      html += '<p class="vide">Aucun moment de flow enregistré ici pour l\'instant.</p>';
    } else {
      const e = CT.regles.eclat(carte, c.id);
      html += '<p class="chiffres"><strong>' + recents.length + '</strong> sur les 30 derniers jours · ' + tous.length + ' au total</p>' +
        (e.niveau ? '<p class="eclat-texte"><i data-lucide="sparkles"></i>Éclat : ' + NIVEAUX_ECLAT[e.niveau] + '</p>' : '') +
        '<ul class="liste-moments">' +
        tous.slice(0, 5).map((m) => '<li><span class="date">' + dateCourte.format(new Date(m.date)) + '</span>' +
          '<span class="intensite" title="Intensité ' + m.intensite + ' sur 5">' + '●'.repeat(m.intensite) + '<span class="pale">' + '●'.repeat(5 - m.intensite) + '</span></span>' +
          (m.note ? '<span class="note">' + O.echapper(m.note) + '</span>' : '') +
          '<button type="button" class="supprimer" data-action="supprimer-moment" data-valeur="' + O.echapper(m.id) +
          '" aria-label="Supprimer ce moment du ' + dateCourte.format(new Date(m.date)) + '" title="Supprimer ce moment"><i data-lucide="trash-2"></i></button></li>').join('') + '</ul>';
    }
    return html + '</section>';
  }

  // Frontière arrivée au seuil : la personne décide elle-même.
  function sectionProposition(c, carte) {
    const f = CT.stats.propositionsConquete(carte).find((x) => x.c.id === c.id);
    if (!f) return '';
    return '<section class="panneau-section proposition-panneau"><p><strong>' + f.nombre + ' moments de flow ici.</strong> Ce territoire te semble-t-il conquis ?</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" data-action="conquerir"><i data-lucide="trophy"></i>Oui, je l\'ai conquis</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="pas-encore">Pas encore</button></div></section>';
  }

  function sectionObjectif(c, carte) {
    const o = CT.regles.objectifDe(carte, c.id);
    if (!o && c.statut !== 'frontiere') return '';
    let html = '<section class="panneau-section"><h3><i data-lucide="target"></i> Objectif</h3>';
    if (o) {
      const a = CT.stats.suiviObjectif(carte, o).actuelle;
      const maintenant = o.frequence.periode === 'mois' ? 'ce mois-ci' : 'cette semaine';
      html += '<p class="objectif"><strong>' + O.echapper(o.description || c.nom) + '</strong><br><span class="discret">' +
        (a.fait >= a.cible ? 'Objectif atteint ' + maintenant : a.fait + ' sur ' + a.cible + ' ' + maintenant) + '</span></p>' +
        '<div class="actions-ligne"><button type="button" class="bouton bouton-secondaire bouton-compact" data-action="session" data-valeur="' + O.echapper(o.id) + '">' +
        '<i data-lucide="plus"></i>J\'ai fait une session</button>' +
        '<button type="button" class="bouton-lien" data-action="progres">Voir le suivi</button></div>';
    } else {
      html += '<p class="vide">Pas encore d\'objectif sur cette frontière.</p>' +
        '<button type="button" class="bouton bouton-secondaire bouton-compact" data-action="nouvel-objectif"><i data-lucide="target"></i>Me fixer un objectif</button>';
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
      '<div class="panneau-corps">' + sectionProposition(c, carte) + sectionFlow(c, carte) + sectionObjectif(c, carte) + sectionStatut(c, carte) + sectionPosition(c) + '</div>';
  }

  // Territoire caché par le brouillard de guerre : rien n'est dévoilé avant l'exploration.
  function contenuBrouillard(c, carte) {
    const r = CT.regles.regionDe(carte, c.regionId);
    return '<header class="panneau-tete" style="--teinte:#E9EFF1">' +
      '<svg class="panneau-hex" viewBox="-30 -30 60 64" aria-hidden="true"><polygon points="' +
      CT.hex.coins(0, 0, 26).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + '" fill="#E1E9EC" stroke="#C9D5DA" stroke-width="2" stroke-dasharray="3 5"/>' +
      O.iconeSvg('cloud', 0, 0, 26, '#8FA3AB', 2) + '</svg>' +
      '<div class="panneau-titre"><span class="badge">Brouillard</span><h2 id="panneau-titre">Territoire inexploré</h2>' +
      '<p class="lieu">' + (r ? 'Au-delà de ' + O.echapper(r.nom) : 'Quelque part au bord de ta carte') + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="Fermer"><i data-lucide="x"></i></button></header>' +
      '<div class="panneau-corps"><section class="panneau-section">' +
      '<p>Quelque chose t\'attend ici. Explore ce territoire pour découvrir de quoi il s\'agit.</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" data-action="explorer"><i data-lucide="compass"></i>Explorer ce territoire</button></div>' +
      '</section></div>';
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

  // ---------- Suggestions ----------

  function teteSuggestions(titre, sousTitre, badge, icone) {
    const pts = CT.hex.coins(0, 0, 26).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
    return '<header class="panneau-tete" style="--teinte:#FFF1C9">' +
      '<svg class="panneau-hex" viewBox="-30 -30 60 64" aria-hidden="true"><polygon points="' + pts + '" fill="#FFFDF5" stroke="#E9A400" stroke-width="2.5" stroke-dasharray="5 4"/>' +
      O.iconeSvg(icone, 0, 0, 24, '#8A6A2A', 2) + '</svg>' +
      '<div class="panneau-titre"><span class="badge badge-suggestion">' + badge + '</span><h2 id="panneau-titre">' + O.echapper(titre) + '</h2>' +
      '<p class="lieu">' + sousTitre + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="Fermer"><i data-lucide="x"></i></button></header>';
  }

  function contenuSuggestions(carte, suggestions) {
    let html = teteSuggestions('Territoires à explorer', 'Des idées proches de ce que tu vis déjà. Prends ce qui te parle, laisse le reste.', 'Suggestions', 'lightbulb') +
      '<div class="panneau-corps"><section class="panneau-section">';
    if (!suggestions.length) {
      html += '<p class="vide">Tu as fait le tour des suggestions pour l\'instant. La bibliothèque ci-dessous en garde d\'autres.</p>';
    } else {
      html += '<p class="discret">Elles apparaissent en pointillés dorés sur ta carte, à l\'endroit où elles se poseraient.</p><ul class="suggestions">' +
        suggestions.map((p) => '<li class="suggestion">' +
          '<button type="button" class="suggestion-nom" data-action="voir-suggestion" data-valeur="' + O.echapper(p.entree.id) + '">' +
          '<i data-lucide="' + O.echapper(p.entree.icone) + '"></i><span><strong>' + O.echapper(p.entree.nom) + '</strong>' +
          '<span class="discret">' + O.echapper(p.raison) + '</span></span></button>' +
          '<div class="suggestion-actions"><button type="button" class="bouton bouton-principal bouton-compact" data-action="accepter" data-valeur="' + O.echapper(p.entree.id) + '">' +
          '<i data-lucide="plus"></i>Ajouter</button>' +
          '<button type="button" class="bouton-lien bouton-lien-discret" data-action="refuser" data-valeur="' + O.echapper(p.entree.id) + '">Pas pour moi</button></div></li>').join('') + '</ul>';
    }
    html += '</section>' +
      '<section class="panneau-section"><h3><i data-lucide="pencil"></i> Ton idée à toi</h3>' +
      '<form class="idee" data-form="idee"><label class="visuellement-cache" for="idee-nom">Nom de la compétence</label>' +
      '<input type="text" id="idee-nom" name="nom" maxlength="60" placeholder="Ex. : Animer un podcast en direct" autocomplete="off">' +
      '<button type="submit" class="bouton bouton-secondaire bouton-compact"><i data-lucide="plus"></i>Ajouter</button></form>' +
      '<p class="discret">Elle rejoint tes territoires à conquérir. Tu pourras ajuster sa région dans son panneau.</p></section>' +
      sectionBibliotheque(carte, suggestions) + '</div>';
    return html;
  }

  function sectionBibliotheque(carte, suggestions) {
    const proposees = new Set(suggestions.map((p) => p.entree.id));
    const parDomaine = {};
    CT.suggestions.disponibles(carte).filter((x) => !proposees.has(x.id)).forEach((x) => {
      (parDomaine[x.domaine] = parDomaine[x.domaine] || []).push(x);
    });
    const domaines = Object.keys(S.DOMAINES).filter((d) => parDomaine[d]);
    if (!domaines.length) return '';
    return '<section class="panneau-section"><h3><i data-lucide="library"></i> Toute la bibliothèque</h3>' +
      domaines.map((d) => '<details class="domaine"><summary><span class="pastille-couleur" style="background:' + S.DOMAINES[d].couleur + '"></span>' +
        S.DOMAINES[d].nom + '<span class="discret">' + parDomaine[d].length + '</span></summary><ul>' +
        parDomaine[d].map((x) => '<li><i data-lucide="' + O.echapper(x.icone) + '"></i><span>' + O.echapper(x.nom) + '</span>' +
          '<button type="button" class="bouton-lien" data-action="accepter" data-valeur="' + O.echapper(x.id) + '">Ajouter</button></li>').join('') +
        '</ul></details>').join('') + '</section>';
  }

  function contenuSuggestion(p) {
    return teteSuggestions(p.entree.nom, O.echapper(p.raison), 'Suggestion', p.entree.icone) +
      '<div class="panneau-corps"><section class="panneau-section">' +
      '<p>Si ce territoire t\'attire, ajoute-le à ta carte. Sinon, laisse-le : il ne te sera plus proposé.</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" data-action="accepter" data-valeur="' + O.echapper(p.entree.id) + '">' +
      '<i data-lucide="plus"></i>Ajouter à mes territoires à conquérir</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="accepter-frontiere" data-valeur="' + O.echapper(p.entree.id) + '">' +
      '<i data-lucide="mountain"></i>Je le travaille déjà : frontière</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="refuser" data-valeur="' + O.echapper(p.entree.id) + '">Pas pour moi</button></div>' +
      '<button type="button" class="bouton-lien" data-action="retour-suggestions"><i data-lucide="arrow-left"></i>Toutes les suggestions</button>' +
      '</section></div>';
  }

  function creer(racine, surAction, contexte) {
    let ouvert = null;

    racine.addEventListener('submit', (e) => {
      e.preventDefault();
      const champ = e.target.querySelector('input[name="nom"]');
      if (champ && champ.value.trim()) surAction('ajouter-idee', champ.value.trim());
    });

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
        const suggestions = contexte && contexte.suggestions ? contexte.suggestions() : [];
        let html;
        if (id === 'suggestions') html = contenuSuggestions(carte, suggestions);
        else if (id.startsWith('sugg:')) {
          const p = suggestions.find((x) => 'sugg:' + x.entree.id === id);
          if (!p) { this.afficher('suggestions', carte); return; }
          html = contenuSuggestion(p);
        } else {
          const c = id === 'capitale' ? null : CT.regles.trouver(carte, id);
          if (id !== 'capitale' && !c) { this.fermer(); return; }
          html = !c ? contenuCapitale(carte) : CT.regles.estCache(carte, c) ? contenuBrouillard(c, carte) : contenuCompetence(c, carte);
        }
        const premier = !ouvert;
        const memeVue = ouvert === id;
        const defilement = racine.querySelector('.panneau-corps') ? racine.querySelector('.panneau-corps').scrollTop : 0;
        const ouverts = [...racine.querySelectorAll('details[open] summary')].map((s) => s.textContent);
        ouvert = id;
        racine.innerHTML = html;
        // Même vue redessinée : on garde le défilement et les domaines dépliés.
        if (memeVue) {
          racine.querySelectorAll('details').forEach((d) => { if (ouverts.includes(d.querySelector('summary').textContent)) d.open = true; });
          if (racine.querySelector('.panneau-corps')) racine.querySelector('.panneau-corps').scrollTop = defilement;
        }
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
