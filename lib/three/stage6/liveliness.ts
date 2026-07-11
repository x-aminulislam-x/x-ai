import * as THREE from 'three';
import { STAGE6_CONFIG } from '../constants';

/**
 * 0 = fully "organized" (camera still, particles calm) — 1 = fully back
 * to the free-floating stage2 state. Feeds into updateCamera's stillness
 * calc and updateParticleMotion's calmFactor, both of which already exist
 * and just need this value instead of new physics.
 */
export function getLivelinessBoost(reformProgress: number): number {
  const { LIVELINESS_START, LIVELINESS_END } = STAGE6_CONFIG;
  return THREE.MathUtils.smoothstep(reformProgress, LIVELINESS_START, LIVELINESS_END);
}
