import * as THREE from 'three';
import { AnimationLoop } from './animation';
import { createCamera, updateCamera } from './camera';
import { ANIMATION_CONFIG, CAMERA_SETTINGS, STAGE2_CONFIG, STAGE7_CONFIG } from './constants';
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
  getDashboardContentRevealProgress,
  getInsightContentRevealProgress,
  updateCardMorph,
} from './stage4';
import {
  CARD_ACTIVATION_THRESHOLD,
  cardInteraction,
  registerCardSeeds,
  updateCardHover,
} from './stage4/cardInteraction';
import { updateCardStackBounds } from './stage4/cardStackBounds';
import { dashboardHandoffTimeline, getHandoffContentFade, updateDashboardHandoff } from './stage5';
import { updateCardReform, updateParticleRejoin } from './stage6';
import { getLivelinessBoost } from './stage6/liveliness';
import { reformTimeline } from './stage6/reformTimeline';
import {
  computeAizawaNormalization,
  createDragOrbit,
  lorenzTimeline,
  seedFlowPositions,
  updateCameraOrbit,
  updateParticleBillboard,
  updateParticleFlow,
  updateParticleJoinScale,
} from './stage7';
import { isPointerOverAttractor } from './stage7/objectHover';

export function createScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(ANIMATION_CONFIG.RENDERER_BACKGROUND);

  const renderer = createRenderer(canvas);
  const mouseTracker = createMouseTracker();
  const dragOrbit = createDragOrbit(canvas);

  let accumulator = 0;

  const camera = createCamera();
  scene.add(camera);

  const particles = createParticles(scene);

  const anchors = generateGridAnchors(particles.length);
  assignGridAnchors(particles, anchors);

  const aizawaNorm = computeAizawaNormalization(STAGE7_CONFIG);
  seedFlowPositions(particles);

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
  animationLoop.updates.push((elapsed: number, delta: number) => {
    const liveliness = getLivelinessBoost(reformTimeline.getProgress());
    updateCamera(camera, elapsed, dashboardTimeline.getProgress() * (1 - liveliness));

    const lorenzProgress = lorenzTimeline.getProgress();
    const isFormed = lorenzProgress > STAGE7_CONFIG.DRAG_ENABLE_THRESHOLD;
    const overObject = isFormed && isPointerOverAttractor(mouseTracker.mouse, camera);

    dragOrbit.setEnabled(isFormed);
    dragOrbit.setPointerOverObject(overObject);
    dragOrbit.update();

    updateCameraOrbit(
      camera,
      elapsed,
      delta,
      lorenzProgress,
      dragOrbit.getAzimuthOffset(),
      dragOrbit.getElevationOffset(),
      dragOrbit.getZoomOffset(),
      dragOrbit.getHoverFactor()
    );
  });

  animationLoop.updates.push(() => {
    updateCardStackBounds(camera);
  });

  animationLoop.updates.push(elapsed => {
    const liveliness = getLivelinessBoost(reformTimeline.getProgress());
    updateParticleMotion(
      particles,
      mouseTracker.mouse,
      camera,
      elapsed,
      liveliness,
      lorenzTimeline.getProgress()
    );
  });

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

  animationLoop.updates.push((_, delta) => {
    reformTimeline.update(delta);
  });

  animationLoop.updates.push((_, delta) => {
    lorenzTimeline.update(delta);
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
  animationLoop.updates.push(() => {
    const dashProgress = dashboardTimeline.getProgress();
    const dashboardReveal = getDashboardContentRevealProgress(dashProgress);
    const insightReveal = getInsightContentRevealProgress(dashProgress);
    const handoffFade = getHandoffContentFade(dashboardHandoffTimeline.getProgress());

    dashboardContent.updateText(dashboardReveal * handoffFade, insightReveal * handoffFade);
  });

  // Stage5 — morphs the 6 settled card backgrounds into dashboard-slot
  // rects. Runs after updateCardMorph above so it overrides this frame's
  // already-settled collapsed position/scale rather than fighting it.
  animationLoop.updates.push(() => {
    updateDashboardHandoff(particles, dashboardHandoffTimeline.getProgress(), camera);
  });

  animationLoop.updates.push(() => {
    updateCardReform(particles, reformTimeline.getProgress(), camera);
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
    const cardsActive =
      dashboardTimeline.getProgress() > CARD_ACTIVATION_THRESHOLD &&
      dashboardHandoffTimeline.getProgress() <= 0.001;
    if (cardsActive) {
      canvas.style.cursor = cardInteraction.hoveredCardIndex !== -1 ? 'pointer' : 'default';
    }
  });

  animationLoop.updates.push(() => {
    updateParticleRejoin(particles, reformTimeline.getProgress());
  });

  animationLoop.updates.push(() => {
    updateParticleJoinScale(particles, lorenzTimeline.getProgress());
  });

  animationLoop.updates.push(() => {
    updateParticleBillboard(particles, camera, lorenzTimeline.getProgress());
  });

  animationLoop.updates.push(() => {
    updateParticleFlow(
      particles,
      lorenzTimeline.getProgress(),
      aizawaNorm.center,
      aizawaNorm.scale
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
    reformTimeline.dispose();
    lorenzTimeline.dispose();
    animationLoop.dispose();

    const gl = renderer.getContext();
    renderer.dispose();
    gl.getExtension('WEBGL_lose_context')?.loseContext(); // force immediate GPU context release

    mouseTracker.dispose();
    dragOrbit.dispose();
  }

  function resetView() {
    // Hard-snaps the camera back to its resting position instead of
    // relying on updateCamera's damped lerp (CAMERA_LERP_FACTOR: 0.03)
    // to slowly catch up from wherever the stage7 orbit left it — that
    // slow catch-up is what reads as "spinning" right after the loop.
    camera.position.set(0, 0, CAMERA_SETTINGS.BASE_DISTANCE_Z);
    camera.lookAt(0, 0, 0);
    dragOrbit.reset();
  }

  return {
    scene,
    camera,
    renderer,
    particles,
    mouse: mouseTracker.mouse,
    dispose,
    resetView,
  };
}
