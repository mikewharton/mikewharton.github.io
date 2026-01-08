(function () {
  'use strict';

  /* ---------- Element cache ---------- */
  const header = document.getElementById('site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list'); // keeps parity with CSS
  const dropdownToggles = Array.from(document.querySelectorAll('.nav-dropdown-toggle'));
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-container img') : null;
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
    document.body.classList.add('nav-open');
    // Allow scrolling - don't lock body overflow
  };

  const closeNav = () => {
    if (!navList) return;
    navList.classList.remove('show');
    if (navToggle) navToggle.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
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
    let currentScale = 1;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialDistance = 0;
    let isPinching = false;

    const resetTransform = () => {
      currentScale = 1;
      currentX = 0;
      currentY = 0;
      updateTransform();
      lightboxImg.classList.remove('zoomed');
    };

    const updateTransform = () => {
      lightboxImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
    };

    const constrainPosition = () => {
      const imgRect = lightboxImg.getBoundingClientRect();
      const containerRect = lightbox.querySelector('.lightbox-container')?.getBoundingClientRect() || lightbox.getBoundingClientRect();
      
      const scaledWidth = imgRect.width * currentScale;
      const scaledHeight = imgRect.height * currentScale;
      
      const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
      const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
      
      currentX = Math.max(-maxX, Math.min(maxX, currentX));
      currentY = Math.max(-maxY, Math.min(maxY, currentY));
      
      updateTransform();
    };

    const zoom = (delta, clientX, clientY) => {
      const rect = lightboxImg.getBoundingClientRect();
      const containerRect = lightbox.querySelector('.lightbox-container')?.getBoundingClientRect() || lightbox.getBoundingClientRect();
      
      const scaleFactor = delta > 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.5, Math.min(5, currentScale * scaleFactor));
      
      if (newScale === currentScale) return;
      
      // Use mouse position if provided, otherwise use viewport center
      const viewportCenterX = containerRect.left + containerRect.width / 2;
      const viewportCenterY = containerRect.top + containerRect.height / 2;
      
      const zoomPointX = clientX !== undefined ? clientX : viewportCenterX;
      const zoomPointY = clientY !== undefined ? clientY : viewportCenterY;
      
      // Get the current image center position
      const imgCenterX = rect.left + rect.width / 2;
      const imgCenterY = rect.top + rect.height / 2;
      
      // Calculate the point relative to the image center in the current scale
      const pointRelativeToCenterX = (zoomPointX - imgCenterX) / currentScale;
      const pointRelativeToCenterY = (zoomPointY - imgCenterY) / currentScale;
      
      // Update scale
      currentScale = newScale;
      
      // Calculate where the image center needs to be so the zoom point stays fixed
      // The zoom point should remain at the same screen position
      const newImgCenterX = zoomPointX - (pointRelativeToCenterX * currentScale);
      const newImgCenterY = zoomPointY - (pointRelativeToCenterY * currentScale);
      
      // Calculate the translation needed (relative to viewport center)
      currentX = newImgCenterX - viewportCenterX;
      currentY = newImgCenterY - viewportCenterY;
      
      if (currentScale > 1) {
        lightboxImg.classList.add('zoomed');
      } else {
        lightboxImg.classList.remove('zoomed');
      }
      
      constrainPosition();
    };

    const openLightbox = (src) => {
      lightboxImg.src = src || '';
      lightbox.classList.add('show');
      document.body.style.overflow = 'hidden';
      if (header) header.classList.add('lightbox-open');
      resetTransform();
      
      // Wait for image to load, then reset transform
      if (lightboxImg.complete) {
        resetTransform();
      } else {
        lightboxImg.onload = () => {
          resetTransform();
        };
      }
    };

    const closeLightbox = () => {
      lightbox.classList.remove('show');
      document.body.style.overflow = '';
      if (header) header.classList.remove('lightbox-open');
      lightboxImg.src = '';
      resetTransform();
    };

    // Mouse wheel zoom
    lightbox.addEventListener('wheel', (e) => {
      if (!lightbox.classList.contains('show')) return;
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY);
    }, { passive: false });

    // Touch pinch zoom
    lightboxImg.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      } else if (e.touches.length === 1 && currentScale > 1) {
        isDragging = true;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
      }
    }, { passive: true });

    lightboxImg.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && isPinching) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const scaleChange = currentDistance / initialDistance;
        const newScale = Math.max(0.5, Math.min(5, currentScale * scaleChange));
        
        if (newScale !== currentScale) {
          const midX = (touch1.clientX + touch2.clientX) / 2;
          const midY = (touch1.clientY + touch2.clientY) / 2;
          
          const rect = lightboxImg.getBoundingClientRect();
          const containerRect = lightbox.querySelector('.lightbox-container')?.getBoundingClientRect() || lightbox.getBoundingClientRect();
          
          const offsetX = (midX - rect.left - rect.width / 2) / currentScale;
          const offsetY = (midY - rect.top - rect.height / 2) / currentScale;
          
          currentScale = newScale;
          
          currentX = (midX - containerRect.left - containerRect.width / 2) - (offsetX * currentScale);
          currentY = (midY - containerRect.top - containerRect.height / 2) - (offsetY * currentScale);
          
          if (currentScale > 1) {
            lightboxImg.classList.add('zoomed');
          } else {
            lightboxImg.classList.remove('zoomed');
          }
          
          constrainPosition();
          initialDistance = currentDistance;
        }
      } else if (e.touches.length === 1 && isDragging && currentScale > 1) {
        e.preventDefault();
        currentX = e.touches[0].clientX - startX;
        currentY = e.touches[0].clientY - startY;
        constrainPosition();
      }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', () => {
      isPinching = false;
      isDragging = false;
    });

    // Mouse drag
    lightboxImg.addEventListener('mousedown', (e) => {
      if (currentScale > 1) {
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        e.preventDefault();
      }
    });

    lightboxImg.addEventListener('mousemove', (e) => {
      if (isDragging && currentScale > 1) {
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        constrainPosition();
      }
    });

    lightboxImg.addEventListener('mouseup', () => {
      isDragging = false;
    });

    lightboxImg.addEventListener('mouseleave', () => {
      isDragging = false;
    });

    // Close button click handler
    const closeButton = lightbox.querySelector('.close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // Click to open
    document.addEventListener('click', (e) => {
      const tile = e.target.closest('.photo-tile');
      if (tile) {
        const src = tile.dataset.full || (tile.querySelector('img') ? tile.querySelector('img').src : '');
        if (src) openLightbox(src);
        return;
      }

      // Close on background click (but not on the image or container)
      if (e.target.matches('.lightbox') && !e.target.closest('.lightbox-container')) {
        closeLightbox();
      } else if (e.target.closest('.lightbox-container') && !e.target.closest('img') && !e.target.closest('.close')) {
        // Click on container but not image or close button - close if not zoomed
        if (currentScale <= 1) {
          closeLightbox();
        }
      }
    });

    // Escape to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('show')) {
        closeLightbox();
      }
    });
  }

  /* ---------- Footer year ---------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Unified filtering system (used by both blog and research) ---------- */
  function setupFiltering(prefix) {
    const search = document.getElementById(`${prefix}-search`);
    const filterTags = document.querySelectorAll(`.${prefix}-filter-tag`);
    const listItems = document.querySelectorAll(`.${prefix}-list-item`);
    const cards = document.querySelectorAll(`.${prefix}-card`);
    const noResults = document.getElementById(`${prefix}-no-results`);

    if (!search && filterTags.length === 0) return;

    function filterItems() {
      const searchTerm = search ? search.value.toLowerCase().trim() : '';
      const activeFilter = document.querySelector(`.${prefix}-filter-tag.active`);
      const filterKeyword = activeFilter && activeFilter.dataset.filter !== 'all' 
        ? activeFilter.dataset.filter.toLowerCase() 
        : null;

      let visibleCount = 0;

      // Filter list items
      listItems.forEach(item => {
        const keywords = (item.dataset.keywords || '').toLowerCase();
        const title = (item.dataset.title || '').toLowerCase();
        const description = (item.dataset.description || '').toLowerCase();

        const matchesSearch = !searchTerm || 
          title.includes(searchTerm) || 
          description.includes(searchTerm) ||
          keywords.includes(searchTerm);

        const matchesFilter = !filterKeyword || keywords.includes(filterKeyword);

        if (matchesSearch && matchesFilter) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });

      // Filter featured cards
      cards.forEach(card => {
        const keywords = (card.dataset.keywords || '').toLowerCase();
        const matchesSearch = !searchTerm || keywords.includes(searchTerm);
        const matchesFilter = !filterKeyword || keywords.includes(filterKeyword);

        if (matchesSearch && matchesFilter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      // Show/hide no results message
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    // Search input handler
    if (search) {
      search.addEventListener('input', filterItems);
    }

    // Filter tag buttons
    filterTags.forEach(tag => {
      tag.addEventListener('click', () => {
        // Remove active class from all tags with same prefix
        filterTags.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tag
        tag.classList.add('active');
        // Filter items
        filterItems();
      });
    });
  }

  // Initialize filtering for blog and research pages
  setupFiltering('blog');
  setupFiltering('research');

  /* ---------- ASCII Background Animation (lightweight) ---------- */
  const asciiCanvas = document.getElementById('ascii-canvas');
  // asciiCanvas now has the ascii-bg class directly, no wrapper needed
  
  if (asciiCanvas) {
    // Check if we're on the index page
    const isIndexPage = document.body.hasAttribute('data-page') && 
                        document.body.getAttribute('data-page') === 'index';
    
    // Calculate hero section height (for non-index pages)
    function getHeroHeight() {
      if (isIndexPage) return window.innerHeight;
      
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const headerHeight = parseFloat(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h')) || 60;
        
        // Get the bottom of the hero section (including hero-sub if present)
        const heroSub = heroSection.querySelector('.hero-sub');
        let bottomPosition;
        
        if (heroSub) {
          const subRect = heroSub.getBoundingClientRect();
          bottomPosition = subRect.bottom;
        } else {
          bottomPosition = rect.bottom;
        }
        
        // Calculate height from top of viewport to bottom of hero section
        // Since ASCII is now at top: 0, we need height from viewport top
        const height = bottomPosition; // bottomPosition is already relative to viewport
        // Add padding buffer for spacing (1-2 em more)
        // 1em ≈ 16px, so 1-2em ≈ 16-32px, using ~24px (1.5em)
        const emPadding = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return Math.max(150, height + 30 + (emPadding * 1.5));
      }
      return 300; // Fallback
    }
    
    // Update ASCII background height for non-index pages
    function updateAsciiHeight() {
      if (!isIndexPage) {
        const heroHeight = getHeroHeight();
        document.documentElement.style.setProperty('--ascii-height', `${heroHeight}px`);
      }
    }
    
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
      let width = rect.width;
      let height = rect.height;
      document.body.removeChild(testEl);
      
      // Fallback if measurement fails (can happen on mobile before fonts load)
      if (width === 0 || height === 0 || isNaN(width) || isNaN(height)) {
        // Use computed font size as fallback
        const fontSize = parseFloat(getComputedStyle(asciiCanvas).fontSize) || 10;
        width = fontSize * 0.6; // Approximate character width (monospace is usually ~60% of height)
        height = fontSize;
      }
      
      return { width, height };
    }
    
    let charSize = measureCharSize();
    let CHAR_W = charSize.width;
    let CHAR_H = charSize.height;
    
    // Calculate grid size based on viewport or container
    function getGridSize() {
      let width, height;
      
      if (isIndexPage) {
        // Index page: use full viewport
        width = window.innerWidth;
        height = window.innerHeight;
      } else {
        // Non-index: use full viewport width, height matches hero section
        width = window.innerWidth; // Full width like index page
        height = getHeroHeight(); // Dynamic height based on hero section
      }
      
      const cols = Math.ceil(width / CHAR_W) + 2;
      const rows = Math.ceil(height / CHAR_H) + 2;
      return { cols, rows };
    }
    
    let { cols, rows } = getGridSize();
    let animTime = 0;
    let animating = true;
    
    // Check if screen is narrow (mobile)
    const isNarrow = () => cols < 60;
    
    // Lava lamp blobs - lightweight with fixed number of blobs
    // Use more blobs on narrow screens for better coverage
    const getNumBlobs = () => isNarrow() ? 6 : 4;
    const blobs = [];
    
    // Initialize blobs with positions that ensure center activity
    function initializeBlobs() {
      blobs.length = 0;
      const narrow = isNarrow();
      const numBlobs = getNumBlobs();
      
      for (let i = 0; i < numBlobs; i++) {
        let baseX, baseY;
        
        // Ensure at least 2 blobs are near the center, especially on narrow screens
        if (i < 2 || (narrow && i < 4)) {
          // Position near center with some variation
          const centerX = cols * 0.5;
          const centerY = rows * 0.5;
          const spread = narrow ? 0.3 : 0.4;
          baseX = centerX + (Math.random() - 0.5) * cols * spread;
          baseY = centerY + (Math.random() - 0.5) * rows * spread;
        } else {
          // Random positions for remaining blobs
          baseX = Math.random() * cols;
          baseY = Math.random() * rows;
        }
        
        blobs.push({
          baseX: baseX,
          baseY: baseY,
          radius: narrow ? (10 + Math.random() * 14) : (8 + Math.random() * 12), // Slightly larger on narrow
          speedX: narrow ? (0.4 + Math.random() * 0.5) : (0.3 + Math.random() * 0.4), // Faster on narrow
          speedY: narrow ? (0.3 + Math.random() * 0.4) : (0.2 + Math.random() * 0.3),
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          amplitudeX: cols * (narrow ? (0.2 + Math.random() * 0.25) : (0.15 + Math.random() * 0.2)),
          amplitudeY: rows * (narrow ? (0.2 + Math.random() * 0.25) : (0.15 + Math.random() * 0.2)),
          swirl: narrow ? (0.7 + Math.random() * 1.0) : (0.5 + Math.random() * 0.8), // More swirl on narrow
        });
      }
    }
    
    // Initialize blobs
    initializeBlobs();
    
    // Create lava lamp blob pattern
    function render() {
      if (!asciiCanvas) return;
      
      const L = PALETTE.length - 1;
      let output = '';
      
      // Convert grid coordinates to normalized space for blob calculations
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let value = 0;
          
          // Add a subtle global wave pattern for more interest, especially on narrow screens
          const narrow = isNarrow();
          const globalWave = narrow 
            ? Math.sin((x * 0.1 + y * 0.15 + animTime * 0.8) * 0.5) * 0.08
            : Math.sin((x * 0.08 + y * 0.12 + animTime * 0.6) * 0.4) * 0.05;
          value += globalWave;
          
          // Calculate contribution from each blob
          for (let i = 0; i < blobs.length; i++) {
            const blob = blobs[i];
            
            // Animated blob position with smooth movement
            const blobX = blob.baseX + Math.sin(animTime * blob.speedX + blob.phaseX) * blob.amplitudeX;
            const blobY = blob.baseY + Math.cos(animTime * blob.speedY + blob.phaseY) * blob.amplitudeY;
            
            // Distance from current pixel to blob center
            const dx = x - blobX;
            const dy = y - blobY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Add swirl effect (rotational component) - more pronounced on narrow screens
            const angle = Math.atan2(dy, dx) + animTime * blob.swirl;
            const swirlIntensity = narrow ? 0.4 : 0.3;
            const swirlDist = dist * (1 + swirlIntensity * Math.sin(angle * 2));
            
            // Smooth falloff using inverse distance (creates blob shape)
            const influence = blob.radius / (1 + swirlDist * 0.8);
            
            // Add some noise/variation for organic feel - more dynamic on narrow
            const noiseFreq = narrow ? 0.4 : 0.3;
            const noiseSpeed = narrow ? 0.7 : 0.5;
            const noise = Math.sin(dist * noiseFreq + animTime * noiseSpeed) * (narrow ? 0.2 : 0.15);
            value += influence * (1 + noise);
          }
          
          // Normalize and add some base level for smoother transitions
          const normalized = Math.min(1, Math.max(0, (value * 0.4 + 0.3)));
          
          // Apply smooth curve for better visual
          const curved = Math.pow(normalized, 0.7);
          const idx = Math.max(0, Math.min(L, Math.floor(curved * (L + 1))));
          
          output += PALETTE[idx];
        }
        output += '\n';
      }
      
      asciiCanvas.textContent = output;
    }
    
    // Animation loop - pause during scroll to prevent "following" effect
    let lastAnimTime = 0;
    let isScrolling = false;
    let scrollTimeout = null;
    let frozenAnimTime = 0; // Store animTime when scrolling starts
    const ANIM_SPEED = 0.0005; // Slower animation
    
    function animate(now) {
      if (!animating) return;
      
      // Completely freeze animation during active scrolling
      if (isScrolling) {
        // Don't update animTime, don't render - keep frozen
        requestAnimationFrame(animate);
        return;
      }
      
      // Normal animation when not scrolling
      if (lastAnimTime === 0) lastAnimTime = now;
      animTime += (now - lastAnimTime) * ANIM_SPEED;
      lastAnimTime = now;
      render();
      requestAnimationFrame(animate);
    }
    
    // Detect scrolling and pause animation
    let lastScrollY = window.scrollY;
    function handleScroll() {
      const currentScrollY = window.scrollY;
      
      // Only set scrolling if actually moved
      if (Math.abs(currentScrollY - lastScrollY) > 1) {
        if (!isScrolling) {
          // Freeze the current animation time
          frozenAnimTime = animTime;
        }
        isScrolling = true;
        lastScrollY = currentScrollY;
      }
      
      // Clear existing timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Resume animation after scrolling stops
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // Restore animTime from where we froze it
        animTime = frozenAnimTime;
        lastAnimTime = 0; // Reset to allow smooth continuation
      }, 200); // Wait 200ms after last scroll event
    }
    
    // Handle resize
    function handleResize() {
      // Update ASCII height for non-index pages
      updateAsciiHeight();
      
      // Remeasure character size (in case font rendering changed)
      charSize = measureCharSize();
      CHAR_W = charSize.width;
      CHAR_H = charSize.height;
      
      const oldCols = cols;
      const oldRows = rows;
      const newSize = getGridSize();
      cols = newSize.cols;
      rows = newSize.rows;
      
      // If grid size changed significantly, reinitialize blobs
      // Otherwise, scale existing blobs proportionally
      if (Math.abs(cols - oldCols) > 10 || Math.abs(rows - oldRows) > 10) {
        initializeBlobs();
      } else {
        // Adjust blob positions and amplitudes proportionally
        const scaleX = cols / oldCols;
        const scaleY = rows / oldRows;
        
        for (let i = 0; i < blobs.length; i++) {
          blobs[i].baseX *= scaleX;
          blobs[i].baseY *= scaleY;
          blobs[i].amplitudeX *= scaleX;
          blobs[i].amplitudeY *= scaleY;
        }
      }
      
      render();
    }
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Scroll-based fade
    const FADE_START = 100;  // Start fading after 100px
    const FADE_END = 400;    // Fully faded at 400px
    
    function updateAsciiOpacity() {
      const scrollY = window.scrollY;
      let opacity = isIndexPage ? 1 : 0.6; // Start with appropriate base opacity (matches CSS default)
      let blur = 0;
      let topFade = 0;
      
      if (isIndexPage) {
        // Index page: full fade effect
        if (scrollY > FADE_START) {
          const fadeProgress = Math.min(1, (scrollY - FADE_START) / (FADE_END - FADE_START));
          opacity = 1 - fadeProgress;
          blur = fadeProgress * 8; // Blur up to 8px
          topFade = 1; // Always show top fade gradient
        }
      } else {
        // Non-index pages: fade away completely
        if (scrollY > FADE_START) {
          const fadeProgress = Math.min(1, (scrollY - FADE_START) / (FADE_END - FADE_START));
          // Use a more aggressive fade curve to ensure it fully disappears
          const easedProgress = Math.pow(fadeProgress, 0.6); // More aggressive ease out
          opacity = Math.max(0, 0.6 * (1 - easedProgress)); // Fade from 0.6 to 0, ensure >= 0
          blur = fadeProgress * 10; // More blur to help hide it completely
          topFade = 0; // No top fade needed
        } else {
          // Before fade starts, ensure full opacity
          opacity = 0.6;
        }
      }
      
      document.documentElement.style.setProperty('--ascii-opacity', opacity);
      document.documentElement.style.setProperty('--ascii-blur', `${blur}px`);
      document.documentElement.style.setProperty('--ascii-top-fade', topFade);
    }
    
    // Set initial opacity immediately
    updateAsciiOpacity();
    
    // Handle scroll for both opacity and animation pause
    window.addEventListener('scroll', () => {
      updateAsciiOpacity();
      handleScroll();
    }, { passive: true });
    
    // Set initial height for non-index pages
    updateAsciiHeight();
    
    // Force fixed positioning removed to allow CSS to control layout

    
    // Initialize and start animation
    function initializeAndStart() {
      // Remeasure character size (important on mobile where fonts might load later)
      charSize = measureCharSize();
      CHAR_W = charSize.width;
      CHAR_H = charSize.height;
      
      // Update height again after layout is ready
      updateAsciiHeight();
      
      // Recalculate grid size
      const newSize = getGridSize();
      cols = newSize.cols;
      rows = newSize.rows;
      
      // Ensure we have valid dimensions
      if (cols > 0 && rows > 0 && CHAR_W > 0 && CHAR_H > 0) {
        // Reinitialize blobs with new dimensions
        initializeBlobs();
        
        // Render immediately to show something
        render();
        // Ensure layout recalculation after initial render
        if (typeof handleResize === 'function') handleResize();

        
        // Start animation - always start if not already running
        animating = true;
        // Always start the animation loop
        requestAnimationFrame(animate);
      } else {
        // Retry if dimensions are invalid (might happen on mobile)
        setTimeout(initializeAndStart, 100);
      }
    }
    
    // Start animation after a brief delay to ensure layout is ready
    // This is especially important for non-index pages and mobile devices
    setTimeout(initializeAndStart, 50);
    
    // Also retry on window load (for mobile where fonts might load late)
    if (document.readyState === 'loading') {
      window.addEventListener('load', () => {
        setTimeout(initializeAndStart, 100);
      });
    } else {
      // Already loaded, try again after a short delay
      setTimeout(initializeAndStart, 150);
    }
    
    // For index page, also try to start immediately if dimensions are already valid
    if (isIndexPage) {
      // Quick check - if we can get dimensions immediately, start right away
      const quickSize = getGridSize();
      if (quickSize.cols > 0 && quickSize.rows > 0 && CHAR_W > 0 && CHAR_H > 0) {
        cols = quickSize.cols;
        rows = quickSize.rows;
        initializeBlobs();
        render();
        animating = true;
        requestAnimationFrame(animate);
      }
    }
    
    // Pause animation when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
      animating = !document.hidden;
      if (animating) requestAnimationFrame(animate);
    });
  }

  /* ---------- Email obfuscation ---------- */
  const emailLink = document.getElementById('email-link');
  const emailText = document.getElementById('email-text');
  
  if (emailLink && emailText) {
    const obfuscatedEmail = emailLink.getAttribute('data-email');
    if (obfuscatedEmail) {
      // Extract every other character (even indices) to get the real email
      const realEmail = [...obfuscatedEmail].filter((_, i) => i % 2 === 0).join('');
      
      // Update the link and text
      emailLink.href = 'mailto:' + realEmail;
      emailText.textContent = realEmail;
    }
  }

})();


(function () {
  const list = document.getElementById('announcements-list');
  const btn = document.getElementById('announcements-more-btn');
  if (!list || !btn) return;

  const BATCH = 3;
  const items = Array.from(list.querySelectorAll('[data-announcement]'));
  let visibleCount = 0;

  function init() {
    // Hide all initially
    items.forEach(it => it.classList.add('is-hidden'));

    // Show initial batch
    revealNext();
    // If nothing to reveal (zero items), hide the button
    if (items.length === 0) btn.style.display = 'none';
  }

  function revealNext() {
    const start = visibleCount;
    const end = Math.min(items.length, visibleCount + BATCH);
    let revealed = 0;

    for (let i = start; i < end; i++) {
      items[i].classList.remove('is-hidden');
      revealed++;
    }

    visibleCount += revealed;
    btn.setAttribute('aria-expanded', String(visibleCount > 0));

    if (visibleCount >= items.length) {
      // nothing left to show
      btn.style.display = 'none';
    }
  }

  btn.addEventListener('click', revealNext, { passive: true });

  // initialise on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
