# Handoff

## Goal

Maintain and evolve a bright, high-quality interactive 3D retro radio and music player for desktop browsers.

## Stack

Vite, vanilla ES modules, Three.js, OrbitControls, RoundedBoxGeometry, GLTFExporter, and GSAP. Audio uses the browser `HTMLAudioElement` through `AudioPlayer`.

## Completed

- Procedural blue radio with named parts: Body, Record, Tonearm, PowerButton, PlayButton, PauseButton, NextButton, VolumeKnob and additional industrial-detail parts.
- Full 360-degree OrbitControls with zoom/pan disabled and pole limits.
- Bright neutral lighting, contact shadow, idle floating/parallax motion, material layering, screen texture, record label artwork, headphone stand and headphones.
- Power boot sequence, physical-button raycast interaction, record rotation, needle animation, speaker pulse, screen metadata/waveform, album carousel drag gestures, playlist, progress and volume controls.
- Two local MP3 tracks wired to the playlist: `public/audio/zapsplat-no-more.mp3` and `public/audio/darren-somber.mp3`.
- Local file loading remains available through `LOAD MUSIC`.

## Current development state

The catalog still contains three entries with `audio: null`: Remember U, Time to Go, and The Shutdown. They are intentionally marked unavailable until their licensed files are downloaded and added.

## Known bugs / limitations

- Some status strings in `src/main.js` contain mojibake from an earlier encoding conversion; behavior is unaffected but copy should be normalized in a future cleanup.
- Remote Zapsplat cover images may fail under network/CORS conditions; each card has a local fallback image.
- No automated test suite exists.
- The current demo is a procedural model, not a source GLB asset.

## Highest priority next

Add and verify the remaining three licensed local MP3s, then normalize user-facing status text encoding and add a small smoke-test checklist.

## Key files

- Model, rendering, named parts, animation, and GLB export: `src/scene/RadioScene.js`
- Event wiring and power/playback flow: `src/main.js`
- Audio lifecycle: `src/player/AudioPlayer.js`
- Album/playlist UI and drag carousel: `src/ui/PlaylistUI.js`
- Track metadata and attribution: `src/data/tracks.js`
- Page markup/styles: `index.html`, `src/styles.css`

## Git state

This handoff is written before repository initialization. The intended default branch is `main`; the first commit is `feat: initialize retro cyber radio project`.

## Do not modify without an explicit request

Do not replace the procedural radio with a guessed external model, remove 360-degree viewing, restore click-on-record playback, change the bright lighting direction, or silently substitute unlicensed remote audio.

