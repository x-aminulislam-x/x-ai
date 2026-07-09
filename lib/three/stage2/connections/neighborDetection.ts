import { STAGE2_CONFIG } from '../../constants';
import { ParticleData } from '../../particles/types';

export function detectNeighbors(particles: ParticleData[], searchRadius: number): void {
  const radiusSquared = searchRadius * searchRadius;

  // Optimization 2: Clear all neighbor lists once
  for (const particle of particles) {
    particle.neighbors.length = 0;
  }

  // Optimization 1: Compare each pair only once
  for (let i = 0; i < particles.length; i++) {
    const particleA = particles[i];

    for (let j = i + 1; j < particles.length; j++) {
      const particleB = particles[j];

      const dx = particleA.mesh.position.x - particleB.mesh.position.x;
      const dy = particleA.mesh.position.y - particleB.mesh.position.y;
      const dz = particleA.mesh.position.z - particleB.mesh.position.z;

      const distanceSquared = dx * dx + dy * dy + dz * dz;

      if (distanceSquared <= radiusSquared) {
        if (
          particleA.neighbors.length < STAGE2_CONFIG.MAX_CONNECTIONS &&
          particleB.neighbors.length < STAGE2_CONFIG.MAX_CONNECTIONS
        ) {
          particleA.neighbors.push(j);
          particleB.neighbors.push(i);
        }
      }
    }
  }
}
