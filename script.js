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

if (sessionStorage.getItem('gw-intro-seen')) {
  boot?.remove();
  revealHero();
} else {
  sessionStorage.setItem('gw-intro-seen', '1');
  if (video) {
    const fallback = setTimeout(endBoot, 12000);
    video.addEventListener('ended', () => { clearTimeout(fallback); endBoot(); });
    video.addEventListener('error', () => { clearTimeout(fallback); endBoot(); });
    video.play().catch(endBoot);
  } else {
    endBoot();
  }
}

skip?.addEventListener('click', () => { if (boot) endBoot(); });

sound?.addEventListener('click', () => {
  const active = sound.getAttribute('aria-pressed') === 'true';
  sound.setAttribute('aria-pressed', String(!active));
  sound.lastChild.textContent = active ? ' Sound' : ' Sound on';
});

// ── Bag panel ──────────────────────────────────────────────────
const bagPanel       = document.getElementById('bag-panel');
const bagOpenBtn     = document.getElementById('bag-open');
const bagClose       = bagPanel && bagPanel.querySelector('.bag-panel__close');
const bagBackdrop    = bagPanel && bagPanel.querySelector('.bag-panel__backdrop');
const bagCountEl     = document.getElementById('bag-count');
const bagHeaderCount = document.getElementById('bag-header-count');
const bagHeaderPlur  = document.getElementById('bag-header-plural');
const bagEmptyEl     = document.getElementById('bag-empty');
const bagItemsEl     = document.getElementById('bag-items');
const bagFooterEl    = document.getElementById('bag-footer');
const bagSubtotalEl  = document.getElementById('bag-subtotal');
const bagEnterDrop   = document.getElementById('bag-enter-drop');

let bagItems = [];
let bagLastFocus = null;

function bagTotal() { return bagItems.reduce((s, i) => s + i.price * i.qty, 0); }

function renderBag() {
  const qty = bagItems.reduce((s, i) => s + i.qty, 0);
  if (bagCountEl)     bagCountEl.textContent     = qty;
  if (bagHeaderCount) bagHeaderCount.textContent = qty;
  if (bagHeaderPlur)  bagHeaderPlur.textContent  = qty === 1 ? '' : 'S';
  const empty = qty === 0;
  if (bagEmptyEl)  bagEmptyEl.hidden  = !empty;
  if (bagItemsEl)  bagItemsEl.hidden  = empty;
  if (bagFooterEl) bagFooterEl.hidden = empty;
  if (bagSubtotalEl) bagSubtotalEl.textContent = '$' + bagTotal() + ' USD';
  if (!bagItemsEl) return;
  bagItemsEl.innerHTML = bagItems.map((item, idx) => `
    <li class="bag-item">
      <img class="bag-item__img" src="assets/gw-editorial-hero.png" alt="${item.name}" />
      <div class="bag-item__info">
        <p class="bag-item__name">${item.name}</p>
        <p class="bag-item__meta">Size: ${item.size} &nbsp;/ Qty: ${item.qty}</p>
        <p class="bag-item__price">$${item.price} USD</p>
      </div>
      <button class="bag-item__remove" data-idx="${idx}" aria-label="Remove ${item.name}">✕</button>
    </li>`).join('');
  bagItemsEl.querySelectorAll('.bag-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      bagItems.splice(Number(btn.dataset.idx), 1);
      renderBag();
    });
  });
}

function openBag() {
  if (!bagPanel) return;
  bagLastFocus = document.activeElement;
  bagPanel.classList.add('is-open');
  bagPanel.setAttribute('aria-hidden', 'false');
  if (bagOpenBtn) bagOpenBtn.setAttribute('aria-expanded', 'true');
  if (bagClose) bagClose.focus();
}

function closeBag() {
  if (!bagPanel) return;
  bagPanel.classList.remove('is-open');
  bagPanel.setAttribute('aria-hidden', 'true');
  if (bagOpenBtn) bagOpenBtn.setAttribute('aria-expanded', 'false');
  if (bagLastFocus) bagLastFocus.focus();
}

function addToBag(name, size, price) {
  const existing = bagItems.find(i => i.name === name && i.size === size);
  if (existing) { existing.qty++; } else { bagItems.push({ name, size, price, qty: 1 }); }
  renderBag();
  openBag();
}

if (bagOpenBtn)  bagOpenBtn.addEventListener('click', openBag);
if (bagClose)    bagClose.addEventListener('click', closeBag);
if (bagBackdrop) bagBackdrop.addEventListener('click', closeBag);
if (bagEnterDrop) bagEnterDrop.addEventListener('click', () => { closeBag(); openModal(); });

renderBag();

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
  if (e.key === 'Escape') {
    if (bagPanel && bagPanel.classList.contains('is-open')) { closeBag(); return; }
    if (!modal?.hidden) { closeModal(); return; }
    return;
  }
  if (modal?.hidden) return;
  if (e.key !== 'Tab') return;
  const focusable = [...accessCard.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')]
    .filter(el => !el.closest('[hidden]'));
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
