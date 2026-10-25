// home.js — Y2K effects, fixed cursor + optimised scroll

// ─────────────────────────────────────────────────────────
// 0. SPOTLIGHT GLOW EFFECT
//    A radial gradient that follows the mouse, creating
//    a soft pink spotlight over the page content.
// ─────────────────────────────────────────────────────────
const spotlightCSS = document.createElement('style');
spotlightCSS.textContent = `
  .spotlight-overlay {
    position: fixed; inset: 0; z-index: 2;
    pointer-events: none;
    background: radial-gradient(
      circle 280px at var(--sx, -500px) var(--sy, -500px),
      rgba(236,112,154,0.13) 0%,
      rgba(245,232,170,0.06) 40%,
      transparent 70%
    );
    transition: opacity 0.4s ease;
    opacity: 0;
  }
  .spotlight-overlay.active { opacity: 1; }
`;
document.head.appendChild(spotlightCSS);

const spotlight = document.createElement('div');
spotlight.className = 'spotlight-overlay';
document.body.appendChild(spotlight);

let spFrame = false;
document.addEventListener('mousemove', e => {
  if (!spFrame) {
    spFrame = true;
    requestAnimationFrame(() => {
      spotlight.style.setProperty('--sx', e.clientX + 'px');
      spotlight.style.setProperty('--sy', e.clientY + 'px');
      if (!spotlight.classList.contains('active')) spotlight.classList.add('active');
      spFrame = false;
    });
  }
}, { passive: true });

// hide spotlight when mouse leaves window
document.addEventListener('mouseleave', () => spotlight.classList.remove('active'));
document.addEventListener('mouseenter', () => spotlight.classList.add('active'));
//    Strategy: use CSS transform only (no top/left changes).
//    dot  = position fixed at (0,0), translate() moves it.
//    ring = same, but lerped.
//    Half-size offset baked into translate so centre = mouse.
// ─────────────────────────────────────────────────────────
const DOT_HALF  = 4;   // half of 8px dot
const RING_HALF = 16;  // half of 32px ring
const RING_HALF_BIG = 24; // half of 48px ring (hovered)

const dot  = document.createElement('div');
const ring = document.createElement('div');
dot.className  = 'hc-dot';
ring.className = 'hc-ring';
// fixed at top-left; transform moves them
Object.assign(dot.style,  { position:'fixed', top:'0', left:'0', zIndex:'9999', pointerEvents:'none' });
Object.assign(ring.style, { position:'fixed', top:'0', left:'0', zIndex:'9998', pointerEvents:'none' });
document.body.append(dot, ring);

const cursorCSS = document.createElement('style');
cursorCSS.textContent = `
  .hc-dot {
    width:8px; height:8px; border-radius:50%;
    background:#EC709A;
    box-shadow: 0 0 6px #EC709A, 0 0 0 2px rgba(255,255,255,0.6);
    will-change: transform;
  }
  .hc-ring {
    width:32px; height:32px; border-radius:50%;
    border:1.5px solid rgba(236,112,154,.55);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.4);
    will-change: transform;
    transition: width .2s ease, height .2s ease, border-color .2s ease, background .2s ease;
  }
  .hc-ring.on {
    width:48px; height:48px;
    border-color:#EC709A;
    background:rgba(236,112,154,.07);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.5);
  }
  @media (hover:none){ .hc-dot,.hc-ring{ display:none; } }
`;
document.head.appendChild(cursorCSS);

// Shared raw mouse coords — updated by mousemove
let mx = -200, my = -200;
let rx = -200, ry = -200;
let mouseHasMoved = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  if (!mouseHasMoved) {
    mouseHasMoved = true;
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  }
}, { passive: true });

// start hidden until first real mouse move (prevents flash at 0,0)
dot.style.opacity  = '0';
ring.style.opacity = '0';

// Single rAF loop — drives both dot and ring
;(function rafLoop() {
  dot.style.transform = `translate(${mx - DOT_HALF}px,${my - DOT_HALF}px)`;

  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  const rh = ring.classList.contains('on') ? RING_HALF_BIG : RING_HALF;
  ring.style.transform = `translate(${rx - rh}px,${ry - rh}px)`;

  requestAnimationFrame(rafLoop);
})();

// cursor grow on interactive elements
document.querySelectorAll('a,button,.skill-card,.stat').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('on'));
  el.addEventListener('mouseleave', () => ring.classList.remove('on'));
});

// ─────────────────────────────────────────────────────────
// 2. SPARKLE ON CLICK — lightweight version
// ─────────────────────────────────────────────────────────
const SC   = ['✦','★','✩'];
const SCOL = ['#EC709A','#F5E8AA','#F4A7C0','#E8D070'];

