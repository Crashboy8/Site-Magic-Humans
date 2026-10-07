/* Suivi Google Analytics des clics vers Calendly (événement « clic_calendly »)
   et vers le quiz Talent Unique (événement « clic_quiz »).
   Écoute au niveau du document : couvre aussi les liens ajoutés dynamiquement
   (quiz, textes FR / EN / ES). Aucun cookie posé ici : gtag applique le Consent Mode. */
(function () {
  "use strict";

  function send(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(["event", eventName, params]);
    }
  }

  function track(eventName, params) {
    var data = {};
    if (params) {
      Object.keys(params).forEach(function (key) { data[key] = params[key]; });
    }
    if (!data.transport_type) data.transport_type = "beacon";
    send(eventName, data);
    if (window.va) {
      try { window.va("event", { name: eventName, data: data }); } catch (e) { /* mesure indisponible */ }
    }
  }

  window.mhTrack = track;

  function buildParams(link) {
    var placed = link.closest("[data-cta-place]");
    var text = (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
    return {
      page_path: location.pathname,
      link_text: text,
      link_url: link.href,
      emplacement: placed ? placed.getAttribute("data-cta-place") : "inconnu",
      transport_type: "beacon"
    };
  }

  function onClick(event) {
    var target = event.target;
    var link = target && target.closest ? target.closest("a[href]") : null;
    if (!link) return;

    if (link.href.indexOf("calendly.com") !== -1) {
      var params = buildParams(link);
      send("clic_calendly", params);
      window.va && window.va("event", { name: "clic_calendly", data: { emplacement: params.emplacement } });
      return;
    }

    if (link.pathname === "/quiz/" || link.pathname === "/quiz") {
      send("clic_quiz", buildParams(link));
    }
  }

  // Clic gauche, et clic molette (ouverture dans un nouvel onglet). Phase de capture :
  // l'événement part avant tout autre traitement, sans jamais bloquer l'ouverture du lien.
  document.addEventListener("click", onClick, true);
  document.addEventListener("auxclick", function (event) {
    if (event.button === 1) onClick(event);
  }, true);
})();
