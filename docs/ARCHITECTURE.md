# Architecture

`src/main.js` composes four systems: `RadioScene`, `AudioPlayer`, `PlaylistUI`, and `runBootSequence`.

- `RadioScene` owns the Three.js scene, camera, controls, procedural hierarchy, raycast picking, animations, screen canvas, and GLB export.
- `AudioPlayer` wraps one `HTMLAudioElement`, exposes load/play/pause/seek/volume, and emits lifecycle events.
- `PlaylistUI` owns track selection, carousel gestures, playlist rendering, metadata, progress, and visibility.
- `BootSequence` sequences power press, screen reveal, panel reveal, and needle drop.

The systems communicate through DOM events and `EventTarget` events rather than shared framework state.

