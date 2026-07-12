import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { lerp } from '../utils/math';

let autoAngleAccum = 0;

/**
 * Orbits the camera using spherical coordinates (azimuth + elevation +
 * radius). The auto-rotate part of azimuth is now an ACCUMULATOR,
 * incremented each frame by `delta * speed * hoverFactor`, rather than
 * derived fresh from absolute `elapsed` each frame. That's what lets
 * hoverFactor smoothly slow the spin without a jump — an
 * `elapsed * speed * hoverFactor` formula would discontinuously warp
 * position whenever hoverFactor changes, since `elapsed` keeps growing
 * underneath it regardless.
 * Resets the accumulator when lorenzProgress drops back near 0, so the
 * scroll-loop starts each lap from a clean angle instead of wherever
 * the orbit last was.
 */
export function updateCameraOrbit(
  camera: THREE.PerspectiveCamera,
  elapsed: number,
  delta: number,
  lorenzProgress: number,
  dragAzimuthOffset = 0,
  dragElevationOffset = 0,
  zoomOffset = 0,
  hoverFactor = 1
): void {
  if (lorenzProgress < 0.001) {
    autoAngleAccum = 0;
    return;
  }

  const {
    ORBIT_RADIUS,
    ORBIT_BASE_ELEVATION,
    ORBIT_MAX_SCROLL_ANGLE,
    ORBIT_AUTO_ROTATE_SPEED,
    ORBIT_LERP_FACTOR,
    ZOOM_MIN_RADIUS,
    ZOOM_MAX_RADIUS,
  } = STAGE7_CONFIG;

  autoAngleAccum += delta * ORBIT_AUTO_ROTATE_SPEED * lorenzProgress * hoverFactor;

  const scrollAngle = THREE.MathUtils.lerp(0, ORBIT_MAX_SCROLL_ANGLE, lorenzProgress);
  const azimuth = scrollAngle + autoAngleAccum + dragAzimuthOffset;

  const baseElevation = ORBIT_BASE_ELEVATION * THREE.MathUtils.smoothstep(lorenzProgress, 0, 0.3);
  const elevation = baseElevation + dragElevationOffset;

  const radius = THREE.MathUtils.clamp(ORBIT_RADIUS + zoomOffset, ZOOM_MIN_RADIUS, ZOOM_MAX_RADIUS);

  const horizontalRadius = radius * Math.cos(elevation);
  const targetX = horizontalRadius * Math.sin(azimuth);
  const targetZ = horizontalRadius * Math.cos(azimuth);
  const targetY = radius * Math.sin(elevation);

  camera.position.x = lerp(camera.position.x, targetX, ORBIT_LERP_FACTOR);
  camera.position.y = lerp(camera.position.y, targetY, ORBIT_LERP_FACTOR);
  camera.position.z = lerp(camera.position.z, targetZ, ORBIT_LERP_FACTOR);

  camera.lookAt(0, 0, 0);
}
