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
import { dashboardHandoffTimeline, getHandoffContentFade, updateDashboardHandoff } from './stage5';

export function createScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(ANIMATION_CONFIG.RENDERER_BACKGROUND);

  const renderer = createRenderer(canvas);
  const mouseTracker = createMouseTracker();

  let accumulator = 0;

  const camera = createCamera();
  scene.add(camera);

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
  animationLoop.updates.push((elapsed: number) =>
    updateCamera(camera, elapsed, dashboardTimeline.getProgress())
  );
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

  animationLoop.updates.push((_, delta) => {
    dashboardHandoffTimeline.update(delta);
  });

  // Card formation (position/shape/opacity lockstep + left-column collapse)
  // and the synchronized background-particle shrink, in one pass.
  // (Previously updateCardMorph was called twice per frame here — once
  // alone, once again inside this block — consolidated into a single call.)
  animationLoop.updates.push(() => {
    const dashProgress = dashboardTimeline.getProgress();
    updateCardMorph(particles, dashProgress);

    const shrinkProgress = THREE.MathUtils.clamp(dashProgress / 0.6, 0, 1);
    const scaleMultiplier = 1.0 - shrinkProgress;

    for (const particle of particles) {
      if (particle.dissolves && particle.mesh) {
        particle.mesh.scale.setScalar(particle.baseScale * scaleMultiplier);
      }
    }
  });

  // Card content (label text) reveal — combines stage4's own reveal
  // window with stage5's fast fade-out at the start of the dashboard
  // handoff, so labels are fully gone before their card backgrounds
  // start reshaping into sidebar/header/panel/etc.
  animationLoop.updates.push(elapsed => {
    const revealProgress = getContentRevealProgress(dashboardTimeline.getProgress());
    const handoffFade = getHandoffContentFade(dashboardHandoffTimeline.getProgress());
    const combinedReveal = revealProgress * handoffFade;

    dashboardContent.updateIndicators(elapsed, combinedReveal);
    dashboardContent.updateText(combinedReveal);
  });

  // Stage5 — morphs the 6 settled card backgrounds into dashboard-slot
  // rects. Runs after updateCardMorph above so it overrides this frame's
  // already-settled collapsed position/scale rather than fighting it.
  animationLoop.updates.push(() => {
    updateDashboardHandoff(particles, dashboardHandoffTimeline.getProgress(), camera);
  });

  // Card hover detection — runs after the morph/handoff updates above so
  // it raycasts against this frame's already-settled mesh positions, and
  // is suppressed once the dashboard handoff begins (see cardInteraction.ts).
  animationLoop.updates.push(() => {
    updateCardHover(
      mouseTracker.mouse,
      camera,
      dashboardTimeline.getProgress(),
      dashboardHandoffTimeline.getProgress()
    );
  });

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

    const gl = renderer.getContext();
    renderer.dispose();
    gl.getExtension('WEBGL_lose_context')?.loseContext(); // force immediate GPU context release

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
