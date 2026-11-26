/* ===== HOME · PET MOMENTS: album de polaroids (parte de Danna Arjona) ===== */
(() => {
  const section = document.querySelector('#petmoments');
  const board = document.querySelector('#moBoard');
  const lightbox = document.querySelector('#moLightbox');
  if (!section || !board || !lightbox) return;

  document.documentElement.classList.add('js-moments');
  let zTop = 10;
  const bigScreen = () => window.innerWidth >= 768;

  // Las fotos caen cuando la sección aparece en pantalla
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { section.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(section);
  } else {
    section.classList.add('is-in');
  }

  // Abrir y cerrar la foto en grande
  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('figcaption');
  const openPhoto = card => {
    const img = card.querySelector('img');
    const cap = card.querySelector('figcaption');
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.innerHTML = cap ? cap.innerHTML : '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  };
  const closePhoto = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  };
  lightbox.addEventListener('click', closePhoto);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePhoto(); });

  // Tocar una tarjeta: abre la foto o, si es "Add your moment", abre el selector de archivos
  const tapCard = card => {
    if (card.classList.contains('mo-add')) card.querySelector('input').click();
    else if (card.classList.contains('mo-pol')) openPhoto(card);
  };

  // Arrastrar polaroids y stickers (solo en pantallas grandes)
  board.querySelectorAll('.mo-pol, .mo-stk').forEach(el => {
    let startX = 0, startY = 0, origX = 0, origY = 0, down = false, moved = false;

    el.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      down = true; moved = false; startX = e.clientX; startY = e.clientY;
      if (!bigScreen()) return;
      origX = el.offsetLeft; origY = el.offsetTop;
      el.style.zIndex = ++zTop;
      el.style.animation = 'none';
      el.style.opacity = 1;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    el.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 5) { moved = true; el.classList.add('is-drag'); }
      if (!bigScreen() || !moved) return;
      const bw = board.clientWidth, bh = board.clientHeight;
      const x = Math.max(-30, Math.min(bw - el.offsetWidth + 30, origX + dx));
      const y = Math.max(-30, Math.min(bh - el.offsetHeight + 30, origY + dy));
      el.style.left = (x / bw * 100) + '%';
      el.style.top = (y / bh * 100) + '%';
    });

    el.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      el.classList.remove('is-drag');
      if (!moved) tapCard(el);
    });
    el.addEventListener('pointercancel', () => { down = false; el.classList.remove('is-drag'); });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapCard(el); }
    });
  });

  // "Add your moment": muestra la foto elegida (solo en tu navegador, no se sube a internet)
  const addCard = board.querySelector('.mo-add');
  if (addCard) {
    addCard.querySelector('input').addEventListener('change', function () {
      const file = this.files && this.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const placeholder = addCard.querySelector('.mo-add-ph');
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = 'Your pet';
      img.draggable = false;
      placeholder.replaceWith(img);
      addCard.querySelector('figcaption').innerHTML = 'My best friend<span>a new moment</span>';
      addCard.classList.remove('mo-add');
    });
  }
})();