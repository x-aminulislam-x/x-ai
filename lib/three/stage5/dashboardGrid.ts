import * as THREE from 'three';

export interface FractionalRect {
  x: number; // 0-1 left edge, fraction of viewport width
  y: number; // 0-1 top edge, fraction of viewport height (y-down, matches CSS)
  width: number; // fraction of viewport width
  height: number; // fraction of viewport height
}

export interface WorldRect {
  position: THREE.Vector3; // center, world space
  width: number; // world units
  height: number; // world units
}

/**
 * Single source of truth for the dashboard layout. Both the WebGL handoff
 * (dashboardHandoff.ts) and the real DOM dashboard (DashboardPreview.tsx)
 * read from this same object — that's what keeps the WebGL landing
 * positions and the DOM crossfade target perfectly aligned.
 */
export const DASHBOARD_SLOTS = {
  sidebar: { x: 0.0, y: 0.0, width: 0.16, height: 1.0 },
  header: { x: 0.16, y: 0.0, width: 0.84, height: 0.08 },
  panel: { x: 0.16, y: 0.08, width: 0.84, height: 0.92 },
  chart: { x: 0.19, y: 0.13, width: 0.42, height: 0.42 },
  metric: { x: 0.64, y: 0.13, width: 0.34, height: 0.2 },
  table: { x: 0.19, y: 0.6, width: 0.79, height: 0.34 },
} as const satisfies Record<string, FractionalRect>;

export type DashboardSlotKey = keyof typeof DASHBOARD_SLOTS;

/** Card N (1-indexed in conversation) -> particle.cardIndex (0-indexed) -> slot. */
export const CARD_INDEX_TO_SLOT: Record<number, DashboardSlotKey> = {
  0: 'sidebar',
  1: 'header',
  2: 'panel',
  3: 'chart',
  4: 'metric',
  5: 'table',
};

// Depth the dashboard sits at — matches the z the cards are already at
// during the stage4 left-column collapse (see cardMorph.ts's targetLeftZ),
// so there's no depth pop when the handoff begins.
const DASHBOARD_Z = -2;

/**
 * Converts a viewport-fraction rect into a world-space rect at a fixed
 * depth, given the camera's current vertical FOV/aspect/distance.
 *
 * Assumes the camera is looking at the origin (see camera.ts's
 * lookAt(0,0,0)) and is effectively still by the time this runs — see the
 * drift-damping added to updateCamera, which zeroes out camera parallax
 * once dashboardTimeline (stage4) settles at progress 1. Without that
 * stillness, these world targets would drift frame to frame and the
 * landing positions would visibly swim instead of locking into place.
 */
export function fractionalRectToWorld(
  rect: FractionalRect,
  camera: THREE.PerspectiveCamera
): WorldRect {
  const distance = camera.position.z - DASHBOARD_Z;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const visibleHeight = 2 * Math.tan(vFov / 2) * distance;
  const visibleWidth = visibleHeight * camera.aspect;

  const centerFracX = rect.x + rect.width / 2;
  const centerFracY = rect.y + rect.height / 2;

  const worldX = (centerFracX - 0.5) * visibleWidth;
  const worldY = (0.5 - centerFracY) * visibleHeight;

  return {
    position: new THREE.Vector3(worldX, worldY, DASHBOARD_Z),
    width: rect.width * visibleWidth,
    height: rect.height * visibleHeight,
  };
}
