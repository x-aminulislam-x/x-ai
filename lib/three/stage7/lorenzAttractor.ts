import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';

interface LorenzPoint {
  x: number;
  y: number;
  z: number;
}

function derivative(p: LorenzPoint, sigma: number, rho: number, beta: number): LorenzPoint {
  return {
    x: sigma * (p.y - p.x),
    y: p.x * (rho - p.z) - p.y,
    z: p.x * p.y - beta * p.z,
  };
}

function rk4Step(
  p: LorenzPoint,
  dt: number,
  sigma: number,
  rho: number,
  beta: number
): LorenzPoint {
  const k1 = derivative(p, sigma, rho, beta);
  const p2 = { x: p.x + (k1.x * dt) / 2, y: p.y + (k1.y * dt) / 2, z: p.z + (k1.z * dt) / 2 };
  const k2 = derivative(p2, sigma, rho, beta);
  const p3 = { x: p.x + (k2.x * dt) / 2, y: p.y + (k2.y * dt) / 2, z: p.z + (k2.z * dt) / 2 };
  const k3 = derivative(p3, sigma, rho, beta);
  const p4 = { x: p.x + k3.x * dt, y: p.y + k3.y * dt, z: p.z + k3.z * dt };
  const k4 = derivative(p4, sigma, rho, beta);

  return {
    x: p.x + (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: p.y + (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    z: p.z + (dt / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z),
  };
}

/**
 * Integrates a fine-resolution Lorenz trajectory (TRAJECTORY_STEPS points,
 * far more than the particle count), then resamples it down to exactly
 * `count` points spaced EVENLY BY ARC LENGTH rather than by time step.
 * This is what removes the gaps: the raw trajectory moves fast through
 * the middle crossing and slow around each wing, so equal-time sampling
 * leaves fast regions sparse and slow regions clumped. Equal-arc-length
 * sampling fixes both.
 */
export function generateLorenzAttractor(
  count: number,
  config: typeof STAGE7_CONFIG
): THREE.Vector3[] {
  const { SIGMA, RHO, BETA, TRAJECTORY_DT, TRAJECTORY_STEPS, WARMUP_STEPS, DISPLAY_RADIUS } =
    config;

  let p: LorenzPoint = { x: 0.1, y: 0, z: 0 };

  for (let i = 0; i < WARMUP_STEPS; i++) {
    p = rk4Step(p, TRAJECTORY_DT, SIGMA, RHO, BETA);
  }

  const raw: THREE.Vector3[] = [];
  for (let i = 0; i < TRAJECTORY_STEPS; i++) {
    p = rk4Step(p, TRAJECTORY_DT, SIGMA, RHO, BETA);
    raw.push(new THREE.Vector3(p.x, p.y, p.z));
  }

  // Cumulative arc length along the fine trajectory
  const cumulative: number[] = [0];
  for (let i = 1; i < raw.length; i++) {
    cumulative.push(cumulative[i - 1] + raw[i].distanceTo(raw[i - 1]));
  }
  const totalLength = cumulative[cumulative.length - 1];

  // Walk the cumulative-length array and pick `count` points at evenly
  // spaced arc-length targets, linearly interpolating within whichever
  // fine segment straddles each target.
  const resampled: THREE.Vector3[] = [];
  let segmentIndex = 1;
  for (let i = 0; i < count; i++) {
    const targetLength = (i / (count - 1)) * totalLength;
    while (segmentIndex < cumulative.length - 1 && cumulative[segmentIndex] < targetLength) {
      segmentIndex++;
    }
    const segStart = cumulative[segmentIndex - 1];
    const segEnd = cumulative[segmentIndex];
    const segT = segEnd > segStart ? (targetLength - segStart) / (segEnd - segStart) : 0;
    resampled.push(raw[segmentIndex - 1].clone().lerp(raw[segmentIndex], segT));
  }

  // Center + normalize to DISPLAY_RADIUS, same as before
  const center = new THREE.Vector3();
  for (const v of resampled) center.add(v);
  center.divideScalar(resampled.length);

  let maxDist = 0;
  for (const v of resampled) maxDist = Math.max(maxDist, v.distanceTo(center));

  return resampled.map(v =>
    v.clone().sub(center).divideScalar(maxDist).multiplyScalar(DISPLAY_RADIUS)
  );
}
