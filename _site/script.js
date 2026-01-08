(function(){
  const header = document.getElementById('site-header');
  const threshold = 28;

  function onScroll(){
    if(!header) return;
    if(window.scrollY > threshold){
      header.classList.add('nav-glass');
      header.classList.remove('nav-plain');
    } else {
      header.classList.remove('nav-glass');
      header.classList.add('nav-plain');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');

  if(navToggle && navList){
    navToggle.addEventListener('click', function(){
      navList.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', String(navList.classList.contains('show')));
    });

    // Close after selecting a link
    navList.addEventListener('click', function(e){
      const a = e.target.closest('a');
      if(a && navList.classList.contains('show')){
        navList.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on outside click
    document.addEventListener('click', function(e){
      if(!navList.classList.contains('show')) return;
      if(!e.target.closest('#site-header')){
        navList.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Lightbox (gallery pages)
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;

  document.addEventListener('click', function(e){
    const tile = e.target.closest('.photo-tile');
    if(tile && lightbox && lightboxImg){
      const src = tile.dataset.full || (tile.querySelector('img') ? tile.querySelector('img').src : '');
      if(src){
        lightboxImg.src = src;
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }

    if(e.target.matches('.lightbox') || e.target.matches('.lightbox .close')){
      if(lightbox){
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
        if(lightboxImg) lightboxImg.src = '';
      }
    }
  });

  window.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && lightbox && lightbox.classList.contains('show')){
      lightbox.classList.remove('show');
      document.body.style.overflow = '';
      if(lightboxImg) lightboxImg.src = '';
    }
  });

  // Footer year
  const yearEl = document.getElementById('copyright-year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
})();

(function(){
  const header = document.getElementById('site-header');
  const threshold = 28;
  function onScroll(){
    if(!header) return;
    if(window.scrollY > threshold){
      header.classList.add('nav-glass');
      header.classList.remove('nav-plain');
    } else {
      header.classList.remove('nav-glass');
      header.classList.add('nav-plain');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  // Toggle + animation
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');

  function closeNav(){
    if(!navList) return;
    navList.classList.remove('show');
    if(navToggle) {
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }
  function openNav(){
    if(!navList) return;
    navList.classList.add('show');
    if(navToggle){
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
    }
    // optionally lock scroll when menu open on very small screens
    if(window.innerWidth <= 540) document.body.style.overflow = 'hidden';
  }

  if(navToggle && navList){
    navToggle.addEventListener('click', function(e){
      if(navList.classList.contains('show')) { closeNav(); }
      else { openNav(); }
    });

    // Close when clicking outside
    document.addEventListener('click', function(e){
      if(!navList.classList.contains('show')) return;
      if(!e.target.closest('#site-header')){
        closeNav();
      }
    });

    // Close with Escape
    window.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && navList.classList.contains('show')) closeNav();
    });

    // Close when window resized above mobile breakpoint
    window.addEventListener('resize', function(){
      if(window.innerWidth > 720) closeNav();
    });
  }

  // hamburger icon → simple transform to X
  // Add this CSS hook: .nav-toggle.open .bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  // .nav-toggle.open .bar:nth-child(2) { opacity: 0; }
  // .nav-toggle.open .bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

  // Dropdown toggle functionality
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdown = this.nextElementSibling;
      const isOpen = dropdown.classList.contains('show');
      
      // Close all dropdowns
      document.querySelectorAll('.nav-dropdown.show').forEach(d => {
        d.classList.remove('show');
      });
      document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
      });
      
      // Open clicked dropdown if it was closed
      if (!isOpen) {
        dropdown.classList.add('show');
        this.setAttribute('aria-expanded', 'true');
      }
    });
    
    // Close dropdown when clicking a link inside
    const dropdown = toggle.nextElementSibling;
    if (dropdown && dropdown.classList.contains('nav-dropdown')) {
      dropdown.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          dropdown.classList.remove('show');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown-toggle') && !e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.show').forEach(d => {
        d.classList.remove('show');
      });
      document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
      });
    }
  });
  
  // Close dropdowns with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.show').forEach(d => {
        d.classList.remove('show');
      });
      document.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
      });
    }
  });
})();

