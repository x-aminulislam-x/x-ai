import * as THREE from 'three';
import { PARTICLE_COLORS } from '../constants';
import { ParticleData } from '../particles/types';
import { CardSlot } from './dashboardLayout';
import { createRoundedRectMaterial } from './roundedRectMaterial';

const cardGeometry = new THREE.PlaneGeometry(1, 1);

/**
 * One-time setup (called once at scene creation, right after stage3's
 * grid assignment): buckets particles into card clusters, picks a seed
 * particle per card to become the panel, and lays the rest out along
 * that card's border.
 */
export function assignParticlesToCards(
  scene: THREE.Scene,
  particles: ParticleData[],
  cardSlots: CardSlot[]
): void {
  const buckets: ParticleData[][] = cardSlots.map(() => []);

  for (const particle of particles) {
    particle.baseOpacity = getInitialOpacity(particle.mesh);

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < cardSlots.length; i++) {
      const distance = particle.targetPosition.distanceToSquared(cardSlots[i].position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    particle.cardIndex = nearestIndex;
    buckets[nearestIndex].push(particle);
  }

  cardSlots.forEach((slot, cardIndex) => {
    const bucket = buckets[cardIndex];
    if (bucket.length === 0) return;

    // Pick the seed particle for the main card panel
    let seed = bucket.find(p => p.type !== 'cross') ?? bucket[0];
    let seedDistance = seed.targetPosition.distanceToSquared(slot.position);

    for (const particle of bucket) {
      if (particle.type === 'cross') continue;
      const distance = particle.targetPosition.distanceToSquared(slot.position);
      if (distance < seedDistance) {
        seed = particle;
        seedDistance = distance;
      }
    }

    setupSeedParticle(scene, seed, slot);

    // BORDER REMOVAL: Every other particle in this bucket now dissolves.
    for (const particle of bucket) {
      if (particle === seed) continue;

      particle.cardIndex = cardIndex;
      particle.isCardSeed = false;
      particle.dissolves = true; // Force all remaining to dissolve
      particle.cardPosition = particle.targetPosition.clone();
    }
  });
}

function setupSeedParticle(scene: THREE.Scene, particle: ParticleData, slot: CardSlot): void {
  particle.isCardSeed = true;
  particle.dissolves = false;
  particle.cardPosition = slot.position.clone();
  particle.cardWidth = slot.width;
  particle.cardHeight = slot.height;

  const initialDiameter = particle.baseScale;
  const color = new THREE.Color(PARTICLE_COLORS.primary);

  const shaderMaterial = createRoundedRectMaterial(
    color,
    initialDiameter,
    initialDiameter / 2,
    particle.baseOpacity
  );

  const mesh = particle.mesh;
  let finalMesh: THREE.Mesh;

  if (!(mesh instanceof THREE.Mesh)) {
    const replacement = new THREE.Mesh(cardGeometry, shaderMaterial);
    replacement.position.copy(mesh.position);
    replacement.rotation.set(0, 0, 0);
    replacement.scale.set(initialDiameter, initialDiameter, 1);

    scene.remove(mesh);
    scene.add(replacement);

    particle.mesh = replacement;
    finalMesh = replacement;
  } else {
    mesh.geometry = cardGeometry;
    mesh.material = shaderMaterial;
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(initialDiameter, initialDiameter, 1);
    finalMesh = mesh;
  }

  // Stable local draw-order tag — cardInteraction.ts reads this every
  // frame to compute an absolute renderOrder per card (cardIndex * 10 +
  // localRenderOrder), which is what actually fixes cards' content
  // bleeding into each other once they overlap in the collapsed stack.
  finalMesh.userData.localRenderOrder = 1;
}

function getInitialOpacity(mesh: THREE.Object3D): number {
  const target =
    mesh instanceof THREE.Mesh ? mesh : mesh.children.find(child => child instanceof THREE.Mesh);
  if (target instanceof THREE.Mesh && target.material instanceof THREE.MeshBasicMaterial) {
    return target.material.opacity;
  }
  return 0.85;
}
