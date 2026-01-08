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

  /* ---------- ASCII Background Animation (lightweight) ---------- */
  const asciiBg = document.getElementById('ascii-bg');
  const asciiCanvas = document.getElementById('ascii-canvas');
  
  if (asciiCanvas && asciiBg) {
    // Lightweight config - using a repeating pattern for performance
    const PALETTE = ".: -=+*#%@";
    
    // Measure actual character dimensions
    function measureCharSize() {
      const testEl = document.createElement('pre');
      testEl.style.position = 'absolute';
      testEl.style.visibility = 'hidden';
      testEl.style.fontFamily = getComputedStyle(asciiCanvas).fontFamily;
      testEl.style.fontSize = getComputedStyle(asciiCanvas).fontSize;
      testEl.style.lineHeight = getComputedStyle(asciiCanvas).lineHeight;
      testEl.style.whiteSpace = 'pre';
      testEl.textContent = 'M'; // Use 'M' as a representative character
      document.body.appendChild(testEl);
      const rect = testEl.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      document.body.removeChild(testEl);
      return { width, height };
    }
    
    let charSize = measureCharSize();
    let CHAR_W = charSize.width;
    let CHAR_H = charSize.height;
    
    // Calculate grid size based on viewport
    function getGridSize() {
      const cols = Math.ceil(window.innerWidth / CHAR_W) + 2;
      const rows = Math.ceil(window.innerHeight / CHAR_H) + 2;
      return { cols, rows };
    }
    
    let { cols, rows } = getGridSize();
    let animTime = 0;
    let animating = true;
    
    // Create a lightweight wave pattern
    function render() {
      if (!asciiCanvas) return;
      
      const L = PALETTE.length - 1;
      let output = '';
      
      // Use a repeating wave pattern for performance
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Multiple sine waves for interesting pattern
          const wave1 = Math.sin((x * 0.3 + animTime * 0.5) * 0.5);
          const wave2 = Math.sin((y * 0.2 + animTime * 0.3) * 0.4);
          const wave3 = Math.sin(((x + y) * 0.15 + animTime * 0.4) * 0.3);
          
          // Combine waves
          const v = (wave1 + wave2 * 0.6 + wave3 * 0.4) / 2;
          const normalized = (v + 1) * 0.5; // 0 to 1
          const idx = Math.max(0, Math.min(L, Math.floor(normalized * (L + 1))));
          
          output += PALETTE[idx];
        }
        output += '\n';
      }
      
      asciiCanvas.textContent = output;
    }
    
    // Animation loop
    function animate(now) {
      if (!animating) return;
      
      animTime = now * 0.001; // Convert to seconds
      render();
      requestAnimationFrame(animate);
    }
    
    // Handle resize
    function handleResize() {
      // Remeasure character size (in case font rendering changed)
      charSize = measureCharSize();
      CHAR_W = charSize.width;
      CHAR_H = charSize.height;
      
      const newSize = getGridSize();
      cols = newSize.cols;
      rows = newSize.rows;
      render();
    }
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Start animation
    requestAnimationFrame(animate);
    
    // Scroll-based fade
    const FADE_START = 100;  // Start fading after 100px
    const FADE_END = 400;    // Fully faded at 400px
    
    function updateAsciiOpacity() {
      const scrollY = window.scrollY;
      let opacity = 1;
      let blur = 0;
      let topFade = 0;
      
      if (scrollY > FADE_START) {
        const fadeProgress = Math.min(1, (scrollY - FADE_START) / (FADE_END - FADE_START));
        opacity = 1 - fadeProgress;
        blur = fadeProgress * 8; // Blur up to 8px
        topFade = 1; // Always show top fade gradient
      }
      
      document.documentElement.style.setProperty('--ascii-opacity', opacity);
      document.documentElement.style.setProperty('--ascii-blur', `${blur}px`);
      document.documentElement.style.setProperty('--ascii-top-fade', topFade);
    }
    
    updateAsciiOpacity();
    window.addEventListener('scroll', updateAsciiOpacity, { passive: true });
    
    // Pause animation when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
      animating = !document.hidden;
      if (animating) requestAnimationFrame(animate);
    });
  }

})();
