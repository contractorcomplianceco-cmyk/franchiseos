---
name: video-js narrated audio (voiceover + music)
description: How to build a user-requested narrated demo video in a video-js artifact so audio stays synced in preview AND recorded export.
---

# Narrated video-js audio

When the user explicitly requests a voiceover (not just default music), do NOT wire per-scene `<audio src>` swaps — they drift in the recorded export. Instead pre-mix ONE `public/audio/composite_audio.mp3` and reference it from VideoTemplate.

**Recipe that worked:**
1. Pick voice via `searchVoices` — the specific "upbeat young american male energetic" search returned empty; broader terms ("male narrator", "commercial", "social media") returned results. Look for labels gender=male, accent=american, age=young, use_case=social_media/advertisement.
2. Write the script in one beat per scene; generate one TTS file per scene (`textToSpeech`). Keep each VO shorter than its scene's SCENE_DURATIONS ms (leave >=400ms tail).
3. `ffprobe` each VO to get real durations and confirm they fit their scenes.
4. `generateMusic` sized to `ceil(sum(SCENE_DURATIONS)/1000)` seconds, `forceInstrumental:true`.
5. ffmpeg pre-mix: bg music ducked to ~0.22 (`volume=0.22`), each VO at `adelay=OFFSET|OFFSET` where OFFSET = cumulative scene start ms + ~400ms lead; `amix=inputs=N:duration=longest:normalize=0`; clamp with `-t totalSeconds`.
6. In VideoTemplate: single persistent `<audio src=composite_audio.mp3 muted={muted}>`; on `currentSceneKey` change seek to `SCENE_START_SEC[baseSceneKey]` (strip `_r[12]$`) with an epsilon guard (~0.18s) so normal transitions don't re-seek audibly.

**Why:** recorded export plays the composite once start-to-finish, so a single pre-aligned track guarantees preview==export parity. Per-scene audio elements race the recorder and drift.

**How to apply:** only for user-requested VO/SFX. Default (music only) can just point `<audio>` at bg_music.mp3 per the audio.md skill. Iframe preview starts muted with a Volume toggle; export path renders `<VideoTemplate/>` with no props (unmuted, no controls).
