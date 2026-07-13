import * as THREE from 'three';
import { STAGE6_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';

export function updateParticleRejoin(particles: ParticleData[], reformProgress: number): void {
  if (reformProgress < 0.001) return;
  const { REJOIN_START, REJOIN_END } = STAGE6_CONFIG;
  const t = THREE.MathUtils.smoothstep(reformProgress, REJOIN_START, REJOIN_END);

  for (const particle of particles) {
    if (!particle.dissolves) continue;

    setMeshOpacity(particle.mesh, THREE.MathUtils.lerp(0, particle.baseOpacity, t));
    particle.mesh.scale.setScalar(THREE.MathUtils.lerp(0, particle.baseScale, t));
  }
}

function setMeshOpacity(mesh: THREE.Object3D, opacity: number): void {
  mesh.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return;
    const material = child.material;
    if (Array.isArray(material)) {
      for (const m of material) applyOpacity(m, opacity);
    } else {
      applyOpacity(material, opacity);
    }
  });
}

function applyOpacity(material: THREE.Material, opacity: number): void {
  if ('opacity' in material) {
    (material as THREE.MeshBasicMaterial).opacity = opacity;
  }
}
