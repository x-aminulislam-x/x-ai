import * as THREE from 'three';
import { ParticleData } from '../particles/types';

const cameraQuat = new THREE.Quaternion();

/**
 * Rotates each background particle to face the camera, blended in by
 * lorenzProgress. Re-derived from particle.originalQuaternion EVERY
 * frame (not incrementally slerped from the mesh's current rotation) —
 * that's what makes it self-reset to the particle's resting orientation
 * when lorenzProgress drops back to 0 after the loop. An incremental
 * `mesh.quaternion.slerp(cameraQuat, t)` would NOT reset at t=0, since
 * slerping by a factor of 0 just returns the current (possibly still
 * camera-facing) value unchanged.
 * Must run AFTER updateCameraOrbit (camera.quaternion needs to be this
 * frame's final value) and after updateParticleJoinScale.
 */
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
