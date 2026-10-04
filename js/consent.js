(function () {
  "use strict";

  var STORAGE_KEY = "mh-cookie-consent";
  var SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function readChoice() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || (data.value !== "granted" && data.value !== "denied")) return null;
      if (typeof data.ts !== "number" || Date.now() - data.ts > SIX_MONTHS_MS) return null;
      return data.value;
    } catch (e) {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: value, ts: Date.now() }));
    } catch (e) {}
  }

  var banner = null;

  function buildBanner() {
    var el = document.createElement("div");
    el.id = "mh-cookie-banner";
    el.className = "mh-cookie-banner";
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Préférences de cookies");
    el.innerHTML =
      '<div class="mh-cookie-banner__inner">' +
      '<p class="mh-cookie-banner__text">Ce site utilise des cookies de mesure d\'audience (Google Analytics) pour comprendre comment il est utilisé. Tu peux accepter ou refuser, ton choix est conservé 6 mois. ' +
      '<a href="/confidentialite/" class="mh-cookie-banner__link">En savoir plus</a></p>' +
      '<div class="mh-cookie-banner__actions">' +
      '<button type="button" class="mh-cookie-banner__btn" data-mh-consent="denied">Refuser</button>' +
      '<button type="button" class="mh-cookie-banner__btn" data-mh-consent="granted">Accepter</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(el);
    el.querySelectorAll("[data-mh-consent]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onChoice(btn.getAttribute("data-mh-consent"));
      });
    });
    return el;
  }

  function measureBanner() {
    if (!banner || banner.hidden) return;
    document.documentElement.style.setProperty("--mh-cookie-banner-h", banner.offsetHeight + "px");
  }

  function showBanner() {
    if (!banner) banner = buildBanner();
    banner.hidden = false;
    document.body.classList.add("mh-cookie-open");
    measureBanner();
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
    document.body.classList.remove("mh-cookie-open");
  }

  window.addEventListener("resize", measureBanner);

  function applyChoice(value) {
    if (value === "granted") {
      gtag("consent", "update", { analytics_storage: "granted" });
    }
  }

  function onChoice(value) {
    saveChoice(value);
    applyChoice(value);
    hideBanner();
  }

  function init() {
    var stored = readChoice();
    if (stored) {
      applyChoice(stored);
    } else {
      showBanner();
    }
    document.querySelectorAll(".js-manage-cookies").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showBanner();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
