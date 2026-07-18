const boot  = document.querySelector('.boot');
const video = document.querySelector('.boot__video');
const skip  = document.querySelector('.boot__skip');
const sound = document.querySelector('.sound');

function wipeOut() {
  if (!boot) return;
  boot.classList.add('boot--out');
  setTimeout(() => boot.remove(), 620);
}

function reveal() {
  document.body.classList.remove('is-booting');
  wipeOut();
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || sessionStorage.getItem('gw-intro-seen')) {
  boot?.remove();
  document.body.classList.remove('is-booting');
} else {
  sessionStorage.setItem('gw-intro-seen', '1');

  if (video) {
    video.addEventListener('ended', reveal);
    video.addEventListener('error', reveal);
    const p = video.play();
    if (p !== undefined) p.catch(reveal); // autoplay blocked → skip to hero
  } else {
    reveal();
  }
}

skip?.addEventListener('click', () => {
  if (video) video.pause();
  reveal();
});

sound?.addEventListener('click', () => {
  const active = sound.getAttribute('aria-pressed') === 'true';
  sound.setAttribute('aria-pressed', String(!active));
  sound.lastChild.textContent = active ? ' Sound' : ' Sound on';
});

