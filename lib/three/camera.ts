import * as THREE from 'three';
import { ANIMATION_CONFIG, CAMERA_SETTINGS } from './constants';
import { lerp } from './utils/math';

/**
 * Instantiates and configures the main PerspectiveCamera.
 */
export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_SETTINGS.FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_SETTINGS.NEAR,
    CAMERA_SETTINGS.FAR
  );

  camera.position.set(0, 0, CAMERA_SETTINGS.BASE_DISTANCE_Z);
  return camera;
}

export function updateCamera(
  camera: THREE.PerspectiveCamera,
  elapsed: number,
  dashboardProgress = 0
): void {
  const stillness = THREE.MathUtils.smoothstep(dashboardProgress, 0.85, 1.0);
  const driftScale = 1 - stillness;

  const targetX = Math.sin(elapsed * 0.18) * 0.25 * driftScale;
  const targetY = Math.cos(elapsed * 0.15) * 0.18 * driftScale;
  const targetZ = CAMERA_SETTINGS.BASE_DISTANCE_Z + Math.sin(elapsed * 0.12) * 0.12 * driftScale;

  camera.position.x = lerp(camera.position.x, targetX, ANIMATION_CONFIG.CAMERA_LERP_FACTOR);
  camera.position.y = lerp(camera.position.y, targetY, ANIMATION_CONFIG.CAMERA_LERP_FACTOR);
  camera.position.z = lerp(camera.position.z, targetZ, ANIMATION_CONFIG.CAMERA_LERP_FACTOR);

  camera.lookAt(0, 0, 0);
}
