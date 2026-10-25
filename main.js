// main.js — shared logic: navbar, hamburger, scroll reveal

// ── NAVBAR SCROLL STYLE ─────────────────────────────────────
window.addEventListener('scroll', () => {
  document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 40);
});

// ── ACTIVE NAV LINK (only on index.html) ────────────────────
const isHome = document.getElementById('home') !== null;

if (isHome) {
  window.addEventListener('scroll', () => {
    const ids      = ['home', 'about', 'skills'];
    const links    = document.querySelectorAll('.nav-links a');
    let   current  = 'home';

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 140) current = id;
    });

    links.forEach(link => {
      const href = link.getAttribute('href');
      // mark Home link active when anywhere on home page
      link.classList.toggle(
        'active',
        href === 'index.html' || href === '#home' ? current !== null && isHome : false
      );
    });
  });
}

// ── HAMBURGER ───────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navMenu   = document.querySelector('.nav-links');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    hamburger.classList.toggle('is-open');
  });

  // close menu when a link is clicked
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('is-open');
    });
  });
}

// ── SCROLL REVEAL ────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');

if (reveals.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}
