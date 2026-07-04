---
name: video-js scene timer pause/resume
description: How to pause/resume the useVideoPlayer scene timer without desyncing audio
---

# Pausing the video-js scene timer

The scene-advance loop in `useVideoPlayer` (artifacts/demo/src/lib/video/hooks.ts) is a single `setTimeout(sceneDuration)` per scene. A naive pause that clears the timer and, on resume, starts a fresh `setTimeout(fullDuration)` makes scene transitions fire late — the visuals fall behind the composite audio (which resumes from its own `currentTime`), so narration for scene N+1 plays while scene N is still on screen.

**Rule:** pause/resume must track *remaining* time, not restart the scene.

**How to apply:** keep refs for `sceneStartRef` (Date.now() when the timer started), `remainingRef` (ms left in the current scene), and `remainingSceneRef` (which scene remainingRef belongs to). On each effect run: if the scene index changed, reset `remainingRef` to that scene's full duration; if `paused`, return without a timer; otherwise start `setTimeout(remainingRef)` and, in cleanup, subtract `Date.now() - sceneStartRef` from `remainingRef`. This makes resume continue where it left off and stay aligned with the audio element (which pauses/resumes from its current playback position in VideoTemplate).

**Why:** audio and the scene clock are two independent timelines; only remaining-time bookkeeping keeps them tied. The export/recording path passes no `paused` prop (defaults false), so cleanup runs on every scene change and resets to full duration — export is unaffected.
