import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';

export interface DragOrbitHandle {
  getAzimuthOffset: () => number;
  getElevationOffset: () => number;
  getZoomOffset: () => number;
  getHoverFactor: () => number;
  setEnabled: (enabled: boolean) => void;
  setPointerOverObject: (isOver: boolean) => void;
  update: () => void;
  reset: () => void;
  dispose: () => void;
}

export function createDragOrbit(canvas: HTMLCanvasElement): DragOrbitHandle {
  const {
    DRAG_SENSITIVITY,
    DRAG_ELEVATION_LIMIT,
    DRAG_INERTIA_DECAY,
    ZOOM_SENSITIVITY,
    ZOOM_DEFAULT_RADIUS,
    ZOOM_MIN_RADIUS,
    ZOOM_MAX_RADIUS,
    ORBIT_RADIUS,
    HOVER_SPIN_DAMPING,
    HOVER_LERP_FACTOR,
  } = STAGE7_CONFIG;

  // Defaults to ZOOM_MIN_RADIUS on load (item 4) — expressed as an
  // offset from ORBIT_RADIUS since that's what all the orbit math adds
  // this to.
  const DEFAULT_ZOOM_OFFSET = ZOOM_DEFAULT_RADIUS - ORBIT_RADIUS;

  let enabled = false;
  let isDragging = false;
  let isOverObject = false; // driven by the per-frame raycast hit-test now, not enter/leave events
  let lastX = 0;
  let lastY = 0;
  let azimuthOffset = 0;
  let elevationOffset = 0;
  let velocityAzimuth = 0;
  let velocityElevation = 0;
  let zoomOffset = DEFAULT_ZOOM_OFFSET;
  let hoverFactor = 1;

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

  function onWheel(e: WheelEvent) {
    // Only intercept while the cursor is actually over the attractor's
    // geometry — outside that (or before stage 7 is formed) we don't
    // preventDefault, so normal page scroll stays completely untouched.
    if (!enabled || !isOverObject) return;
    e.preventDefault();
    zoomOffset = THREE.MathUtils.clamp(
      zoomOffset + e.deltaY * ZOOM_SENSITIVITY,
      ZOOM_MIN_RADIUS - ORBIT_RADIUS,
      ZOOM_MAX_RADIUS - ORBIT_RADIUS
    );
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  return {
    getAzimuthOffset: () => azimuthOffset,
    getElevationOffset: () => elevationOffset,
    getZoomOffset: () => zoomOffset,
    getHoverFactor: () => hoverFactor,
    setEnabled: (value: boolean) => {
      enabled = value;
      canvas.style.touchAction = value ? 'none' : 'auto';
      canvas.style.cursor = value ? 'grab' : 'default';
      if (!value) isOverObject = false;
    },
    // Called every frame from scene.ts with the result of the same
    // raycast hit-test that gates zoom — this single boolean now drives
    // BOTH "is zoom allowed" and "should the auto-spin dim", so the two
    // are guaranteed to agree, and both track the cursor's actual
    // current position rather than a stale enter/leave crossing.
    setPointerOverObject: (isOver: boolean) => {
      isOverObject = isOver;
    },
    update: () => {
      if (!isDragging) {
        azimuthOffset += velocityAzimuth;
        velocityAzimuth *= DRAG_INERTIA_DECAY;
        velocityElevation *= DRAG_INERTIA_DECAY;

        azimuthOffset = THREE.MathUtils.lerp(azimuthOffset, 0, STAGE7_CONFIG.AZIMUTH_RETURN_LERP);
      }

      const targetHoverFactor = isOverObject ? HOVER_SPIN_DAMPING : 1;
      hoverFactor = THREE.MathUtils.lerp(hoverFactor, targetHoverFactor, HOVER_LERP_FACTOR);
    },
    reset: () => {
      azimuthOffset = 0;
      elevationOffset = 0;
      velocityAzimuth = 0;
      velocityElevation = 0;
      zoomOffset = DEFAULT_ZOOM_OFFSET; // resets to min-zoom default, not 0
      hoverFactor = 1;
      isDragging = false;
      isOverObject = false;
    },
    dispose: () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    },
  };
}
