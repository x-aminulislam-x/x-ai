import { clamp, lerp } from '../utils/math';

/**
 * Computes a scale factor based on the particle's depth (Z position).
 * Replaces the original inline computeParticleScale logic.
 * * @param z - The current Z position of the particle
 * @returns The computed uniform scale scalar
 */
export function getScaleFromDepth(z: number): number {
  // Original normalization bounds: (z + 8) / 16
  const normalized = clamp((z + 8) / 16, 0, 1);

  // Original interpolation range: 1 to 5 pixels equivalent
  const pixels = lerp(1, 5, normalized);

  // Original base scalar conversion multiplier
  return pixels * 0.03;
}
