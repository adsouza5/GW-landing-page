# GW — Drop 001 Landing Page

Single-viewport launch page for GW's first streetwear drop. Built around a 4-second glitch-transition intro video, editorial hero photography, and a private-access signup modal.

## Stack

- Vanilla HTML / CSS / JS — zero dependencies, no build step
- Node.js static file server with HTTP Range request support for MP4 streaming
- Google Fonts: Archivo Black, IBM Plex Mono, Inter

## Run locally

```bash
node serve.js
```

Then open `http://localhost:8090`.

## Structure

```
├── index.html          # Single-page markup
├── styles.css          # All styles (boot, hero, modal, responsive)
├── script.js           # Boot sequence + access modal logic
├── serve.js            # Local dev server (Range-request aware)
└── assets/
    ├── gw-mark.png                              # GW logo mark
    ├── gw-editorial-hero.png                    # Hero background photo
    ├── gw-bone-linen.png                        # Linen texture (modal card)
    └── gw-glitch-transition-clean-hero-4s.mp4  # Boot intro video
```

## Features

**Boot sequence**
- 4s glitch-transition MP4 plays on every page load
- Skip button top-right; falls back gracefully if autoplay is blocked
- Boot overlay fades out, then nav / headline / meta stagger in over ~2s

**Access modal**
- Triggered by "Enter the drop" button
- Email / SMS channel switch with inline validation
- Confirmation state on submit
- Keyboard accessible: Escape closes, focus trapped inside, backdrop click closes

**Responsive**
- Mobile: full-width bottom-sheet modal, scaled typography, centered video/hero crop
- Desktop: centered card modal, oversized Archivo Black headlines

## Production checklist

- [ ] Wire `accessForm` submit handler to email/SMS provider (see `script.js`)
- [ ] Replace hero image with final collection photography
- [ ] Connect menu and Lookbook nav link to their destinations
- [ ] Uncomment Bag link in nav when cart is ready
- [ ] Add `og:image`, `og:title`, and `description` meta tags
- [ ] Deploy behind HTTPS (required for `backdrop-filter` on some browsers)
