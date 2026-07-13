import * as THREE from 'three';
import { MouseState } from '../inputs/mouse';
import { ParticleData } from '../particles/types';

export const CARD_ACTIVATION_THRESHOLD = 0.95;

const HIGHLIGHT_COLOR = new THREE.Color('#FFFFFF');
const HIGHLIGHT_MIX = 0.5; // how far toward white the hovered card shifts
const HIGHLIGHT_LERP_SPEED = 0.15; // per-frame ease, not framerate-independent but fine at 60fps

interface SeedMeshEntry {
  mesh: THREE.Mesh;
  cardIndex: number;
  baseColor: THREE.Color;
}

const HOVER_POP_Z = 0.4; // how far the hovered card steps toward the camera

export const cardInteraction = {
  hoveredCardIndex: -1,
  lastHoveredCardIndex: 0,
  cardsActive: false, // NEW — true once cards are formed & hover-eligible
};

const raycaster = new THREE.Raycaster();
let seedEntries: SeedMeshEntry[] = [];
let hoverFactors: number[] = [];

export function registerCardSeeds(particles: ParticleData[]): void {
  seedEntries = particles
    .filter(particle => particle.isCardSeed)
    .map(particle => {
      const mesh = particle.mesh as THREE.Mesh;
      const material = mesh.material as THREE.ShaderMaterial;
      const baseColor = (material.uniforms.uColor.value as THREE.Color).clone();
      return { mesh, cardIndex: particle.cardIndex, baseColor };
    });

  hoverFactors = seedEntries.map(() => 0);
}

export function updateCardHover(
  mouse: MouseState,
  camera: THREE.PerspectiveCamera,
  dashProgress: number,
  handoffProgress = 0
): void {
  const isActive = dashProgress > CARD_ACTIVATION_THRESHOLD && handoffProgress <= 0.001;
  cardInteraction.cardsActive = isActive; // NEW

  let newHoveredIndex = -1;

  if (isActive && seedEntries.length > 0) {
    raycaster.setFromCamera(mouse.normalized, camera);
    const intersects = raycaster.intersectObjects(
      seedEntries.map(entry => entry.mesh),
      false
    );
    if (intersects.length > 0) {
      const hit = seedEntries.find(entry => entry.mesh === intersects[0].object);
      if (hit) newHoveredIndex = hit.cardIndex;
    }
  }

  cardInteraction.hoveredCardIndex = newHoveredIndex;
  if (newHoveredIndex !== -1) {
    cardInteraction.lastHoveredCardIndex = newHoveredIndex;
  }

  seedEntries.forEach((entry, i) => {
    const target = entry.cardIndex === newHoveredIndex ? 1 : 0;
    hoverFactors[i] = THREE.MathUtils.lerp(hoverFactors[i], target, HIGHLIGHT_LERP_SPEED);

    const material = entry.mesh.material as THREE.ShaderMaterial;
    const colorUniform = material.uniforms.uColor.value as THREE.Color;
    colorUniform.copy(entry.baseColor).lerp(HIGHLIGHT_COLOR, hoverFactors[i] * HIGHLIGHT_MIX);

    entry.mesh.position.z += hoverFactors[i] * HOVER_POP_Z;

    const cardBase = entry.cardIndex * 10;
    const hoverBoost = hoverFactors[i] > 0.5 ? 1000 : 0;
    entry.mesh.traverse(obj => {
      const localOrder = (obj.userData.localRenderOrder as number | undefined) ?? 1;
      obj.renderOrder = cardBase + hoverBoost + localOrder;
    });
  });
}
