export function aizawaStepInPlace(
  state: { x: number; y: number; z: number },
  dt: number,
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): void {
  const { x, y, z } = state;

  const k1x = (z - b) * x - d * y;
  const k1y = d * x + (z - b) * y;
  const k1z = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x;

  const x2 = x + (k1x * dt) / 2;
  const y2 = y + (k1y * dt) / 2;
  const z2 = z + (k1z * dt) / 2;
  const k2x = (z2 - b) * x2 - d * y2;
  const k2y = d * x2 + (z2 - b) * y2;
  const k2z =
    c + a * z2 - (z2 * z2 * z2) / 3 - (x2 * x2 + y2 * y2) * (1 + e * z2) + f * z2 * x2 * x2 * x2;

  const x3 = x + (k2x * dt) / 2;
  const y3 = y + (k2y * dt) / 2;
  const z3 = z + (k2z * dt) / 2;
  const k3x = (z3 - b) * x3 - d * y3;
  const k3y = d * x3 + (z3 - b) * y3;
  const k3z =
    c + a * z3 - (z3 * z3 * z3) / 3 - (x3 * x3 + y3 * y3) * (1 + e * z3) + f * z3 * x3 * x3 * x3;

  const x4 = x + k3x * dt;
  const y4 = y + k3y * dt;
  const z4 = z + k3z * dt;
  const k4x = (z4 - b) * x4 - d * y4;
  const k4y = d * x4 + (z4 - b) * y4;
  const k4z =
    c + a * z4 - (z4 * z4 * z4) / 3 - (x4 * x4 + y4 * y4) * (1 + e * z4) + f * z4 * x4 * x4 * x4;

  state.x = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
  state.y = y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
  state.z = z + (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);
}
