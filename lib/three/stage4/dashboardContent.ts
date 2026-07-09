import * as THREE from 'three';
import { ParticleData } from '../particles/types';
import { createAIIndicator } from './aiIndicator';
import { CardSlot } from './dashboardLayout';
import { generatePipelines } from './pipelines';

export interface DashboardContent {
  updateIndicators: (elapsed: number, revealProgress: number) => void;
  updatePipelines: (elapsed: number, revealProgress: number) => void;
}

/**
 * Attaches a chart + AI indicator to every card's seed mesh, and builds
 * the inter-card pipelines. Call once, right after
 * assignParticlesToCards() has created the seed meshes.
 */
export function createDashboardContent(
  scene: THREE.Scene,
  particles: ParticleData[],
  cardSlots: CardSlot[]
): DashboardContent {
  const indicators: ReturnType<typeof createAIIndicator>[] = [];

  const seeds = particles.filter(particle => particle.isCardSeed);

  seeds.forEach(seed => {
    const mesh = seed.mesh as THREE.Mesh;
    const material = mesh.material as THREE.ShaderMaterial;
    const color = (material.uniforms.uColor.value as THREE.Color).clone();

    const indicator = createAIIndicator(color);
    mesh.add(indicator.object);
    indicators.push(indicator);
  });

  const pipelines = generatePipelines(cardSlots);
  for (const pipeline of pipelines) {
    scene.add(pipeline.object);
  }

  return {
    updateIndicators(elapsed, revealProgress) {
      for (const indicator of indicators) indicator.update(elapsed, revealProgress);
    },
    updatePipelines(elapsed, revealProgress) {
      for (const pipeline of pipelines) pipeline.update(elapsed, revealProgress);
    },
  };
}
