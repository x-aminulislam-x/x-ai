import { STAGE7_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';

/**
 * Seeds each particle's flowPosition with a small, scaled-down copy of
 * its own original scatter position — deliberately OFF the attractor,
 * inside its basin of attraction. Stage 7 then plays out as literal
 * chaotic dissipation pulling each particle onto the attractor surface;
 * that convergence is what "draws" the shape, rather than particles
 * snapping to precomputed points.
 */
export function seedFlowPositions(particles: ParticleData[]): void {
  const { FLOW_SEED_SCALE, FLOW_SEED_CLAMP } = STAGE7_CONFIG;

  for (const particle of particles) {
    const seed = particle.originalPosition
      .clone()
      .multiplyScalar(FLOW_SEED_SCALE)
      .clampScalar(-FLOW_SEED_CLAMP, FLOW_SEED_CLAMP);

    // The origin is a fixed point of the Aizawa system — a particle
    // seeded exactly there would never move. Nudge it off.
    if (seed.lengthSq() < 0.0001) seed.set(0.1, 0.1, 0.1);

    particle.flowPosition.copy(seed);
  }
}
