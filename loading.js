// loading.js — animasi loading screen

const loader  = document.getElementById('loader');
const bar     = document.querySelector('.loader-bar-fill');
const pct     = document.querySelector('.loader-percent');
let progress  = 0;

const tick = setInterval(() => {
  progress += Math.random() * 14 + 3;

  if (progress >= 100) {
    progress = 100;
    clearInterval(tick);
    pct.textContent    = '100%';
    bar.style.width    = '100%';

    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => (loader.style.display = 'none'), 700);
    }, 400);
  } else {
    pct.textContent = Math.floor(progress) + '%';
    bar.style.width = progress + '%';
  }
}, 120);
