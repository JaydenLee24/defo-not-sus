/* ================================================================
   script.js — Birthday Website
   Fitur:
     - Full-page scroll navigation (scroll, swipe, keyboard, tombol)
     - Dot indicator sinkron
     - canvas-confetti saat buka & di slide 5
     - Swiper.js untuk galeri foto
     - Animasi fade-in ucapan & harapan
     - Drag-to-scroll pada kartu ucapan
     - Touch swipe vertikal antar slide
================================================================ */

/* ─── KONFIGURASI ──────────────────────────────────────────── */
const TOTAL_SLIDES = 5;

/* ─── ELEMEN ───────────────────────────────────────────────── */
const wrapper     = document.getElementById('slidesWrapper');
const dotWrap     = document.getElementById('dotIndicator');
const btnPrev     = document.getElementById('navPrev');
const btnNext     = document.getElementById('navNext');
const btnHeroNext = document.getElementById('btnHeroNext');
const btnCelebrate= document.getElementById('btnCelebrate');
const wishesOuter = document.querySelector('.wishes-track-outer');

/* ─── STATE ────────────────────────────────────────────────── */
let currentSlide  = 0;
let isScrolling   = false; // Debounce scroll
const SCROLL_COOLDOWN = 700; // ms

/* ════════════════════════════════════════════════════════════
   1. DOT INDICATOR
════════════════════════════════════════════════════════════ */
function buildDots() {
  const labels = ['Hero', 'Foto Diri', 'Foto Bersama', 'Ucapan', 'Harapan'];
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${labels[i]}`);
    dot.dataset.index = i;
    dot.addEventListener('click', () => goToSlide(i));
    dotWrap.appendChild(dot);
  }
}

function updateDots(index) {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.setAttribute('aria-selected', i === index);
  });
}

/* ════════════════════════════════════════════════════════════
   2. NAVIGASI SLIDE
════════════════════════════════════════════════════════════ */
function goToSlide(index) {
  if (index < 0 || index >= TOTAL_SLIDES) return;
  currentSlide = index;

  const slide = document.querySelector(`[data-slide="${index}"]`);
  if (slide) {
    slide.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateDots(index);
  onSlideEnter(index);
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

/* ─── Tombol panah ─────────────────────────────────────────── */
btnNext.addEventListener('click', nextSlide);
btnPrev.addEventListener('click', prevSlide);
btnHeroNext.addEventListener('click', nextSlide);

/* ─── Keyboard ──────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); }
  if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); prevSlide(); }
});

/* ─── Scroll wheel (debounced) ─────────────────────────────── */
wrapper.addEventListener('wheel', (e) => {
  if (isScrolling) return;
  isScrolling = true;
  if (e.deltaY > 0) nextSlide();
  else              prevSlide();
  setTimeout(() => { isScrolling = false; }, SCROLL_COOLDOWN);
}, { passive: true });

/* ─── Native scroll snap — sinkronisasi currentSlide ──────── */
// Gunakan IntersectionObserver agar dot & state selalu sinkron
function setupScrollObserver() {
  const options = { root: wrapper, threshold: 0.6 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.slide, 10);
        if (!isNaN(idx) && idx !== currentSlide) {
          currentSlide = idx;
          updateDots(idx);
          onSlideEnter(idx);
        }
      }
    });
  }, options);

  document.querySelectorAll('.slide').forEach(slide => observer.observe(slide));
}

/* ─── Touch swipe (vertikal) ───────────────────────────────── */
let touchStartY = 0;
wrapper.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

wrapper.addEventListener('touchend', (e) => {
  if (isScrolling) return;
  const diff = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diff) < 40) return; // threshold 40px
  isScrolling = true;
  if (diff > 0) nextSlide();
  else          prevSlide();
  setTimeout(() => { isScrolling = false; }, SCROLL_COOLDOWN);
}, { passive: true });

/* ════════════════════════════════════════════════════════════
   3. LIFECYCLE — onSlideEnter
════════════════════════════════════════════════════════════ */
function onSlideEnter(index) {
  if (index === 3) animateWishCards(); // Ucapan
  if (index === 4) animateHopeItems(); // Harapan
}

/* ════════════════════════════════════════════════════════════
   4. CONFETTI
════════════════════════════════════════════════════════════ */
function launchConfetti(opts = {}) {
  if (typeof confetti === 'undefined') return;

  const defaults = {
    particleCount: 120,
    spread: 90,
    startVelocity: 45,
    gravity: 0.9,
    ticks: 200,
    colors: ['#FF8FAB','#FFD43B','#74C0FC','#74E89E','#CC5DE8','#FF922B','#fff'],
    shapes: ['circle', 'square'],
    scalar: 0.9,
    zIndex: 0, // di bawah UI, di atas background
  };

  confetti({ ...defaults, ...opts, origin: { x: 0.3, y: 0.5 } });
  confetti({ ...defaults, ...opts, origin: { x: 0.7, y: 0.5 } });
}

function bigCelebration() {
  if (typeof confetti === 'undefined') return;
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FF8FAB','#FFD43B','#74C0FC','#CC5DE8'],
      zIndex: 0,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#74E89E','#FF922B','#FFD43B','#FF8FAB'],
      zIndex: 0,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ─── Confetti saat halaman pertama kali terbuka ─────────── */
window.addEventListener('load', () => {
  setTimeout(() => launchConfetti(), 600);
});

/* ─── Tombol rayakan di slide 5 ─────────────────────────── */
btnCelebrate.addEventListener('click', () => {
  bigCelebration();
});

/* ════════════════════════════════════════════════════════════
   5. SWIPER.JS — Dua Galeri Foto
════════════════════════════════════════════════════════════ */
function initSwiper() {
  if (typeof Swiper === 'undefined') return;

  const swiperConfig = (extraOpts = {}) => ({
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    speed: 600,
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    keyboard: { enabled: false },
    a11y: {
      prevSlideMessage: 'Foto sebelumnya',
      nextSlideMessage: 'Foto berikutnya',
    },
    ...extraOpts,
  });

  // Slide 2 — Foto Solo (portrait, lebih sempit)
  new Swiper('.swiper-solo', {
    ...swiperConfig(),
    breakpoints: {
      640: { slidesPerView: 1.1 },
      900: { slidesPerView: 1.3 },
    },
  });

  // Slide 3 — Foto Bersama (landscape, lebih lebar)
  new Swiper('.swiper-together', {
    ...swiperConfig({ autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true } }),
    breakpoints: {
      640: { slidesPerView: 1.1 },
      900: { slidesPerView: 1.2 },
    },
  });
}

/* ════════════════════════════════════════════════════════════
   6. ANIMASI UCAPAN (Slide 4)
════════════════════════════════════════════════════════════ */
let wishesAnimated = false;

function animateWishCards() {
  if (wishesAnimated) return;
  wishesAnimated = true;

  const cards = document.querySelectorAll('.wish-card');
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, i * 150);
  });
}

/* ─── Drag-to-scroll pada wishes track ─────────────────────── */
function initDragScroll() {
  if (!wishesOuter) return;
  let startX, scrollLeft, dragging = false;

  wishesOuter.addEventListener('mousedown', (e) => {
    dragging  = true;
    startX    = e.pageX - wishesOuter.offsetLeft;
    scrollLeft= wishesOuter.scrollLeft;
    wishesOuter.style.cursor = 'grabbing';
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    if (wishesOuter) wishesOuter.style.cursor = 'grab';
  });
  wishesOuter.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    e.preventDefault();
    const x    = e.pageX - wishesOuter.offsetLeft;
    const walk = (x - startX) * 1.4;
    wishesOuter.scrollLeft = scrollLeft - walk;
  });
}

/* ════════════════════════════════════════════════════════════
   7. ANIMASI HARAPAN (Slide 5)
════════════════════════════════════════════════════════════ */
let hopesAnimated = false;

function animateHopeItems() {
  if (hopesAnimated) return;
  hopesAnimated = true;

  const items = document.querySelectorAll('.hope-item');
  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.add('visible');
    }, i * 200);
  });
}

/* ════════════════════════════════════════════════════════════
   8. INIT
════════════════════════════════════════════════════════════ */
(function init() {
  buildDots();
  updateDots(0);
  setupScrollObserver();
  initSwiper();
  initDragScroll();
})();