import * as THREE from 'three';
import { STAGE7_CONFIG } from '../constants';

export interface DragOrbitHandle {
  getAzimuthOffset: () => number;
  getElevationOffset: () => number;
  getZoomOffset: () => number;
  getHoverFactor: () => number;
  setEnabled: (enabled: boolean) => void;
  setZoomEnabled: (enabled: boolean) => void;
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
    ZOOM_MIN_RADIUS,
    ZOOM_MAX_RADIUS,
    ORBIT_RADIUS,
    HOVER_SPIN_DAMPING,
    HOVER_LERP_FACTOR,
  } = STAGE7_CONFIG;

  let enabled = false;
  let isDragging = false;
  let isHovering = false;
  let lastX = 0;
  let lastY = 0;
  let azimuthOffset = 0;
  let elevationOffset = 0;
  let velocityAzimuth = 0;
  let velocityElevation = 0;
  let zoomOffset = 0;
  let hoverFactor = 1;
  let zoomEnabled = false;

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

  function onPointerEnter() {
    if (!enabled) return;
    isHovering = true;
  }

  function onPointerLeave() {
    isHovering = false;
  }

  function onWheel(e: WheelEvent) {
    // Only intercept once the attractor is formed — outside that window
    // we don't preventDefault, so normal page scroll (driving the GSAP
    // ScrollTrigger stages) is completely untouched.
    if (!zoomEnabled) return;
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
  canvas.addEventListener('pointerenter', onPointerEnter);
  canvas.addEventListener('pointerleave', onPointerLeave);
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
      if (!value) isHovering = false;
    },
    setZoomEnabled: (value: boolean) => {
      zoomEnabled = value;
    },
    update: () => {
      if (!isDragging) {
        azimuthOffset += velocityAzimuth;
        velocityAzimuth *= DRAG_INERTIA_DECAY;
        velocityElevation *= DRAG_INERTIA_DECAY;

        // Azimuth (the "spin") is left wherever it ends up — that's
        // just a continuation of the globe's rotation. Elevation (tilt)
        // eases back to 0 so a drag can't leave the shape viewed from
        // an awkward pole-on angle; this is what "aligns it properly".
        azimuthOffset = THREE.MathUtils.lerp(azimuthOffset, 0, STAGE7_CONFIG.AZIMUTH_RETURN_LERP);
      }

      // Eased toward the hover target so the spin visibly "dims" in and
      // out rather than snapping — HOVER_LERP_FACTOR controls how fast.
      const targetHoverFactor = isHovering ? HOVER_SPIN_DAMPING : 1;
      hoverFactor = THREE.MathUtils.lerp(hoverFactor, targetHoverFactor, HOVER_LERP_FACTOR);
    },
    reset: () => {
      azimuthOffset = 0;
      elevationOffset = 0;
      velocityAzimuth = 0;
      velocityElevation = 0;
      zoomOffset = 0;
      hoverFactor = 1;
      zoomEnabled = false;
      isDragging = false;
      isHovering = false;
    },
    dispose: () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerenter', onPointerEnter);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('wheel', onWheel);
    },
  };
}
