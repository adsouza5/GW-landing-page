# GW landing concept

A single-viewport, mobile-responsive streetwear launch page built around the supplied GW mark.

## Creative direction

- **Quiet interface, violent transition:** the landing state is editorial and restrained; the energy is concentrated in a 2.5-second signal-break reveal.
- **Palette:** bone paper, washed black, and one signal-red accent.
- **Fashion language:** xerox grain, industrial flash photography, oversized type, limited-edition metadata.
- **Motion sequence:** signal handshake → RGB split → horizontal frame tears → red scan lock → interface snap-in.

## Run locally

Open `index.html` directly, or from this folder run:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`. The intro plays once per browser tab session. Remove the `gw-intro-seen` session-storage key to replay it.

## Production notes

- Replace the campaign image with the final collection photography while keeping the same right-weighted composition.
- Wire the two CTAs, menu, cart, and sound toggle to the production app.
- Keep the intro under three seconds and always retain the skip control and reduced-motion fallback.
- For repeat visitors, the intro is intentionally skipped after the first playback.

