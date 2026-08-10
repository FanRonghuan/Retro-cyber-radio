# Retro Cyber Radio

An interactive product-showcase radio built with Vite and Three.js. The left side renders a procedural 3D radio with full 360-degree OrbitControls; the right side provides an HTML/CSS music player with an album carousel, playlist, transport controls, progress, volume, and local audio loading.

## Run locally

```bash
npm install
npm run dev
```

Open the printed localhost URL. Build for deployment with `npm run build`.

## Current audio

Two local MP3 files are included under `public/audio/`: `zapsplat-no-more.mp3` and `darren-somber.mp3`. The remaining catalog entries are placeholders until their licensed files are added. The `LOAD MUSIC` control can load a user-selected audio file for the current session.

## Credits

The `No More` track is credited to Kulluh via Zapsplat under the Standard License. See `docs/AUDIO_SYSTEM.md` and the in-app source link for attribution details.

## Project memory

See `AGENTS.md` and `docs/HANDOFF.md` before making future changes.

