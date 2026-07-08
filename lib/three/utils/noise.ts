/**
 * Generates a simple 1D/2D pseudo-random noise value.
 */
export function simpleNoise(x: number, y: number = 0): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const n = X + Y * 57;
  const nn = (n << 13) ^ n;
  return 1.0 - ((nn * (nn * nn * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0;
}
