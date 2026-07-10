import * as THREE from 'three';
import { ParticleData } from '../particles/types';
import { getCardLabel } from './cardLabels';
import { CardText, createCardText } from './cardText';
import { CardSlot } from './dashboardLayout';

export interface DashboardContent {
  updateIndicators: (elapsed: number, revealProgress: number) => void;
  updateText: (revealProgress: number) => void;
}

export function createDashboardContent(
  scene: THREE.Scene,
  particles: ParticleData[],
  _cardSlots: CardSlot[]
): DashboardContent {
  const textLabels: CardText[] = [];
  const seeds = particles.filter(particle => particle.isCardSeed);

  seeds.forEach(seed => {
    const mesh = seed.mesh as THREE.Mesh;
    const material = mesh.material as THREE.ShaderMaterial;
    const color = material.uniforms.uColor.value as THREE.Color;

    const label = getCardLabel(seed.cardIndex);
    const text = createCardText(label, color);
    mesh.add(text.object);
    textLabels.push(text);
  });

  return {
    updateIndicators() {},
    updateText(revealProgress) {
      textLabels.forEach((text, i) => {
        const seed = seeds[i];
        text.update(revealProgress, seed.mesh.scale);
      });
    },
  };
}
