import * as THREE from 'three';
import { PARTICLE_COLORS } from '../constants';
import { ParticleData } from '../particles/types';
import { CardSlot } from './dashboardLayout';
import { pointOnRectPerimeter } from './perimeter';
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
    initialDiameter / 2, // starts life as a perfect circle
    particle.baseOpacity
  );

  const mesh = particle.mesh;

  if (!(mesh instanceof THREE.Mesh)) {
    // 'cross' type is a Group — replace it with a single mesh instead.
    const replacement = new THREE.Mesh(cardGeometry, shaderMaterial);
    replacement.position.copy(mesh.position);
    // Card panels must be perfectly flat/aligned — do NOT inherit the
    // source particle's rotation (crosses/squares are randomly rotated
    // for visual variety in particleFactory.ts).
    replacement.rotation.set(0, 0, 0);
    replacement.scale.set(initialDiameter, initialDiameter, 1);

    scene.remove(mesh);
    scene.add(replacement);

    particle.mesh = replacement;
    return;
  }

  mesh.geometry = cardGeometry;
  mesh.material = shaderMaterial;
  mesh.rotation.set(0, 0, 0);
  mesh.scale.set(initialDiameter, initialDiameter, 1);
}

function setupBorderParticle(
  particle: ParticleData,
  slot: CardSlot,
  index: number,
  total: number
): void {
  particle.isCardSeed = false;
  particle.dissolves = false;

  const t = total > 0 ? index / total : 0;
  const localOffset = pointOnRectPerimeter(t, slot.width, slot.height);

  particle.cardPosition = new THREE.Vector3(
    slot.position.x + localOffset.x,
    slot.position.y + localOffset.y,
    slot.position.z
  );
}

function getMaterialColor(mesh: THREE.Object3D): THREE.Color | null {
  const target =
    mesh instanceof THREE.Mesh ? mesh : mesh.children.find(child => child instanceof THREE.Mesh);
  if (target instanceof THREE.Mesh && target.material instanceof THREE.MeshBasicMaterial) {
    return target.material.color.clone();
  }
  return null;
}

function getInitialOpacity(mesh: THREE.Object3D): number {
  const target =
    mesh instanceof THREE.Mesh ? mesh : mesh.children.find(child => child instanceof THREE.Mesh);
  if (target instanceof THREE.Mesh && target.material instanceof THREE.MeshBasicMaterial) {
    return target.material.opacity;
  }
  return 0.85;
}
