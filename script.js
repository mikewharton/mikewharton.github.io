const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const behavior = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

const header = $('.top');
const banner = $('.banner');
const panel = $('#painting-info');
const layers = $$('.layer');
let index = 0;
let open = false;
let anchorY = null;
let anchorTimer;

const size = () => {
  let height = '18px';
  let width = '100%';
  if (open) {
    const ratio = Number(layers[index].dataset.ar);
    const maxHeight = Math.max(240, Math.min(innerHeight - 150, 820));
    const w = Math.min(header.clientWidth, maxHeight * ratio);
    height = `${Math.round(w / ratio)}px`;
    width = `${Math.round(w)}px`;
  }
  header.style.setProperty('--ban-h', height);
  header.style.setProperty('--ban-w', width);
};

const anchor = delay => {
  clearTimeout(anchorTimer);
  anchorY = null;
  anchorTimer = setTimeout(() => { anchorY = scrollY; }, delay);
};

const show = i => {
  const count = layers.length;
  index = (i + count) % count;
  layers.forEach((layer, j) => {
    const active = j === index;
    const near = [0, 1, count - 1].includes((j - index + count) % count);
    layer.classList.toggle('on', active);
    layer.alt = active ? layer.dataset.caption : '';
    if (near && layer.getAttribute('src') !== layer.dataset.full) layer.src = layer.dataset.full;
  });
  $('#caption').textContent = layers[index].dataset.caption;
  $('#counter').textContent = `${index + 1}/${count}`;
  document.body.dataset.art = index;
  size();
};

const step = direction => {
  if (open) anchor(900);
  show(index + direction);
};

const setOpen = value => {
  open = value;
  banner.setAttribute('aria-expanded', open);
  banner.setAttribute('aria-label', open ? 'Close the painting' : 'Open the painting to see it whole');
  panel.classList.toggle('open', open);
  if (open) {
    scrollTo({ top: 0, behavior: behavior() });
    anchor(1200);
  } else {
    clearTimeout(anchorTimer);
    anchorY = null;
  }
  size();
};

banner.addEventListener('click', () => setOpen(!open));
$('.close').addEventListener('click', () => setOpen(false));
$('.arrow.prev').addEventListener('click', () => step(-1));
$('.arrow.next').addEventListener('click', () => step(1));

addEventListener('scroll', () => {
  if (open && anchorY !== null && Math.abs(scrollY - anchorY) > 160) setOpen(false);
}, { passive: true });

let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(size, 120);
});

let touchStart = null;
banner.addEventListener('touchstart', e => {
  touchStart = open ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
}, { passive: true });
banner.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
}, { passive: true });

let lastWheel = 0;
banner.addEventListener('wheel', e => {
  if (!open || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;
  e.preventDefault();
  const now = Date.now();
  if (now - lastWheel > 120) step(e.deltaX > 0 ? 1 : -1);
  lastWheel = now;
}, { passive: false });

const examples = $('#examples');
const chips = $$('.chip');
let current = null;

const select = topic => {
  current = topic;
  chips.forEach(chip => {
    const active = chip.dataset.topic === topic;
    chip.classList.toggle('on', active);
    chip.setAttribute('aria-expanded', active);
  });
  if (topic) {
    $$('.topic').forEach(t => {
      t.hidden = t.id !== `topic-${topic}`;
      $('.car', t).scrollLeft = 0;
    });
  }
  examples.classList.toggle('open', Boolean(topic));
};

chips.forEach(chip => chip.addEventListener('click', () => {
  select(chip.dataset.topic === current ? null : chip.dataset.topic);
}));

const setupCarousel = topic => {
  const car = $('.car', topic);
  let target = null;
  let position = 0;
  let last = 0;
  let frame = null;

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = null;
    target = null;
  };

  const glide = now => {
    const dt = last ? Math.min(48, now - last) : 16;
    last = now;
    const diff = target - position;
    if (Math.abs(diff) < 0.5) {
      car.scrollLeft = target;
      stop();
      return;
    }
    position += diff * (1 - Math.exp(-dt / 90));
    car.scrollLeft = position;
    frame = requestAnimationFrame(glide);
  };

  car.addEventListener('wheel', e => {
    const max = car.scrollWidth - car.clientWidth;
    if (innerWidth <= 760 || max <= 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const delta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    const from = target ?? car.scrollLeft;
    if ((delta > 0 && from >= max - 1) || (delta < 0 && from <= 1)) return;
    e.preventDefault();
    target = Math.max(0, Math.min(max, from + delta));
    if (behavior() === 'auto') {
      car.scrollLeft = target;
      target = null;
    } else if (frame === null) {
      position = car.scrollLeft;
      last = 0;
      frame = requestAnimationFrame(glide);
    }
  }, { passive: false });

  ['pointerdown', 'touchstart'].forEach(type => car.addEventListener(type, stop, { passive: true }));

  $$('.prev, .next', topic).forEach(button => button.addEventListener('click', () => {
    stop();
    const direction = button.classList.contains('next') ? 1 : -1;
    car.scrollBy({ left: direction * Math.min(car.clientWidth, 872) * 0.8, behavior: behavior() });
  }));
};

$$('.topic').forEach(setupCarousel);

$('#year').textContent = new Date().getFullYear();
