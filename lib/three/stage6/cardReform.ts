import * as THREE from 'three';
import { STAGE4_CONFIG, STAGE6_CONFIG } from '../constants';
import { ParticleData } from '../particles/types';
import {
  CARD_INDEX_TO_SLOT,
  DASHBOARD_SLOTS,
  fractionalRectToWorld,
} from '../stage5/dashboardGrid';
import { getCollapsedPosition } from '../stage5/dashboardHandoff';

/**
 * Reverse of dashboardHandoff.ts + cardMorph.ts's updateSeedParticle,
 * chained the opposite direction: dashboard slot -> collapsed column ->
 * grid position, shrinking back down to particle size along the way.
 * Must run AFTER updateDashboardHandoff in the pipeline so it overrides
 * this frame's slot-rect position once reformProgress > 0.
 */
export function updateCardReform(
  particles: ParticleData[],
  reformProgress: number,
  camera: THREE.PerspectiveCamera
): void {
  if (reformProgress < 0.001) return;

  const { HANDOFF_REVERSE_END, UNCOLLAPSE_START, UNCOLLAPSE_END } = STAGE6_CONFIG;

  const handoffT = 1 - THREE.MathUtils.smoothstep(reformProgress, 0, HANDOFF_REVERSE_END);
  const uncollapseT = THREE.MathUtils.smoothstep(reformProgress, UNCOLLAPSE_START, UNCOLLAPSE_END);

  for (const particle of particles) {
    if (!particle.isCardSeed) continue;

    const slotKey = CARD_INDEX_TO_SLOT[particle.cardIndex];
    if (!slotKey) continue;

    const mesh = particle.mesh as THREE.Mesh;
    const material = mesh.material as THREE.ShaderMaterial;

    const targetRect = fractionalRectToWorld(DASHBOARD_SLOTS[slotKey], camera);
    const collapsed = getCollapsedPosition(particle.cardIndex);

    // Phase A: dashboard slot -> collapsed column
    const posAx = THREE.MathUtils.lerp(targetRect.position.x, collapsed.x, 1 - handoffT);
    const posAy = THREE.MathUtils.lerp(targetRect.position.y, collapsed.y, 1 - handoffT);
    const posAz = THREE.MathUtils.lerp(targetRect.position.z, collapsed.z, 1 - handoffT);

    const widthA = THREE.MathUtils.lerp(targetRect.width, particle.cardWidth, 1 - handoffT);
    const heightA = THREE.MathUtils.lerp(targetRect.height, particle.cardHeight, 1 - handoffT);

    // Phase B: collapsed column -> grid position (targetPosition), shrink to baseScale
    const finalX = THREE.MathUtils.lerp(posAx, particle.targetPosition.x, uncollapseT);
    const finalY = THREE.MathUtils.lerp(posAy, particle.targetPosition.y, uncollapseT);
    const finalZ = THREE.MathUtils.lerp(posAz, particle.targetPosition.z, uncollapseT);

    const width = THREE.MathUtils.lerp(widthA, particle.baseScale, uncollapseT);
    const height = THREE.MathUtils.lerp(heightA, particle.baseScale, uncollapseT);

    mesh.position.set(finalX, finalY, finalZ);
    mesh.scale.set(width, height, 1);

    const uniforms = material.uniforms;
    uniforms.uSize.value.set(width, height);
    uniforms.uRadius.value = THREE.MathUtils.lerp(
      STAGE4_CONFIG.CARD_CORNER_RADIUS,
      particle.baseScale / 2,
      uncollapseT
    );
    uniforms.uOpacity.value = THREE.MathUtils.lerp(
      STAGE4_CONFIG.CARD_OPACITY,
      particle.baseOpacity,
      uncollapseT
    );
  }
}
