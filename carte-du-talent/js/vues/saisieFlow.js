/*
 * Saisie express d'un moment de flow (objectif : moins de 30 secondes, d'abord au pouce).
 * Choix des compétences (recherche + récentes), trois curseurs, découpage flow / à déléguer,
 * note facultative. Le formulaire renvoie une saisie brute ; l'application l'enregistre.
 */
(function (CT) {
  'use strict';

  const O = CT.outils;

  const CURSEURS = [
    ['intensite', 'Intensité', 'Quelle force avait ce moment ?', ['Léger', 'Agréable', 'Prenant', 'Intense', 'Total']],
    ['defi', 'Défi', 'À quel point c\'était exigeant ?', ['Très facile', 'Facile', 'Juste bien', 'Exigeant', 'Très exigeant']],
    ['maitrise', 'Maîtrise', 'À quel point tu te sentais à l\'aise ?', ['Je débute', 'Je tâtonne', 'À l\'aise', 'Solide', 'Expert']]
  ];

  function couleurPuce(c, carte) {
    return CT.vueCarte.couleurDe(c, carte);
  }

  function puce(c, carte, action, selectionnee) {
    return '<button type="button" class="puce-competence' + (selectionnee ? ' choisie' : '') + '" data-action="' + action +
      '" data-id="' + O.echapper(c.id) + '" aria-pressed="' + Boolean(selectionnee) + '">' +
      '<span class="pastille-couleur" style="background:' + couleurPuce(c, carte) + '"></span>' +
      '<i data-lucide="' + O.echapper(c.icone) + '"></i><span class="libelle">' + O.echapper(c.nom) + '</span>' +
      (action === 'retirer' ? '<i data-lucide="x" class="retirer"></i>' : '') + '</button>';
  }

  // Champ de recherche avec puces choisies et liste de résultats.
  function creerSelecteur(racine, options) {
    const choisis = [];
    let texte = '';

    racine.innerHTML =
      '<div class="selection" aria-live="polite"></div>' +
      '<div class="recherche"><i data-lucide="search"></i><input type="search" autocomplete="off" enterkeyhint="done" placeholder="' +
      O.echapper(options.placeholder) + '" aria-label="' + O.echapper(options.placeholder) + '"></div>' +
      '<div class="resultats" role="listbox"></div>' +
      (options.avecRecentes ? '<div class="recentes"></div>' : '');
    const champ = racine.querySelector('input');
    const zoneSelection = racine.querySelector('.selection');
    const zoneResultats = racine.querySelector('.resultats');
    const zoneRecentes = racine.querySelector('.recentes');

    function rendre() {
      const carte = options.carte();
      zoneSelection.innerHTML = choisis.map((id) => CT.regles.trouver(carte, id)).filter(Boolean)
        .map((c) => puce(c, carte, 'retirer', true)).join('');
      if (texte) {
        const exclus = choisis.concat(options.exclure ? options.exclure() : []);
        const trouves = CT.regles.rechercher(carte, texte, exclus).slice(0, 6);
        const exact = carte.competences.some((c) => CT.regles.normaliserTexte(c.nom) === CT.regles.normaliserTexte(texte));
        zoneResultats.innerHTML = trouves.map((c) => puce(c, carte, 'choisir', false)).join('') +
          (exact ? '' : '<button type="button" class="puce-competence puce-creer" data-action="creer"><i data-lucide="plus"></i>' +
            '<span class="libelle">Ajouter « ' + O.echapper(texte.trim()) + ' » à ma carte</span></button>');
      } else {
        zoneResultats.innerHTML = '';
      }
      if (zoneRecentes) {
        const { recentes, suggestions } = CT.regles.competencesRecentes(carte, 8);
        const bloc = (titre, ids) => {
          const libres = ids.filter((id) => !choisis.includes(id));
          return libres.length ? '<p class="sous-titre">' + titre + '</p><div class="puces">' +
            libres.map((id) => puce(CT.regles.trouver(carte, id), carte, 'choisir', false)).join('') + '</div>' : '';
        };
        zoneRecentes.innerHTML = texte ? '' : bloc('Récemment', recentes) + bloc(recentes.length ? 'Tes frontières' : 'Pour commencer : tes frontières', suggestions);
      }
      O.rafraichirIcones(racine);
      if (options.surChangement) options.surChangement(choisis.slice());
    }

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-action]');
      if (!b) return;
      const action = b.getAttribute('data-action');
      if (action === 'choisir') {
        choisis.push(b.getAttribute('data-id'));
        texte = '';
        champ.value = '';
      } else if (action === 'retirer') {
        choisis.splice(choisis.indexOf(b.getAttribute('data-id')), 1);
      } else if (action === 'creer') {
        const c = options.creer(texte.trim());
        if (c && !choisis.includes(c.id)) choisis.push(c.id);
        texte = '';
        champ.value = '';
      }
      rendre();
    });
    champ.addEventListener('input', () => { texte = champ.value; rendre(); });
    champ.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const premier = zoneResultats.querySelector('button[data-action]');
      if (premier) premier.click();
    });

    return {
      get valeurs() { return choisis.slice(); },
      definir(ids) { choisis.splice(0, choisis.length, ...ids); texte = ''; champ.value = ''; rendre(); },
      champ
    };
  }

  function creer(racine, rappels) {
    let ouvert = false;
    let dernierFocus = null;

    const maintenant = () => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    racine.innerHTML =
      '<div class="flow-fond" data-action="fermer"></div>' +
      '<form class="flow-fiche" role="dialog" aria-modal="true" aria-labelledby="flow-titre" novalidate>' +
        '<header class="flow-tete"><div><p class="surtitre"><i data-lucide="waves"></i> Moment de flow</p>' +
        '<h2 id="flow-titre">Qu\'est-ce qui t\'a mis dans le flow ?</h2></div>' +
        '<button type="button" class="fermer" data-action="fermer" aria-label="Fermer"><i data-lucide="x"></i></button></header>' +
        '<div class="flow-corps">' +
          '<section class="flow-bloc"><div id="flow-competences"></div></section>' +
          '<section class="flow-bloc flow-curseurs">' + CURSEURS.map(([cle, nom, aide, niveaux]) =>
            '<div class="curseur"><div class="curseur-tete"><label for="flow-' + cle + '">' + nom + '</label>' +
            '<output id="flow-' + cle + '-valeur" for="flow-' + cle + '">' + niveaux[2] + '</output></div>' +
            '<input type="range" id="flow-' + cle + '" name="' + cle + '" min="1" max="5" step="1" value="3" aria-describedby="flow-' + cle + '-aide">' +
            '<p class="aide" id="flow-' + cle + '-aide">' + aide + '</p></div>').join('') +
            '<p class="observation" id="flow-observation" aria-live="polite"></p>' +
          '</section>' +
          '<section class="flow-bloc">' +
            '<button type="button" class="depliant" data-action="deplier" data-cible="flow-deleguer" aria-expanded="false">' +
            '<i data-lucide="scissors"></i><span>Une partie de cette activité est à déléguer ?</span><i data-lucide="chevron-down" class="chevron"></i></button>' +
            '<div id="flow-deleguer" class="deplie" hidden>' +
              '<p class="aide">Par exemple : concevoir le message t\'a mis dans le flow, le rédiger beaucoup moins.</p>' +
              '<div id="flow-parties"></div>' +
              '<label class="case"><input type="checkbox" id="flow-ranger"> <span>Les ranger aussi dans ma zone à déléguer</span></label>' +
            '</div>' +
          '</section>' +
          '<section class="flow-bloc flow-details">' +
            '<label class="champ"><span>Note (facultative)</span><input type="text" id="flow-note" maxlength="280" placeholder="Un mot pour t\'en souvenir"></label>' +
            '<label class="champ champ-date"><span>Quand ?</span><input type="datetime-local" id="flow-date"></label>' +
          '</section>' +
        '</div>' +
        '<footer class="flow-pied"><p class="flow-manque" id="flow-manque">Choisis au moins une compétence.</p>' +
        '<button type="submit" class="bouton bouton-principal" id="flow-enregistrer" disabled><i data-lucide="check"></i>Enregistrer ce moment</button></footer>' +
      '</form>';

    const $ = (sel) => racine.querySelector(sel);
    // Le brouillard garde ses secrets : pas de territoire inexploré dans les résultats.
    const caches = () => rappels.carte().competences.filter((c) => CT.regles.estCache(rappels.carte(), c)).map((c) => c.id);
    const enregistrer = $('#flow-enregistrer');

    const selecteur = creerSelecteur($('#flow-competences'), {
      placeholder: 'Chercher une compétence…',
      avecRecentes: true,
      carte: rappels.carte,
      creer: (nom) => rappels.creerCompetence(nom, 'frontiere'),
      exclure: () => parties.valeurs.concat(caches()),
      surChangement(ids) {
        enregistrer.disabled = ids.length === 0;
        $('#flow-manque').hidden = ids.length > 0;
      }
    });
    const parties = creerSelecteur($('#flow-parties'), {
      placeholder: 'Quelle partie ? (ex. rédaction)',
      carte: rappels.carte,
      creer: (nom) => rappels.creerCompetence(nom, 'a_deleguer'),
      exclure: () => selecteur.valeurs.concat(caches())
    });

    function majCurseurs() {
      const v = {};
      CURSEURS.forEach(([cle, , , niveaux]) => {
        v[cle] = Number($('#flow-' + cle).value);
        $('#flow-' + cle + '-valeur').textContent = niveaux[v[cle] - 1];
        $('#flow-' + cle).style.setProperty('--remplissage', ((v[cle] - 1) / 4 * 100) + '%');
      });
      let obs = '';
      if (v.defi >= 4 && v.maitrise >= 4) obs = 'Défi et maîtrise élevés : la zone de flow par excellence.';
      else if (v.defi >= 4 && v.maitrise <= 2) obs = 'Beaucoup de défi pour ta maîtrise actuelle : un terrain où tu grandis.';
      else if (v.defi <= 2 && v.maitrise >= 4) obs = 'Peu de défi pour ta maîtrise : un moment fluide et ressourçant.';
      $('#flow-observation').textContent = obs;
    }

    racine.addEventListener('input', (e) => { if (e.target.type === 'range') majCurseurs(); });
    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) return;
      const action = b.getAttribute('data-action');
      if (action === 'fermer') fermer();
      if (action === 'deplier') {
        const cible = $('#' + b.getAttribute('data-cible'));
        cible.hidden = !cible.hidden;
        b.setAttribute('aria-expanded', String(!cible.hidden));
      }
    });
    racine.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } });
    $('form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selecteur.valeurs.length) return;
      const saisie = {
        competenceIds: selecteur.valeurs,
        intensite: $('#flow-intensite').value,
        defi: $('#flow-defi').value,
        maitrise: $('#flow-maitrise').value,
        note: $('#flow-note').value,
        date: $('#flow-date').value ? new Date($('#flow-date').value).toISOString() : null,
        partiesADeleguer: parties.valeurs,
        rangerADeleguer: $('#flow-ranger').checked
      };
      fermer();
      rappels.enregistrer(saisie);
    });

    function ouvrir(idsDepart) {
      selecteur.definir(idsDepart || []);
      parties.definir([]);
      CURSEURS.forEach(([cle]) => { $('#flow-' + cle).value = 3; });
      $('#flow-note').value = '';
      $('#flow-ranger').checked = false;
      $('#flow-date').value = maintenant();
      $('#flow-date').max = maintenant();
      $('#flow-deleguer').hidden = true;
      $('[data-cible="flow-deleguer"]').setAttribute('aria-expanded', 'false');
      majCurseurs();
      dernierFocus = document.activeElement;
      racine.hidden = false;
      ouvert = true;
      document.body.classList.add('flow-ouvert');
      requestAnimationFrame(() => racine.classList.add('visible'));
      $('.flow-corps').scrollTop = 0;
      // Sur ordinateur on peut taper tout de suite ; sur téléphone on évite d'ouvrir le clavier.
      const tactile = window.matchMedia('(pointer: coarse)').matches;
      (tactile ? $('.flow-fiche .fermer') : selecteur.champ).focus({ preventScroll: true });
    }

    function fermer() {
      if (!ouvert) return;
      ouvert = false;
      racine.classList.remove('visible');
      document.body.classList.remove('flow-ouvert');
      setTimeout(() => { if (!ouvert) racine.hidden = true; }, 250);
      if (dernierFocus && dernierFocus.focus) dernierFocus.focus({ preventScroll: true });
    }

    O.rafraichirIcones(racine);
    return { ouvrir, fermer, get ouvert() { return ouvert; } };
  }

  CT.vueSaisieFlow = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
