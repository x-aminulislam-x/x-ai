import * as THREE from 'three';
import { MouseState } from '../inputs/mouse';
import { ParticleData } from '../particles/types';

// Cards are still collapsing into their left-column stack until dashProgress
// hits 1.0 (see cardMorph.ts's collapseFactor). Wait until they're
// effectively settled before enabling hit-testing, so hover doesn't engage
// on a card that's still sliding into place.
export const CARD_ACTIVATION_THRESHOLD = 0.95;

const HIGHLIGHT_COLOR = new THREE.Color('#FFFFFF');
const HIGHLIGHT_MIX = 0.5; // how far toward white the hovered card shifts
const HIGHLIGHT_LERP_SPEED = 0.15; // per-frame ease, not framerate-independent but fine at 60fps

interface SeedMeshEntry {
  mesh: THREE.Mesh;
  cardIndex: number;
  baseColor: THREE.Color;
}

/**
 * Polled by React (same pattern as dashboardTimeline) to know which card,
 * if any, is currently under the pointer.
 */
export const cardInteraction = {
  hoveredCardIndex: -1,
};

const raycaster = new THREE.Raycaster();
let seedEntries: SeedMeshEntry[] = [];
let hoverFactors: number[] = [];

/**
 * Call once, after assignParticlesToCards() has finished replacing seed
 * particles' meshes with their final card-panel mesh.
 */
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

/**
 * Call every frame, after updateCardMorph() so meshes are already
 * positioned/scaled for the current frame before we raycast against them.
 */
export function updateCardHover(
  mouse: MouseState,
  camera: THREE.PerspectiveCamera,
  dashProgress: number,
  handoffProgress = 0
): void {
  // Once the stage4->dashboard handoff begins, the seed meshes stop
  // representing individual metrics (they're mid-morph into sidebar/
  // header/panel/etc), so hover hit-testing and the highlight-toward-white
  // effect need to switch off. Leaving isActive false here also drives
  // hoverFactors back down to 0 via the lerp below, so any currently
  // hovered card's highlight eases out cleanly instead of freezing mid-fade.
  const isActive = dashProgress > CARD_ACTIVATION_THRESHOLD && handoffProgress <= 0.001;

  let newHoveredIndex = -1;

  if (isActive && seedEntries.length > 0) {
    raycaster.setFromCamera(mouse.normalized, camera);
    // recursive: false — each seed mesh has the AI indicator and text label
    // as children, and we only want to hit-test the card panel itself.
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

  seedEntries.forEach((entry, i) => {
    const target = entry.cardIndex === newHoveredIndex ? 1 : 0;
    hoverFactors[i] = THREE.MathUtils.lerp(hoverFactors[i], target, HIGHLIGHT_LERP_SPEED);

    const material = entry.mesh.material as THREE.ShaderMaterial;
    const colorUniform = material.uniforms.uColor.value as THREE.Color;
    colorUniform.copy(entry.baseColor).lerp(HIGHLIGHT_COLOR, hoverFactors[i] * HIGHLIGHT_MIX);
  });
}
