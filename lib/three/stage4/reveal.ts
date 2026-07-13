import * as THREE from 'three';

export function getDashboardContentRevealProgress(morphProgress: number): number {
  const fadeIn = THREE.MathUtils.smoothstep(morphProgress, 0.4, 0.6);
  const fadeOut = THREE.MathUtils.smoothstep(morphProgress, 0.6, 0.85);
  return fadeIn * (1 - fadeOut);
}

export function getInsightContentRevealProgress(morphProgress: number): number {
  return THREE.MathUtils.smoothstep(morphProgress, 0.8, 1.0);
}
