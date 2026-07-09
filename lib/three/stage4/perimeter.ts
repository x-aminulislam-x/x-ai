import * as THREE from 'three';

/**
 * Maps a normalized value t (0..1) to a point on the perimeter of a
 * rectangle centered at the origin, walking clockwise from top-left.
 * Used to spread border particles evenly around a card's edge.
 */
export function pointOnRectPerimeter(t: number, width: number, height: number): THREE.Vector2 {
  const perimeter = 2 * (width + height);
  let distance = (((t % 1) + 1) % 1) * perimeter;

  const halfW = width / 2;
  const halfH = height / 2;

  // Top edge (left -> right)
  if (distance <= width) {
    return new THREE.Vector2(-halfW + distance, halfH);
  }
  distance -= width;

  // Right edge (top -> bottom)
  if (distance <= height) {
    return new THREE.Vector2(halfW, halfH - distance);
  }
  distance -= height;

  // Bottom edge (right -> left)
  if (distance <= width) {
    return new THREE.Vector2(halfW - distance, -halfH);
  }
  distance -= width;

  // Left edge (bottom -> top)
  return new THREE.Vector2(-halfW, -halfH + distance);
}
