import * as THREE from 'three';
import { PARTICLE_COUNT, VOLUME } from '../constants';
import { randFloatSpread } from '../utils/random';
import { pickRandomColor } from './particleColors';
import { createParticleMesh } from './particleFactory';
import { getScaleFromDepth } from './particleScale';
import { ParticleData, ParticleType } from './types';

/**
 * Determines a random particle type based on weighted distributions.
 */
function getRandomType(): ParticleType {
  const r = Math.random();

  if (r < 0.4) return 'circle';
  if (r < 0.65) return 'square';
  if (r < 0.85) return 'line';

  return 'cross';
}

/**
 * Generates and initializes the collection of scene particles.
 * * @param scene - The active THREE.Scene instance to attach meshes to
 * @returns An array containing the structural data for each generated particle
 */
export function createParticles(scene: THREE.Scene): ParticleData[] {
  const particles: ParticleData[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const type = getRandomType();

    // Spread coordinates uniformly inside the bounding volume limits
    const x = randFloatSpread(VOLUME.SPREAD_X);
    const y = randFloatSpread(VOLUME.SPREAD_Y);
    const z = randFloatSpread(VOLUME.SPREAD_Z);

    const position = new THREE.Vector3(x, y, z);
    const color = pickRandomColor();

    // Build the mesh/group deterministically via the factory
    const object = createParticleMesh(type, color);

    // Apply layout transformations
    object.position.copy(position);
    object.rotation.z = Math.random() * Math.PI;

    const scale = getScaleFromDepth(z);
    object.scale.setScalar(scale);

    // Mount structural instance directly to the scene graph
    scene.add(object);

    particles.push({
      type,
      mesh: object,

      originalPosition: position.clone(),
      targetPosition: position.clone(),
      position: position.clone(),

      // ------------------------------------------------------------------
      // Motion randomization (Chunk C4)
      // ------------------------------------------------------------------

      // Around ±20% variation
      speed: THREE.MathUtils.randFloat(0.8, 1.2),

      // Around ±25% variation
      amplitude: THREE.MathUtils.randFloat(0.75, 1.25),

      // Random starting point
      phase: Math.random() * Math.PI * 2,
      neighbors: [],
      stableNeighbors: new Set(),

      // Stage 4 — filled in later by assignParticlesToCards()
      cardIndex: -1,
      isCardSeed: false,
      dissolves: false,
      cardPosition: new THREE.Vector3(),
      cardWidth: 0,
      cardHeight: 0,
      baseScale: scale,
      baseOpacity: 0.85,
    });
  }

  return particles;
}
