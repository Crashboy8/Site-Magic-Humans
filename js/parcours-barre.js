/* Barre « Mon parcours · Mes outils » des outils du site statique (Quiz Talent Unique, Quiz Amour, Carte du Talent).
   Où que l'on soit dans un outil : retour en un geste à « Où j'en suis ? » (ou à Mon espace avec un compte), passage
   d'un outil à l'autre, et de quoi créer son compte pour garder son travail. L'application a la même barre
   (apps/boussole-decision/src/features/espace/BarreParcours.tsx) : mêmes adresses, mêmes noms d'outils.
   Le script ne lit que deux choses, dans le navigateur, et n'envoie rien :
   - l'instantané « ou_j_en_suis_resume_v1 » écrit par « Où j'en suis ? » (étape, points, jamais les réponses) ;
   - la présence du cookie de session Supabase (sb-…-auth-token), pour savoir si un compte est ouvert. */
(function (racine) {
  "use strict";

  var CLE = "ou_j_en_suis_resume_v1";
  var BASE = "/boussole-decision";
  var SUITE = "?suite=%2Fmon-espace%2F";

  var TEXTES = {
    fr: {
      aria: "Ton parcours et tes outils",
      parcours: "Mon parcours",
      aucun: "Fais le point en 2 minutes",
      etape: "Étape",
      fini: "Ton Ikigai",
      point: "point",
      points: "points",
      outils: "Mes outils",
      ici: "Tu es ici",
      compteTitre: "Garde ton travail",
      compteTexte: "Crée ton compte pour garder ton parcours et tes Boussoles, et les retrouver sur tous tes appareils.",
      creer: "Créer mon compte",
      connecter: "J'ai déjà un compte",
      espace: "Ouvrir mon espace",
      compteOk: "Ton travail est gardé dans ton compte.",
      pro: "Vie professionnelle",
      coeur: "Vie perso et amour"
    },
    en: {
      aria: "Your journey and your tools",
      parcours: "My journey",
      aucun: "Take stock in 2 minutes",
      etape: "Step",
      fini: "Your Ikigai",
      point: "point",
      points: "points",
      outils: "My tools",
      ici: "You are here",
      compteTitre: "Keep your work",
      compteTexte: "Create your account to keep your journey and your Compasses, and find them on all your devices.",
      creer: "Create my account",
      connecter: "I already have an account",
      espace: "Open my space",
      compteOk: "Your work is kept in your account.",
      pro: "Work life",
      coeur: "Personal life and love"
    },
    es: {
      aria: "Tu recorrido y tus herramientas",
      parcours: "Mi recorrido",
      aucun: "Haz balance en 2 minutos",
      etape: "Etapa",
      fini: "Tu Ikigai",
      point: "punto",
      points: "puntos",
      outils: "Mis herramientas",
      ici: "Estás aquí",
      compteTitre: "Guarda tu trabajo",
      compteTexte: "Crea tu cuenta para guardar tu recorrido y tus Brújulas, y encontrarlos en todos tus dispositivos.",
      creer: "Crear mi cuenta",
      connecter: "Ya tengo una cuenta",
      espace: "Abrir mi espacio",
      compteOk: "Tu trabajo está guardado en tu cuenta.",
      pro: "Vida profesional",
      coeur: "Vida personal y amor"
    }
  };

  var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

  /* Dans l'ordre du menu de Mon espace et de la page Tes outils. Noms, icônes et couleurs : ceux de /outils/. */
  var OUTILS = [
    { cle: "qcm", section: "pro", chemin: "/quiz/", langue: true, forte: "#D4532C", fond: "#FDE8E1",
      noms: { fr: "Quiz Talent Unique", en: "Unique Talent quiz", es: "Test de Talento Único" },
      icone: '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M9 3.5h6v2.2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M9.5 11h5M9.5 14.5h3.5"/>' },
    { cle: "boussole", section: "pro", chemin: BASE + "/", langue: false, forte: "#6E4E96", fond: "#F3ECF8",
      noms: { fr: "Boussole de décision pro", en: "Decision Compass: work", es: "Brújula de decisión pro" },
      icone: '<circle cx="12" cy="12" r="8.5"/><path d="m14.8 9.2-1.1 3.4-3.4 1.1 1.1-3.4z"/>' },
    { cle: "cibleur", section: "pro", chemin: BASE + "/ma-cible/", langue: false, forte: "#1F7A6E", fond: "#E5F6F3",
      noms: { fr: "Le Cibleur", en: "The Targeter", es: "El Buscador de Clientes" },
      icone: '<circle cx="12" cy="12" r="6.5"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>' },
    { cle: "carte", section: "pro", chemin: "/carte-du-talent/", langue: false, forte: "#C4922A", fond: "#FFF3D4",
      noms: { fr: "Carte du Talent", en: "Talent Map", es: "Mapa del Talento" },
      icone: '<path d="M9 4.5 4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z"/><path d="M9 4.5v13M15 6.5v13"/>' },
    { cle: "amour", section: "coeur", chemin: "/quiz-amour/", langue: true, forte: "#C2412D", fond: "#FDE9E4",
      noms: { fr: "Quiz Amour", en: "Love Quiz", es: "Test del Amor" },
      icone: '<path d="M12 19.2s-6.2-3.8-6.2-7.6a3.4 3.4 0 0 1 6.2-1.9 3.4 3.4 0 0 1 6.2 1.9c0 3.8-6.2 7.6-6.2 7.6z"/>' },
    { cle: "relation", section: "coeur", chemin: BASE + "/importer-quiz/?theme=amour", langue: false, forte: "#B4235A", fond: "#FCE7EF",
      noms: { fr: "Boussole de décision perso", en: "Decision Compass: personal", es: "Brújula de decisión personal" },
      icone: '<circle cx="12" cy="12" r="8.5"/><path d="M12 16.2s-3.6-2.2-3.6-4.4a2 2 0 0 1 3.6-1.1 2 2 0 0 1 3.6 1.1c0 2.2-3.6 4.4-3.6 4.4z"/><path d="M12 3.5v1.8M12 18.7v1.8"/>' }
  ];

  var MARQUE = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#FFF5D9"/><path d="M6.5 30 C 11 23, 16 31, 21.5 24 S 29 15, 31 13" fill="none" stroke="#3A2F24" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.4 3.4"/><circle cx="7" cy="29.5" r="2.8" fill="#D4532C"/><circle cx="21.5" cy="24" r="2.8" fill="#1F9E8C"/><path d="M31 5.5v11" stroke="#3A2F24" stroke-width="1.7" stroke-linecap="round"/><path d="M31.4 6.2h6.4l-2 2.8 2 2.8h-6.4z" fill="#E0A526"/></svg>';
  var FLECHE_G = SVG + '<path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  var FLECHE_D = SVG + '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CHEVRON = SVG + '<path d="m6 9 6 6 6-6"/></svg>';
  var PIN = SVG + '<path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>';
  var COCHE = SVG + '<path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  var CSS = [
    ".mhp{--mhp-bg:#FFFBF2;--mhp-bord:#EADFC9;--mhp-ink:#3A2F24;--mhp-soft:#6B5D4E;--mhp-or:#FFF5D9;--mhp-or-bord:#F0D9A0;--mhp-or-ink:#4A3300;--mhp-or-ink2:#6B4E00;--mhp-or-fl:#7A5200;--mhp-btn:#fff;--mhp-pan:#fff;--mhp-ligne:rgba(58,47,36,.14);--mhp-actif:#F1E9DC;--mhp-cpt:#F7E9DE;--mhp-ok:#E6EEE1;--mhp-ok-ink:#55704F;--mhp-accent:#B34716;--mhp-accent-fonce:#8F3810;--mhp-lien:#A8431A}",
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .mhp{--mhp-bg:#1B1816;--mhp-bord:#3A332E;--mhp-ink:#F1ECE6;--mhp-soft:#ABA097;--mhp-or:#3A2F1A;--mhp-or-bord:#6B5420;--mhp-or-ink:#FFE3A0;--mhp-or-ink2:#F2D58A;--mhp-or-fl:#F2C14E;--mhp-btn:#25211E;--mhp-pan:#25211E;--mhp-ligne:#3A332E;--mhp-actif:#3A332E;--mhp-cpt:#3A2618;--mhp-ok:#1F3328;--mhp-ok-ink:#7CC59A;--mhp-accent:#F08A3E;--mhp-accent-fonce:#F6A15F;--mhp-lien:#F08A3E}}",
    ":root[data-theme=dark] .mhp{--mhp-bg:#1B1816;--mhp-bord:#3A332E;--mhp-ink:#F1ECE6;--mhp-soft:#ABA097;--mhp-or:#3A2F1A;--mhp-or-bord:#6B5420;--mhp-or-ink:#FFE3A0;--mhp-or-ink2:#F2D58A;--mhp-or-fl:#F2C14E;--mhp-btn:#25211E;--mhp-pan:#25211E;--mhp-ligne:#3A332E;--mhp-actif:#3A332E;--mhp-cpt:#3A2618;--mhp-ok:#1F3328;--mhp-ok-ink:#7CC59A;--mhp-accent:#F08A3E;--mhp-accent-fonce:#F6A15F;--mhp-lien:#F08A3E}",
    ".mhp{position:sticky;top:0;z-index:2000;flex:none;box-sizing:border-box;background:var(--mhp-bg);border-bottom:1px solid var(--mhp-bord);color:var(--mhp-ink);font-family:inherit;font-size:15px;line-height:1.3;-webkit-text-size-adjust:100%}",
    ".mhp *{box-sizing:border-box}",
    ":where(.mhp a,.mhp button){font:inherit;color:inherit;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}",
    ".mhp a:focus-visible,.mhp button:focus-visible{outline:3px solid #1F5F70;outline-offset:2px}",
    ".mhp svg{display:block}",
    ".mhp-in{max-width:1100px;margin:0 auto;padding:6px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".mhp-parcours{display:flex;align-items:center;gap:8px;min-width:0;min-height:44px;padding:4px 12px 4px 10px;border:1px solid var(--mhp-or-bord);border-radius:12px;background:var(--mhp-or);box-shadow:0 2px 0 rgba(184,130,20,.3);text-align:left}",
    ".mhp-parcours:hover{filter:brightness(.97)}",
    ".mhp-parcours:active,.mhp-btn:active,.mhp-compte:active,.mhp-cta:active{transform:translateY(1px);box-shadow:none}",
    ".mhp-retour{width:16px;height:16px;flex:none;color:var(--mhp-or-fl)}",
    ".mhp-retour svg,.mhp-chev svg,.mhp-fl svg,.mhp-pin svg,.mhp-coche svg{width:100%;height:100%}",
    ".mhp-marque{display:none;width:28px;height:28px;flex:none}",
    ".mhp-marque svg{width:100%;height:100%}",
    ".mhp-txt{min-width:0;display:block}",
    ".mhp-t1{display:block;font-size:15px;font-weight:700;color:var(--mhp-or-ink);white-space:nowrap}",
    ".mhp-t2{display:block;font-size:12.5px;color:var(--mhp-or-ink2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".mhp-droite{display:flex;align-items:center;gap:8px;flex:none}",
    ".mhp-btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border:2px solid rgba(128,112,96,.55);border-radius:12px;background:var(--mhp-btn);color:var(--mhp-ink);font-weight:600;box-shadow:0 2px 0 rgba(58,47,36,.16)}",
    ".mhp-btn:hover{border-color:rgba(128,112,96,.9)}",
    ".mhp-chev{width:16px;height:16px;flex:none;transition:transform .15s}",
    ".mhp-btn[aria-expanded=true] .mhp-chev{transform:rotate(180deg)}",
    ".mhp-compte{display:none;align-items:center;min-height:44px;padding:0 14px;border:2px solid var(--mhp-accent);border-radius:12px;background:var(--mhp-btn);color:var(--mhp-accent);font-weight:600;box-shadow:0 2px 0 rgba(179,71,22,.25)}",
    ".mhp-menu{position:relative}",
    ".mhp-liste{position:absolute;right:0;top:calc(100% + 8px);z-index:1;width:min(23rem,calc(100vw - 1.5rem));max-height:calc(100vh - 5rem);max-height:calc(100dvh - 5rem);overflow-y:auto;padding:12px;background:var(--mhp-pan);border:1px solid var(--mhp-ligne);border-radius:16px;box-shadow:0 24px 60px -24px rgba(58,47,36,.55)}",
    ".mhp-liste[hidden]{display:none}",
    ".mhp-sec{margin:0 0 8px}",
    ".mhp-h{margin:0;padding:0 4px 4px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mhp-soft)}",
    ".mhp-ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}",
    ".mhp-lien{display:flex;align-items:center;gap:12px;min-height:48px;padding:8px;border:1px solid var(--mhp-ligne);border-radius:12px;background:var(--mhp-pan);color:var(--mhp-ink)}",
    ".mhp-lien:hover{border-color:rgba(128,112,96,.6);box-shadow:0 8px 18px -12px rgba(58,47,36,.5)}",
    ".mhp-lien[aria-current=page]{background:var(--mhp-actif);border-color:transparent}",
    ".mhp-ico{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;flex:none}",
    ".mhp-ico svg{width:20px;height:20px}",
    ".mhp-nom{flex:1;min-width:0;display:block;font-size:16px;font-weight:600;line-height:1.2}",
    ".mhp-ici{display:flex;align-items:center;gap:4px;margin-top:2px;font-size:12px;font-weight:600;color:var(--mhp-soft)}",
    ".mhp-pin{width:14px;height:14px;flex:none}",
    ".mhp-fl{width:16px;height:16px;flex:none;color:var(--mhp-soft)}",
    ".mhp-cpt{margin-top:4px;padding:12px;border-radius:12px;background:var(--mhp-cpt)}",
    ".mhp-cpt-t{margin:0;font-size:17px;font-weight:700;line-height:1.2}",
    ".mhp-cpt-p{margin:4px 0 0;font-size:14px;line-height:1.4;color:var(--mhp-soft)}",
    ".mhp-cta{display:flex;align-items:center;justify-content:center;min-height:44px;margin-top:12px;padding:0 16px;border-radius:12px;background:var(--mhp-accent);color:#fff;font-weight:600;box-shadow:0 3px 0 rgba(143,56,16,.6)}",
    ".mhp-cta:hover{background:var(--mhp-accent-fonce)}",
    ".mhp-conn{display:flex;align-items:center;justify-content:center;min-height:40px;margin-top:4px;font-size:14px;font-weight:500;color:var(--mhp-lien);text-decoration:underline;text-underline-offset:4px}",
    ".mhp-ok{margin-top:4px;padding:10px 12px;border-radius:12px;background:var(--mhp-ok)}",
    ".mhp-ok-p{display:flex;align-items:center;gap:6px;margin:0;font-size:14px;font-weight:600;color:var(--mhp-ok-ink)}",
    ".mhp-coche{width:16px;height:16px;flex:none}",
    ".mhp-ok .mhp-conn{justify-content:flex-start;min-height:36px;margin-top:0}",
    "@media (min-width:420px){.mhp-marque{display:block}}",
    "@media (min-width:640px){.mhp-in{padding:6px 24px}.mhp-compte{display:inline-flex}}",
    "@media (prefers-reduced-motion:reduce){.mhp-chev{transition:none}}",
    "@media print{.mhp{display:none!important}}"
  ].join("\n");

  /* ---------- Fonctions pures (testées) ---------- */

  function langue(doc, stockage) {
    var l = doc && doc.documentElement && doc.documentElement.lang ? String(doc.documentElement.lang).slice(0, 2).toLowerCase() : "";
    if (TEXTES[l]) return l;
    var cles = ["mh-lang", "mh-quiz-lang", "carteDuTalent.langue"];
    for (var i = 0; i < cles.length; i++) {
      var v = null;
      try { v = stockage && stockage.getItem(cles[i]); } catch (e) { v = null; }
      if (TEXTES[v]) return v;
    }
    return "fr";
  }

  /* Même contrôle que lireInstantane (instantane.ts) : une valeur qui n'est pas celle qu'on attend est ignorée. */
  function lireInstantane(brut) {
    if (!brut) return null;
    try {
      var o = JSON.parse(brut);
      if (!o || o.v !== 1) return null;
      if (typeof o.maj !== "string" || typeof o.etape !== "string" || typeof o.fin !== "boolean") return null;
      if (o.etape.length > 14 || !/^[A-Za-z0-9 +]*$/.test(o.etape)) return null;
      if (typeof o.points !== "number" || o.points % 1 !== 0 || o.points < 0 || o.points > 100000) return null;
      return { v: 1, maj: o.maj, etape: o.etape, fin: o.fin, points: o.points };
    } catch (e) {
      return null;
    }
  }

  function aSession(cookies) {
    return /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/.test(cookies || "");
  }

  function outilCourant(chemin, recherche) {
    chemin = chemin || "";
    if (chemin.indexOf("/carte-du-talent") === 0) return "carte";
    if (chemin.indexOf("/quiz-amour") === 0) return "amour";
    if (chemin.indexOf("/quiz") === 0) return /(?:^|[?&])theme=amour(?:&|$)/.test(recherche || "") ? "amour" : "qcm";
    return null;
  }

  function lienParcours(session) {
    return session ? BASE + "/mon-espace/" : BASE + "/ou-j-en-suis/";
  }
  function lienCompte(session) {
    return session ? BASE + "/mon-espace/" : BASE + "/inscription/" + SUITE;
  }
  function lienConnexion() {
    return BASE + "/connexion/" + SUITE;
  }
  function lienOutil(outil, lg) {
    return outil.langue && lg !== "fr" ? outil.chemin + "?lang=" + lg : outil.chemin;
  }

  function etat(T, instantane) {
    if (!instantane) return T.aucun;
    var morceaux = [];
    if (instantane.fin) morceaux.push(T.fini);
    else if (instantane.etape) morceaux.push(T.etape + " " + instantane.etape);
    morceaux.push(instantane.points + " " + (instantane.points === 1 ? T.point : T.points));
    return morceaux.join(" · ");
  }

  /* ---------- Rendu ---------- */

  function contenu(lg, courant, session, instantane) {
    var T = TEXTES[lg];
    var sections = "";
    ["pro", "coeur"].forEach(function (section) {
      var lignes = "";
      OUTILS.forEach(function (o) {
        if (o.section !== section) return;
        var ici = o.cle === courant;
        lignes += '<li><a class="mhp-lien" href="' + lienOutil(o, lg) + '"' + (ici ? ' aria-current="page"' : "") + ">" +
          '<span class="mhp-ico" aria-hidden="true" style="background:' + o.fond + ";color:" + o.forte + '">' + SVG + o.icone + "</svg></span>" +
          '<span class="mhp-nom">' + o.noms[lg] +
          (ici ? '<span class="mhp-ici"><span class="mhp-pin" aria-hidden="true">' + PIN + "</span>" + T.ici + "</span>" : "") + "</span>" +
          (ici ? "" : '<span class="mhp-fl" aria-hidden="true">' + FLECHE_D + "</span>") + "</a></li>";
      });
      sections += '<section class="mhp-sec" aria-label="' + T[section] + '"><h2 class="mhp-h">' + T[section] + '</h2><ul class="mhp-ul">' + lignes + "</ul></section>";
    });
    var compte = session
      ? '<div class="mhp-ok"><p class="mhp-ok-p"><span class="mhp-coche" aria-hidden="true">' + COCHE + "</span>" + T.compteOk + '</p><a class="mhp-conn" href="' + lienCompte(true) + '">' + T.espace + "</a></div>"
      : '<div class="mhp-cpt"><p class="mhp-cpt-t">' + T.compteTitre + '</p><p class="mhp-cpt-p">' + T.compteTexte + '</p><a class="mhp-cta" href="' + lienCompte(false) + '">' + T.creer + '</a><a class="mhp-conn" href="' + lienConnexion() + '">' + T.connecter + "</a></div>";
    return {
      barre:
        '<div class="mhp-in"><a class="mhp-parcours" href="' + lienParcours(session) + '">' +
        '<span class="mhp-retour" aria-hidden="true">' + FLECHE_G + "</span>" +
        '<span class="mhp-marque" aria-hidden="true">' + MARQUE + "</span>" +
        '<span class="mhp-txt"><span class="mhp-t1">' + T.parcours + '</span><span class="mhp-t2">' + etat(T, instantane) + "</span></span></a>" +
        '<div class="mhp-droite">' +
        (session ? "" : '<a class="mhp-compte" href="' + lienCompte(false) + '">' + T.creer + "</a>") +
        '<div class="mhp-menu"><button type="button" class="mhp-btn" aria-expanded="false" aria-controls="mhp-liste">' + T.outils +
        '<span class="mhp-chev" aria-hidden="true">' + CHEVRON + '</span></button><div class="mhp-liste" id="mhp-liste" hidden>' + sections + compte + "</div></div></div></div>",
      aria: T.aria
    };
  }

  function cookies(doc) {
    try { return doc.cookie; } catch (e) { return ""; }
  }

  /* script : la balise qui charge ce fichier. data-outil="carte" force l'outil marqué « Tu es ici ». */
  function monter(doc, win, script) {
    if (!doc || !doc.body || doc.getElementById("mhp")) return null;
    var force = script && script.getAttribute ? script.getAttribute("data-outil") : null;
    var style = doc.createElement("style");
    style.id = "mhp-css";
    style.textContent = CSS;
    doc.head.appendChild(style);
    var nav = doc.createElement("nav");
    nav.id = "mhp";
    nav.className = "mhp";
    doc.body.insertBefore(nav, doc.body.firstChild);
    // Une page sans remise à zéro garde la marge de 8 px du navigateur autour de son corps : la barre la compense pour toucher les bords.
    try {
      var cs = win.getComputedStyle(doc.body);
      nav.style.margin = "-" + cs.marginTop + " -" + cs.marginRight + " 0 -" + cs.marginLeft;
    } catch (e) { /* mise en page par défaut */ }

    function stockage() { try { return win.localStorage; } catch (e) { return null; } }
    function dessiner() {
      var lg = langue(doc, stockage());
      var brut = null;
      try { brut = stockage() && stockage().getItem(CLE); } catch (e) { brut = null; }
      var courant = force || outilCourant(win.location.pathname, win.location.search);
      var vue = contenu(lg, courant, aSession(cookies(doc)), lireInstantane(brut));
      var ouvert = nav.querySelector(".mhp-btn") && nav.querySelector(".mhp-btn").getAttribute("aria-expanded") === "true";
      nav.setAttribute("aria-label", vue.aria);
      nav.innerHTML = vue.barre;
      var bouton = nav.querySelector(".mhp-btn");
      var liste = nav.querySelector(".mhp-liste");
      function basculer(plus) {
        bouton.setAttribute("aria-expanded", plus ? "true" : "false");
        liste.hidden = !plus;
      }
      bouton.addEventListener("click", function () { basculer(bouton.getAttribute("aria-expanded") !== "true"); });
      if (ouvert) basculer(true);
      doc.documentElement.style.setProperty("--mhp-h", nav.offsetHeight + "px");
    }
    dessiner();

    doc.addEventListener("pointerdown", function (e) {
      var bouton = nav.querySelector(".mhp-btn");
      if (bouton && bouton.getAttribute("aria-expanded") === "true" && !nav.querySelector(".mhp-menu").contains(e.target)) {
        bouton.setAttribute("aria-expanded", "false");
        nav.querySelector(".mhp-liste").hidden = true;
      }
    });
    doc.addEventListener("keydown", function (e) {
      var bouton = nav.querySelector(".mhp-btn");
      if (e.key === "Escape" && bouton && bouton.getAttribute("aria-expanded") === "true") {
        bouton.setAttribute("aria-expanded", "false");
        nav.querySelector(".mhp-liste").hidden = true;
        bouton.focus();
      }
    });
    // Le Quiz et les pages du site changent de langue sans recharger : la barre suit. L'instantané peut changer dans un autre onglet.
    if (win.MutationObserver) new win.MutationObserver(dessiner).observe(doc.documentElement, { attributes: true, attributeFilter: ["lang"] });
    win.addEventListener("storage", function (e) { if (e.key === CLE) dessiner(); });
    // La hauteur de la barre sert aux pages dont des fenêtres plein écran doivent commencer en dessous (Carte du Talent).
    function mesurer() { doc.documentElement.style.setProperty("--mhp-h", nav.offsetHeight + "px"); }
    win.addEventListener("resize", mesurer);
    win.addEventListener("load", mesurer);
    return nav;
  }

  racine.MHParcoursBarre = {
    CLE: CLE, TEXTES: TEXTES, OUTILS: OUTILS, CSS: CSS,
    langue: langue, lireInstantane: lireInstantane, aSession: aSession, outilCourant: outilCourant,
    lienParcours: lienParcours, lienCompte: lienCompte, lienConnexion: lienConnexion, lienOutil: lienOutil, etat: etat, contenu: contenu
  };

  if (typeof document !== "undefined") {
    var balise = document.currentScript;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { monter(document, window, balise); });
    else monter(document, window, balise);
  }
})(typeof window !== "undefined" ? window : this);
