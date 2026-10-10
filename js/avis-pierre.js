/* « Demander l'avis de Pierre » sur le site statique (Quiz Talent Unique, Quiz Amour, Carte du Talent, le jeu).
   Un outil pose un emplacement <div data-avis-pierre data-outil="quiz-talent" data-etape="resultats"></div> ; ce script y
   met un bouton discret qui ouvre un court formulaire : la question (500 caractères au maximum), le mail sans compte,
   et une case jamais cochée d'avance « J'accepte que Pierre me réponde par mail ». Les emplacements ajoutés plus tard
   (pages redessinées en JavaScript) sont repérés tout seuls. L'application a le même bouton
   (apps/boussole-decision/src/features/intention/DemanderAvis.tsx), avec les mêmes textes et la même route :
   /boussole-decision/api/intention/ (même adresse que le site). Tout est écrit avec textContent : la question reste
   du texte, et n'est donnée à aucune IA. Aucun numéro de téléphone ni lien de messagerie ici. */
(function (racine) {
  "use strict";

  var API = "/boussole-decision/api/intention/";
  var DONNEES = "/boussole-decision/tes-donnees/";
  var QUESTION_MAX = 500;
  var OUTILS = ["cibleur", "boussole-pro", "boussole-perso", "carte-talent", "quiz-talent", "quiz-amour", "ou-j-en-suis", "jeu"];

  var TEXTES = {
    fr: {
      bouton: "Demander l'avis de Pierre",
      titre: "Demander l'avis de Pierre",
      intro: "Une question sur ce que tu vois ici ? Écris-la, elle arrive directement chez Pierre.",
      question: "Ta question",
      compteur: "{n} / {max} caractères",
      mail: "Ton mail",
      mailAide: "Tu n'as pas de compte : ton mail permet à Pierre de te répondre.",
      accord: "J'accepte que Pierre me réponde par mail",
      piege: "Ne remplis pas ce champ",
      envoyer: "Envoyer ma question",
      envoi: "Envoi…",
      fermer: "Fermer",
      donnees: "Ce qu'on garde : ta question, l'outil, l'écran et la date.",
      lienDonnees: "Tes données",
      chargement: "Un instant…",
      envoye: "C'est envoyé. Ta question est bien arrivée chez Pierre.",
      erreurs: {
        question: "Écris ta question (500 caractères au maximum).",
        mail: "Vérifie ton mail.",
        trop_tot: "Prends quelques secondes avant d'envoyer.",
        jeton: "Le formulaire a expiré. Ferme-le et ouvre-le à nouveau.",
        attendre: "Tu as déjà envoyé une demande il y a moins de 10 minutes. Réessaie un peu plus tard.",
        plafond: "Beaucoup de demandes en ce moment. Réessaie dans une minute.",
        indisponible: "L'envoi n'a pas marché. Réessaie dans un moment."
      }
    },
    en: {
      bouton: "Ask Pierre's opinion",
      titre: "Ask Pierre's opinion",
      intro: "A question about what you see here? Write it down, it goes straight to Pierre.",
      question: "Your question",
      compteur: "{n} / {max} characters",
      mail: "Your email",
      mailAide: "You don't have an account: your email lets Pierre reply to you.",
      accord: "I agree that Pierre may reply to me by email",
      piege: "Leave this field empty",
      envoyer: "Send my question",
      envoi: "Sending…",
      fermer: "Close",
      donnees: "What we keep: your question, the tool, the screen and the date.",
      lienDonnees: "Your data",
      chargement: "One moment…",
      envoye: "Sent. Your question has reached Pierre.",
      erreurs: {
        question: "Write your question (500 characters at most).",
        mail: "Check your email address.",
        trop_tot: "Take a few seconds before sending.",
        jeton: "The form has expired. Close it and open it again.",
        attendre: "You already sent a request less than 10 minutes ago. Try again a little later.",
        plafond: "Lots of requests right now. Try again in a minute.",
        indisponible: "Sending didn't work. Try again in a moment."
      }
    },
    es: {
      bouton: "Pedir la opinión de Pierre",
      titre: "Pedir la opinión de Pierre",
      intro: "¿Una pregunta sobre lo que ves aquí? Escríbela, le llega directamente a Pierre.",
      question: "Tu pregunta",
      compteur: "{n} / {max} caracteres",
      mail: "Tu correo",
      mailAide: "No tienes cuenta: tu correo permite a Pierre responderte.",
      accord: "Acepto que Pierre me responda por correo",
      piege: "No rellenes este campo",
      envoyer: "Enviar mi pregunta",
      envoi: "Enviando…",
      fermer: "Cerrar",
      donnees: "Qué guardamos: tu pregunta, la herramienta, la pantalla y la fecha.",
      lienDonnees: "Tus datos",
      chargement: "Un momento…",
      envoye: "Enviado. Tu pregunta le ha llegado a Pierre.",
      erreurs: {
        question: "Escribe tu pregunta (500 caracteres como máximo).",
        mail: "Revisa tu correo.",
        trop_tot: "Tómate unos segundos antes de enviar.",
        jeton: "El formulario ha caducado. Ciérralo y vuelve a abrirlo.",
        attendre: "Ya enviaste una solicitud hace menos de 10 minutos. Vuelve a intentarlo un poco más tarde.",
        plafond: "Hay muchas solicitudes ahora mismo. Vuelve a intentarlo en un minuto.",
        indisponible: "El envío no ha funcionado. Vuelve a intentarlo en un momento."
      }
    }
  };

  var ERREURS = ["question", "mail", "trop_tot", "jeton", "attendre", "plafond", "indisponible"];

  /** Même typographie que l'application (src/i18n/typo.ts) : pas de coupure avant « ? : ; ! » ni après un nombre. */
  function insecables(t) {
    return String(t)
      .replace(/(\d) (?=[A-Za-zÀ-ÿ€%$£])/g, "$1 ")
      .replace(/ ([:;?!%»])/g, " $1")
      .replace(/« /g, "« ");
  }

  /** Langue de la page (le Quiz et la Carte la changent sans recharger), puis le choix gardé par le site. */
  function langue(doc, win) {
    var l = doc && doc.documentElement ? String(doc.documentElement.lang || "").slice(0, 2) : "";
    if (TEXTES[l]) return l;
    try { l = win.localStorage.getItem("mh-lang"); } catch (e) { l = null; }
    return TEXTES[l] ? l : "fr";
  }

  function texte(lang, cle) {
    return insecables((TEXTES[lang] || TEXTES.fr)[cle]);
  }

  function compteur(lang, n) {
    return insecables((TEXTES[lang] || TEXTES.fr).compteur.replace("{n}", String(n)).replace("{max}", String(QUESTION_MAX)));
  }

  function messageErreur(lang, cle) {
    if (cle === "invalide") cle = "question";
    if (ERREURS.indexOf(cle) === -1) cle = "indisponible";
    return insecables((TEXTES[lang] || TEXTES.fr).erreurs[cle]);
  }

  /** Nombre de caractères comme la base les compte (un emoji = 1). */
  function longueur(t) {
    return Array.from(String(t)).length;
  }

  var ICONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4.5 19.5l1.4-4.1A7.5 7.5 0 1 1 20 11.5z"/><path d="M9 10.5h6M9 13.5h4"/></svg>';

  var CSS = [
    ".mhav-btn{display:inline-flex;align-items:center;gap:8px;max-width:100%;min-height:44px;margin:0;padding:8px 16px;border:1px solid rgba(179,71,22,.3);border-radius:999px;background:#FFFDF9;color:#8F3810;font:inherit;font-size:15px;font-weight:600;line-height:1.2;text-align:left;text-decoration:none;cursor:pointer;box-shadow:none;-webkit-tap-highlight-color:transparent}",
    ".mhav-btn:hover{border-color:rgba(179,71,22,.6);background:#F7E9DE}",
    ".mhav-btn:focus-visible,.mhav-dlg :focus-visible{outline:2px solid #B34716;outline-offset:2px}",
    ".mhav-btn svg{display:block;flex:none;width:18px;height:18px}",
    ".mhav-btn span{white-space:nowrap}",
    ".mhav-dlg{box-sizing:border-box;width:calc(100% - 32px);max-width:448px;max-height:calc(100% - 32px);margin:auto;padding:24px;border:1px solid rgba(58,47,36,.14);border-radius:16px;background:#FBF7F0;color:#3A2F24;font-family:inherit;font-size:16px;line-height:1.5;box-shadow:0 20px 50px rgba(58,47,36,.25);overflow:auto}",
    ".mhav-dlg[open]{display:block}",
    ".mhav-dlg::backdrop{background:rgba(58,47,36,.4)}",
    ".mhav-dlg *{box-sizing:border-box}",
    ".mhav-dlg h2{display:flex;align-items:center;gap:8px;margin:0 0 12px;font-size:24px;line-height:1.2;font-style:italic;color:#3A2F24}",
    ".mhav-dlg h2 svg{flex:none;width:24px;height:24px;color:#B34716}",
    ".mhav-dlg p{margin:0 0 12px}",
    ".mhav-intro,.mhav-aide,.mhav-note{color:#6B5D4E}",
    ".mhav-aide,.mhav-note,.mhav-n{font-size:14px}",
    ".mhav-n{margin:4px 0 12px;text-align:right;color:#6B5D4E}",
    ".mhav-dlg label.mhav-lab{display:block;margin:0 0 6px;font-weight:600;font-size:15px}",
    ".mhav-dlg textarea,.mhav-dlg input[type=email]{display:block;width:100%;margin:0;padding:10px 14px;border:1px solid rgba(58,47,36,.2);border-radius:12px;background:#FFFDF9;color:#3A2F24;font:inherit;font-size:16px}",
    ".mhav-dlg textarea{min-height:112px;resize:vertical}",
    ".mhav-dlg textarea:focus,.mhav-dlg input[type=email]:focus{border-color:#B34716;outline:none;box-shadow:0 0 0 3px rgba(226,104,58,.25)}",
    ".mhav-piege{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}",
    ".mhav-case{display:flex;align-items:flex-start;gap:12px;margin:4px 0 16px;font-size:15px;cursor:pointer}",
    ".mhav-case input{flex:none;width:20px;height:20px;margin:2px 0 0;accent-color:#B34716}",
    ".mhav-err,.mhav-ok{margin:0 0 12px;padding:12px 16px;border-radius:12px;font-size:15px}",
    ".mhav-err{border:1px solid rgba(163,58,42,.3);background:#F8E3DD;color:#A33A2A}",
    ".mhav-ok{border:1px solid rgba(85,112,79,.3);background:#E6EEE1;color:#3A2F24}",
    ".mhav-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:0 0 12px}",
    ".mhav-envoyer,.mhav-fermer{display:inline-flex;align-items:center;justify-content:center;min-height:44px;margin:0;padding:10px 20px;border-radius:999px;font:inherit;font-size:15px;font-weight:600;cursor:pointer}",
    ".mhav-envoyer{border:0;background:#B34716;color:#fff}",
    ".mhav-envoyer:hover{background:#8F3810}",
    ".mhav-envoyer:disabled{opacity:.5;cursor:not-allowed}",
    ".mhav-fermer{border:1px solid rgba(58,47,36,.25);background:#FFFDF9;color:#3A2F24}",
    ".mhav-fermer:hover{background:#F1E9DC}",
    ".mhav-note a{color:#A8431A;text-decoration:underline}",
    ".avis-pierre{margin:24px 0}",
    ".avis-pierre.avis-pierre-entete{margin:0}",
    "@media print{[data-avis-pierre],.mhav-dlg{display:none!important}}"
  ].join("\n");

  function el(doc, balise, attrs, contenu) {
    var e = doc.createElement(balise);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (contenu !== undefined) e.textContent = contenu;
    return e;
  }

  var compte = 0;

  /** Le formulaire, dans une fenêtre posée sur la page entière : un outil qui se redessine ne l'efface pas. */
  function ouvrir(doc, win, outil, etape, retour) {
    var lang = langue(doc, win);
    var id = "mhav-" + (++compte);
    var dlg = el(doc, "dialog", { "class": "mhav-dlg", "aria-labelledby": id + "-t", lang: lang });
    var titre = el(doc, "h2", { id: id + "-t" });
    titre.innerHTML = ICONE;
    titre.appendChild(doc.createTextNode(texte(lang, "titre")));
    dlg.appendChild(titre);

    var form = el(doc, "form", { novalidate: "" });
    form.appendChild(el(doc, "p", { "class": "mhav-intro" }, texte(lang, "intro")));
    form.appendChild(el(doc, "label", { "class": "mhav-lab", "for": id + "-q" }, texte(lang, "question")));
    var question = el(doc, "textarea", { id: id + "-q", name: "question", maxlength: String(QUESTION_MAX), required: "", "aria-describedby": id + "-n" });
    form.appendChild(question);
    var n = el(doc, "p", { id: id + "-n", "class": "mhav-n", "aria-live": "polite" }, compteur(lang, 0));
    form.appendChild(n);

    var blocMail = el(doc, "div", { hidden: "" });
    blocMail.appendChild(el(doc, "label", { "class": "mhav-lab", "for": id + "-m" }, texte(lang, "mail")));
    var mail = el(doc, "input", { id: id + "-m", name: "mail", type: "email", autocomplete: "email", inputmode: "email", maxlength: "254", "aria-describedby": id + "-ma" });
    blocMail.appendChild(mail);
    blocMail.appendChild(el(doc, "p", { id: id + "-ma", "class": "mhav-aide" }, texte(lang, "mailAide")));
    form.appendChild(blocMail);

    // Pot de miel : caché aux personnes, rempli par les robots.
    var piege = el(doc, "div", { "class": "mhav-piege", "aria-hidden": "true" });
    piege.appendChild(el(doc, "label", { "for": id + "-s" }, texte(lang, "piege")));
    var site = el(doc, "input", { id: id + "-s", name: "site", type: "text", tabindex: "-1", autocomplete: "off" });
    piege.appendChild(site);
    form.appendChild(piege);

    var caseLabel = el(doc, "label", { "class": "mhav-case" });
    var accord = el(doc, "input", { type: "checkbox", name: "accord", value: "oui" });
    accord.checked = false;
    caseLabel.appendChild(accord);
    caseLabel.appendChild(el(doc, "span", null, texte(lang, "accord")));
    form.appendChild(caseLabel);

    var erreur = el(doc, "p", { "class": "mhav-err", role: "alert", hidden: "" });
    form.appendChild(erreur);

    var actions = el(doc, "div", { "class": "mhav-actions" });
    var envoyer = el(doc, "button", { type: "submit", "class": "mhav-envoyer", disabled: "" }, texte(lang, "chargement"));
    var fermer = el(doc, "button", { type: "button", "class": "mhav-fermer" }, texte(lang, "fermer"));
    actions.appendChild(envoyer);
    actions.appendChild(fermer);
    form.appendChild(actions);

    var note = el(doc, "p", { "class": "mhav-note" }, texte(lang, "donnees") + " ");
    note.appendChild(el(doc, "a", { href: DONNEES }, texte(lang, "lienDonnees")));
    form.appendChild(note);
    dlg.appendChild(form);

    var etat = { pret: false, envoi: false, compte: false, jeton: "" };
    function majBouton() {
      envoyer.disabled = !etat.pret || etat.envoi || !etat.jeton || longueur(question.value.trim()) === 0;
      envoyer.textContent = etat.envoi ? texte(lang, "envoi") : etat.pret ? texte(lang, "envoyer") : texte(lang, "chargement");
    }
    function montrerErreur(cle) {
      if (!cle) { erreur.hidden = true; erreur.textContent = ""; return; }
      erreur.textContent = messageErreur(lang, cle);
      erreur.hidden = false;
    }
    question.addEventListener("input", function () {
      n.textContent = compteur(lang, longueur(question.value));
      majBouton();
    });

    function clore() {
      if (dlg.open && dlg.close) dlg.close();
      if (dlg.parentNode) dlg.parentNode.removeChild(dlg);
      if (retour && retour.isConnected) retour.focus();
    }
    fermer.addEventListener("click", clore);
    dlg.addEventListener("close", function () { if (dlg.parentNode) clore(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) clore(); });
    dlg.addEventListener("keydown", function (e) { if (e.key === "Escape" && !dlg.showModal) clore(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (envoyer.disabled) return;
      var q = question.value.trim();
      if (!q || longueur(q) > QUESTION_MAX) return montrerErreur("question");
      var m = etat.compte ? "" : mail.value.trim();
      if (!etat.compte && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { montrerErreur("mail"); mail.focus(); return; }
      montrerErreur(null);
      etat.envoi = true;
      majBouton();
      win.fetch(API, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outil: outil, etape: etape, question: q, mail: m, accord: accord.checked === true, site: site.value, jeton: etat.jeton })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j || {} }; });
      }).then(function (res) {
        etat.envoi = false;
        if (res.ok && res.j.ok === true) {
          form.parentNode.removeChild(form);
          dlg.appendChild(el(doc, "p", { "class": "mhav-ok", role: "status" }, texte(lang, "envoye")));
          var ok = el(doc, "button", { type: "button", "class": "mhav-fermer" }, texte(lang, "fermer"));
          ok.addEventListener("click", clore);
          dlg.appendChild(ok);
          ok.focus();
          return;
        }
        montrerErreur(res.j.erreur);
        majBouton();
      }).catch(function () {
        etat.envoi = false;
        montrerErreur("indisponible");
        majBouton();
      });
    });

    doc.body.appendChild(dlg);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    question.focus();

    // Ouverture : la route dit si un compte est connecté (pas de champ mail alors) et donne le jeton qui porte l'heure.
    win.fetch(API, { credentials: "same-origin", cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).then(function (j) {
      etat.compte = j.compte === true;
      etat.jeton = typeof j.jeton === "string" ? j.jeton : "";
      etat.pret = true;
      blocMail.hidden = etat.compte;
      mail.required = !etat.compte;
      majBouton();
    }).catch(function () {
      etat.pret = true;
      montrerErreur("indisponible");
      majBouton();
    });
    return dlg;
  }

  function dessinerBouton(doc, win, bouton) {
    var lang = langue(doc, win);
    bouton.innerHTML = ICONE;
    bouton.appendChild(el(doc, "span", null, texte(lang, "bouton")));
  }

  function monterEmplacement(doc, win, place) {
    if (place.getAttribute("data-avis-monte") === "1") return;
    var outil = place.getAttribute("data-outil");
    if (OUTILS.indexOf(outil) === -1) return;
    place.setAttribute("data-avis-monte", "1");
    var bouton = el(doc, "button", { type: "button", "class": "mhav-btn", "aria-haspopup": "dialog" });
    dessinerBouton(doc, win, bouton);
    bouton.addEventListener("click", function () {
      // L'écran est lu au moment du clic : un outil peut le changer sans recréer le bouton.
      var etape = String(place.getAttribute("data-etape") || "").toLowerCase();
      ouvrir(doc, win, outil, /^[a-z0-9][a-z0-9-]{0,39}$/.test(etape) ? etape : "inconnu", bouton);
    });
    place.appendChild(bouton);
  }

  function parcourir(doc, win) {
    var places = doc.querySelectorAll("[data-avis-pierre]");
    for (var i = 0; i < places.length; i++) monterEmplacement(doc, win, places[i]);
  }

  function monter(doc, win) {
    if (!doc.getElementById("mhav-css")) {
      var style = el(doc, "style", { id: "mhav-css" });
      style.textContent = CSS;
      doc.head.appendChild(style);
    }
    parcourir(doc, win);
    if (!win.MutationObserver) return;
    var prevu = false;
    new win.MutationObserver(function () {
      if (prevu) return;
      prevu = true;
      win.setTimeout(function () { prevu = false; parcourir(doc, win); }, 0);
    }).observe(doc.body, { childList: true, subtree: true });
    // Changement de langue sans rechargement : les boutons suivent.
    new win.MutationObserver(function () {
      var boutons = doc.querySelectorAll(".mhav-btn");
      for (var i = 0; i < boutons.length; i++) dessinerBouton(doc, win, boutons[i]);
    }).observe(doc.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }

  racine.MHAvisPierre = {
    API: API, OUTILS: OUTILS, TEXTES: TEXTES, QUESTION_MAX: QUESTION_MAX, CSS: CSS,
    langue: langue, compteur: compteur, messageErreur: messageErreur, longueur: longueur, insecables: insecables, ouvrir: ouvrir
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { monter(document, window); });
    else monter(document, window);
  }
})(typeof window !== "undefined" ? window : this);
