import { STAGE7_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';

export function seedFlowPositions(particles: ParticleData[]): void {
  const { FLOW_SEED_SCALE, FLOW_SEED_CLAMP } = STAGE7_CONFIG;

  for (const particle of particles) {
    const seed = particle.originalPosition
      .clone()
      .multiplyScalar(FLOW_SEED_SCALE)
      .clampScalar(-FLOW_SEED_CLAMP, FLOW_SEED_CLAMP);

    if (seed.lengthSq() < 0.0001) seed.set(0.1, 0.1, 0.1);

    particle.flowPosition.copy(seed);
  }
}
