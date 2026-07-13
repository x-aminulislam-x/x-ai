import * as THREE from 'three';
import { ParticleData } from '../particles/types';
import { getCardLabel } from './cardLabels';
import { CardText, createCardText } from './cardText';
import { CardSlot } from './dashboardLayout';
import { getInsightLabel } from './insightLabels';

export interface DashboardContent {
  updateText: (dashboardReveal: number, insightReveal: number) => void;
}

export function createDashboardContent(
  scene: THREE.Scene,
  particles: ParticleData[],
  _cardSlots: CardSlot[]
): DashboardContent {
  const dashboardTexts: CardText[] = [];
  const insightTexts: CardText[] = [];
  const seeds = particles.filter(particle => particle.isCardSeed);
  const black = new THREE.Color('#000000'); // drawText() ignores this param and always fills black — kept only for signature compatibility

  seeds.forEach(seed => {
    const mesh = seed.mesh as THREE.Mesh;

    const dashboardLabel = getCardLabel(seed.cardIndex);
    const dashboardText = createCardText(dashboardLabel, black);
    mesh.add(dashboardText.object);
    dashboardTexts.push(dashboardText);

    const insightLabel = getInsightLabel(seed.cardIndex);
    const insightText = createCardText(insightLabel, black);
    // Sits just in front of, and paints after, the dashboard text so
    // there's no z-fighting or flicker during the brief window both
    // could theoretically have nonzero opacity.
    insightText.object.position.z = 0.011;
    insightText.object.userData.localRenderOrder = 3; // overridden per-frame in cardInteraction.ts
    mesh.add(insightText.object);
    insightTexts.push(insightText);
  });

  return {
    updateText(dashboardReveal, insightReveal) {
      dashboardTexts.forEach((text, i) => text.update(dashboardReveal, seeds[i].mesh.scale));
      insightTexts.forEach((text, i) => text.update(insightReveal, seeds[i].mesh.scale));
    },
  };
}
