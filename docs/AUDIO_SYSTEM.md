# Audio System

`src/player/AudioPlayer.js` owns a single browser `Audio` element. Local catalog paths are rooted at `/audio/` and are served from `public/audio/` by Vite.

Current local files:

- `zapsplat-no-more.mp3` — No More, Kulluh via Zapsplat Standard License.
- `darren-somber.mp3` — Somber, a local user-provided MP3.

Three catalog records remain `audio: null` until licensed downloads are supplied. The UI reports unavailable tracks instead of silently using unrelated remote audio. `LOAD MUSIC` supports a session-only object URL.

