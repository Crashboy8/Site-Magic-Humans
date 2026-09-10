(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.nav-right');
    if (!toggle || !panel) return;

    function closePanel() {
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function openPanel() {
      panel.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function () {
      if (panel.classList.contains('open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closePanel);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closePanel();
        toggle.focus();
      }
    });
  });
})();
