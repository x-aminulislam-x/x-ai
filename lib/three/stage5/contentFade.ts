import * as THREE from 'three';

const FADE_END = 0.2;

/**
 * Card text/icon content fades out fast at the very start of the
 * stage4->dashboard handoff, well before the card backgrounds finish
 * reshaping into their dashboard slots. Returned as a multiplier that's
 * combined with stage4's own reveal window in scene.ts:
 * 1 = fully visible, 0 = fully faded.
 */
export function getHandoffContentFade(handoffProgress: number): number {
  return 1 - THREE.MathUtils.smoothstep(handoffProgress, 0, FADE_END);
}
