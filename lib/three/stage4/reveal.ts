import * as THREE from 'three';

/**
 * Card formation (position/shape/opacity) happens over dashboardTimeline
 * progress 0 → 1, with the card fully built (see buildProgress in
 * cardMorph.ts) by progress 0.6. Content inside the card — text, pipelines —
 * should be fully visible by that same point, not still fading in during
 * the 0.6 → 1.0 collapse-to-left-column phase.
 */
export function getDashboardContentRevealProgress(morphProgress: number): number {
  const fadeIn = THREE.MathUtils.smoothstep(morphProgress, 0.4, 0.6);
  const fadeOut = THREE.MathUtils.smoothstep(morphProgress, 0.6, 0.85);
  return fadeIn * (1 - fadeOut);
}

export function getInsightContentRevealProgress(morphProgress: number): number {
  return THREE.MathUtils.smoothstep(morphProgress, 0.8, 1.0);
}
