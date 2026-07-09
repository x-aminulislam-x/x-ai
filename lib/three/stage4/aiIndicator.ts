import * as THREE from 'three';

export interface AIIndicator {
  object: THREE.Mesh;
  update: (elapsed: number, revealProgress: number) => void;
}

const BASE_RADIUS = 0.045;

/**
 * A small pulsing dot in the corner of a card, signaling "AI active."
 * Also a child of the card's seed mesh — local position (0.38, 0.32)
 * lands near the top-right corner of a unit-plane card.
 */
export function createAIIndicator(color: THREE.Color): AIIndicator {
  const geometry = new THREE.CircleGeometry(BASE_RADIUS, 16);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0.38, 0.32, 0.002);
  mesh.renderOrder = 2;

  return {
    object: mesh,
    update(elapsed: number, revealProgress: number) {
      const pulse = 0.85 + Math.sin(elapsed * 3.2) * 0.15;
      mesh.scale.setScalar(pulse);
      material.opacity = revealProgress * 0.95;
    },
  };
}
