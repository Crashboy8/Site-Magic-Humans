/*
 * Création guidée de la carte : accueil, 6 questions (une par écran, réponses en vrac),
 * filtre « Est-ce que ça élargit ton domaine d'action ? », regroupement par glisser-déposer.
 * Le brouillon est enregistré à chaque changement.
 */
(function (CT) {
  'use strict';

  const O = CT.outils;
  const C = CT.creation;

  const QUESTIONS = {
    2: {
      liste: 'regions',
      titre: 'Quels sont tes sous-talents ?',
      aide: 'Les grandes facettes de ton talent. Elles deviendront les régions de ta carte. Trois à six, c\'est souvent bien.',
      placeholder: 'Ex. : Transmettre',
      exemples: ['Accueillir', 'Fédérer', 'Transmettre', 'Révéler les gens', 'Mettre en scène', 'Dynamiser']
    },
    3: {
      liste: 'moments',
      titre: 'Quels sont tes moments de flow récents ?',
      aide: 'Ces moments où tu oublies l\'heure. Note-les en vrac : tu les rangeras dans tes régions à la fin. Ceux qui sont hors de ton talent deviendront des îles.',
      placeholder: 'Ex. : Animer un atelier',
      exemples: ['Animer un atelier', 'Coacher quelqu\'un', 'Improviser sur scène', 'Danser', 'Jongler']
    },
    4: {
      liste: 'conquises',
      titre: 'Qu\'as-tu appris et maîtrises-tu aujourd\'hui ?',
      aide: 'Pour chacun, indique si c\'est proche de ton talent ou plus éloigné (comme Excel ou une langue).',
      placeholder: 'Ex. : Anglais',
      exemples: ['Anglais', 'Excel', 'Préparer une formation', 'Chanter', 'Gérer un budget']
    },
    5: {
      liste: 'frontieres',
      titre: 'Qu\'est-ce qui te donne envie, juste à côté ?',
      aide: 'Ce que tu apprends en ce moment, ou que tu aimerais apprendre. Ce seront tes frontières.',
      placeholder: 'Ex. : Vente',
      exemples: ['Vente', 'Réseaux sociaux', 'Podcast', 'Arts martiaux']
    },
    6: {
      liste: 'deleguer',
      titre: 'Qu\'est-ce qui te vide et que tu repousses ?',
      aide: 'Aucune honte à ça : ce sont des tâches que tu peux confier à d\'autres. Elles iront dans une zone à part.',
      placeholder: 'Ex. : Comptabilité',
      exemples: ['Comptabilité', 'Administratif', 'Montage vidéo', 'Rédaction']
    }
  };

  const LIBELLE_TYPE = { moments: 'flow', conquises: 'appris', frontieres: 'envie' };

  function creer(racine, rappels) {
    let brouillon = null;
    let accueil = false;
    let ouvert = false;
    let selection = null; // { liste, id } en mode « toucher puis poser »

    function enregistrer() {
      CT.stockage.sauvegarderBrouillon(brouillon);
    }

    // ---------- Écrans ----------

    function tete(etape) {
      const question = etape <= 6;
      const libelle = question ? 'Question ' + etape + ' sur 6' : etape === 7 ? 'Presque fini : le filtre' : 'Dernière étape : le regroupement';
      const avance = Math.round(Math.min(etape, 8) / 8 * 100);
      return '<header class="creation-tete"><div class="creation-progression"><span class="surtitre"><i data-lucide="map"></i> Créer ma carte · ' + libelle + '</span>' +
        '<div class="barre-progression" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + avance + '" aria-label="Avancement"><span style="width:' + avance + '%"></span></div></div>' +
        '<button type="button" class="fermer" data-action="quitter" aria-label="Quitter (ta saisie est gardée)" title="Quitter : ta saisie est gardée"><i data-lucide="x"></i></button></header>';
    }

    function pied(etape, peutContinuer, libelleSuite) {
      return '<footer class="creation-pied">' +
        (etape > 1 ? '<button type="button" class="bouton-lien" data-action="retour"><i data-lucide="arrow-left"></i>Retour</button>' : '<span></span>') +
        '<button type="button" class="bouton bouton-principal" data-action="suite"' + (peutContinuer ? '' : ' disabled') + '>' +
        (libelleSuite || 'Continuer') + '<i data-lucide="arrow-right"></i></button></footer>';
    }

    function ecranAccueil() {
      const enCours = CT.stockage.chargerBrouillon();
      const reprendre = enCours && (enCours.talent.nom || enCours.regions.length);
      return '<div class="creation-accueil"><div class="accueil-hex" aria-hidden="true">' + hexDecor() + '</div>' +
        '<h1>Bienvenue sur ta Carte du Talent</h1>' +
        '<p>Ta carte montre ton talent comme un territoire : un cœur, des régions, des frontières que tu repousses, des îles où tu te ressources. ' +
        'Six questions suffisent pour la dessiner. Compte une dizaine de minutes.</p>' +
        '<div class="accueil-actions">' +
        (reprendre
          ? '<button type="button" class="bouton bouton-principal" data-action="reprendre"><i data-lucide="play"></i>Reprendre ma carte (' + (enCours.etape > 6 ? 'dernière étape' : 'question ' + enCours.etape) + ')</button>' +
            '<button type="button" class="bouton bouton-secondaire" data-action="recommencer"><i data-lucide="rotate-ccw"></i>Recommencer de zéro</button>'
          : '<button type="button" class="bouton bouton-principal" data-action="commencer"><i data-lucide="sparkles"></i>Créer ma carte</button>') +
        '<button type="button" class="bouton bouton-secondaire" data-action="demo"><i data-lucide="eye"></i>Explorer la carte de démonstration</button>' +
        '</div><p class="discret">Tout reste dans ce navigateur. Tu pourras exporter ta carte à tout moment.</p></div>';
    }

    function hexDecor() {
      const couleurs = ['#F2A65A', '#5DB88A', '#9A8CDB', '#E5738E', '#F2C53D', '#6FB7D6', '#F4C95D'];
      const centres = [[0, 0], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
      return '<svg viewBox="-110 -100 220 200">' + centres.map(([q, r], i) => {
        const p = CT.hex.versPixel(q, r, 34);
        return '<polygon points="' + CT.hex.coins(p.x, p.y, 31).map((c) => c.x.toFixed(1) + ',' + c.y.toFixed(1)).join(' ') + '" fill="' + couleurs[(i + 6) % 7] + '"/>';
      }).join('') + '</svg>';
    }

    function ecranTalent() {
      return '<div class="creation-question"><h2 id="creation-titre">Quel est ton talent ?</h2>' +
        '<p class="aide-question">Une phrase qui dit ce que tu fais naturellement, mieux que la plupart des gens, et qui te donne de l\'énergie.</p>' +
        '<label class="champ champ-grand"><span>Ton talent</span><input type="text" id="creation-talent" maxlength="120" value="' + O.echapper(brouillon.talent.nom) +
        '" placeholder="Ex. : Créer des dynamiques humaines positives" autocomplete="off"></label>' +
        '<label class="champ champ-grand"><span>Le fil rouge qui relie tout (facultatif)</span><input type="text" id="creation-fil" maxlength="160" value="' +
        O.echapper(brouillon.talent.filRouge) + '" placeholder="Ex. : la mise en scène des échanges humains" autocomplete="off"></label>' +
        '<p class="discret">Pas besoin que ce soit parfait. Tu pourras y revenir plus tard.</p></div>';
    }

    function ecranListe(etape) {
      const q = QUESTIONS[etape];
      const elements = brouillon[q.liste];
      const nomDe = (x) => x.texte || x.nom;
      const deja = new Set(elements.map((x) => CT.regles.normaliserTexte(nomDe(x))));
      const exemples = q.exemples.filter((e) => !deja.has(CT.regles.normaliserTexte(e)));
      let liste;
      if (q.liste === 'conquises') {
        liste = '<ul class="lignes">' + elements.map((x) => '<li><span class="ligne-nom">' + O.echapper(x.texte) + '</span>' +
          '<span class="segments segments-compacts" role="group" aria-label="Distance au talent de ' + O.echapper(x.texte) + '">' +
          [['proche', 'Proche'], ['eloignee', 'Éloigné']].map(([v, l]) => '<button type="button" data-action="distance" data-id="' + x.id + '" data-valeur="' + v +
            '" aria-pressed="' + (x.distance === v) + '">' + l + '</button>').join('') + '</span>' +
          '<button type="button" class="retirer-element" data-action="retirer" data-id="' + x.id + '" aria-label="Retirer ' + O.echapper(x.texte) + '"><i data-lucide="x"></i></button></li>').join('') + '</ul>';
      } else {
        liste = '<ul class="puces-saisie">' + elements.map((x) => '<li' + (q.liste === 'regions' ? ' style="--couleur:' + x.couleur + '"' : '') + '>' +
          (q.liste === 'regions' ? '<span class="pastille-couleur" style="background:' + x.couleur + '"></span>' : '') + O.echapper(nomDe(x)) +
          '<button type="button" data-action="retirer" data-id="' + x.id + '" aria-label="Retirer ' + O.echapper(nomDe(x)) + '"><i data-lucide="x"></i></button></li>').join('') + '</ul>';
      }
      const plein = q.liste === 'regions' && elements.length >= C.MAX_REGIONS;
      return '<div class="creation-question"><h2 id="creation-titre">' + q.titre + '</h2><p class="aide-question">' + q.aide + '</p>' +
        '<form class="saisie-vrac" data-form="vrac"><label class="visuellement-cache" for="creation-saisie">' + O.echapper(q.titre) + '</label>' +
        '<input type="text" id="creation-saisie" autocomplete="off" enterkeyhint="enter" placeholder="' + O.echapper(q.placeholder) + '"' + (plein ? ' disabled' : '') + '>' +
        '<button type="submit" class="bouton bouton-secondaire"' + (plein ? ' disabled' : '') + '><i data-lucide="plus"></i>Ajouter</button></form>' +
        '<p class="discret">Tu peux en écrire plusieurs d\'un coup, séparés par des virgules.' + (plein ? ' Huit régions au maximum.' : '') + '</p>' +
        liste +
        (exemples.length && !plein ? '<div class="exemples"><span class="discret">Exemples :</span>' + exemples.map((e) =>
          '<button type="button" class="puce-exemple" data-action="exemple" data-valeur="' + O.echapper(e) + '"><i data-lucide="plus"></i>' + O.echapper(e) + '</button>').join('') + '</div>' : '') +
        '</div>';
    }

    function ecranFiltre() {
      return '<div class="creation-question"><h2 id="creation-titre">Est-ce que ça élargit ton domaine d\'action ?</h2>' +
        '<p class="aide-question">Conduire ou faire du vélo, c\'est utile, mais ça n\'élargit pas vraiment ton terrain de jeu. Garde ce qui ouvre de nouvelles possibilités.</p>' +
        '<ul class="lignes">' + brouillon.conquises.map((x) => '<li class="' + (x.elargit === false ? 'ecarte' : '') + '"><span class="ligne-nom">' + O.echapper(x.texte) + '</span>' +
          '<span class="segments segments-compacts" role="group" aria-label="' + O.echapper(x.texte) + ' élargit-il ton domaine d\'action ?">' +
          [[true, 'Oui'], [false, 'Non']].map(([v, l]) => '<button type="button" data-action="elargit" data-id="' + x.id + '" data-valeur="' + v +
            '" aria-pressed="' + ((x.elargit !== false) === v) + '">' + l + '</button>').join('') + '</span></li>').join('') + '</ul>' +
        '<p class="discret">Ce que tu marques « Non » ne sera pas mis sur ta carte.</p></div>';
    }

    function carteElement(liste, el) {
      const choisi = selection && selection.id === el.id;
      return '<button type="button" class="element' + (choisi ? ' choisi' : '') + '" data-liste="' + liste + '" data-id="' + el.id + '" aria-pressed="' + choisi + '">' +
        '<span class="element-type type-' + liste + '">' + LIBELLE_TYPE[liste] + '</span>' + O.echapper(el.texte) + '</button>';
    }

    function ecranRegroupement() {
      const items = C.aRanger(brouillon);
      const zone = (id, titre, couleur, icone, aide) => {
        const dedans = items.filter((x) => (x.el.zone || null) === id);
        return '<section class="zone' + (id === null ? ' zone-a-ranger' : '') + (selection ? ' zone-active' : '') + '" data-zone="' + (id === null ? '' : id) + '"' +
          (couleur ? ' style="--couleur:' + couleur + '"' : '') + '>' +
          '<header class="zone-tete">' + (icone ? '<i data-lucide="' + icone + '"></i>' : '') + '<span>' + O.echapper(titre) + '</span>' +
          (selection && id !== null ? '<button type="button" class="poser-ici" data-action="poser" data-zone="' + id + '">Poser ici</button>' : '') + '</header>' +
          (aide ? '<p class="discret">' + aide + '</p>' : '') +
          '<div class="zone-elements">' + (dedans.length ? dedans.map((x) => carteElement(x.liste, x.el)).join('') : '<span class="zone-vide">' + (id === null ? 'Tout est rangé.' : 'Glisse un élément ici') + '</span>') + '</div></section>';
      };
      return '<div class="creation-question creation-large"><h2 id="creation-titre">Range chaque élément dans sa région</h2>' +
        '<p class="aide-question">Glisse-le dans la région qu\'il nourrit. Sur téléphone, touche un élément puis « Poser ici ». ' +
        'Ce qui est hors de ton talent va sur une île.</p>' +
        zone(null, 'À ranger', null, 'inbox', items.some((x) => !x.el.zone) ? 'Ce qui reste ici rejoindra ta première région ; tu pourras l\'ajuster sur la carte.' : '') +
        '<div class="zones">' + brouillon.regions.map((r) => zone(r.id, r.nom, r.couleur, r.icone)).join('') +
        zone('ile', 'Hors de mon talent : île de flow', '#7DCDAE', 'palmtree') + '</div></div>';
    }

    function rendre() {
      if (!ouvert) return;
      let html;
      if (accueil) html = ecranAccueil();
      else {
        const e = brouillon.etape;
        let corps;
        let peut = true;
        let suite = null;
        if (e === 1) { corps = ecranTalent(); peut = Boolean(brouillon.talent.nom.trim()); }
        else if (e <= 6) {
          corps = ecranListe(e);
          if (e === 2) peut = brouillon.regions.length > 0;
          if (e === 6) suite = 'Continuer';
        } else if (e === 7) corps = ecranFiltre();
        else { corps = ecranRegroupement(); suite = 'Créer ma carte'; }
        html = tete(e) + '<div class="creation-corps">' + corps + '</div>' + pied(e, peut, suite);
      }
      const focusId = document.activeElement && racine.contains(document.activeElement) ? document.activeElement.id : null;
      racine.innerHTML = '<div class="creation-page" role="dialog" aria-modal="true" aria-labelledby="creation-titre">' + html + '</div>';
      O.rafraichirIcones(racine);
      if (focusId && racine.querySelector('#' + focusId)) racine.querySelector('#' + focusId).focus();
    }

    // ---------- Navigation entre écrans ----------

    function prochaine(e) {
      if (e === 6 && !brouillon.conquises.length) return C.aRanger(brouillon).length ? 8 : 9;
      if (e === 7 && !C.aRanger(brouillon).length) return 9;
      return e + 1;
    }

    function precedente(e) {
      if (e === 8 && !brouillon.conquises.length) return 6;
      return e - 1;
    }

    function aller(e) {
      if (e >= 9) { terminer(); return; }
      brouillon.etape = Math.max(1, e);
      selection = null;
      enregistrer();
      rendre();
      const corps = racine.querySelector('.creation-corps');
      if (corps) corps.scrollTop = 0;
      const champ = racine.querySelector('#creation-talent, #creation-saisie');
      if (champ && !window.matchMedia('(pointer: coarse)').matches) champ.focus();
    }

    function terminer() {
      const carte = C.genererCarte(brouillon);
      if (rappels.terminer(carte)) {
        CT.stockage.effacerBrouillon();
        fermer();
      }
    }

    // ---------- Événements ----------

    racine.addEventListener('input', (e) => {
      if (e.target.id === 'creation-talent') {
        brouillon.talent.nom = e.target.value;
        racine.querySelector('[data-action="suite"]').disabled = !e.target.value.trim();
        enregistrer();
      }
      if (e.target.id === 'creation-fil') { brouillon.talent.filRouge = e.target.value; enregistrer(); }
    });

    racine.addEventListener('submit', (e) => {
      e.preventDefault();
      const champ = racine.querySelector('#creation-saisie');
      const q = QUESTIONS[brouillon.etape];
      if (!champ || !q || !champ.value.trim()) return;
      C.ajouter(brouillon, q.liste, champ.value);
      champ.value = '';
      enregistrer();
      rendre();
      const nouveau = racine.querySelector('#creation-saisie');
      if (nouveau) nouveau.focus();
    });

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) {
        const zone = e.target.closest('.zone');
        if (zone && selection && !e.target.closest('.element')) poser(selection, zone.dataset.zone);
        return;
      }
      const action = b.getAttribute('data-action');
      const id = b.getAttribute('data-id');
      const valeur = b.getAttribute('data-valeur');
      const q = QUESTIONS[brouillon && brouillon.etape];
      if (action === 'commencer' || action === 'recommencer') {
        if (action === 'recommencer' && !rappels.confirmer('Recommencer de zéro ? Tes réponses en cours seront effacées.')) return;
        brouillon = C.nouveauBrouillon(); accueil = false; aller(1); return;
      }
      if (action === 'reprendre') { brouillon = CT.stockage.chargerBrouillon() || C.nouveauBrouillon(); accueil = false; aller(Math.min(brouillon.etape, 8)); return; }
      if (action === 'demo') { fermer(); rappels.demo(); return; }
      if (action === 'quitter') {
        if (rappels.doitAccueillir()) { accueil = true; rendre(); } else fermer();
        rappels.toast('Ta saisie est gardée : tu pourras reprendre depuis les Réglages.');
        return;
      }
      if (action === 'suite') { aller(prochaine(brouillon.etape)); return; }
      if (action === 'retour') { aller(precedente(brouillon.etape)); return; }
      if (action === 'exemple' && q) { C.ajouter(brouillon, q.liste, valeur); enregistrer(); rendre(); return; }
      if (action === 'retirer' && q) { C.retirer(brouillon, q.liste, id); enregistrer(); rendre(); return; }
      if (action === 'distance') { const x = brouillon.conquises.find((c) => c.id === id); if (x) x.distance = valeur; enregistrer(); rendre(); return; }
      if (action === 'elargit') { const x = brouillon.conquises.find((c) => c.id === id); if (x) x.elargit = valeur === 'true'; enregistrer(); rendre(); return; }
      if (action === 'poser' && selection) { poser(selection, b.getAttribute('data-zone')); }
    });

    function poser(cible, zone) {
      C.ranger(brouillon, cible.liste, cible.id, zone === '' ? null : zone);
      selection = null;
      enregistrer();
      rendre();
    }

    // Regroupement : toucher un élément puis sa zone, ou le faire glisser (souris et doigt).
    let glisse = null;

    racine.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.element');
      if (!el || e.button > 0) return;
      glisse = { el, liste: el.dataset.liste, id: el.dataset.id, x: e.clientX, y: e.clientY, actif: false, fantome: null, pointeur: e.pointerId };
    });

    racine.addEventListener('pointermove', (e) => {
      if (!glisse || e.pointerId !== glisse.pointeur) return;
      if (!glisse.actif) {
        if (Math.hypot(e.clientX - glisse.x, e.clientY - glisse.y) < 8) return;
        glisse.actif = true;
        glisse.el.setPointerCapture(e.pointerId);
        const f = glisse.el.cloneNode(true);
        f.classList.add('element-fantome');
        f.style.width = glisse.el.offsetWidth + 'px';
        document.body.appendChild(f);
        glisse.fantome = f;
        glisse.el.classList.add('en-deplacement');
      }
      e.preventDefault();
      glisse.fantome.style.transform = 'translate(' + (e.clientX - 20) + 'px,' + (e.clientY - 20) + 'px)';
      racine.querySelectorAll('.zone.survol').forEach((z) => z.classList.remove('survol'));
      const sous = document.elementFromPoint(e.clientX, e.clientY);
      const zone = sous && sous.closest('.zone');
      if (zone) zone.classList.add('survol');
      // Défilement automatique près des bords.
      const corps = racine.querySelector('.creation-corps');
      const r = corps.getBoundingClientRect();
      if (e.clientY > r.bottom - 50) corps.scrollTop += 12;
      if (e.clientY < r.top + 50) corps.scrollTop -= 12;
    });

    function finGlisse(e, annule) {
      if (!glisse || e.pointerId !== glisse.pointeur) return;
      const g = glisse;
      glisse = null;
      if (!g.actif) {
        // Simple toucher : sélectionner ou désélectionner l'élément.
        if (annule) return;
        selection = selection && selection.id === g.id ? null : { liste: g.liste, id: g.id };
        rendre();
        return;
      }
      g.fantome.remove();
      g.el.classList.remove('en-deplacement');
      const sous = annule ? null : document.elementFromPoint(e.clientX, e.clientY);
      const zone = sous && sous.closest('.zone');
      racine.querySelectorAll('.zone.survol').forEach((z) => z.classList.remove('survol'));
      if (zone) poser({ liste: g.liste, id: g.id }, zone.dataset.zone);
    }

    racine.addEventListener('pointerup', (e) => finGlisse(e, false));
    racine.addEventListener('pointercancel', (e) => finGlisse(e, true));
    // Un clic clavier (Entrée / Espace) sur un élément le sélectionne aussi.
    racine.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (selection) { selection = null; rendre(); }
        return;
      }
      const el = e.target.closest('.element');
      if (el && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        selection = selection && selection.id === el.dataset.id ? null : { liste: el.dataset.liste, id: el.dataset.id };
        rendre();
        const bouton = racine.querySelector('.poser-ici');
        if (bouton) bouton.focus();
      }
    });

    function ouvrir(options) {
      accueil = Boolean(options && options.accueil);
      brouillon = CT.stockage.chargerBrouillon() || C.nouveauBrouillon();
      selection = null;
      ouvert = true;
      racine.hidden = false;
      document.body.classList.add('creation-ouverte');
      if (accueil) rendre(); else aller(Math.min(brouillon.etape, 8));
      requestAnimationFrame(() => racine.classList.add('visible'));
    }

    function fermer() {
      ouvert = false;
      racine.classList.remove('visible');
      document.body.classList.remove('creation-ouverte');
      setTimeout(() => { if (!ouvert) racine.hidden = true; }, 250);
    }

    return { ouvrir, fermer, get ouvert() { return ouvert; } };
  }

  CT.vueCreation = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
