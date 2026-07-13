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

const DASHBOARD_Z = -2;

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