function spawnSparkle(x, y, n) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.textContent = SC[i % SC.length];
    const angle = (Math.PI * 2 / n) * i;
    const dist  = 36 + Math.random() * 44;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;

    Object.assign(s.style, {
      position:'fixed', top:'0', left:'0',
      fontSize: (9 + Math.random()*11)+'px',
      color: SCOL[i % SCOL.length],
      pointerEvents:'none', zIndex:'9997', userSelect:'none',
      transform: `translate(${x - 4}px,${y - 4}px)`,
      opacity:'1',
      transition:'transform .6s cubic-bezier(.2,1,.3,1), opacity .6s ease',
      willChange:'transform,opacity',
    });
    document.body.appendChild(s);

    // trigger animation next frame
    requestAnimationFrame(() => {
      s.style.transform = `translate(${x + tx - 4}px,${y + ty - 4}px) rotate(${i*45}deg) scale(.1)`;
      s.style.opacity   = '0';
    });
    setTimeout(() => s.remove(), 700);
  }
}

document.addEventListener('click', e => {
  spawnSparkle(e.clientX, e.clientY, e.target.closest('a,button') ? 3 : 6);
});

// ─────────────────────────────────────────────────────────
// 3. SKILL CARDS — soft skills hover (tilt removed, now
//    handled by CSS transform on .sk-soft-card)
//    Progress bars animate on scroll into view
// ─────────────────────────────────────────────────────────

// animate progress bars when they scroll into view
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.sk-bar-fill').forEach(fill => {
      fill.style.width = fill.dataset.w + '%';
    });
    barObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.sk-box-tech').forEach(el => barObserver.observe(el));

// ─────────────────────────────────────────────────────────
// 4. STAT COUNTER
// ─────────────────────────────────────────────────────────
document.querySelectorAll('.stat strong').forEach(el => {
  const raw    = el.textContent.trim();
  const num    = parseFloat(raw);
  if (isNaN(num)) return;
  const suffix = raw.replace(/[\d.]/g, '');

  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    obs.unobserve(el);
    const dur = 1200;
    let t0 = null;
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1-p, 3)) * num) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    });
  }, { threshold: 0.7 }).observe(el);
});

// ─────────────────────────────────────────────────────────
// 5. HERO PHOTO FRAME — tilt on hover only (not scroll)
// ─────────────────────────────────────────────────────────
const imgFrame = document.querySelector('.hero-img-frame');
if (imgFrame) {
  let pending = false;
  let fx = 0, fy = 0;

  imgFrame.addEventListener('mousemove', e => {
    fx = e.clientX; fy = e.clientY;
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      const r  = imgFrame.getBoundingClientRect();
      const dx = (fx - (r.left + r.width/2))  / (r.width/2);
      const dy = (fy - (r.top  + r.height/2)) / (r.height/2);
      imgFrame.style.transform =
        `perspective(600px) rotateX(${dy*-8}deg) rotateY(${dx*8}deg) scale(1.02)`;
      pending = false;
    });
  }, { passive: true });

  imgFrame.addEventListener('mouseleave', () => {
    imgFrame.style.transform = '';
  });
}

// hero name parallax REMOVED — was running on every mousemove = janky scroll
const starCSS = document.createElement('style');
starCSS.textContent = `
  .y2k-star {
    position:absolute; pointer-events:none; user-select:none; z-index:0;
    animation: yFloat var(--d) ease-in-out var(--dl) infinite alternate;
  }
  @keyframes yFloat {
    from { transform:translateY(0) rotate(0deg);    opacity:.45; }
    to   { transform:translateY(-14px) rotate(18deg); opacity:.08; }
  }
`;
document.head.appendChild(starCSS);

const heroEl = document.querySelector('.hero');
if (heroEl) {
  const fCols  = ['rgba(236,112,154,.22)','rgba(245,232,170,.3)','rgba(244,167,192,.18)'];
  const fChars = ['✦','★','✩'];
  for (let i = 0; i < 4; i++) {
    const s = document.createElement('span');
    s.className = 'y2k-star';
    s.textContent = fChars[i % 3];
    s.style.cssText = `
      font-size:${9 + Math.random()*11}px;
      color:${fCols[i%3]};
      left:${10 + Math.random()*80}%;
      top:${10 + Math.random()*80}%;
      --d:${4+Math.random()*4}s;
      --dl:${Math.random()*4}s;
    `;
    heroEl.appendChild(s);
  }
}

// ─────────────────────────────────────────────────────────
// 7. SCROLL REVEAL
// ─────────────────────────────────────────────────────────
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      obs.unobserve(entry.target);
    }
  }, { threshold: 0.1 }).observe(el);
});
