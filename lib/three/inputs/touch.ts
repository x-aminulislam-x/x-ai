import * as THREE from 'three';

export interface TouchState {
  position: THREE.Vector2;
  isActive: boolean;
}

export function createTouchTracker() {
  const touch: TouchState = {
    position: new THREE.Vector2(),
    isActive: false,
  };

  // Touch listener hooks will be appended here later

  function dispose() {}

  return { touch, dispose };
}
