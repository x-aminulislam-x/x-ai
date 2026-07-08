import * as THREE from 'three';
import { ANIMATION_CONFIG } from './constants';

/**
 * Instantiates and configures the WebGLRenderer for the canvas element.
 * * @param canvas - The HTMLCanvasElement to attach the context to
 * @returns Fully configured THREE.WebGLRenderer instance
 */
export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, ANIMATION_CONFIG.MAX_PIXEL_RATIO));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  return renderer;
}
