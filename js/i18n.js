(function () {
  var STORAGE_KEY = 'mh-lang';

  function applyLang(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.hasAttribute('data-fr')) {
        el.setAttribute('data-fr', el.innerHTML);
      }
      el.innerHTML = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-fr');
    });

    document.querySelectorAll('.lang-toggle [data-lang]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function initLang() {
    var saved = 'fr';
    try {
      saved = localStorage.getItem(STORAGE_KEY) || 'fr';
    } catch (e) {}
    applyLang(saved);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLang();
    document.querySelectorAll('.lang-toggle [data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang'));
      });
    });
  });
})();
