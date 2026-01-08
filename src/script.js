(function () {
  'use strict';

  /* ---------- Element cache ---------- */
  const header = document.getElementById('site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list'); // keeps parity with CSS
  const dropdownToggles = Array.from(document.querySelectorAll('.nav-dropdown-toggle'));
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const yearEl = document.getElementById('copyright-year');

  /* ---------- Config ---------- */
  const SCROLL_THRESHOLD = 28;
  const MOBILE_LOCK_WIDTH = 540;   // lock body scroll under this width when nav open
  const MOBILE_BREAKPOINT = 720;   // close mobile nav when > this width

  /* ---------- Helpers ---------- */
  const isVisible = el => !!(el && el.classList && el.classList.contains('show'));
  const closeAllDropdowns = () => {
    document.querySelectorAll('.nav-dropdown.show').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
  };

  /* ---------- Header glass on scroll ---------- */
  const syncHeaderGlass = () => {
    if (!header) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('nav-glass');
      header.classList.remove('nav-plain');
    } else {
      header.classList.remove('nav-glass');
      header.classList.add('nav-plain');
    }
  };
  syncHeaderGlass();
  window.addEventListener('scroll', syncHeaderGlass, { passive: true });

  /* ---------- Mobile nav open / close ---------- */
  const openNav = () => {
    if (!navList) return;
    navList.classList.add('show');
    if (navToggle) navToggle.classList.add('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');

    if (window.innerWidth <= MOBILE_LOCK_WIDTH) {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeNav = () => {
    if (!navList) return;
    navList.classList.remove('show');
    if (navToggle) navToggle.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (navToggle && navList) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isVisible(navList)) closeNav();
      else {
        closeAllDropdowns();
        openNav();
      }
    });

    // close when clicking a link inside the mobile nav
    navList.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a && isVisible(navList)) closeNav();
    });

    // close when clicking outside header
    document.addEventListener('click', (e) => {
      if (!isVisible(navList)) return;
      if (!e.target.closest('#site-header')) closeNav();
    });

    // close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isVisible(navList)) closeNav();
    });

    // close when resizing above mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) closeNav();
    });
  }

  /* ---------- Dropdown toggles (desktop & mobile) ---------- */
  dropdownToggles.forEach(toggle => {
    // ensure ARIA defaults
    if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = toggle.nextElementSibling && toggle.nextElementSibling.classList.contains('nav-dropdown')
        ? toggle.nextElementSibling
        : document.querySelector(toggle.getAttribute('aria-controls'));

      const wasOpen = dropdown && dropdown.classList.contains('show');

      // close any open dropdowns first
      closeAllDropdowns();

      if (!wasOpen && dropdown) {
        dropdown.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // close when clicking a link inside the dropdown
    const dropdown = toggle.nextElementSibling && toggle.nextElementSibling.classList.contains('nav-dropdown')
      ? toggle.nextElementSibling
      : null;

    if (dropdown) {
      dropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          dropdown.classList.remove('show');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // close dropdowns when clicking outside or pressing Escape
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-dropdown') || e.target.closest('.nav-dropdown-toggle')) return;
    closeAllDropdowns();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  /* ---------- Lightbox (delegated) ---------- */
  if (lightbox && lightboxImg) {
    const openLightbox = (src) => {
      lightboxImg.src = src || '';
      lightbox.classList.add('show');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('show');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };

    document.addEventListener('click', (e) => {
      const tile = e.target.closest('.photo-tile');
      if (tile) {
        const src = tile.dataset.full || (tile.querySelector('img') ? tile.querySelector('img').src : '');
        if (src) openLightbox(src);
        return;
      }

      if (e.target.matches('.lightbox') || e.target.closest('.lightbox .close')) {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('show')) closeLightbox();
    });
  }

  /* ---------- Footer year ---------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
