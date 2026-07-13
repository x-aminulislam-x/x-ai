import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';

export function updateParticleJoinScale(particles: ParticleData[], lorenzProgress: number): void {
  const t = THREE.MathUtils.smoothstep(lorenzProgress, 0, 1);
  const scaleMultiplier = THREE.MathUtils.lerp(1, STAGE7_CONFIG.PARTICLE_JOIN_SCALE, t);

  for (const particle of particles) {
    if (particle.isCardSeed) continue;
    particle.mesh.scale.setScalar(particle.baseScale * scaleMultiplier);
  }
}
