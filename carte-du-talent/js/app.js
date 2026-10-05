/*
 * Point d'entrée : charge la carte, calcule la géographie, branche l'interface.
 */
(function (CT) {
  'use strict';

  const etat = {
    carte: null,
    placement: null,
    parCase: new Map() // id -> case placée
  };

  let navigation = null;
  let panneau = null;

  const $ = (id) => document.getElementById(id);

  function toast(message) {
    const t = $('toast');
    t.textContent = message;
    t.classList.add('visible');
    clearTimeout(toast.minuteur);
    toast.minuteur = setTimeout(() => t.classList.remove('visible'), 3200);
  }

  // Calcule le placement (positions mémorisées conservées) et l'enregistre dans le modèle.
  function recalculer(options) {
    etat.placement = CT.placement.placer(etat.carte, options);
    etat.parCase = new Map(etat.placement.cases.map((c) => [c.id, c]));
    etat.carte.competences.forEach((c) => {
      const p = etat.placement.positions[c.id];
      if (p) c.position = { q: p.q, r: p.r };
    });
    const problemes = CT.placement.verifier(etat.placement);
    if (problemes.length && globalThis.console) console.info('Placement :', problemes);
  }

  function enregistrer() {
    if (!CT.stockage.sauvegarder(etat.carte)) toast('Impossible d\'enregistrer dans ce navigateur. Pense à exporter ta carte.');
  }

  // Marges à laisser libres pour cadrer la carte (légende, boutons, panneau).
  function marges() {
    const telephone = window.matchMedia('(max-width: 640px)').matches;
    return telephone ? { gauche: 8, droite: 8, haut: 8, bas: 72 } : { gauche: 250, droite: 76, haut: 16, bas: 16 };
  }

  // Partie de la carte que le panneau ne recouvre pas, en pixels relatifs au SVG.
  function zoneLibre() {
    const r = $('carte').getBoundingClientRect();
    const z = { gauche: 0, haut: 0, droite: r.width, bas: r.height };
    if (!panneau || !panneau.ouvert) return z;
    // Dimensions finales du panneau (il peut être encore en train de glisser).
    const p = $('panneau');
    if (window.matchMedia('(max-width: 640px)').matches) z.bas = window.innerHeight - p.offsetHeight - r.top;
    else z.droite = window.innerWidth - p.offsetWidth - r.left;
    return z;
  }

  function rendre(options) {
    $('talent-nom').textContent = etat.carte.talent.nom || 'Mon talent';
    $('talent-fil').textContent = etat.carte.talent.filRouge ? 'Fil rouge : ' + etat.carte.talent.filRouge : '';
    const { cadre } = CT.vueCarte.rendre($('carte'), etat.carte, etat.placement);
    navigation.majCadre(cadre, { ajuster: options && options.ajuster, marges: marges() });
    CT.vueLegende.rendre($('legende-contenu'), etat.carte);
    if (panneau.ouvert) panneau.afficher(panneau.ouvert, etat.carte);
  }

  // Toute modification du modèle passe par ici.
  function appliquer(options) {
    recalculer(options);
    enregistrer();
    rendre(options);
  }

  function changerCarte(carte) {
    etat.carte = carte;
    fermerPanneau();
    appliquer({ ajuster: true });
  }

  // ---------- Sélection et panneau ----------

  function ouvrir(id) {
    navigation.selectionner(id);
    panneau.afficher(id, etat.carte);
    requestAnimationFrame(() => navigation.rendreVisible(id, zoneLibre()));
  }

  function fermerPanneau() {
    if (navigation) navigation.selectionner(null);
    if (panneau && panneau.ouvert) panneau.fermer();
  }

  function nomDe(id) {
    const c = CT.regles.trouver(etat.carte, id);
    return c ? '« ' + c.nom + ' »' : '';
  }

  const MESSAGES_STATUT = {
    conquise: (n) => 'Bravo ! ' + n + ' rejoint tes territoires conquis.',
    frontiere: (n) => n + ' devient une frontière : c\'est là que tu grandis.',
    a_conquerir: (n) => n + ' attendra son heure. Il reste visible sur ta carte.',
    a_deleguer: (n) => n + ' rejoint la zone à déléguer. Tu peux le confier à d\'autres.',
    ile: (n) => n + ' devient une île de flow, hors de ton talent principal.',
    natale: (n) => n + ' fait partie de ton territoire natal.'
  };

  function surActionPanneau(action, valeur) {
    const id = panneau.ouvert;
    if (action === 'fermer') { fermerPanneau(); return; }
    if (!id || id === 'capitale') return;
    const avant = CT.regles.trouver(etat.carte, id).position;
    let change = false;
    if (action === 'statut') {
      change = Boolean(CT.regles.changerStatut(etat.carte, id, valeur));
      if (change) toast(MESSAGES_STATUT[valeur](nomDe(id)));
    } else if (action === 'region') {
      change = CT.regles.changerRegion(etat.carte, id, valeur);
    } else if (action === 'distance') {
      change = CT.regles.changerDistance(etat.carte, id, valeur);
    } else if (action === 'ile') {
      change = CT.regles.changerIle(etat.carte, id, valeur);
    } else if (action === 'remettre') {
      CT.regles.remettreAuto(etat.carte, id);
      change = true;
      toast(nomDe(id) + ' retrouve sa place automatique.');
    }
    if (!change) return;
    appliquer();
    navigation.selectionner(id);
    // Si l'hexagone a changé de zone, on le suit des yeux.
    const apres = CT.regles.trouver(etat.carte, id).position;
    if (!avant || !apres || avant.q !== apres.q || avant.r !== apres.r) {
      requestAnimationFrame(() => navigation.rendreVisible(id, zoneLibre()));
    }
  }

  // ---------- Glisser-déposer ----------

  function occupant(cel) {
    return etat.placement.cases.find((c) => c.q === cel.q && c.r === cel.r) || null;
  }

  const rappelsNavigation = {
    caseDe: (id) => etat.parCase.get(id) || null,
    estDeplacable: (id) => id !== 'capitale',
    clic(id) {
      if (id) ouvrir(id);
      else fermerPanneau();
    },
    verdictDepot(id, cel) {
      const o = occupant(cel);
      if (!o || o.id === id) return '';
      return o.id === 'capitale' ? 'refus' : 'echange';
    },
    deposer(id, cel) {
      const o = occupant(cel);
      const resultat = CT.regles.deplacer(etat.carte, id, cel, etat.placement.cases);
      if (!resultat) {
        if (o && o.id === 'capitale') toast('La capitale reste au centre de ta carte.');
        return;
      }
      appliquer();
      ouvrir(id);
      if (resultat === 'echange') toast(nomDe(id) + ' et ' + nomDe(o.id) + ' ont échangé leur place.');
    }
  };

  // ---------- Branchements ----------

  function brancher() {
    $('btn-exporter').addEventListener('click', () => {
      CT.stockage.exporter(etat.carte);
      toast('Carte exportée. Garde ce fichier précieusement.');
    });
    $('btn-importer').addEventListener('click', () => $('fichier-import').click());
    $('fichier-import').addEventListener('change', (e) => {
      const fichier = e.target.files[0];
      e.target.value = '';
      if (!fichier) return;
      CT.stockage.importer(fichier)
        .then((carte) => {
          if (!confirm('Remplacer ta carte actuelle par celle du fichier « ' + fichier.name + ' » ?')) return;
          changerCarte(carte);
          toast('Carte importée.');
        })
        .catch((err) => toast(err.message || 'Fichier illisible.'));
    });
    $('btn-reinitialiser').addEventListener('click', () => {
      if (!confirm('Revenir à la carte de démonstration ? Ta carte actuelle sera remplacée (exporte-la d\'abord si tu veux la garder).')) return;
      changerCarte(CT.demo.creer());
      toast('Carte de démonstration restaurée.');
    });
    $('legende-bascule').addEventListener('click', () => {
      const ouverte = $('legende').classList.toggle('fermee') === false;
      $('legende-bascule').setAttribute('aria-expanded', String(ouverte));
    });
    $('btn-zoom-plus').addEventListener('click', () => navigation.zoomer(1.4));
    $('btn-zoom-moins').addEventListener('click', () => navigation.zoomer(1 / 1.4));
    $('btn-recentrer').addEventListener('click', () => navigation.ajuster(marges()));
    $('btn-reorganiser').addEventListener('click', () => {
      if (!confirm('Réorganiser automatiquement la carte ? Les hexagones que tu as déplacés à la main restent où ils sont.')) return;
      CT.regles.preparerReorganisation(etat.carte);
      appliquer({ reorganiser: true });
      toast('Carte réorganisée.');
    });
  }

  function demarrer() {
    navigation = CT.navigation.creer($('carte'), rappelsNavigation);
    panneau = CT.vuePanneau.creer($('panneau'), surActionPanneau);
    if (window.matchMedia('(max-width: 640px)').matches) $('legende').classList.add('fermee');
    etat.carte = CT.stockage.charger() || CT.demo.creer();
    appliquer({ ajuster: true });
    brancher();
    CT.outils.rafraichirIcones();
  }

  CT.app = { etat, ouvrir };
  document.addEventListener('DOMContentLoaded', demarrer);
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
