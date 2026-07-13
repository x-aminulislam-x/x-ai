import * as THREE from 'three';
import { STAGE4_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';

export function updateCardMorph(particles: ParticleData[], progress: number): void {
  for (const particle of particles) {
    if (particle.cardIndex === -1) continue;

    if (particle.isCardSeed) {
      updateSeedParticle(particle, progress);
    } else if (particle.dissolves) {
      updateDissolvingParticle(particle, progress);
    }
  }
}

function updateSeedParticle(particle: ParticleData, progress: number): void {
  const mesh = particle.mesh as THREE.Mesh;
  const material = mesh.material as THREE.ShaderMaterial;

  // 1. PERFECT TRANSLATION (No more lazy CHASE_FACTOR)
  // Lockstep interpolation from original network -> card grid (0.0 to 0.4)
  const gridProgress = THREE.MathUtils.clamp(progress / 0.4, 0, 1);

  let currentX = THREE.MathUtils.lerp(
    particle.targetPosition.x,
    particle.cardPosition.x,
    gridProgress
  );
  let currentY = THREE.MathUtils.lerp(
    particle.targetPosition.y,
    particle.cardPosition.y,
    gridProgress
  );
  let currentZ = THREE.MathUtils.lerp(
    particle.targetPosition.z,
    particle.cardPosition.z,
    gridProgress
  );

  // Collapse to the left perfectly
  const collapseFactor = progress > 0.6 ? THREE.MathUtils.clamp((progress - 0.6) / 0.4, 0, 1) : 0;

  if (progress > 0.6) {
    // Mathematically perfect vertical stack for the 6 cards on the left
    const targetLeftX = -6.0;
    const targetLeftY = 3.0 - particle.cardIndex * 1.2;
    const targetLeftZ = -2.0;

    currentX = THREE.MathUtils.lerp(currentX, targetLeftX, collapseFactor);
    currentY = THREE.MathUtils.lerp(currentY, targetLeftY, collapseFactor);
    currentZ = THREE.MathUtils.lerp(currentZ, targetLeftZ, collapseFactor);
  }

  // Force exact mathematical position to fix all alignment bugs instantly
  mesh.position.set(currentX, currentY, currentZ);

  // 2. SIZE & SHAPE
  const buildProgress = THREE.MathUtils.clamp(progress / 0.6, 0, 1);
  let width = THREE.MathUtils.lerp(particle.baseScale, particle.cardWidth, buildProgress);
  const height = THREE.MathUtils.lerp(particle.baseScale, particle.cardHeight, buildProgress);

  // Collapsed cards get extra width beyond their grid-formation width —
  // giving the longer INSIGHT_LABELS text (e.g. "Correlation Surfaced")
  // more room than the short dashboard metric values ever needed.
  width = THREE.MathUtils.lerp(width, STAGE4_CONFIG.CARD_COLLAPSED_WIDTH, collapseFactor);
  mesh.scale.set(width, height, 1);

  const uniforms = material.uniforms;
  uniforms.uSize.value.set(width, height);
  uniforms.uRadius.value = THREE.MathUtils.lerp(
    particle.baseScale / 2,
    STAGE4_CONFIG.CARD_CORNER_RADIUS,
    buildProgress
  );

  // 3. FADE-IN, then hold steady
  // (previously this also faded opacity back to 0 between 0.85→1.0, which
  // meant the cards went fully invisible right as the left-column collapse
  // finished — removed since the collapsed state is meant to stay visible.)
  let opacity = particle.baseOpacity;
  if (progress < 0.6) {
    opacity = THREE.MathUtils.lerp(particle.baseOpacity, STAGE4_CONFIG.CARD_OPACITY, buildProgress);
  } else {
    opacity = STAGE4_CONFIG.CARD_OPACITY;
  }

  uniforms.uOpacity.value = opacity;
}

function updateDissolvingParticle(particle: ParticleData, progress: number): void {
  // Dissolving particles remain for the synchronized shrink in scene.ts,
  // but we can ensure their opacity zeroes out cleanly here as a fallback.
  const dissolveProgress = THREE.MathUtils.clamp(progress / 0.5, 0, 1);
  setMeshOpacity(particle.mesh, THREE.MathUtils.lerp(particle.baseOpacity, 0, dissolveProgress));
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
