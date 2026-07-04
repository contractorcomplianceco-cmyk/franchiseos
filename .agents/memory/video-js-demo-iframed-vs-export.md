---
name: video-js demo iframed vs export path
description: Why /demo/ direct differs from the embedded demo, and how to verify a specific scene
---

# Demo has two render paths, and how to screenshot a specific scene

`VideoWithControls` branches on `window.self !== window.top` (isIframed):
- **Non-iframed** (opening `/demo/` directly, and the export/recording path): renders bare `<VideoTemplate />` — NO control bar, NO `useSceneControls`, always starts at scene 0.
- **Iframed** (embedded in the franchise-os landing overlay): renders the control bar + `useSceneControls`.

**Consequence:** screenshotting `/demo/` directly always shows the intro and never shows controls. To QA controls or a later scene, screenshot the franchise-os landing (`/`) whose overlay iframes the demo.

**To verify a specific scene (e.g. the closing Expansion map):** temporarily set the initial `activeIndex` in `useSceneControls.ts` (e.g. `useState(5)`), restart `artifacts/demo: web`, screenshot the franchise-os landing overlay, then REVERT to `useState(0)`. Durations rotate from that index so the chosen scene plays first. The demo loops ~81s, so you can't reliably catch a late scene by random timing.

**DOM lib caveat:** the demo's tsconfig omits the DOM lib, so `window`/`document`/`getAnimations`/`Element`/timers show as TS name/type errors even though Vite runs fine. When adding DOM code here, annotate with `any` and avoid `instanceof Element` to at least not introduce *new* implicit-any (TS7006) / value-as-type (TS2693) categories; the existing name errors are accepted scaffold noise.
