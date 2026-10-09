/* Langue du site statique : le français est dans le HTML, data-en porte l'anglais, data-es l'espagnol.
   L'espagnol n'existe que sur les pages qui ont des textes data-es (aujourd'hui /outils/) : ailleurs, un choix « es » mémorisé
   donne le français et n'est pas effacé. Le choix est écrit à chaque clic sur FR / EN / ES, jamais à l'arrivée sur une page. */
!function () {
  var KEY = "mh-lang";
  function available() {
    return document.querySelector("[data-es]") ? ["fr", "en", "es"] : ["fr", "en"];
  }
  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-en],[data-es]").forEach(function (el) {
      if (!el.hasAttribute("data-fr")) el.setAttribute("data-fr", el.innerHTML);
      var text = lang === "en" ? el.getAttribute("data-en") : lang === "es" ? el.getAttribute("data-es") : null;
      el.innerHTML = text !== null ? text : el.getAttribute("data-fr");
    });
    document.querySelectorAll(".lang-toggle [data-lang]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    var lang = "fr";
    try { lang = localStorage.getItem(KEY) || "fr"; } catch (e) { /* stockage indisponible */ }
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q === "en" || q === "fr" || q === "es") lang = q;
    } catch (e) { /* adresse illisible */ }
    if (available().indexOf(lang) === -1) lang = "fr";
    apply(lang);
    document.querySelectorAll(".lang-toggle [data-lang]").forEach(function (b) {
      b.addEventListener("click", function () {
        var next = b.getAttribute("data-lang");
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* stockage indisponible */ }
      });
    });
  });
}();
