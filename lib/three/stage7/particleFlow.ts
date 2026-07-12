import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';
import { aizawaStepInPlace } from './aizawaStep';

/**
 * Every frame, once lorenzProgress > 0, advances each particle's
 * flowPosition through several TRUE RK4 steps of the Aizawa system.
 * Multiple substeps per frame (not one) is what makes the convergence
 * visible within a normal scroll pass — a single small dt per 16ms
 * frame integrates too slowly to noticeably pull a particle onto the
 * attractor. This doesn't change the underlying physics, it just runs
 * more of the same correct RK4 integration per rendered frame.
 * Once a particle reaches the attractor, integration continues forever
 * — that's what keeps the whole shape perpetually alive rather than
 * settling into a static pose once formed.
 */
export function updateParticleFlow(
  particles: ParticleData[],
  lorenzProgress: number,
  center: THREE.Vector3,
  scale: number
): void {
  if (lorenzProgress < 0.001) return;

  const {
    AIZAWA_A,
    AIZAWA_B,
    AIZAWA_C,
    AIZAWA_D,
    AIZAWA_E,
    AIZAWA_F,
    FLOW_DT,
    FLOW_SUBSTEPS_PER_FRAME,
  } = STAGE7_CONFIG;

  for (const particle of particles) {
    if (particle.isCardSeed) continue;

    // particle.flowPosition (a THREE.Vector3) is passed directly and
    // mutated in place across all substeps — no per-frame, per-particle
    // object allocation at all now.
    for (let i = 0; i < FLOW_SUBSTEPS_PER_FRAME; i++) {
      aizawaStepInPlace(
        particle.flowPosition,
        FLOW_DT,
        AIZAWA_A,
        AIZAWA_B,
        AIZAWA_C,
        AIZAWA_D,
        AIZAWA_E,
        AIZAWA_F
      );
    }

    const dx = (particle.flowPosition.x - center.x) * scale;
    const dy = (particle.flowPosition.y - center.y) * scale;
    const dz = (particle.flowPosition.z - center.z) * scale;
    particle.lorenzPosition.set(dx, -dz, dy);
  }
}
