import * as THREE from 'three';

// Mirrors cardMorph.ts's collapse target (targetLeftX = -6.0) plus the
// card's half-width and a small margin, at the same z the stack settles at.
const STACK_RIGHT_EDGE_WORLD_X = -6.0 + 3.2 / 2 + 0.3;
const STACK_WORLD_Y = 0;
const STACK_WORLD_Z = -2.0;

export const cardStackBounds = {
  rightEdgeScreenFraction: 0.32, // fallback until the first frame computes it
};

const projectionPoint = new THREE.Vector3();

/**
 * Projects the collapsed card stack's right edge to normalized [0,1]
 * screen-space X, so the DOM insight panel can sit flush beside it —
 * instead of a hardcoded vw guess that breaks on viewport/camera changes.
 */
export function updateCardStackBounds(camera: THREE.PerspectiveCamera): void {
  projectionPoint.set(STACK_RIGHT_EDGE_WORLD_X, STACK_WORLD_Y, STACK_WORLD_Z);
  projectionPoint.project(camera);
  cardStackBounds.rightEdgeScreenFraction = (projectionPoint.x + 1) / 2;
}
