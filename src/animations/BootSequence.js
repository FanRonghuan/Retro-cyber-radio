import { gsap } from 'gsap';

export async function runBootSequence({ scene, ui }) {
  await scene.powerOn();
  ui.reveal(true);
  await new Promise((resolve) => gsap.to('#playerPanel', { opacity: 1, x: 0, duration: 0.42, ease: 'power2.out', onComplete: resolve }));
  await scene.dropNeedle();
}
