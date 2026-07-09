import * as THREE from 'three';
import { AnimationLoop } from './animation';
import { createCamera, updateCamera } from './camera';
import { ANIMATION_CONFIG } from './constants';
import { createMouseTracker } from './inputs/mouse';
import { createParticles } from './particles/createParticles';
import { updateParticleMotion } from './particles/particleMotion';
import { updateParticleOpacity } from './particles/particleOpacity';
import { createRenderer } from './renderer';
import { scrollTimeline } from './stage2';
import { detectNeighbors } from './stage2/connections/neighborDetection';

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

  const searchRadius = THREE.MathUtils.lerp(0.4, 2.5, progress);

  updateParticleOpacity(particles);

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

    if (accumulator < 0.1) return;

    accumulator = 0;
    detectNeighbors(particles, searchRadius);
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
