import * as THREE from 'three';
import { ParticleData } from '../particles/types';

const cameraQuat = new THREE.Quaternion();

export function updateParticleBillboard(
  particles: ParticleData[],
  camera: THREE.PerspectiveCamera,
  lorenzProgress: number
): void {
  const t = THREE.MathUtils.smoothstep(lorenzProgress, 0, 1);
  cameraQuat.copy(camera.quaternion);

  for (const particle of particles) {
    if (particle.isCardSeed) continue;
    particle.mesh.quaternion.copy(particle.originalQuaternion).slerp(cameraQuat, t);
  }
}
