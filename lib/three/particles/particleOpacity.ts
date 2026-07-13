import * as THREE from 'three';
import { ParticleData } from './types';

export function updateParticleOpacity(particles: ParticleData[]) {
  for (const particle of particles) {
    const depth = THREE.MathUtils.clamp((particle.position.z + 8) / 16, 0, 1);

    const opacity = THREE.MathUtils.lerp(
      0.25, // far
      0.95, // near
      depth
    );

    particle.mesh.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return;

      const material = child.material;

      if (Array.isArray(material)) {
        for (const m of material) {
          if (m instanceof THREE.MeshBasicMaterial) {
            m.opacity = opacity;
          }
        }
      } else if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = opacity;
      }
    });
  }
}
