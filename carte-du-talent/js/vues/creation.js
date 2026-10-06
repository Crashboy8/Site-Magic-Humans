/*
 * Création guidée de la carte : accueil, 6 questions (une par écran, réponses en vrac),
 * filtre « Est-ce que ça élargit ton domaine d'action ? », regroupement par glisser-déposer.
 * Le brouillon est enregistré à chaque changement.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;
  const C = CT.creation;

  const QUESTIONS = {
    2: {
      liste: 'regions',
      titre: 'Quels sont tes sous-talents ?',
      aide: 'Les grandes facettes de ton talent. Elles deviendront les régions de ta carte. Trois à six, c\'est souvent bien.',
      placeholder: 'Ex. : Transmettre',
      exemples: ['Accueillir', 'Fédérer', 'Transmettre', 'Révéler les gens', 'Mettre en scène', 'Dynamiser']
    },
    3: {
      liste: 'moments',
      titre: 'Quels sont tes moments de flow récents ?',
      aide: 'Ces moments où tu oublies l\'heure. Note-les en vrac : tu les rangeras dans tes régions à la fin. Ceux qui sont hors de ton talent deviendront des îles.',
      placeholder: 'Ex. : Animer un atelier',
      exemples: ['Animer un atelier', 'Coacher quelqu\'un', 'Improviser sur scène', 'Danser', 'Jongler']
    },
    4: {
      liste: 'conquises',
      titre: 'Qu\'as-tu appris et maîtrises-tu aujourd\'hui ?',
      aide: 'Pour chacun, indique si c\'est proche de ton talent ou plus éloigné (comme Excel ou une langue).',
      placeholder: 'Ex. : Anglais',
      exemples: ['Anglais', 'Excel', 'Préparer une formation', 'Chanter', 'Gérer un budget']
    },
    5: {
      liste: 'frontieres',
      titre: 'Qu\'est-ce qui te donne envie, juste à côté ?',
      aide: 'Ce que tu apprends en ce moment, ou que tu aimerais apprendre. Ce seront tes frontières.',
      placeholder: 'Ex. : Vente',
      exemples: ['Vente', 'Réseaux sociaux', 'Podcast', 'Arts martiaux']
    },
    6: {
      liste: 'deleguer',
      titre: 'Qu\'est-ce qui te vide et que tu repousses ?',
      aide: 'Aucune honte à ça : ce sont des tâches que tu peux confier à d\'autres. Elles iront dans une zone à part.',
      placeholder: 'Ex. : Comptabilité',
      exemples: ['Comptabilité', 'Administratif', 'Montage vidéo', 'Rédaction']
    }
  };

  // Une phrase de la Boussole ajoutée telle quelle : ses virgules ne doivent pas la découper.
  const sansVirgule = (t) => t.replace(/\s*[,;]\s*/g, ' ');

  // Textes des questions, traduits une fois pour toutes.
  Object.values(QUESTIONS).forEach((q) => {
    q.titre = T(q.titre);
    q.aide = T(q.aide);
    q.placeholder = T(q.placeholder);
    q.exemples = q.exemples.map((e) => T(e));
  });

  const LIBELLE_TYPE = { moments: T('flow'), conquises: T('appris'), frontieres: T('envie') };

  function creer(racine, rappels) {
    let brouillon = null;
    let accueil = false;
    let ouvert = false;
    let selection = null; // { liste, id } en mode « toucher puis poser »
    let arrivee = null; // { donnees, carteExistante } : arrivée depuis la Boussole, avant de commencer
    let alerte = ''; // message sous le champ de saisie (élément trop long)
    const voirPlus = {}; // étape → toutes les idées sont affichées

    function enregistrer() {
      CT.stockage.sauvegarderBrouillon(brouillon);
    }

    // ---------- Écrans ----------

    function tete(etape) {
      const question = etape <= 6;
      const libelle = question ? T('Question {n} sur 6', { n: etape }) : etape === 7 ? T('Presque fini : le filtre') : T('Dernière étape : le regroupement');
      const avance = Math.round(Math.min(etape, 8) / 8 * 100);
      return '<header class="creation-tete"><div class="creation-progression"><span class="surtitre"><i data-lucide="map"></i> ' + T('Créer ma carte') + ' · ' + libelle + '</span>' +
        '<div class="barre-progression" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + avance + '" aria-label="' + O.echapper(T('Avancement')) + '"><span style="width:' + avance + '%"></span></div></div>' +
        '<button type="button" class="fermer" data-action="quitter" aria-label="' + O.echapper(T('Quitter (ta saisie est gardée)')) + '" title="' + O.echapper(T('Quitter : ta saisie est gardée')) + '"><i data-lucide="x"></i></button></header>';
    }

    function pied(etape, peutContinuer, libelleSuite) {
      return '<footer class="creation-pied">' +
        (etape > 1 ? '<button type="button" class="bouton-lien" data-action="retour"><i data-lucide="arrow-left"></i>' + T('Retour') + '</button>' : '<span></span>') +
        '<button type="button" class="bouton bouton-principal" data-action="suite"' + (peutContinuer ? '' : ' disabled') + '>' +
        (libelleSuite || T('Continuer')) + '<i data-lucide="arrow-right"></i></button></footer>';
    }

    function ecranAccueil() {
      const enCours = CT.stockage.chargerBrouillon();
      const reprendre = enCours && (enCours.talent.nom || enCours.regions.length);
      return '<div class="creation-accueil"><div class="accueil-hex" aria-hidden="true">' + hexDecor() + '</div>' +
        '<h1>' + T('Bienvenue sur ta Carte du Talent') + '</h1>' +
        '<p>' + T('Ta carte montre ton talent comme un territoire : un cœur, des régions, des frontières que tu repousses, des îles où tu te ressources.') + ' ' +
        T('Six questions suffisent pour la dessiner. Compte une dizaine de minutes.') + '</p>' +
        '<div class="accueil-actions">' +
        (reprendre
          ? '<button type="button" class="bouton bouton-principal" data-action="reprendre"><i data-lucide="play"></i>' + T('Reprendre ma carte ({etape})', { etape: enCours.etape > 6 ? T('dernière étape') : T('question {n}', { n: enCours.etape }) }) + '</button>' +
            '<button type="button" class="bouton bouton-secondaire" data-action="recommencer"><i data-lucide="rotate-ccw"></i>' + T('Recommencer de zéro') + '</button>'
          : '<button type="button" class="bouton bouton-principal" data-action="commencer"><i data-lucide="sparkles"></i>' + T('Créer ma carte') + '</button>') +
        '<button type="button" class="bouton bouton-secondaire" data-action="importer-pdf"><i data-lucide="file-up"></i>' + T('Importer mon résultat QCM (PDF)') + '</button>' +
        '<button type="button" class="bouton bouton-secondaire" data-action="demo"><i data-lucide="eye"></i>' + T('Explorer la carte de démonstration') + '</button>' +
        '</div><p class="discret">' + T('Tout reste dans ce navigateur. Tu pourras exporter ta carte à tout moment.') + '</p></div>';
    }

    // Arrivée depuis la Boussole : rien n'est remplacé tant que la personne n'a pas choisi.
    function ecranBoussole() {
      const enCours = CT.stockage.chargerBrouillon();
      const reprendre = enCours && (enCours.talent.nom || enCours.regions.length);
      const quiz = arrivee.donnees.source === 'quiz';
      return '<div class="creation-accueil"><div class="accueil-hex" aria-hidden="true">' + hexDecor() + '</div>' +
        '<h1 id="creation-titre">' + (quiz ? T('Ta carte à partir de ton résultat du quiz') : T('Ta carte à partir de ta Boussole')) + '</h1>' +
        '<p>' + (quiz ? T('Ton talent et tes sous-talents sont déjà proposés : la création guidée s\'ouvre pré-remplie. Tu modifies tout ce que tu veux, puis tu crées ta carte.')
          : T('Ton talent et tes contextes vécus sont prêts : la création guidée s\'ouvre pré-remplie. Tu ajustes chaque étape, puis tu crées ta carte.')) + '</p>' +
        (arrivee.carteExistante ? '<p class="note-boussole"><i data-lucide="shield-check"></i>' + T('Ta carte actuelle reste en place tant que tu n\'as pas créé la nouvelle.') + ' ' +
          T('Pense à l\'exporter depuis les Réglages si tu veux la garder.') + '</p>' : '') +
        (reprendre ? '<p class="note-boussole"><i data-lucide="info"></i>' + T('Tu avais commencé une création ({etape}) : commencer avec ta Boussole la remplacera.', { etape: enCours.etape > 6 ? T('dernière étape') : T('question {n}', { n: enCours.etape }) }) + '</p>' : '') +
        '<div class="accueil-actions">' +
        '<button type="button" class="bouton bouton-principal" data-action="boussole-commencer"><i data-lucide="sparkles"></i>' + (quiz ? T('Commencer avec mon résultat') : T('Commencer avec ma Boussole')) + '</button>' +
        (reprendre ? '<button type="button" class="bouton bouton-secondaire" data-action="reprendre"><i data-lucide="play"></i>' + T('Reprendre ma création en cours') + '</button>' : '') +
        (arrivee.carteExistante
          ? '<button type="button" class="bouton bouton-secondaire" data-action="garder"><i data-lucide="map"></i>' + T('Garder ma carte') + '</button>'
          : '<button type="button" class="bouton bouton-secondaire" data-action="demo"><i data-lucide="eye"></i>' + T('Explorer la carte de démonstration') + '</button>') +
        '</div><p class="discret">' + T('Tout reste dans ce navigateur : rien n\'est envoyé.') + '</p></div>';
    }

    // Encart « Depuis ta Boussole » : les phrases du profil, à ajouter (et raccourcir si besoin).
    function encartBoussole(etape) {
      const bo = brouillon.boussole;
      if (!bo) return '';
      const tete = '<aside class="encart-boussole" aria-labelledby="encart-boussole-titre"><h3 id="encart-boussole-titre"><i data-lucide="compass"></i>' + (bo.source === 'quiz' ? T('Depuis ton résultat du quiz') : T('Depuis ta Boussole')) + '</h3>';
      if (etape === 1) {
        const lignes = [[T('Je…'), bo.mecanisme], [T('…dans un environnement où…'), bo.contexte], [T('…afin de…'), bo.benefice]].filter(([, t]) => t);
        if (!lignes.length) return '';
        return tete + '<p class="discret">' + T('Ton Talent Unique, pour t\'aider à le dire en une phrase courte.') + '</p><dl class="rappel-boussole">' +
          lignes.map(([l, t]) => '<dt>' + l + '</dt><dd>' + O.echapper(t) + '</dd>').join('') + '</dl></aside>';
      }
      const source = etape === 3 ? 'reussites' : etape === 6 ? 'echecs' : null;
      if (!source) return '';
      const q = QUESTIONS[etape];
      const max = C.longueurMax(q.liste);
      const deja = new Set(brouillon[q.liste].map((x) => CT.regles.normaliserTexte(x.texte)));
      const liste = bo[source];
      const intro = etape === 3 ? T('Tes contextes de réussite. Ajoute ceux qui sont de vrais moments de flow.') : T('Tes contextes d\'échec. Ajoute ce que tu pourrais confier à d\'autres.');
      const anti = etape === 6 && bo.antiContexte
        ? '<p class="rappel-anti"><strong>' + T('Ton Anti-Contexte :') + '</strong> ' + O.echapper(bo.antiContexte) + '</p>' : '';
      if (!liste.length && !anti) return '';
      return tete + (liste.length ? '<p class="discret">' + intro + ' ' + T('Une phrase trop longue pour un hexagone va dans le champ : raccourcis-la, puis ajoute-la.') + '</p>' +
        '<ul class="phrases-boussole">' + liste.map((t, i) => {
          const ajoute = deja.has(CT.regles.normaliserTexte(sansVirgule(t)));
          const long = t.length > max;
          return '<li><span>' + O.echapper(t) + '</span>' + (ajoute
            ? '<span class="phrase-ajoutee"><i data-lucide="check"></i>' + T('Ajouté') + '</span>'
            : '<button type="button" class="bouton-lien" data-action="boussole-ajouter" data-source="' + source + '" data-index="' + i + '">' +
              '<i data-lucide="' + (long ? 'pencil' : 'plus') + '"></i>' + (long ? T('Raccourcir') : T('Ajouter')) + '<span class="visuellement-cache"> : ' + O.echapper(t) + '</span></button>') + '</li>';
        }).join('') + '</ul>' : '') + anti + '</aside>';
    }

    // Q6 : ce qui recharge (zone de ressourcement), pré-rempli avec les idées du quiz.
    function blocRessources() {
      const liste = brouillon.ressources || [];
      const plein = liste.length >= C.MAX_RESSOURCES;
      const titre = brouillon.boussole && brouillon.boussole.rechargeTitre;
      return '<section class="bloc-ressources" aria-labelledby="ressources-titre"><h3 id="ressources-titre"><i data-lucide="sprout"></i>' + T('Ce qui te recharge') + '</h3>' +
        '<p class="discret">' + (titre ? O.echapper(titre) + ' · ' : '') + T('Ces idées forment ta zone de ressourcement, à l\'écart de ta carte. C\'est facultatif.') + '</p>' +
        (liste.length ? '<ul class="puces-saisie">' + liste.map((x) => '<li>' + O.echapper(x.texte) + '<button type="button" data-action="retirer-ressource" data-id="' + x.id +
          '" aria-label="' + O.echapper(T('Retirer {nom}', { nom: x.texte })) + '"><i data-lucide="x"></i></button></li>').join('') + '</ul>' : '') +
        '<form class="saisie-vrac" data-form="ressource"><label class="visuellement-cache" for="creation-ressource">' + T('Ce qui te recharge') + '</label>' +
        '<input type="text" id="creation-ressource" autocomplete="off" enterkeyhint="enter" maxlength="' + C.longueurMax('ressources') + '" placeholder="' + O.echapper(T('Ex. : Marcher en forêt')) + '"' + (plein ? ' disabled' : '') + '>' +
        '<button type="submit" class="bouton bouton-secondaire"' + (plein ? ' disabled' : '') + '><i data-lucide="plus"></i>' + T('Ajouter') + '</button></form></section>';
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
      return '<div class="creation-question"><h2 id="creation-titre">' + T('Quel est ton talent ?') + '</h2>' +
        '<p class="aide-question">' + T('Une phrase qui dit ce que tu fais naturellement, mieux que la plupart des gens, et qui te donne de l\'énergie.') + '</p>' +
        '<label class="champ champ-grand"><span>' + T('Ton talent') + '</span><input type="text" id="creation-talent" maxlength="120" value="' + O.echapper(brouillon.talent.nom) +
        '" placeholder="' + O.echapper(T('Ex. : Créer des dynamiques humaines positives')) + '" autocomplete="off"></label>' +
        '<label class="champ champ-grand"><span>' + T('Le fil rouge qui relie tout (facultatif)') + '</span><input type="text" id="creation-fil" maxlength="160" value="' +
        O.echapper(brouillon.talent.filRouge) + '" placeholder="' + O.echapper(T('Ex. : la mise en scène des échanges humains')) + '" autocomplete="off"></label>' +
        '<p class="discret">' + T('Pas besoin que ce soit parfait. Tu pourras y revenir plus tard.') + '</p>' + encartBoussole(1) + '</div>';
    }

    // Idées regroupées par grands domaines : trois par domaine, le reste derrière « Voir plus ».
    function blocIdees(etape, groupes) {
      const plus = Boolean(voirPlus[etape]);
      const caches = groupes.reduce((n, g) => n + g.idees.filter((i) => i.plus).length, 0);
      const total = groupes.reduce((n, g) => n + g.idees.length, 0);
      return '<div class="idees"><p class="discret">' + T('{n} idées pour t\'inspirer, par domaine. Touche pour ajouter.', { n: total }) + '</p>' +
        groupes.map((g) => '<section class="idees-groupe" aria-label="' + O.echapper(g.nom) + '"><h3>' + O.echapper(g.nom) + '</h3><div class="idees-puces">' +
          g.idees.filter((i) => plus || !i.plus).map((i) => '<button type="button" class="puce-exemple" data-action="exemple" data-valeur="' + O.echapper(i.texte) + '"><i data-lucide="plus"></i>' +
            O.echapper(i.texte) + '</button>').join('') + '</div></section>').join('') +
        (caches ? '<button type="button" class="bouton bouton-secondaire idees-plus" data-action="voir-plus" aria-expanded="' + plus + '"><i data-lucide="' + (plus ? 'chevron-up' : 'chevron-down') + '"></i>' +
          (plus ? T('Voir moins') : T('Voir plus ({n} idées de plus)', { n: caches })) + '</button>' : '') + '</div>';
    }

    function ecranListe(etape) {
      const q = QUESTIONS[etape];
      const elements = brouillon[q.liste];
      const nomDe = (x) => x.texte || x.nom;
      const deja = new Set(elements.map((x) => CT.regles.normaliserTexte(nomDe(x))));
      const exemples = q.exemples.filter((e) => !deja.has(CT.regles.normaliserTexte(e)));
      const groupes = CT.idees.proposer(q.liste, elements.map(nomDe));
      let liste;
      if (q.liste === 'regions') {
        // Liste ordonnée : l'ordre décide des voisinages sur la carte.
        liste = (elements.length > 1 ? '<p class="aide-ordre"><i data-lucide="arrow-down-up"></i>' + T('L\'ordre compte : deux régions qui se suivent seront voisines sur ta carte, et la dernière touchera la première. Utilise les flèches pour rapprocher celles qui se ressemblent.') + '</p>' : '') +
          '<ol class="lignes lignes-regions">' + elements.map((x, i) => '<li style="--couleur:' + x.couleur + '">' +
          '<span class="pastille-couleur" style="background:' + x.couleur + '"></span><span class="ligne-nom">' + O.echapper(x.nom) + '</span>' +
          '<span class="fleches">' +
          '<button type="button" class="fleche" data-action="monter" data-id="' + x.id + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="' + O.echapper(T('Monter {nom}', { nom: x.nom })) + '"><i data-lucide="arrow-up"></i></button>' +
          '<button type="button" class="fleche" data-action="descendre" data-id="' + x.id + '"' + (i === elements.length - 1 ? ' disabled' : '') + ' aria-label="' + O.echapper(T('Descendre {nom}', { nom: x.nom })) + '"><i data-lucide="arrow-down"></i></button></span>' +
          '<button type="button" class="retirer-element" data-action="retirer" data-id="' + x.id + '" aria-label="' + O.echapper(T('Retirer {nom}', { nom: x.nom })) + '"><i data-lucide="x"></i></button></li>').join('') + '</ol>';
      } else if (q.liste === 'conquises') {
        liste = '<ul class="lignes">' + elements.map((x) => '<li><span class="ligne-nom">' + O.echapper(x.texte) + '</span>' +
          '<span class="segments segments-compacts" role="group" aria-label="' + O.echapper(T('Distance au talent de {nom}', { nom: x.texte })) + '">' +
          [['proche', T('Proche')], ['eloignee', T('Éloigné')]].map(([v, l]) => '<button type="button" data-action="distance" data-id="' + x.id + '" data-valeur="' + v +
            '" aria-pressed="' + (x.distance === v) + '">' + l + '</button>').join('') + '</span>' +
          '<button type="button" class="retirer-element" data-action="retirer" data-id="' + x.id + '" aria-label="' + O.echapper(T('Retirer {nom}', { nom: x.texte })) + '"><i data-lucide="x"></i></button></li>').join('') + '</ul>';
      } else {
        liste = '<ul class="puces-saisie">' + elements.map((x) => '<li' + (q.liste === 'regions' ? ' style="--couleur:' + x.couleur + '"' : '') + '>' +
          (q.liste === 'regions' ? '<span class="pastille-couleur" style="background:' + x.couleur + '"></span>' : '') + O.echapper(nomDe(x)) +
          '<button type="button" data-action="retirer" data-id="' + x.id + '" aria-label="' + O.echapper(T('Retirer {nom}', { nom: nomDe(x) })) + '"><i data-lucide="x"></i></button></li>').join('') + '</ul>';
      }
      const plein = q.liste === 'regions' && elements.length >= C.MAX_REGIONS;
      return '<div class="creation-question"><h2 id="creation-titre">' + q.titre + '</h2><p class="aide-question">' + q.aide + '</p>' +
        '<form class="saisie-vrac" data-form="vrac"><label class="visuellement-cache" for="creation-saisie">' + O.echapper(q.titre) + '</label>' +
        '<input type="text" id="creation-saisie" autocomplete="off" enterkeyhint="enter" placeholder="' + O.echapper(q.placeholder) + '"' + (plein ? ' disabled' : '') + '>' +
        '<button type="submit" class="bouton bouton-secondaire"' + (plein ? ' disabled' : '') + '><i data-lucide="plus"></i>' + T('Ajouter') + '</button></form>' +
        (alerte ? '<p class="alerte-saisie" role="alert">' + O.echapper(alerte) + '</p>' : '') +
        '<p class="discret">' + T('Tu peux en écrire plusieurs d\'un coup, séparés par des virgules.') + (plein ? ' ' + T('Huit régions au maximum.') : '') + '</p>' +
        liste + encartBoussole(etape) + (etape === 6 ? blocRessources() : '') +
        (groupes.length && !plein ? blocIdees(etape, groupes) : '') +
        (!groupes.length && exemples.length && !plein ? '<div class="exemples"><span class="discret">' + T('Exemples :') + '</span>' + exemples.map((e) =>
          '<button type="button" class="puce-exemple" data-action="exemple" data-valeur="' + O.echapper(e) + '"><i data-lucide="plus"></i>' + O.echapper(e) + '</button>').join('') + '</div>' : '') +
        '</div>';
    }

    function ecranFiltre() {
      return '<div class="creation-question"><h2 id="creation-titre">' + T('Est-ce que ça élargit ton domaine d\'action ?') + '</h2>' +
        '<p class="aide-question">' + T('Conduire ou faire du vélo, c\'est utile, mais ça n\'élargit pas vraiment ton terrain de jeu. Garde ce qui ouvre de nouvelles possibilités.') + '</p>' +
        '<ul class="lignes">' + brouillon.conquises.map((x) => '<li class="' + (x.elargit === false ? 'ecarte' : '') + '"><span class="ligne-nom">' + O.echapper(x.texte) + '</span>' +
          '<span class="segments segments-compacts" role="group" aria-label="' + O.echapper(T('{nom} élargit-il ton domaine d\'action ?', { nom: x.texte })) + '">' +
          [[true, T('Oui')], [false, T('Non')]].map(([v, l]) => '<button type="button" data-action="elargit" data-id="' + x.id + '" data-valeur="' + v +
            '" aria-pressed="' + ((x.elargit !== false) === v) + '">' + l + '</button>').join('') + '</span></li>').join('') + '</ul>' +
        '<p class="discret">' + T('Ce que tu marques « Non » ne sera pas mis sur ta carte.') + '</p></div>';
    }

    function carteElement(liste, el) {
      const choisi = selection && selection.id === el.id;
      return '<button type="button" class="element' + (choisi ? ' choisi' : '') + '" data-liste="' + liste + '" data-id="' + el.id + '" aria-pressed="' + choisi + '">' +
        '<span class="element-type type-' + liste + '">' + LIBELLE_TYPE[liste] + '</span>' + O.echapper(el.texte) +
        (el.raison ? '<span class="element-raison"><i data-lucide="sparkles"></i>' + O.echapper(el.raison) + '</span>' : '') + '</button>';
    }

    function ecranRegroupement() {
      const items = C.aRanger(brouillon);
      const zone = (id, titre, couleur, icone, aide) => {
        const dedans = items.filter((x) => (x.el.zone || null) === id);
        return '<section class="zone' + (id === null ? ' zone-a-ranger' : '') + (selection ? ' zone-active' : '') + '" data-zone="' + (id === null ? '' : id) + '"' +
          (couleur ? ' style="--couleur:' + couleur + '"' : '') + '>' +
          '<header class="zone-tete">' + (icone ? '<i data-lucide="' + icone + '"></i>' : '') + '<span>' + O.echapper(titre) + '</span>' +
          (selection && id !== null ? '<button type="button" class="poser-ici" data-action="poser" data-zone="' + id + '">' + T('Poser ici') + '</button>' : '') + '</header>' +
          (aide ? '<p class="discret">' + aide + '</p>' : '') +
          '<div class="zone-elements">' + (dedans.length ? dedans.map((x) => carteElement(x.liste, x.el)).join('') : '<span class="zone-vide">' + (id === null ? T('Tout est rangé.') : T('Glisse un élément ici')) + '</span>') + '</div></section>';
      };
      return '<div class="creation-question creation-large"><h2 id="creation-titre">' + T('Range chaque élément dans sa région') + '</h2>' +
        '<p class="aide-question">' + T('On a déjà rangé chaque élément dans la région la plus proche, avec la raison en petit. Garde ce qui te parle, déplace le reste.') + ' ' +
        T('Glisse-le dans la région qu\'il nourrit. Sur téléphone, touche un élément puis « Poser ici ».') + ' ' +
        T('Ce qui ne colle à aucune région devient une île.') + '</p>' +
        zone(null, T('À ranger'), null, 'inbox', items.some((x) => !x.el.zone) ? T('Ce qui reste ici rejoindra ta première région ; tu pourras l\'ajuster sur la carte.') : '') +
        '<div class="zones">' + brouillon.regions.map((r) => zone(r.id, r.nom, r.couleur, r.icone)).join('') +
        zone('ile', T('Hors de mon talent : île de flow'), '#7DCDAE', 'palmtree') + '</div></div>';
    }

    function rendre() {
      if (!ouvert) return;
      let html;
      if (arrivee) html = ecranBoussole();
      else if (accueil) html = ecranAccueil();
      else {
        const e = brouillon.etape;
        let corps;
        let peut = true;
        let suite = null;
        if (e === 1) { corps = ecranTalent(); peut = Boolean(brouillon.talent.nom.trim()); }
        else if (e <= 6) {
          corps = ecranListe(e);
          if (e === 2) peut = brouillon.regions.length > 0;
          if (e === 6) suite = T('Continuer');
        } else if (e === 7) corps = ecranFiltre();
        else { corps = ecranRegroupement(); suite = T('Créer ma carte'); }
        html = tete(e) + '<div class="creation-corps">' + corps + '</div>' + pied(e, peut, suite);
      }
      const focusId = document.activeElement && racine.contains(document.activeElement) ? document.activeElement.id : null;
      const defile = racine.querySelector('.creation-corps');
      const haut = defile ? defile.scrollTop : 0;
      racine.innerHTML = '<div class="creation-page" role="dialog" aria-modal="true" aria-labelledby="creation-titre">' + html + '</div>';
      O.rafraichirIcones(racine);
      const corpsNeuf = racine.querySelector('.creation-corps');
      if (corpsNeuf && haut) corpsNeuf.scrollTop = haut;
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
      if (brouillon.etape === 8) C.preRanger(brouillon);
      selection = null;
      alerte = '';
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
      if (e.target.getAttribute('data-form') === 'ressource') {
        const saisie = racine.querySelector('#creation-ressource');
        if (!saisie || !saisie.value.trim()) return;
        C.ajouter(brouillon, 'ressources', saisie.value.slice(0, C.longueurMax('ressources')));
        enregistrer();
        rendre();
        const nouveau = racine.querySelector('#creation-ressource');
        if (nouveau) nouveau.focus();
        return;
      }
      const champ = racine.querySelector('#creation-saisie');
      const q = QUESTIONS[brouillon.etape];
      if (!champ || !q || !champ.value.trim()) return;
      const longs = C.tropLongs(q.liste, champ.value);
      if (longs.length) {
        // Rien n'est coupé en silence : la personne raccourcit elle-même.
        const valeur = champ.value;
        alerte = T('Trop long pour un hexagone ({max} caractères au plus) : raccourcis « {texte} ».',
          { max: C.longueurMax(q.liste), texte: longs[0].length > 50 ? longs[0].slice(0, 50) + '…' : longs[0] });
        rendre();
        const garde = racine.querySelector('#creation-saisie');
        if (garde) { garde.value = valeur; garde.focus(); }
        return;
      }
      alerte = '';
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
        if (action === 'recommencer' && !rappels.confirmer(T('Recommencer de zéro ? Tes réponses en cours seront effacées.'))) return;
        brouillon = C.nouveauBrouillon(); accueil = false; aller(1); return;
      }
      if (action === 'reprendre') { arrivee = null; brouillon = CT.stockage.chargerBrouillon() || C.nouveauBrouillon(); accueil = false; aller(Math.min(brouillon.etape, 8)); return; }
      if (action === 'importer-pdf') { rappels.importerPdf(); return; }
      if (action === 'demo') { arrivee = null; fermer(); rappels.demo(); return; }
      if (action === 'garder') { arrivee = null; fermer(); rappels.toast(T('Ta carte est inchangée.')); return; }
      if (action === 'boussole-commencer') {
        brouillon = CT.boussole.versBrouillon(arrivee.donnees);
        arrivee = null; accueil = false; aller(1); return;
      }
      if (action === 'boussole-ajouter' && q) {
        const t = ((brouillon.boussole || {})[b.getAttribute('data-source')] || [])[Number(b.getAttribute('data-index'))];
        if (!t) return;
        if (t.length <= C.longueurMax(q.liste)) { C.ajouter(brouillon, q.liste, sansVirgule(t)); alerte = ''; enregistrer(); rendre(); return; }
        // Trop longue : elle va dans le champ, à raccourcir avant de l'ajouter.
        alerte = T('Raccourcis cette phrase en quelques mots ({max} caractères au plus), puis ajoute-la.', { max: C.longueurMax(q.liste) });
        rendre();
        const champ = racine.querySelector('#creation-saisie');
        if (champ) { champ.value = t; champ.focus(); champ.select(); }
        return;
      }
      if (action === 'quitter') {
        if (rappels.doitAccueillir()) { accueil = true; rendre(); } else fermer();
        rappels.toast(T('Ta saisie est gardée : tu pourras reprendre depuis les Réglages.'));
        return;
      }
      if (action === 'suite') { aller(prochaine(brouillon.etape)); return; }
      if (action === 'retour') { aller(precedente(brouillon.etape)); return; }
      if (action === 'voir-plus') { voirPlus[brouillon.etape] = !voirPlus[brouillon.etape]; rendre(); const bt = racine.querySelector('.idees-plus'); if (bt) bt.focus(); return; }
      if (action === 'exemple' && q) { C.ajouter(brouillon, q.liste, valeur); enregistrer(); rendre(); return; }
      if (action === 'retirer-ressource') { C.retirer(brouillon, 'ressources', id); enregistrer(); rendre(); return; }
      if (action === 'retirer' && q) { C.retirer(brouillon, q.liste, id); enregistrer(); rendre(); return; }
      if (action === 'monter' || action === 'descendre') {
        C.deplacerRegion(brouillon, id, action === 'monter' ? -1 : 1);
        enregistrer();
        rendre();
        // Le focus suit la région déplacée, pour enchaîner au clavier.
        const suivant = racine.querySelector('[data-action="' + action + '"][data-id="' + id + '"]:not([disabled])') ||
          racine.querySelector('[data-id="' + id + '"].fleche:not([disabled])');
        if (suivant) suivant.focus();
        return;
      }
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
      arrivee = options && options.boussole ? { donnees: options.boussole, carteExistante: Boolean(options.carteExistante) } : null;
      alerte = '';
      brouillon = CT.stockage.chargerBrouillon() || C.nouveauBrouillon();
      selection = null;
      ouvert = true;
      racine.hidden = false;
      document.body.classList.add('creation-ouverte');
      if (accueil || arrivee) rendre(); else aller(Math.min(brouillon.etape, 8));
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
