import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';
import { aizawaStepInPlace } from './aizawaStep';

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
