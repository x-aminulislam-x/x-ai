import * as THREE from 'three';
import { AnimationLoop } from './animation';
import { createCamera, updateCamera } from './camera';
import { ANIMATION_CONFIG, STAGE2_CONFIG } from './constants';
import { createMouseTracker } from './inputs/mouse';
import { createParticles } from './particles/createParticles';
import { updateParticleMotion } from './particles/particleMotion';
import { updateParticleOpacity } from './particles/particleOpacity';
import { createRenderer } from './renderer';
import { scrollTimeline } from './stage2';
import { detectNeighbors } from './stage2/connections/neighborDetection';
import { assignGridAnchors, generateGridAnchors } from './stage3/grid';
import {
  assignParticlesToCards,
  createDashboardContent,
  dashboardTimeline,
  generateCardSlots,
  getContentRevealProgress,
  updateCardMorph,
} from './stage4';
import { registerCardSeeds, updateCardHover } from './stage4/cardInteraction';

export function createScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(ANIMATION_CONFIG.RENDERER_BACKGROUND);

  const renderer = createRenderer(canvas);

  const mouseTracker = createMouseTracker();

  let accumulator = 0;

  const camera = createCamera();
  scene.add(camera);

  const progress = scrollTimeline.getProgress();

  const particles = createParticles(scene);

  const anchors = generateGridAnchors(particles.length);
  assignGridAnchors(particles, anchors);

  updateParticleOpacity(particles);

  const cardSlots = generateCardSlots();

  assignParticlesToCards(scene, particles, cardSlots);
  registerCardSeeds(particles);

  const dashboardContent = createDashboardContent(scene, particles, cardSlots);

  const animationLoop = new AnimationLoop(renderer, scene, camera);
  // ---------------------------------------------------------------------------
  // Registering the update pipeline tasks
  // ---------------------------------------------------------------------------

  // Base updates
  animationLoop.updates.push((elapsed: number) => updateCamera(camera, elapsed));
  animationLoop.updates.push(elapsed =>
    updateParticleMotion(particles, mouseTracker.mouse, camera, elapsed)
  );

  animationLoop.updates.push((_, delta) => {
    scrollTimeline.update(delta);
  });

  animationLoop.updates.push((_, delta) => {
    accumulator += delta;
    if (accumulator < STAGE2_CONFIG.NEIGHBOR_UPDATE_INTERVAL) return;
    accumulator -= STAGE2_CONFIG.NEIGHBOR_UPDATE_INTERVAL;

    const progress = scrollTimeline.getProgress();

    const searchRadius = THREE.MathUtils.lerp(
      STAGE2_CONFIG.MIN_CONNECTION_RADIUS,
      STAGE2_CONFIG.MAX_CONNECTION_RADIUS,
      progress
    );
    detectNeighbors(particles, searchRadius);
  });

  animationLoop.updates.push((_, delta) => {
    dashboardTimeline.update(delta);
  });

  animationLoop.updates.push(() => {
    updateCardMorph(particles, dashboardTimeline.getProgress());
  });

  animationLoop.updates.push(elapsed => {
    const revealProgress = getContentRevealProgress(dashboardTimeline.getProgress());
    dashboardContent.updateIndicators(elapsed, revealProgress);
    dashboardContent.updateText(revealProgress);
  });

  // Inside createScene() in scene.ts:

  animationLoop.updates.push(elapsed => {
    const dashProgress = dashboardTimeline.getProgress();

    // 1. ALWAYS run the card morph (letting cardMorph.ts handle the movement/layout)
    updateCardMorph(particles, dashProgress);

    // 2. Synchronized Background Shrink (Shrinks to 0 exactly as cards grow to 100%)
    // The cards grow from progress 0.0 to 0.6.
    const shrinkProgress = THREE.MathUtils.clamp(dashProgress / 0.6, 0, 1);

    // As shrinkProgress goes 0 -> 1, scaleMultiplier goes 1 -> 0
    const scaleMultiplier = 1.0 - shrinkProgress;

    for (const particle of particles) {
      // Only target the ~2,134 background particles marked to dissolve
      if (particle.dissolves && particle.mesh) {
        particle.mesh.scale.setScalar(particle.baseScale * scaleMultiplier);
      }
    }
  });

  // Card hover detection — runs after the morph/collapse updates above so it
  // raycasts against this frame's already-settled mesh positions.
  animationLoop.updates.push(() => {
    updateCardHover(mouseTracker.mouse, camera, dashboardTimeline.getProgress());
  });

  // Future updates can be cleanly appended right here without touching animate():
  // animationLoop.updates.push(updateParticles);
  // animationLoop.updates.push(updateConnections);
  // animationLoop.updates.push(updateMouseInteraction);
  // animationLoop.updates.push(updateMorphing);

  // Start execution loop
  animationLoop.start();

  // ---------------------------------------------------------------------------
  // Window Resize & Cleanup Handles
  // ---------------------------------------------------------------------------
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, ANIMATION_CONFIG.MAX_PIXEL_RATIO));
  }

  window.addEventListener('resize', handleResize);

  function dispose() {
    window.removeEventListener('resize', handleResize);
    animationLoop.dispose();
    renderer.dispose();
    mouseTracker.dispose();
  }

  return {
    scene,
    camera,
    renderer,
    particles,
    mouse: mouseTracker.mouse,
    dispose,
  };
}
