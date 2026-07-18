const boot = document.querySelector('.boot');
const skip = document.querySelector('.boot__skip');
const sound = document.querySelector('.sound');

function reveal() {
  document.body.classList.remove('is-booting');
  boot?.setAttribute('aria-hidden', 'true');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion || sessionStorage.getItem('gw-intro-seen')) {
  boot?.remove();
  reveal();
} else {
  window.setTimeout(() => {
    reveal();
    sessionStorage.setItem('gw-intro-seen', '1');
  }, 2450);
}

skip?.addEventListener('click', () => {
  boot.remove();
  reveal();
});

sound?.addEventListener('click', () => {
  const active = sound.getAttribute('aria-pressed') === 'true';
  sound.setAttribute('aria-pressed', String(!active));
  sound.lastChild.textContent = active ? ' Sound' : ' Sound on';
});

