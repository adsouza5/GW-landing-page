const boot  = document.querySelector('.boot');
const video = document.querySelector('.boot__video');
const skip  = document.querySelector('.boot__skip');
const sound = document.querySelector('.sound');

const enterDrop       = document.querySelector('#enter-drop');
const modal           = document.querySelector('#access-modal');
const accessCard      = modal?.querySelector('.access-card');
const closeButtons    = modal?.querySelectorAll('[data-close-modal]') ?? [];
const channelButtons  = modal?.querySelectorAll('[data-channel]') ?? [];
const accessForm      = document.querySelector('#access-form');
const formView        = document.querySelector('#access-form-view');
const successView     = document.querySelector('#access-success');
const contactInput    = document.querySelector('#contact-input');
const contactLabel    = document.querySelector('#contact-label');
const contactPrefix   = document.querySelector('#contact-prefix');
const formError       = document.querySelector('#form-error');

// ── Boot sequence ──────────────────────────────────────────────
function revealHero() { document.body.classList.remove('is-booting'); }

function endBoot() {
  boot?.classList.add('boot--out');
  setTimeout(revealHero, 150);
  setTimeout(() => boot?.remove(), 950);
}

if (video) {
  const fallback = setTimeout(endBoot, 12000);
  video.addEventListener('ended', () => { clearTimeout(fallback); endBoot(); });
  video.addEventListener('error', () => { clearTimeout(fallback); endBoot(); });
  video.play().catch(endBoot);
} else {
  endBoot();
}

skip?.addEventListener('click', () => { if (boot) endBoot(); });

sound?.addEventListener('click', () => {
  const active = sound.getAttribute('aria-pressed') === 'true';
  sound.setAttribute('aria-pressed', String(!active));
  sound.lastChild.textContent = active ? ' Sound' : ' Sound on';
});

// ── Access modal ───────────────────────────────────────────────
let channel = 'email';
let lastFocus = null;

function setChannel(next) {
  channel = next;
  channelButtons.forEach(btn => {
    const selected = btn.dataset.channel === channel;
    btn.setAttribute('aria-selected', String(selected));
    btn.tabIndex = selected ? 0 : -1;
  });
  contactInput.value = '';
  contactInput.setCustomValidity('');
  formError.textContent = '';

  if (channel === 'phone') {
    contactInput.type = 'tel';
    contactInput.inputMode = 'tel';
    contactInput.autocomplete = 'tel';
    contactInput.placeholder = '+1 000 000 0000';
    contactInput.name = 'phone';
    contactLabel.textContent = 'Phone number';
    contactPrefix.textContent = 'SMS://';
  } else {
    contactInput.type = 'email';
    contactInput.inputMode = 'email';
    contactInput.autocomplete = 'email';
    contactInput.placeholder = 'YOU@DOMAIN.COM';
    contactInput.name = 'email';
    contactLabel.textContent = 'Email address';
    contactPrefix.textContent = 'EMAIL://';
  }
}

function openModal() {
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  accessForm.reset();
  formView.hidden = false;
  successView.hidden = true;
  setChannel('email');
  setTimeout(() => contactInput.focus(), 180);
}

function closeModal() {
  modal.classList.add('is-closing');
  setTimeout(() => {
    modal.hidden = true;
    modal.classList.remove('is-closing');
    document.body.classList.remove('modal-open');
    lastFocus?.focus();
  }, 380);
}

function validate() {
  const val = contactInput.value.trim();
  contactInput.setCustomValidity('');
  if (!val) {
    contactInput.setCustomValidity(channel === 'email' ? 'Enter your email address.' : 'Enter your phone number.');
  } else if (channel === 'email' && !contactInput.validity.valid) {
    contactInput.setCustomValidity('Enter a valid email address.');
  } else if (channel === 'phone' && val.replace(/\D/g, '').length < 7) {
    contactInput.setCustomValidity('Enter a valid phone number.');
  }
  formError.textContent = contactInput.validationMessage;
  return contactInput.checkValidity();
}

enterDrop?.addEventListener('click', openModal);
closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
channelButtons.forEach(btn => btn.addEventListener('click', () => setChannel(btn.dataset.channel)));

contactInput?.addEventListener('input', () => {
  contactInput.setCustomValidity('');
  formError.textContent = '';
});

accessForm?.addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) { contactInput.focus(); return; }
  // Wire to your email/SMS provider here
  formView.hidden = true;
  successView.hidden = false;
  successView.focus();
});

document.addEventListener('keydown', e => {
  if (modal?.hidden) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key !== 'Tab') return;
  const focusable = [...accessCard.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')]
    .filter(el => !el.closest('[hidden]'));
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
