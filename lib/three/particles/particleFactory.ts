import * as THREE from 'three';
import { getParticleGeometry } from './particleGeometry';
import { ParticleType } from './types';

/**
 * Deterministically creates an Object3D particle mesh or group based on type and color.
 * No internal randomness is applied.
 */
export function createParticleMesh(type: ParticleType, color: THREE.Color): THREE.Object3D {
  // Common material configuration
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  if (type === 'cross') {
    // Structural layout for the cross shape composite
    const horizontal = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.22), material);
    const vertical = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 2), material);

    const group = new THREE.Group();
    group.add(horizontal);
    group.add(vertical);

    return group;
  }

  // Handle standard primitives using our shared geometries
  const geometry = getParticleGeometry(type);
  if (!geometry) {
    // Fallback safeguard
    return new THREE.Mesh(new THREE.BufferGeometry(), material);
  }

  return new THREE.Mesh(geometry, material);
}
