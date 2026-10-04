(function () {
  "use strict";

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="calendly.com"]');
    if (!link) return;

    var placeEl = link.closest("[data-cta-place]");
    var emplacement = placeEl ? placeEl.getAttribute("data-cta-place") : "inconnu";
    var linkText = (link.textContent || "").trim().slice(0, 80);

    gtag("event", "clic_calendly", {
      page_path: location.pathname,
      link_text: linkText,
      link_url: link.href,
      emplacement: emplacement,
      transport_type: "beacon"
    });
  });
})();
