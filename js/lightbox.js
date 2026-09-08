(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var trigger = document.getElementById('ikigai-trigger');
    var lightbox = document.getElementById('lightbox');
    if (!trigger || !lightbox) return;

    var lbImg = lightbox.querySelector('img');
    var closeBtn = lightbox.querySelector('.lightbox-close');

    function openLightbox() {
      lbImg.src = trigger.src;
      lbImg.alt = trigger.alt;
      lbImg.classList.remove('zoomed');
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lbImg.classList.remove('zoomed');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', openLightbox);
    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    lbImg.addEventListener('click', function () {
      lbImg.classList.toggle('zoomed');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  });
})();
