import * as THREE from 'three';

const FADE_END = 0.2;

export function getHandoffContentFade(handoffProgress: number): number {
  return 1 - THREE.MathUtils.smoothstep(handoffProgress, 0, FADE_END);
}
