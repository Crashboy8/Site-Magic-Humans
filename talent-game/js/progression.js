/* Progression du jeu : ce que le navigateur garde pour le compte Magic Humans, et le lien avec ce compte.
   Sans compte, tout reste dans ce navigateur et rien n'est envoyé. Avec un compte (cookie de session de la Boussole,
   même adresse www.magichumans.com), les points, les badges et la série de jours partent dans le compte
   (table progression) par /boussole-decision/api/progression/. Le reste du jeu (profil, quêtes, habitudes, contacts)
   ne quitte jamais le navigateur.
   L'application a les mêmes badges et la même clé : apps/boussole-decision/src/domain/progression.ts
   (un test vérifie qu'ils restent égaux). Mon espace lit cette clé à la première connexion pour reprendre les points. */
(function (racine) {
  "use strict";

  var CLE = "talent_game_progression_v1";
  var API = "/boussole-decision/api/progression/";
  var CONNEXION = "/boussole-decision/connexion/?suite=%2Fmon-espace%2F";
  var INSCRIPTION = "/boussole-decision/inscription/?suite=%2Fmon-espace%2F";
  var ESPACE = "/boussole-decision/mon-espace/";
  var AJOUT_MAX = 100000;
  var SERIE_MAX = 100000;

  var BADGES = [
    { id: "premier-pas", seuil: 1, label: "Premier pas", emoji: "🌱" },
    { id: "en-mouvement", seuil: 50, label: "En mouvement", emoji: "🔥" },
    { id: "sur-la-lancee", seuil: 150, label: "Sur la lancée", emoji: "⚡" },
    { id: "ancre", seuil: 300, label: "Ancré·e", emoji: "👑" }
  ];

  var JOUR = null;
  /** Le jour (AAAA-MM-JJ) à l'heure de Paris, comme dans l'application. */
  function jourParis(d) {
    var date = typeof d === "string" ? new Date(d) : d;
    try {
      JOUR = JOUR || new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });
      return JOUR.format(date);
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  function veille(jour) {
    var d = new Date(jour + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  /** Le même jour ne compte qu'une fois, la veille prolonge la série, un trou la relance à 1. */
  function serieApres(serie, dernierJour, aujourdhui) {
    if (dernierJour === aujourdhui) return Math.max(serie, 1);
    if (dernierJour && serie > 0 && dernierJour === veille(aujourdhui)) return Math.min(serie + 1, SERIE_MAX);
    return 1;
  }

  /** La série affichée : elle tient tant que la personne a joué aujourd'hui ou hier. */
  function serieEnCours(e, maintenant) {
    if (!e.maj) return 0;
    var dernier = jourParis(e.maj);
    var aujourdhui = jourParis(maintenant);
    return dernier === aujourdhui || dernier === veille(aujourdhui) ? e.serieJours : 0;
  }

  function entier(v, min, max) {
    return typeof v === "number" && isFinite(v) && Math.floor(v) === v && v >= min && v <= max;
  }

  function rangerBadges(ids) {
    return BADGES.filter(function (b) { return ids.indexOf(b.id) !== -1; }).map(function (b) { return b.id; });
  }

  function vide() {
    return { v: 1, aEnvoyer: 0, badges: [], serieJours: 0, maj: null };
  }

  /** L'enregistrement du navigateur, ou un enregistrement vide s'il est absent ou illisible. */
  function lireTexte(brut) {
    if (!brut) return vide();
    try {
      var o = JSON.parse(brut);
      if (!o || o.v !== 1 || !entier(o.aEnvoyer, 0, AJOUT_MAX) || !entier(o.serieJours, 0, SERIE_MAX) || !Array.isArray(o.badges)) return vide();
      var maj = typeof o.maj === "string" && !isNaN(Date.parse(o.maj)) ? o.maj : null;
      return { v: 1, aEnvoyer: o.aEnvoyer, badges: rangerBadges(o.badges), serieJours: o.serieJours, maj: maj };
    } catch (e) {
      return vide();
    }
  }

  function lire() {
    try {
      return lireTexte(racine.localStorage.getItem(CLE));
    } catch (e) {
      return vide();
    }
  }

  function ecrire(e) {
    try {
      racine.localStorage.setItem(CLE, JSON.stringify(e));
    } catch (err) {
      // Stockage plein ou refusé (navigation privée) : le jeu continue, sans mémoire.
    }
  }

  /** Une quête validée : les points attendent d'aller dans le compte, la série compte ce jour. */
  function gagner(e, points, badges, maintenant) {
    return {
      v: 1,
      aEnvoyer: Math.min(AJOUT_MAX, e.aEnvoyer + Math.max(0, points)),
      badges: rangerBadges(e.badges.concat(badges || [])),
      serieJours: serieApres(e.serieJours, e.maj ? jourParis(e.maj) : null, jourParis(maintenant)),
      maj: maintenant.toISOString()
    };
  }

  /**
   * Le compte a reçu « envoye » points et répond avec sa progression : on retire ce qui est parti (les points gagnés
   * pendant l'envoi restent à envoyer) et la série repart de celle du compte, sauf si l'on a joué depuis.
   */
  function apresEnvoi(e, envoye, compte) {
    var joueDepuis = e.maj && (!compte.misAJour || Date.parse(e.maj) > Date.parse(compte.misAJour));
    return {
      v: 1,
      aEnvoyer: Math.max(0, e.aEnvoyer - envoye),
      badges: rangerBadges(e.badges.concat(compte.badges || [])),
      serieJours: joueDepuis ? e.serieJours : compte.serieJours,
      maj: joueDepuis ? e.maj : compte.misAJour
    };
  }

  /** « Repartir à zéro » : plus rien à envoyer, plus de badge. La série de jours reste. */
  function repartir(e) {
    return { v: 1, aEnvoyer: 0, badges: [], serieJours: e.serieJours, maj: e.maj };
  }

  /** Un compte est ouvert dans ce navigateur : le cookie de session de la Boussole est là (on ne le lit pas). */
  function sessionOuverte(cookies) {
    return /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/.test(cookies || "");
  }

  /** La réponse de la route : { compte: false }, { compte: true, table: false } ou { compte: true, table: true, progression }. */
  function lireReponse(r) {
    if (!r || r.compte !== true || r.table !== true || !r.progression) return null;
    var p = r.progression;
    if (!entier(p.xp, 0, 1000000) || !entier(p.serieJours, 0, SERIE_MAX) || !Array.isArray(p.badges)) return null;
    return {
      xp: p.xp,
      niveau: typeof p.niveau === "string" ? p.niveau : null,
      badges: rangerBadges(p.badges),
      serieJours: p.serieJours,
      misAJour: typeof p.misAJour === "string" ? p.misAJour : null,
      prochain: p.prochain && entier(p.prochain.seuil, 0, 1000000) ? { id: p.prochain.id, seuil: p.prochain.seuil, manque: p.prochain.manque } : null
    };
  }

  function appeler(methode, corps) {
    if (!racine.fetch || !sessionOuverte(racine.document && racine.document.cookie)) return Promise.resolve(null);
    var options = { method: methode, credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store" };
    if (corps) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(corps);
    }
    return racine.fetch(API, options)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(lireReponse)
      .catch(function () { return null; });
  }

  /** La progression du compte, ou null sans compte (ou si le compte ne répond pas). */
  function lireCompte() {
    return appeler("GET");
  }

  /** Envoie au compte ce que le navigateur a de neuf ; null sans compte ou en cas d'échec (on réessaiera). */
  function envoyer(e, options) {
    return appeler("POST", { ajout: e.aEnvoyer, badges: e.badges, serieJours: e.serieJours, maj: e.maj, repartir: Boolean(options && options.repartir) });
  }

  var api = {
    CLE: CLE,
    API: API,
    CONNEXION: CONNEXION,
    INSCRIPTION: INSCRIPTION,
    ESPACE: ESPACE,
    BADGES: BADGES,
    jourParis: jourParis,
    veille: veille,
    serieApres: serieApres,
    serieEnCours: serieEnCours,
    vide: vide,
    lireTexte: lireTexte,
    lire: lire,
    ecrire: ecrire,
    gagner: gagner,
    apresEnvoi: apresEnvoi,
    repartir: repartir,
    sessionOuverte: sessionOuverte,
    lireReponse: lireReponse,
    lireCompte: lireCompte,
    envoyer: envoyer
  };
  racine.MHProgression = api;
})(this);
