import * as THREE from 'three';

/**
 * Card formation (position/shape/opacity) happens over the full
 * dashboardTimeline progress 0 → 1. Content inside the card — charts,
 * AI indicators, pipelines — should only start appearing once the card
 * is mostly formed, finishing right as the morph completes.
 */
export function getContentRevealProgress(morphProgress: number): number {
  return THREE.MathUtils.smoothstep(morphProgress, 0.55, 1);
}
