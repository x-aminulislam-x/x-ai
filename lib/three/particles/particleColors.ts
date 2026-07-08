import * as THREE from 'three';
import { PARTICLE_COLORS } from '../constants';

/**
 * Selects a random THREE.Color from the predefined color palette based on weighted probabilities.
 */
export function pickRandomColor(): THREE.Color {
  const r = Math.random();

  if (r < 0.7) {
    return new THREE.Color(PARTICLE_COLORS.primary);
  }

  if (r < 0.85) {
    return new THREE.Color(PARTICLE_COLORS.secondary);
  }

  if (r < 0.95) {
    return new THREE.Color(PARTICLE_COLORS.accent);
  }

  return new THREE.Color(PARTICLE_COLORS.highlight);
}
