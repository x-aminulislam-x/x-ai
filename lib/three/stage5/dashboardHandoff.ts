import * as THREE from 'three';
import { STAGE4_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';
import { CARD_INDEX_TO_SLOT, DASHBOARD_SLOTS, fractionalRectToWorld } from './dashboardGrid';

/**
 * Mirrors the left-column collapse target from cardMorph.ts's
 * updateSeedParticle (targetLeftX/Y/Z). dashboardTimeline (stage4) is
 * pinned at progress 1 by the time this stage runs, so this is exactly
 * where each card is sitting when the handoff begins — using it as the
 * lerp start means there's no jump at handoffProgress = 0.
 */
function getCollapsedPosition(cardIndex: number): THREE.Vector3 {
  return new THREE.Vector3(-6.0, 3.0 - cardIndex * 1.2, -2.0);
}

/**
 * Morphs the 6 settled card backgrounds (position + size) into their
 * assigned dashboard-slot rects, in world space, as stage5 progresses.
 * Must run AFTER updateCardMorph in the update pipeline so it overrides
 * this frame's already-settled collapsed position/scale, rather than
 * fighting with it.
 */
export function updateDashboardHandoff(
  particles: ParticleData[],
  handoffProgress: number,
  camera: THREE.PerspectiveCamera
): void {
  if (handoffProgress < 0.001) return;

  const t = THREE.MathUtils.smoothstep(handoffProgress, 0, 1);

  for (const particle of particles) {
    if (!particle.isCardSeed) continue;

    const slotKey = CARD_INDEX_TO_SLOT[particle.cardIndex];
    if (!slotKey) continue;

    const mesh = particle.mesh as THREE.Mesh;
    const material = mesh.material as THREE.ShaderMaterial;

    const targetRect = fractionalRectToWorld(DASHBOARD_SLOTS[slotKey], camera);
    const startPos = getCollapsedPosition(particle.cardIndex);

    mesh.position.set(
      THREE.MathUtils.lerp(startPos.x, targetRect.position.x, t),
      THREE.MathUtils.lerp(startPos.y, targetRect.position.y, t),
      THREE.MathUtils.lerp(startPos.z, targetRect.position.z, t)
    );

    const width = THREE.MathUtils.lerp(particle.cardWidth, targetRect.width, t);
    const height = THREE.MathUtils.lerp(particle.cardHeight, targetRect.height, t);
    mesh.scale.set(width, height, 1);

    const uniforms = material.uniforms;
    uniforms.uSize.value.set(width, height);
    uniforms.uRadius.value = STAGE4_CONFIG.CARD_CORNER_RADIUS;
  }
}
