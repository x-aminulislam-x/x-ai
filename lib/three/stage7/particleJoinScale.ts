import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';

/**
 * Scales background particles up slightly as they finish joining the
 * attractor, so neighboring particles along the curve visually overlap
 * rather than leaving sub-pixel gaps even after even arc-length spacing.
 * Skips card-seed particles — those 6 are still driven by cardReform's
 * shader-uniform scale system and would fight with a direct mesh.scale
 * write here.
 * Must run AFTER updateParticleRejoin in the pipeline (that's what sets
 * the baseline scale this multiplies on top of).
 */
export function updateParticleJoinScale(particles: ParticleData[], lorenzProgress: number): void {
  // if (lorenzProgress < 0.001) return;

  const t = THREE.MathUtils.smoothstep(lorenzProgress, 0, 1);
  const scaleMultiplier = THREE.MathUtils.lerp(1, STAGE7_CONFIG.PARTICLE_JOIN_SCALE, t);

  for (const particle of particles) {
    if (particle.isCardSeed) continue;
    particle.mesh.scale.setScalar(particle.baseScale * scaleMultiplier);
  }
}
