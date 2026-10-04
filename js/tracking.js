/* Suivi Google Analytics des clics vers Calendly (événement « clic_calendly »).
   Écoute au niveau du document : couvre aussi les liens ajoutés dynamiquement
   (quiz, textes FR / EN / ES). Aucun cookie posé ici : gtag applique le Consent Mode. */
(function () {
  "use strict";

  function send(params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", "clic_calendly", params);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(["event", "clic_calendly", params]);
    }
  }

  function onClick(event) {
    var target = event.target;
    var link = target && target.closest ? target.closest("a[href]") : null;
    if (!link || link.href.indexOf("calendly.com") === -1) return;

    var placed = link.closest("[data-cta-place]");
    var text = (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);

    send({
      page_path: location.pathname,
      link_text: text,
      link_url: link.href,
      emplacement: placed ? placed.getAttribute("data-cta-place") : "inconnu",
      transport_type: "beacon"
    });
  }

  // Clic gauche, et clic molette (ouverture dans un nouvel onglet). Phase de capture :
  // l'événement part avant tout autre traitement, sans jamais bloquer l'ouverture du lien.
  document.addEventListener("click", onClick, true);
  document.addEventListener("auxclick", function (event) {
    if (event.button === 1) onClick(event);
  }, true);
})();
