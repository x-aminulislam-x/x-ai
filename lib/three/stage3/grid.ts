import * as THREE from 'three';
import { ParticleData } from '../particles/types';

/**
 * Generates evenly spaced grid positions centered around the origin.
 *
 * The returned array contains one anchor per particle.
 */
export function assignGridAnchors(particles: ParticleData[], anchors: THREE.Vector3[]) {
  const available = [...anchors];

  for (const particle of particles) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < available.length; i++) {
      const distance = particle.originalPosition.distanceToSquared(available[i]);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    particle.targetPosition.copy(available[nearestIndex]);

    // Remove this anchor so no other particle can use it.
    available.splice(nearestIndex, 1);
  }
}

export function generateGridAnchors(count: number): THREE.Vector3[] {
  const anchors: THREE.Vector3[] = [];

  // Horizontal spacing between nodes
  const spacingX = 0.7;

  // Vertical spacing between nodes
  const spacingY = 0.7;

  // Number of columns
  const columns = Math.ceil(Math.sqrt(count));

  // Number of rows
  const rows = Math.ceil(count / columns);

  // Center the grid around (0,0)
  const offsetX = ((columns - 1) * spacingX) / 2;
  const offsetY = ((rows - 1) * spacingY) / 2;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (anchors.length >= count) {
        return anchors;
      }

      anchors.push(new THREE.Vector3(column * spacingX - offsetX, offsetY - row * spacingY, 0));
    }
  }

  return anchors;
}
