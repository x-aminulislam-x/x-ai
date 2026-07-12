import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { lerp } from '../utils/math';

/**
 * Orbits the camera around the attractor using spherical coordinates
 * (azimuth + elevation). Azimuth is driven by scroll while forming, then
 * by elapsed time once fully formed; drag input adds an offset on top of
 * both. Elevation starts at a slight default tilt and is otherwise
 * entirely drag-controlled.
 * Runs AFTER updateCamera so it overrides that frame's drift-based
 * position once lorenzProgress > 0.
 */
export function updateCameraOrbit(
  camera: THREE.PerspectiveCamera,
  elapsed: number,
  lorenzProgress: number,
  dragAzimuthOffset = 0,
  dragElevationOffset = 0
): void {
  if (lorenzProgress < 0.001) return;

  const {
    ORBIT_RADIUS,
    ORBIT_BASE_ELEVATION,
    ORBIT_MAX_SCROLL_ANGLE,
    ORBIT_AUTO_ROTATE_SPEED,
    ORBIT_LERP_FACTOR,
  } = STAGE7_CONFIG;

  const scrollAngle = THREE.MathUtils.lerp(0, ORBIT_MAX_SCROLL_ANGLE, lorenzProgress);
  const autoAngle = elapsed * ORBIT_AUTO_ROTATE_SPEED * lorenzProgress;
  const azimuth = scrollAngle + autoAngle + dragAzimuthOffset;

  const baseElevation = ORBIT_BASE_ELEVATION * THREE.MathUtils.smoothstep(lorenzProgress, 0, 0.3);
  const elevation = baseElevation + dragElevationOffset;

  const horizontalRadius = ORBIT_RADIUS * Math.cos(elevation);
  const targetX = horizontalRadius * Math.sin(azimuth);
  const targetZ = horizontalRadius * Math.cos(azimuth);
  const targetY = ORBIT_RADIUS * Math.sin(elevation);

  camera.position.x = lerp(camera.position.x, targetX, ORBIT_LERP_FACTOR);
  camera.position.y = lerp(camera.position.y, targetY, ORBIT_LERP_FACTOR);
  camera.position.z = lerp(camera.position.z, targetZ, ORBIT_LERP_FACTOR);

  camera.lookAt(0, 0, 0);
}
