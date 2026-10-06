/*
 * Point d'entrée : charge la carte, calcule la géographie, branche l'interface.
 */
(function (CT) {
  'use strict';

  const etat = {
    carte: null,
    placement: null,
    parCase: new Map(), // id -> case placée (fantômes compris)
    suggestionsVisibles: false,
    suggestions: [], // suggestions affichées en fantômes
    affichage: null // { carte, placement } réellement dessinés
  };

  let navigation = null;
  let panneau = null;
  let saisieFlow = null;
  let reglages = null;
  let progres = null;

  function caseDe(id) {
    return etat.parCase.get(id) || null;
  }

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
    etat.carte.competences.forEach((c) => {
      const p = etat.placement.positions[c.id];
      if (p) c.position = { q: p.q, r: p.r };
    });
    const problemes = CT.placement.verifier(etat.placement);
    if (problemes.length && globalThis.console) console.info('Placement :', problemes);
    calculerFantomes();
  }

  /*
   * Mode suggestions : on pose des hexagones fantômes autour du territoire.
   * Les positions existantes sont figées, rien de réel ne bouge.
   */
  function calculerFantomes() {
    etat.affichage = { carte: etat.carte, placement: etat.placement };
    etat.suggestions = [];
    if (etat.suggestionsVisibles) {
      etat.suggestions = CT.suggestions.proposer(etat.carte, 6);
      const fantomes = etat.suggestions.map((p) => Object.assign(CT.suggestions.versCompetence(p, 'a_conquerir', 'sugg:' + p.entree.id), { fantome: true }));
      const carte = Object.assign({}, etat.carte, { competences: etat.carte.competences.concat(fantomes) });
      etat.affichage = { carte, placement: CT.placement.placer(carte, { figerExistants: true }) };
    }
    etat.parCase = new Map(etat.affichage.placement.cases.map((c) => [c.id, c]));
    if ($('btn-suggestions')) $('btn-suggestions').setAttribute('aria-pressed', String(etat.suggestionsVisibles));
  }

  function basculerSuggestions(visibles) {
    etat.suggestionsVisibles = visibles;
    calculerFantomes();
    rendre();
    if (visibles) {
      navigation.selectionner(null);
      panneau.afficher('suggestions', etat.carte);
    }
  }

  function enregistrer() {
    if (!CT.stockage.sauvegarder(etat.carte)) toast('Impossible d\'enregistrer dans ce navigateur. Pense à exporter ta carte.');
  }

  // Marges à laisser libres pour cadrer la carte (légende, boutons, panneau).
  function marges() {
    const telephone = window.matchMedia('(max-width: 640px)').matches;
    return telephone ? { gauche: 8, droite: 8, haut: 56, bas: 80 } : { gauche: 250, droite: 76, haut: 16, bas: 80 };
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
    const { cadre } = CT.vueCarte.rendre($('carte'), etat.affichage.carte, etat.affichage.placement);
    navigation.majCadre(cadre, { ajuster: options && options.ajuster, marges: marges() });
    CT.vueLegende.rendre($('legende-contenu'), etat.carte);
    if (panneau.ouvert) panneau.afficher(panneau.ouvert, etat.carte);
    if (progres && progres.ouvert) progres.rendre();
    const propositions = CT.stats.propositionsConquete(etat.carte).length;
    $('alerte-progres').hidden = propositions === 0;
    $('btn-progres').setAttribute('aria-label', 'Progrès et objectifs' + (propositions ? ' (' + propositions + ' proposition' + (propositions > 1 ? 's' : '') + ' de conquête)' : ''));
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
    if (etat.suggestionsVisibles) basculerSuggestions(false);
  }

  function nomDe(id) {
    const c = CT.regles.trouver(etat.carte, id);
    return c ? '«\u00a0' + c.nom + '\u00a0»' : '';
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
    if (actionSuggestion(action, valeur)) return;
    if (!id || id === 'capitale') return;
    if (action === 'flow') { saisieFlow.ouvrir([id]); return; }
    if (action === 'progres') { progres.ouvrir(); return; }
    if (action === 'nouvel-objectif') { progres.ouvrir({ nouvelObjectif: id }); return; }
    if (['conquerir', 'pas-encore', 'session'].includes(action)) { actionProgres(action, action === 'session' ? valeur : id); return; }
    if (action === 'supprimer-moment') {
      if (!confirm('Supprimer ce moment de flow ?')) return;
      CT.regles.supprimerMoment(etat.carte, valeur);
      appliquer();
      toast('Moment supprimé.');
      return;
    }
    const avant = CT.regles.trouver(etat.carte, id).position;
    let change = false;
    let effet = null;
    if (action === 'explorer') {
      change = CT.regles.explorer(etat.carte, id);
      if (change) { toast('Tu découvres ' + nomDe(id) + ' !'); effet = 'exploration'; }
    } else if (action === 'statut') {
      const r = CT.regles.changerStatut(etat.carte, id, valeur);
      change = Boolean(r);
      if (change) toast(MESSAGES_STATUT[valeur](nomDe(id)));
      if (r && valeur === 'conquise' && (r.ancien === 'frontiere' || r.ancien === 'a_conquerir')) effet = 'conquete';
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
    if (effet && caseDe(id)) CT.vueEffets[effet]($('carte'), caseDe(id));
    // Si l'hexagone a changé de zone, on le suit des yeux.
    const apres = CT.regles.trouver(etat.carte, id).position;
    if (!avant || !apres || avant.q !== apres.q || avant.r !== apres.r) {
      requestAnimationFrame(() => navigation.rendreVisible(id, zoneLibre()));
    }
  }

  // ---------- Suggestions ----------

  // Renvoie true si l'action concernait les suggestions.
  function actionSuggestion(action, valeur) {
    const carte = etat.carte;
    if (action === 'voir-suggestion') { ouvrir('sugg:' + valeur); return true; }
    if (action === 'retour-suggestions') { navigation.selectionner(null); panneau.afficher('suggestions', carte); return true; }
    if (action === 'accepter' || action === 'accepter-frontiere') {
      const fantome = caseDe('sugg:' + valeur);
      const c = CT.suggestions.accepter(carte, valeur, {
        statut: action === 'accepter' ? 'a_conquerir' : 'frontiere',
        position: fantome ? { q: fantome.q, r: fantome.r } : null
      });
      if (!c) return true;
      appliquer();
      navigation.selectionner(null);
      panneau.afficher('suggestions', carte);
      if (caseDe(c.id)) CT.vueEffets.exploration($('carte'), caseDe(c.id));
      toast(nomDe(c.id) + (c.statut === 'frontiere' ? ' devient une frontière de ta carte.' : ' rejoint tes territoires à conquérir.'));
      return true;
    }
    if (action === 'refuser') {
      const entree = CT.bibliotheque.trouver(valeur);
      if (!CT.suggestions.refuser(carte, valeur)) return true;
      appliquer();
      navigation.selectionner(null);
      panneau.afficher('suggestions', carte);
      toast('D\'accord, « ' + entree.nom + ' » ne te sera plus proposée.');
      return true;
    }
    if (action === 'ajouter-idee') {
      const c = CT.regles.ajouterCompetence(carte, valeur, 'a_conquerir');
      if (!c) return true;
      appliquer();
      panneau.afficher('suggestions', carte);
      if (caseDe(c.id)) CT.vueEffets.exploration($('carte'), caseDe(c.id));
      toast(nomDe(c.id) + ' rejoint tes territoires à conquérir.');
      return true;
    }
    return false;
  }

  // ---------- Progrès, conquêtes et objectifs ----------

  function actionProgres(action, valeur) {
    const carte = etat.carte;
    if (action === 'voir') { ouvrir(valeur); return; }
    if (action === 'flow') { saisieFlow.ouvrir([]); return; }
    if (action === 'conquerir') {
      if (!CT.regles.changerStatut(carte, valeur, 'conquise')) return;
      appliquer();
      ouvrir(valeur);
      if (caseDe(valeur)) CT.vueEffets.conquete($('carte'), caseDe(valeur));
      toast(MESSAGES_STATUT.conquise(nomDe(valeur)));
      return;
    }
    if (action === 'pas-encore') {
      if (!CT.regles.reporterConquete(carte, valeur)) return;
      appliquer();
      toast('D\'accord, pas encore. La question reviendra après quelques moments de plus.');
      return;
    }
    if (action === 'session') {
      if (!CT.regles.noterSession(carte, valeur)) return;
      appliquer();
      toast('Session notée.');
      return;
    }
    if (action === 'retirer-session') {
      if (CT.regles.retirerSession(carte, valeur)) { appliquer(); toast('Dernière session retirée.'); }
      return;
    }
    if (action === 'enregistrer-objectif') {
      if (CT.regles.definirObjectif(carte, valeur.competenceId, valeur)) { appliquer(); toast('Objectif enregistré.'); }
      return;
    }
    if (action === 'supprimer-objectif') {
      if (!confirm('Supprimer cet objectif ? Les moments de flow restent sur ta carte.')) return;
      if (CT.regles.supprimerObjectif(carte, valeur)) { appliquer(); toast('Objectif supprimé.'); }
    }
  }

  // ---------- Saisie d'un moment de flow ----------

  const rappelsFlow = {
    carte: () => etat.carte,
    creerCompetence(nom, statut) {
      const c = CT.regles.ajouterCompetence(etat.carte, nom, statut);
      if (c) appliquer();
      return c;
    },
    enregistrer(saisie) {
      const avant = new Set(CT.stats.propositionsConquete(etat.carte).map((f) => f.c.id));
      const moment = CT.regles.ajouterMoment(etat.carte, saisie);
      if (!moment) return;
      appliquer();
      CT.vueEffets.flow($('carte'), moment.competenceIds.map(caseDe).filter(Boolean));
      const nouvelle = CT.stats.propositionsConquete(etat.carte).find((f) => !avant.has(f.c.id));
      if (nouvelle) {
        toast(nomDe(nouvelle.c.id) + ' atteint ' + nouvelle.nombre + ' moments de flow : une proposition t\'attend dans Progrès.');
        return;
      }
      const noms = moment.competenceIds.map(nomDe).join(', ');
      toast('Moment de flow enregistré : ' + noms + '.');
    }
  };

  // ---------- Glisser-déposer ----------

  function occupant(cel) {
    return etat.placement.cases.find((c) => c.q === cel.q && c.r === cel.r) || null;
  }

  const rappelsNavigation = {
    caseDe: (id) => etat.parCase.get(id) || null,
    estDeplacable: (id) => id !== 'capitale' && !id.startsWith('sugg:'),
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
    $('btn-reglages').addEventListener('click', () => reglages.ouvrir());
    $('btn-progres').addEventListener('click', () => progres.ouvrir());
    $('legende-bascule').addEventListener('click', () => {
      const ouverte = $('legende').classList.toggle('fermee') === false;
      $('legende-bascule').setAttribute('aria-expanded', String(ouverte));
    });
    $('btn-flow').addEventListener('click', () => {
      const id = panneau.ouvert && panneau.ouvert !== 'capitale' ? panneau.ouvert : null;
      saisieFlow.ouvrir(id ? [id] : []);
    });
    $('btn-suggestions').addEventListener('click', () => {
      if (etat.suggestionsVisibles) fermerPanneau();
      else basculerSuggestions(true);
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
    panneau = CT.vuePanneau.creer($('panneau'), surActionPanneau, { suggestions: () => etat.suggestions });
    saisieFlow = CT.vueSaisieFlow.creer($('saisie-flow'), rappelsFlow);
    progres = CT.vueProgres.creer($('progres'), { carte: () => etat.carte, action: actionProgres });
    reglages = CT.vueReglages.creer($('reglages'), {
      carte: () => etat.carte,
      changerPreference(cle, valeur) {
        CT.regles.changerPreference(etat.carte, cle, valeur);
        appliquer();
        if (cle === 'seuilConquete') toast('Seuil de conquête : ' + etat.carte.preferences.seuilConquete + ' moments de flow.');
        if (cle === 'brouillardDeGuerre') toast(valeur ? 'Brouillard activé : les territoires inexplorés sont sous les nuages.' : 'Brouillard désactivé : toute ta carte est visible.');
      },
      exporter() {
        CT.stockage.exporter(etat.carte);
        toast('Carte exportée. Garde ce fichier précieusement.');
      },
      importer() { $('fichier-import').click(); },
      retablirSuggestions() {
        const n = CT.suggestions.retablirRefusees(etat.carte);
        appliquer();
        toast(n ? 'Les suggestions écartées pourront à nouveau t\'être proposées.' : 'Aucune suggestion écartée.');
      },
      reinitialiser() {
        if (!confirm('Revenir à la carte de démonstration ? Ta carte actuelle sera remplacée (exporte-la d\'abord si tu veux la garder).')) return;
        changerCarte(CT.demo.creer());
        toast('Carte de démonstration restaurée.');
      }
    });
    if (window.matchMedia('(max-width: 640px)').matches) $('legende').classList.add('fermee');
    etat.carte = CT.stockage.charger() || CT.demo.creer();
    appliquer({ ajuster: true });
    brancher();
    CT.outils.rafraichirIcones();
  }

  CT.app = { etat, ouvrir, ouvrirFlow: (ids) => saisieFlow.ouvrir(ids), ouvrirProgres: (o) => progres.ouvrir(o) };
  document.addEventListener('DOMContentLoaded', demarrer);
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
