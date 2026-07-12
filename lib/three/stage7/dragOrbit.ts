import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';

export interface DragOrbitHandle {
  getAzimuthOffset: () => number;
  getElevationOffset: () => number;
  setEnabled: (enabled: boolean) => void;
  update: () => void;
  reset: () => void;
  dispose: () => void;
}

/**
 * Click/touch-drag to rotate the camera around the attractor. Only
 * active once `setEnabled(true)` is called (gated on lorenzProgress
 * crossing DRAG_ENABLE_THRESHOLD in scene.ts) — otherwise dragging
 * across the canvas during earlier stages would fight the card-hover
 * raycasting and the scroll-driven camera.
 */
export function createDragOrbit(canvas: HTMLCanvasElement): DragOrbitHandle {
  const { DRAG_SENSITIVITY, DRAG_ELEVATION_LIMIT, DRAG_INERTIA_DECAY } = STAGE7_CONFIG;

  let enabled = false;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let azimuthOffset = 0;
  let elevationOffset = 0;
  let velocityAzimuth = 0;
  let velocityElevation = 0;

  function onPointerDown(e: PointerEvent) {
    if (!enabled) return;
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velocityAzimuth = 0;
    velocityElevation = 0;
    canvas.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    velocityAzimuth = dx * DRAG_SENSITIVITY;
    velocityElevation = dy * DRAG_SENSITIVITY;

    azimuthOffset += velocityAzimuth;
    elevationOffset = THREE.MathUtils.clamp(
      elevationOffset + velocityElevation,
      -DRAG_ELEVATION_LIMIT,
      DRAG_ELEVATION_LIMIT
    );
  }

  function onPointerUp(e: PointerEvent) {
    isDragging = false;
    canvas.releasePointerCapture(e.pointerId);
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  return {
    getAzimuthOffset: () => azimuthOffset,
    getElevationOffset: () => elevationOffset,
    setEnabled: (value: boolean) => {
      enabled = value;
      canvas.style.touchAction = value ? 'none' : 'auto';
      canvas.style.cursor = value ? 'grab' : 'default';
    },
    update: () => {
      // Inertia: once released, the spin keeps going and decays.
      if (!isDragging) {
        azimuthOffset += velocityAzimuth;
        velocityAzimuth *= DRAG_INERTIA_DECAY;
        velocityElevation *= DRAG_INERTIA_DECAY;
      }
    },
    reset: () => {
      azimuthOffset = 0;
      elevationOffset = 0;
      velocityAzimuth = 0;
      velocityElevation = 0;
      isDragging = false;
    },
    dispose: () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    },
  };
}
