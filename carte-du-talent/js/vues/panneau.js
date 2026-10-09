/*
 * Panneau latéral (bas de l'écran sur téléphone) : détail d'un hexagone et actions.
 * Les actions remontent à l'application via surAction(action, valeur).
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;
  const S = CT.schema;

  // Actions proposées selon le statut actuel : [nouveau statut, libellé, icône, principale ?]
  const ACTIONS = {
    natale: [],
    conquise: [
      ['frontiere', T('Je le travaille encore'), 'mountain', false],
      ['a_deleguer', T('À déléguer'), 'send', false]
    ],
    frontiere: [
      ['conquise', T('Je l\'ai conquis'), 'trophy', true],
      ['a_conquerir', T('Pas pour maintenant'), 'pause', false],
      ['a_deleguer', T('À déléguer'), 'send', false]
    ],
    a_conquerir: [
      ['frontiere', T('J\'y vais : c\'est une frontière'), 'mountain', true],
      ['conquise', T('Je l\'ai déjà conquis'), 'trophy', false],
      ['a_deleguer', T('À déléguer'), 'send', false]
    ],
    a_deleguer: [
      ['conquise', T('Finalement, je le garde'), 'trophy', false],
      ['frontiere', T('Je veux l\'apprendre'), 'mountain', false]
    ],
    ile: [
      ['conquise', T('Rattacher au continent'), 'link', false]
    ],
    ressource: [
      ['conquise', T('Rattacher au continent'), 'link', false],
      ['a_deleguer', T('À déléguer'), 'send', false]
    ]
  };

  const HORS_CONTINENT = ['ile', 'a_deleguer', 'ressource'];

  const NIVEAUX_ECLAT = ['', T('une lueur'), T('ça brille'), T('lumineux'), T('rayonnant')];

  const dateCourte = new Intl.DateTimeFormat(CT.i18n.locale, { day: 'numeric', month: 'short' });

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
      return T('Île « {nom} », hors du talent principal', { nom: ile ? ile.nom : T('de flow') });
    }
    if (c.statut === 'a_deleguer') return T('Zone à déléguer');
    if (c.statut === 'ressource') return T('Zone de ressourcement');
    if (c.distance === 'eloignee' && c.statut !== 'natale') {
      const d = S.DOMAINES[c.domaine];
      const province = d ? T('Province {domaine}', { domaine: d.nom.toLowerCase() }) : T('Province éloignée');
      return c.regionId ? T('{province}, du côté de {region}', { province, region: R(c.regionId) }) : province;
    }
    if (!c.regionId) return '';
    return c.regionJonctionId ? T('Entre {a} et {b}', { a: R(c.regionId), b: R(c.regionJonctionId) }) : T('Région {nom}', { nom: R(c.regionId) });
  }

  function sectionFlow(c, carte) {
    const tous = CT.regles.momentsDe(carte, c.id);
    const recents = CT.regles.momentsRecents(carte, c.id, 30);
    let html = '<section class="panneau-section"><h3><i data-lucide="waves"></i> ' + T('Moments de flow') + '</h3>';
    if (c.statut !== 'a_deleguer') {
      html += '<button type="button" class="bouton bouton-flow-ici" data-action="flow"><i data-lucide="waves"></i>' + T('J\'étais dans le flow ici') + '</button>';
    }
    if (!tous.length) {
      html += '<p class="vide">' + T('Aucun moment de flow enregistré ici pour l\'instant.') + '</p>';
    } else {
      const e = CT.regles.eclat(carte, c.id);
      html += '<p class="chiffres">' + T('<strong>{recents}</strong> sur les 30 derniers jours · {total} au total', { recents: recents.length, total: tous.length }) + '</p>' +
        (e.niveau ? '<p class="eclat-texte"><i data-lucide="sparkles"></i>' + T('Éclat : {niveau}', { niveau: NIVEAUX_ECLAT[e.niveau] }) + '</p>' : '') +
        '<ul class="liste-moments">' +
        tous.slice(0, 5).map((m) => '<li><span class="date">' + dateCourte.format(new Date(m.date)) + '</span>' +
          '<span class="intensite" title="' + O.echapper(T('Intensité {n} sur 5', { n: m.intensite })) + '">' + '●'.repeat(m.intensite) + '<span class="pale">' + '●'.repeat(5 - m.intensite) + '</span></span>' +
          (m.note ? '<span class="note">' + O.echapper(m.note) + '</span>' : '') +
          '<button type="button" class="supprimer" data-action="supprimer-moment" data-valeur="' + O.echapper(m.id) +
          '" aria-label="' + O.echapper(T('Supprimer ce moment du {date}', { date: dateCourte.format(new Date(m.date)) })) + '" title="' + O.echapper(T('Supprimer ce moment')) + '"><i data-lucide="trash-2"></i></button></li>').join('') + '</ul>';
    }
    return html + '</section>';
  }

  // Frontière arrivée au seuil : la personne décide elle-même.
  function sectionProposition(c, carte) {
    const f = CT.stats.propositionsConquete(carte).find((x) => x.c.id === c.id);
    if (!f) return '';
    return '<section class="panneau-section proposition-panneau"><p>' + T('<strong>{n} moments de flow ici.</strong> Ce territoire te semble-t-il conquis ?', { n: f.nombre }) + '</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" data-action="conquerir"><i data-lucide="trophy"></i>' + T('Oui, je l\'ai conquis') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="pas-encore">' + T('Pas encore') + '</button></div></section>';
  }

  function sectionObjectif(c, carte) {
    const o = CT.regles.objectifDe(carte, c.id);
    if (!o && c.statut !== 'frontiere') return '';
    let html = '<section class="panneau-section"><h3><i data-lucide="target"></i> ' + T('Objectif') + '</h3>';
    if (o) {
      const a = CT.stats.suiviObjectif(carte, o).actuelle;
      const maintenant = o.frequence.periode === 'mois' ? T('ce mois-ci') : T('cette semaine');
      html += '<p class="objectif"><strong>' + O.echapper(o.description || c.nom) + '</strong><br><span class="discret">' +
        (a.fait >= a.cible ? T('Objectif atteint {quand}', { quand: maintenant }) : T('{fait} sur {cible} {quand}', { fait: a.fait, cible: a.cible, quand: maintenant })) + '</span></p>' +
        '<div class="actions-ligne"><button type="button" class="bouton bouton-secondaire bouton-compact" data-action="session" data-valeur="' + O.echapper(o.id) + '">' +
        '<i data-lucide="plus"></i>' + T('J\'ai fait une session') + '</button>' +
        '<button type="button" class="bouton-lien" data-action="progres">' + T('Voir le suivi') + '</button></div>';
    } else {
      html += '<p class="vide">' + T('Pas encore d\'objectif sur cette frontière.') + '</p>' +
        '<button type="button" class="bouton bouton-secondaire bouton-compact" data-action="nouvel-objectif"><i data-lucide="target"></i>' + T('Me fixer un objectif') + '</button>';
    }
    return html + '</section>';
  }

  // Classement des territoires en conquête : 1 = celui qu'on attaque d'abord.
  function sectionPriorite(c, carte) {
    if (c.statut !== 'frontiere') return '';
    const liste = CT.regles.frontieres(carte);
    const rang = liste.findIndex((x) => x.id === c.id) + 1;
    const bouton = (sens, icone, libelle, desactive) => '<button type="button" class="bouton bouton-secondaire bouton-compact" data-action="priorite" data-valeur="' + sens + '"' +
      (desactive ? ' disabled' : '') + '><i data-lucide="' + icone + '"></i>' + libelle + '</button>';
    return '<section class="panneau-section"><h3><i data-lucide="flag"></i> ' + T('Priorité') + '</h3>' +
      '<p><strong>' + T('En conquête : n°{rang} sur {total}', { rang, total: liste.length }) + '</strong></p>' +
      (CT.pistes && CT.pistes.pistesDe(c).length ? '<p class="discret">' + O.echapper(T('Pour la piste : {pistes}', { pistes: CT.pistes.pistesDe(c).map((p) => p.nom).join(T(', ')) })) + '</p>' : '') +
      (liste.length > 1 ? '<div class="actions-ligne">' + bouton('-1', 'arrow-up', T('Plus prioritaire'), rang === 1) + bouton('1', 'arrow-down', T('Moins prioritaire'), rang === liste.length) + '</div>' : '') +
      '</section>';
  }

  function sectionStatut(c, carte) {
    const actions = ACTIONS[c.statut] || [];
    let html = '<section class="panneau-section"><h3><i data-lucide="flag"></i> ' + T('Statut') + '</h3>';
    if (actions.length) {
      html += '<div class="actions">' + actions.map(([statut, libelle, icone, principale]) =>
        '<button type="button" class="bouton ' + (principale ? 'bouton-principal' : 'bouton-secondaire') +
        '" data-action="statut" data-valeur="' + statut + '"><i data-lucide="' + icone + '"></i>' + libelle + '</button>').join('') + '</div>';
    }
    html += '<label class="champ"><span>' + T('Autre statut') + '</span><select data-action="statut">' +
      S.STATUTS.map((s) => '<option value="' + s + '"' + (s === c.statut ? ' selected' : '') + '>' + S.LIBELLES_STATUT[s] + '</option>').join('') +
      '</select></label>';

    if (!HORS_CONTINENT.includes(c.statut)) {
      html += '<label class="champ"><span>' + T('Région la plus proche') + '</span><select data-action="region">' +
        carte.regions.map((r) => '<option value="' + O.echapper(r.id) + '"' + (r.id === c.regionId ? ' selected' : '') + '>' + O.echapper(r.nom) + '</option>').join('') +
        '</select></label>';
    }
    if (c.statut === 'ile' && carte.iles.length > 1) {
      html += '<label class="champ"><span>' + T('Île') + '</span><select data-action="ile">' +
        carte.iles.map((i) => '<option value="' + O.echapper(i.id) + '"' + (i.id === c.ileId ? ' selected' : '') + '>' + O.echapper(i.nom) + '</option>').join('') +
        '</select></label>';
    }
    if (c.statut !== 'natale' && !HORS_CONTINENT.includes(c.statut)) {
      html += '<div class="champ"><span>' + T('Distance au talent') + '</span><div class="segments" role="group" aria-label="' + O.echapper(T('Distance au talent')) + '">' +
        [['proche', T('Proche')], ['eloignee', T('Éloignée')]].map(([v, l]) => '<button type="button" data-action="distance" data-valeur="' + v +
          '" aria-pressed="' + (c.distance === v) + '">' + l + '</button>').join('') + '</div></div>';
    }
    return html + '</section>';
  }

  function sectionPosition(c) {
    let html = '<section class="panneau-section panneau-astuce">';
    if (c.positionManuelle) {
      html += '<p><i data-lucide="hand"></i> ' + T('Tu as placé cet hexagone à la main.') + '</p>' +
        '<button type="button" class="bouton bouton-lien" data-action="remettre"><i data-lucide="undo-2"></i>' + T('Le remettre à sa place automatique') + '</button>';
    } else {
      html += '<p><i data-lucide="move"></i> ' + T('Astuce : maintiens appuyé un hexagone pour le déplacer.') + '</p>';
    }
    return html + '</section>';
  }

  function contenuCompetence(c, carte) {
    const couleur = CT.vueCarte.couleurDe(c, carte);
    return '<header class="panneau-tete" style="--teinte:' + O.nuance(couleur, 0.75) + '">' + pastilleTuile(c, carte) +
      '<div class="panneau-titre"><span class="badge badge-' + c.statut + '">' + S.LIBELLES_STATUT[c.statut] +
      (c.statut === 'frontiere' && c.priorite ? ' · ' + T('priorité n°{rang}', { rang: c.priorite }) : '') + '</span>' +
      '<h2 id="panneau-titre">' + O.echapper(CT.bibliotheque.nomAffiche(c)) + '</h2><p class="lieu">' + O.echapper(lieuDe(c, carte)) + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>' +
      '<div class="panneau-corps">' + sectionProposition(c, carte) + sectionFlow(c, carte) + sectionObjectif(c, carte) + sectionPriorite(c, carte) + sectionStatut(c, carte) + sectionPosition(c) + '</div>';
  }

  // Territoire caché par le brouillard de guerre : rien n'est dévoilé avant l'exploration.
  function contenuBrouillard(c, carte) {
    const r = CT.regles.regionDe(carte, c.regionId);
    return '<header class="panneau-tete" style="--teinte:#E9EFF1">' +
      '<svg class="panneau-hex" viewBox="-30 -30 60 64" aria-hidden="true"><polygon points="' +
      CT.hex.coins(0, 0, 26).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + '" fill="#E1E9EC" stroke="#C9D5DA" stroke-width="2" stroke-dasharray="3 5"/>' +
      O.iconeSvg('cloud', 0, 0, 26, '#8FA3AB', 2) + '</svg>' +
      '<div class="panneau-titre"><span class="badge">' + T('Brouillard') + '</span><h2 id="panneau-titre">' + T('Territoire inexploré') + '</h2>' +
      '<p class="lieu">' + (r ? T('Au-delà de {nom}', { nom: O.echapper(r.nom) }) : T('Quelque part au bord de ta carte')) + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>' +
      '<div class="panneau-corps"><section class="panneau-section">' +
      '<p>' + T('Quelque chose t\'attend ici. Explore ce territoire pour découvrir de quoi il s\'agit.') + '</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" data-action="explorer"><i data-lucide="compass"></i>' + T('Explorer ce territoire') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="statut" data-valeur="frontiere"><i data-lucide="flag"></i>' + T('J\'y vais : le conquérir') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="toutes"><i data-lucide="layout-grid"></i>' + T('Voir toutes les compétences') + '</button></div>' +
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
      '<div class="panneau-titre"><span class="badge badge-capitale">' + T('Capitale · ton talent') + '</span>' +
      '<h2 id="panneau-titre">' + O.echapper(carte.talent.nom || T('Mon talent')) + '</h2>' +
      (carte.talent.filRouge ? '<p class="lieu">' + T('Fil rouge : {texte}', { texte: O.echapper(carte.talent.filRouge) }) + '</p>' : '') + '</div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>' +
      '<div class="panneau-corps"><section class="panneau-section"><h3><i data-lucide="map"></i> ' + T('Ton territoire') + '</h3>' +
      '<ul class="bilan">' + S.STATUTS.filter((s) => compte[s]).map((s) => '<li>' + S.LIBELLES_STATUT[s] + '<strong>' + compte[s] + '</strong></li>').join('') + '</ul></section>' +
      '<section class="panneau-section"><h3><i data-lucide="layers"></i> ' + T('Régions') + '</h3><ul class="bilan">' + regions + '</ul></section></div>';
  }

  // ---------- Suggestions ----------

  function teteSuggestions(titre, sousTitre, badge, icone) {
    const pts = CT.hex.coins(0, 0, 26).map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
    return '<header class="panneau-tete" style="--teinte:#FFF1C9">' +
      '<svg class="panneau-hex" viewBox="-30 -30 60 64" aria-hidden="true"><polygon points="' + pts + '" fill="#FFFDF5" stroke="#E9A400" stroke-width="2.5" stroke-dasharray="5 4"/>' +
      O.iconeSvg(icone, 0, 0, 24, '#8A6A2A', 2) + '</svg>' +
      '<div class="panneau-titre"><span class="badge badge-suggestion">' + badge + '</span><h2 id="panneau-titre">' + O.echapper(titre) + '</h2>' +
      '<p class="lieu">' + sousTitre + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>';
  }

  function contenuSuggestions(carte, suggestions) {
    let html = teteSuggestions(T('Territoires à explorer'), T('Des idées proches de ce que tu vis déjà. Prends ce qui te parle, laisse le reste.'), T('Suggestions'), 'lightbulb') +
      '<div class="panneau-corps"><section class="panneau-section">';
    if (!suggestions.length) {
      html += '<p class="vide">' + T('Tu as fait le tour des suggestions pour l\'instant. La bibliothèque ci-dessous en garde d\'autres.') + '</p>';
    } else {
      html += '<p class="discret">' + T('Elles apparaissent en pointillés dorés sur ta carte, à l\'endroit où elles se poseraient.') + '</p><ul class="suggestions">' +
        suggestions.map((p) => '<li class="suggestion">' +
          '<button type="button" class="suggestion-nom" data-action="voir-suggestion" data-valeur="' + O.echapper(p.entree.id) + '">' +
          '<i data-lucide="' + O.echapper(p.entree.icone) + '"></i><span><strong>' + O.echapper(p.entree.nom) + '</strong>' +
          '<span class="discret">' + O.echapper(p.raison) + '</span></span></button>' +
          '<div class="suggestion-actions"><button type="button" class="bouton bouton-principal bouton-compact" data-action="accepter" data-valeur="' + O.echapper(p.entree.id) + '">' +
          '<i data-lucide="plus"></i>' + T('Ajouter') + '</button>' +
          '<button type="button" class="bouton-lien bouton-lien-discret" data-action="refuser" data-valeur="' + O.echapper(p.entree.id) + '">' + T('Pas pour moi') + '</button></div></li>').join('') + '</ul>';
    }
    html += '</section>' +
      '<section class="panneau-section"><h3><i data-lucide="pencil"></i> ' + T('Ton idée à toi') + '</h3>' +
      '<form class="idee" data-form="idee"><label class="visuellement-cache" for="idee-nom">' + T('Nom de la compétence') + '</label>' +
      '<input type="text" id="idee-nom" name="nom" maxlength="60" placeholder="' + O.echapper(T('Ex. : Animer un podcast en direct')) + '" autocomplete="off">' +
      '<button type="submit" class="bouton bouton-secondaire bouton-compact"><i data-lucide="plus"></i>' + T('Ajouter') + '</button></form>' +
      '<p class="discret">' + T('Elle rejoint tes territoires à conquérir. Tu pourras ajuster sa région dans son panneau.') + '</p></section>' +
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
    return '<section class="panneau-section"><h3><i data-lucide="library"></i> ' + T('Toute la bibliothèque') + '</h3>' +
      domaines.map((d) => '<details class="domaine"><summary><span class="pastille-couleur" style="background:' + S.DOMAINES[d].couleur + '"></span>' +
        S.DOMAINES[d].nom + '<span class="discret">' + parDomaine[d].length + '</span></summary><ul>' +
        parDomaine[d].map((x) => '<li><i data-lucide="' + O.echapper(x.icone) + '"></i><span>' + O.echapper(x.nom) + '</span>' +
          '<button type="button" class="bouton-lien" data-action="accepter" data-valeur="' + O.echapper(x.id) + '">' + T('Ajouter') + '</button></li>').join('') +
        '</ul></details>').join('') + '</section>';
  }

  function contenuSuggestion(p) {
    return teteSuggestions(p.entree.nom, O.echapper(p.raison), T('Suggestion'), p.entree.icone) +
      '<div class="panneau-corps"><section class="panneau-section">' +
      '<p>' + T('Si ce territoire t\'attire, ajoute-le à ta carte. Sinon, laisse-le : il ne te sera plus proposé.') + '</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" data-action="accepter" data-valeur="' + O.echapper(p.entree.id) + '">' +
      '<i data-lucide="plus"></i>' + T('Ajouter à mes territoires à conquérir') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="accepter-frontiere" data-valeur="' + O.echapper(p.entree.id) + '">' +
      '<i data-lucide="mountain"></i>' + T('Je le travaille déjà : frontière') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="refuser" data-valeur="' + O.echapper(p.entree.id) + '">' + T('Pas pour moi') + '</button></div>' +
      '<button type="button" class="bouton-lien" data-action="retour-suggestions"><i data-lucide="arrow-left"></i>' + T('Toutes les suggestions') + '</button>' +
      '</section></div>';
  }

  // Terre à découvrir : fiche de la compétence, pistes qu'elle fait avancer, et les choix.
  function contenuHorizon(carte, e) {
    const f = CT.orientation.fiche(carte, e.id);
    const pistes = CT.orientation.pistesPour(carte, e.id, 3);
    const id = O.echapper(e.id);
    return teteSuggestions(e.nom, O.echapper(S.DOMAINES[e.domaine].nom), T('Terre à découvrir'), e.icone) +
      '<div class="panneau-corps"><section class="panneau-section">' +
      '<p><i data-lucide="clock"></i>' + O.echapper(T('Temps estimé : {duree}', { duree: T(f.duree.libelle) })) + '</p>' +
      '<p><i data-lucide="gauge"></i>' + O.echapper(T('Pour toi : {niveau}', { niveau: f.facilite.libelle })) + ' <span class="discret">' + O.echapper(f.facilite.raison) + '</span></p>' +
      '<h3 class="sous-titre">' + T('Pour commencer') + '</h3><ol class="premieres-actions">' + f.actions.map((a) => '<li>' + O.echapper(a) + '</li>').join('') + '</ol>' +
      '<h3 class="sous-titre">' + T('Pistes que ça fait avancer') + '</h3>' +
      (pistes.length ? '<ul>' + pistes.map((x) => '<li>' + O.echapper(T('{piste} : {pct} % (+{gain} %)', { piste: x.piste.nom, pct: x.pourcentage, gain: x.gain })) + '</li>').join('') + '</ul>'
        : '<p class="discret">' + T('Aucune piste ne la demande pour l\'instant : c\'est une envie, et c\'est une très bonne raison.') + '</p>') +
      '<div class="actions">' +
      '<button type="button" class="bouton bouton-principal" data-action="horizon-plan" data-valeur="' + id + '"><i data-lucide="rocket"></i>' + T('Me lancer sur 30 jours') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="horizon-deja" data-valeur="' + id + '"><i data-lucide="check"></i>' + T('Je l\'ai déjà') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="horizon-plus-tard" data-valeur="' + id + '">' + T('Plus tard (à conquérir)') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="refuser" data-valeur="' + id + '">' + T('Pas pour moi') + '</button></div>' +
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
        } else if (id.startsWith('hor:')) {
          const tuile = (contexte && contexte.horizon ? contexte.horizon() : []).find((t) => t.id === id);
          const e = tuile && CT.bibliotheque.trouver(tuile.entreeId);
          if (!e) { this.fermer(); return; }
          html = contenuHorizon(carte, e);
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
