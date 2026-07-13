import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';
import { aizawaStepInPlace } from './aizawaStep';

export interface AizawaPoint {
  x: number;
  y: number;
  z: number;
}

export interface AizawaNormalization {
  center: THREE.Vector3;
  scale: number;
}

export function aizawaDerivative(
  p: AizawaPoint,
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): AizawaPoint {
  const r2 = p.x * p.x + p.y * p.y;
  return {
    x: (p.z - b) * p.x - d * p.y,
    y: d * p.x + (p.z - b) * p.y,
    z: c + a * p.z - (p.z * p.z * p.z) / 3 - r2 * (1 + e * p.z) + f * p.z * p.x * p.x * p.x,
  };
}

export function aizawaRk4Step(
  p: AizawaPoint,
  dt: number,
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): AizawaPoint {
  const k1 = aizawaDerivative(p, a, b, c, d, e, f);
  const p2 = { x: p.x + (k1.x * dt) / 2, y: p.y + (k1.y * dt) / 2, z: p.z + (k1.z * dt) / 2 };
  const k2 = aizawaDerivative(p2, a, b, c, d, e, f);
  const p3 = { x: p.x + (k2.x * dt) / 2, y: p.y + (k2.y * dt) / 2, z: p.z + (k2.z * dt) / 2 };
  const k3 = aizawaDerivative(p3, a, b, c, d, e, f);
  const p4 = { x: p.x + k3.x * dt, y: p.y + k3.y * dt, z: p.z + k3.z * dt };
  const k4 = aizawaDerivative(p4, a, b, c, d, e, f);

  return {
    x: p.x + (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: p.y + (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    z: p.z + (dt / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z),
  };
}

export function computeAizawaNormalization(config: typeof STAGE7_CONFIG): AizawaNormalization {
  const {
    AIZAWA_A,
    AIZAWA_B,
    AIZAWA_C,
    AIZAWA_D,
    AIZAWA_E,
    AIZAWA_F,
    TRAJECTORY_DT,
    TRAJECTORY_STEPS,
    WARMUP_STEPS,
    DISPLAY_RADIUS,
  } = config;

  const p: AizawaPoint = { x: 0.1, y: 0, z: 0 };
  for (let i = 0; i < WARMUP_STEPS; i++) {
    aizawaStepInPlace(p, TRAJECTORY_DT, AIZAWA_A, AIZAWA_B, AIZAWA_C, AIZAWA_D, AIZAWA_E, AIZAWA_F);
  }

  const points: THREE.Vector3[] = [];
  for (let i = 0; i < TRAJECTORY_STEPS; i++) {
    aizawaStepInPlace(p, TRAJECTORY_DT, AIZAWA_A, AIZAWA_B, AIZAWA_C, AIZAWA_D, AIZAWA_E, AIZAWA_F);
    points.push(new THREE.Vector3(p.x, p.y, p.z));
  }

  const center = new THREE.Vector3();
  for (const v of points) center.add(v);
  center.divideScalar(points.length);

  let maxDist = 0;
  for (const v of points) maxDist = Math.max(maxDist, v.distanceTo(center));

  return { center, scale: DISPLAY_RADIUS / maxDist };
}
