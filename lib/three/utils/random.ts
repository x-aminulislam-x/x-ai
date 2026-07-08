/**
 * Generates a random float between a min and max value.
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random float in the interval [-range/2, range/2].
 */
export function randFloatSpread(range: number): number {
  return range * (0.5 - Math.random());
}
