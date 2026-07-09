import * as THREE from 'three';
import { STAGE4_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';

// Position-only smoothing — gives the "growing out of the network" chase feel.
const CHASE_FACTOR = 0.1;

export function updateCardMorph(particles: ParticleData[], progress: number): void {
  for (const particle of particles) {
    if (particle.cardIndex === -1) continue;

    if (particle.isCardSeed) {
      updateSeedParticle(particle, progress);
    } else if (particle.dissolves) {
      updateDissolvingParticle(particle, progress);
    } else {
      updateBorderParticle(particle, progress);
    }
  }
}

function updateSeedParticle(particle: ParticleData, progress: number): void {
  const mesh = particle.mesh as THREE.Mesh;
  const material = mesh.material as THREE.ShaderMaterial;

  const targetPosition = new THREE.Vector3().lerpVectors(
    particle.targetPosition,
    particle.cardPosition,
    progress
  );
  mesh.position.lerp(targetPosition, CHASE_FACTOR);

  const width = THREE.MathUtils.lerp(particle.baseScale, particle.cardWidth, progress);
  const height = THREE.MathUtils.lerp(particle.baseScale, particle.cardHeight, progress);
  mesh.scale.set(width, height, 1);

  const uniforms = material.uniforms;
  uniforms.uSize.value.set(width, height);
  uniforms.uRadius.value = THREE.MathUtils.lerp(
    particle.baseScale / 2,
    STAGE4_CONFIG.CARD_CORNER_RADIUS,
    progress
  );
  uniforms.uOpacity.value = THREE.MathUtils.lerp(
    particle.baseOpacity,
    STAGE4_CONFIG.CARD_OPACITY,
    progress
  );
}

function updateBorderParticle(particle: ParticleData, progress: number): void {
  const targetPosition = new THREE.Vector3().lerpVectors(
    particle.targetPosition,
    particle.cardPosition,
    progress
  );
  particle.mesh.position.lerp(targetPosition, CHASE_FACTOR);

  const targetScale = THREE.MathUtils.lerp(
    particle.baseScale,
    particle.baseScale * STAGE4_CONFIG.BORDER_SCALE_MULTIPLIER,
    progress
  );
  particle.mesh.scale.setScalar(targetScale);

  setMeshOpacity(
    particle.mesh,
    THREE.MathUtils.lerp(particle.baseOpacity, STAGE4_CONFIG.BORDER_OPACITY, progress)
  );
}

function updateDissolvingParticle(particle: ParticleData, progress: number): void {
  setMeshOpacity(particle.mesh, THREE.MathUtils.lerp(particle.baseOpacity, 0, progress));
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
