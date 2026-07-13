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

const HOVER_POP_Z = 0.4; // how far the hovered card steps toward the camera

/**
 * Polled by React (same pattern as dashboardTimeline) to know which card,
 * if any, is currently under the pointer.
 */
export const cardInteraction = {
  hoveredCardIndex: -1,
  // Sticky, insight-flow-only index. Defaults to 0 (first card active by
  // default) and only ever updates on a real hover hit — it never resets
  // to -1 the way hoveredCardIndex does. Deliberately kept as a SEPARATE
  // field from hoveredCardIndex: the Dashboard Content hover highlight
  // (the white-tint/pop/renderOrder loop below) reads hoveredCardIndex
  // directly, so defaulting *that* to 0 is what previously caused card 0
  // to falsely highlight in the 3D canvas. lastHoveredCardIndex is only
  // for consumers like InsightFlowOverlay that want a persistent selection.
  lastHoveredCardIndex: 0,
  cardsActive: false, // NEW — true once cards are formed & hover-eligible
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

    // Deterministic draw order — this is what actually stops one card's
    // text bleeding into a neighbor once they overlap in the collapsed
    // stack (position/z alone isn't reliable since depthWrite is false
    // on these materials; renderOrder is the only thing that reliably
    // controls transparent draw order here). Every element under this
    // card (shadow, panel, both text layers) was tagged with a stable
    // userData.localRenderOrder at creation — this just combines that
    // with the card's index and hover state into one absolute value,
    // every frame, so it self-corrects rather than drifting.
    const cardBase = entry.cardIndex * 10;
    const hoverBoost = hoverFactors[i] > 0.5 ? 1000 : 0;
    entry.mesh.traverse(obj => {
      const localOrder = (obj.userData.localRenderOrder as number | undefined) ?? 1;
      obj.renderOrder = cardBase + hoverBoost + localOrder;
    });

    // if (entry.shadowMesh) {
    //   const shadowMaterial = entry.shadowMesh.material as THREE.ShaderMaterial;
    //   shadowMaterial.uniforms.uOpacity.value = Math.max(
    //     shadowMaterial.uniforms.uOpacity.value,
    //     hoverFactors[i] * 0.55
    //   );
    // }
  });
}
