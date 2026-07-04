---
name: video-js visual pause via WAAPI
description: How to freeze framer-motion + CSS animations when the demo video is paused
---

# Freezing visuals on pause (not just audio/timer)

Pausing the scene timer and audio is not enough — framer-motion (accelerated) and CSS keyframe animations keep running visually. To truly freeze them, use the Web Animations API from a `paused`-aware effect in `VideoTemplate.tsx`.

**Rule:** scope to the video root and re-apply on an interval.

**How to apply:** hold a `rootRef` on the outer video div. In an effect keyed on `paused`:
- Get animations via `document.getAnimations()`, keep only those whose `anim.effect.target` is inside the root (`root.contains(target)`).
- When paused: `pause()` each matching animation, then re-run that freeze on a ~120ms `setInterval` so animations *created after* the pause (per-scene entrances) also get frozen. Clear the interval in cleanup.
- When unpaused: `play()` only animations with `playState === 'paused'` (avoids replaying already-finished ones in some engines).
- Guard with `typeof document.getAnimations === 'function'` for environments lacking WAAPI.

**Why:** three independent timelines (scene timer, audio element, animation engine) must all be paused together or the paused frame keeps moving. The interval is required because entrance animations mount lazily per scene and aren't in the initial `getAnimations()` list.
