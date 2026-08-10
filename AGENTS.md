# Agent Instructions

## Scope

This repository is the Retro Cyber Radio Vite + Three.js demo. Preserve the existing procedural model, bright product lighting, full 360-degree inspection, physical-button entry points, and local audio behavior unless a task explicitly requests a change.

## Development rules

- Read `docs/HANDOFF.md` and the relevant specification in `docs/` before editing.
- Do not introduce GLB/GLTF assumptions: the radio is generated in `src/scene/RadioScene.js` and can be exported from the UI.
- Keep audio assets in `public/audio/` and update `src/data/tracks.js` with attribution when adding licensed tracks.
- Run `npm run build` after source changes.
- Never commit `node_modules/`, `dist/`, `.env*`, credentials, or temporary logs.

## Important interaction contract

The record is a visual output and is not a click-to-play target. Power, Play, Pause, Next, and the physical controls remain the supported interaction entry points.

