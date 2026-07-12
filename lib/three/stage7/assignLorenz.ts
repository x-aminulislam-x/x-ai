import * as THREE from 'three';
import { ParticleData } from '../particles/types';

export function assignLorenzPositions(particles: ParticleData[], points: THREE.Vector3[]): void {
  const available = [...points];

  for (const particle of particles) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < available.length; i++) {
      const distance = particle.targetPosition.distanceToSquared(available[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    particle.lorenzPosition.copy(available[nearestIndex]);
    available.splice(nearestIndex, 1);
  }
}
