import * as THREE from 'three';
import { ParticleType } from './types';

// Instantiate the reusable shared geometries once
const circleGeometry = new THREE.CircleGeometry(0.5, 10);
const squareGeometry = new THREE.PlaneGeometry(1, 1);
const lineGeometry = new THREE.PlaneGeometry(0.35, 2);

/**
 * Returns a shared, reusable geometry instance based on the particle type.
 * Note: 'cross' returns null here since it is constructed as a Group of meshes
 * rather than a single primitive geometry.
 */
export function getParticleGeometry(type: ParticleType): THREE.BufferGeometry | null {
  switch (type) {
    case 'circle':
      return circleGeometry;

    case 'square':
      return squareGeometry;

    case 'line':
      return lineGeometry;

    case 'cross':
    default:
      return null;
  }
}

/**
 * Clean up geometries when the scene or application context is destroyed.
 */
export function disposeParticleGeometries(): void {
  circleGeometry.dispose();
  squareGeometry.dispose();
  lineGeometry.dispose();
}
