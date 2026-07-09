import * as THREE from 'three';

export interface MouseState {
  /**
   * Screen coordinates in pixels.
   */
  screen: THREE.Vector2;

  /**
   * Previous screen coordinates.
   */
  previous: THREE.Vector2;

  /**
   * Normalized Device Coordinates (-1 → 1)
   */
  normalized: THREE.Vector2;

  /**
   * Mouse delta in pixels.
   */
  delta: THREE.Vector2;

  /**
   * Pixels / second
   */
  velocity: THREE.Vector2;
}

export function createMouseTracker() {
  const mouse: MouseState = {
    screen: new THREE.Vector2(),
    previous: new THREE.Vector2(),
    normalized: new THREE.Vector2(),
    delta: new THREE.Vector2(),
    velocity: new THREE.Vector2(),
  };

  let previousTime = performance.now();

  function onPointerMove(event: PointerEvent) {
    const now = performance.now();

    const dt = Math.max((now - previousTime) / 1000, 0.0001);

    mouse.previous.copy(mouse.screen);

    mouse.screen.set(event.clientX, event.clientY);

    mouse.delta.subVectors(mouse.screen, mouse.previous);

    mouse.velocity.copy(mouse.delta).divideScalar(dt);

    mouse.normalized.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    previousTime = now;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  function dispose() {
    window.removeEventListener('pointermove', onPointerMove);
  }

  return {
    mouse,
    dispose,
  };
}
