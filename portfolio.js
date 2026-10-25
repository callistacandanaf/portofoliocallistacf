// portfolio.js — bento grid Y2K effects

// ── SPOTLIGHT GLOW EFFECT ─────────────────────────────────
const spCSS = document.createElement('style');
spCSS.textContent = `
  .spotlight-overlay {
    position: fixed; inset: 0; z-index: 2;
    pointer-events: none;
    background: radial-gradient(
      circle 300px at var(--sx,-500px) var(--sy,-500px),
      rgba(236,112,154,0.13) 0%,
      rgba(245,232,170,0.06) 40%,
      transparent 70%
    );
    opacity: 0; transition: opacity 0.4s ease;
  }
  .spotlight-overlay.active { opacity: 1; }
`;
document.head.appendChild(spCSS);

const spEl = document.createElement('div');
spEl.className = 'spotlight-overlay';
document.body.appendChild(spEl);

let spPending = false;
document.addEventListener('mousemove', e => {
  if (spPending) return;
  spPending = true;
  requestAnimationFrame(() => {
    spEl.style.setProperty('--sx', e.clientX + 'px');
    spEl.style.setProperty('--sy', e.clientY + 'px');
    spEl.classList.add('active');
    spPending = false;
  });
}, { passive: true });

document.addEventListener('mouseleave', () => spEl.classList.remove('active'));
document.addEventListener('mouseenter', () => spEl.classList.add('active'));

// ── CUSTOM CURSOR ──────────────────────────────────────────
const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

if (dot && ring) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  (function animateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('.bento-cell, .bc-link, a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

// ── BENTO ENTRANCE — staggered fade + slide ────────────────
const cells = document.querySelectorAll('.bento-cell');

const entranceObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = parseInt(entry.target.dataset.index) || 0;
      setTimeout(() => entry.target.classList.add('entered'), idx * 110);
      entranceObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.06 });

cells.forEach(c => entranceObs.observe(c));

// ── 3D TILT + GLARE ────────────────────────────────────────
cells.forEach(cell => {
  cell.addEventListener('mousemove', e => {
    const r  = cell.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);

    cell.style.transform =
      `perspective(900px) rotateX(${dy * -8}deg) rotateY(${dx * 8}deg) scale(1.022)`;

    const glare = cell.querySelector('.tilt-glare');
    if (glare) {
      const gx = ((e.clientX - r.left) / r.width)  * 100;
      const gy = ((e.clientY - r.top)  / r.height) * 100;
      glare.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.25) 0%, transparent 55%)`;
    }
  });

  cell.addEventListener('mouseleave', () => {
    cell.style.transform = '';
    const glare = cell.querySelector('.tilt-glare');
    if (glare) glare.style.background = '';
  });
});

// ── SPARKLE ON CLICK ───────────────────────────────────────
const SPARKLE_CHARS  = ['✦', '★', '✩', '✦', '★'];
const SPARKLE_COLORS = ['#EC709A', '#F5E8AA', '#F4A7C0', '#E8D070', '#EC709A'];

function spawnSparkle(x, y) {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('span');
    s.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];

    const size  = 10 + Math.random() * 16;
    const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.6;
    const dist  = 44 + Math.random() * 56;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;

    Object.assign(s.style, {
      position:      'fixed',
      left:          x + 'px',
      top:           y + 'px',
      fontSize:      size + 'px',
      color,
      pointerEvents: 'none',
      zIndex:        '9999',
      transform:     'translate(-50%, -50%)',
      opacity:       '1',
      transition:    'transform 0.7s cubic-bezier(0.2,1,0.3,1), opacity 0.7s ease',
      userSelect:    'none',
    });

    document.body.appendChild(s);

    requestAnimationFrame(() => {
      s.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${Math.random()*360}deg) scale(0.2)`;
      s.style.opacity   = '0';
    });

    setTimeout(() => s.remove(), 800);
  }
}

cells.forEach(c => c.addEventListener('click', e => spawnSparkle(e.clientX, e.clientY)));

// ── MAGNETIC LINKS ─────────────────────────────────────────
document.querySelectorAll('.bc-link').forEach(link => {
  link.addEventListener('mousemove', e => {
    const r  = link.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * 0.32;
    const dy = (e.clientY - (r.top  + r.height / 2)) * 0.32;
    link.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  link.addEventListener('mouseleave', () => link.style.transform = '');
});

// ── Y2K FLOATING STARS (background deco) ───────────────────
const wrap = document.querySelector('.bento-wrap');

if (wrap) {
  const floatColors = [
    'rgba(236,112,154,0.3)',
    'rgba(245,232,170,0.45)',
    'rgba(244,167,192,0.28)',
    'rgba(232,208,112,0.35)',
  ];
  const floatChars = ['✦', '★', '✩'];

  for (let i = 0; i < 14; i++) {
    const star = document.createElement('span');
    star.className   = 'y2k-float-star';
    star.textContent = floatChars[Math.floor(Math.random() * floatChars.length)];

    Object.assign(star.style, {
      fontSize:        (9 + Math.random() * 14) + 'px',
      color:           floatColors[Math.floor(Math.random() * floatColors.length)],
      left:            (Math.random() * 98) + '%',
      top:             (Math.random() * 98) + '%',
      animationDuration: (4 + Math.random() * 4) + 's',
      animationDelay:    (Math.random() * 5) + 's',
    });

    wrap.appendChild(star);
  }
}

// ── HEADER PARALLAX STARS ──────────────────────────────────
const headerStars = document.querySelectorAll('.ph-star');

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  headerStars.forEach((star, i) => {
    const speed = 0.08 + i * 0.04;
    star.style.transform = `translateY(${sy * speed}px)`;
  });
});

// ── LIGHTBOX ─────────────────────────────────────────────
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// close with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// prevent closing when clicking the image itself
document.getElementById('lightbox-img')?.addEventListener('click', e => {
  e.stopPropagation();
});

// ── PROJECT FILTER + SEE ALL ─────────────────────────────
const filterBtns   = document.querySelectorAll('.proj-filter');
const allProjCards = document.querySelectorAll('.proj-card');
const seeAllBtn    = document.getElementById('seeAllBtn');
const INITIAL_SHOW = 8;

let activeFilter = 'all';
let expanded     = false;

function applyState() {
  // 1. figure out which cards match the active filter
  const matching = [...allProjCards].filter(c => {
    return activeFilter === 'all' || c.dataset.cat === activeFilter;
  });

  // 2. show/hide each card
  allProjCards.forEach(card => {
    const matches = activeFilter === 'all' || card.dataset.cat === activeFilter;
    const idx     = matching.indexOf(card);
    const visible = matches && (expanded || idx < INITIAL_SHOW);

    card.classList.toggle('hidden', !visible);
    if (visible) {
      card.classList.add('revealed');
    }
  });

  // 3. show/hide the see-all button
  if (matching.length > INITIAL_SHOW) {
    seeAllBtn.parentElement.style.display = 'block';
    seeAllBtn.textContent = expanded ? 'Show Less ↑' : `See All (${matching.length}) ✦`;
  } else {
    seeAllBtn.parentElement.style.display = 'none';
  }
}

// filter tab click
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    expanded     = false;   // reset collapse when switching filter
    applyState();
  });
});

// see all click
if (seeAllBtn) {
  seeAllBtn.addEventListener('click', () => {
    expanded = !expanded;
    if (!expanded) {
      document.querySelector('.projects-wrap')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    applyState();
  });
}

// initial render
applyState();
