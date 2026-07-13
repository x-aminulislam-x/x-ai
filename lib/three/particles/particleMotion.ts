import * as THREE from 'three';
import { MouseState } from '../inputs/mouse';
import { scrollTimeline } from '../stage2';
import { ParticleData } from './types';

const FLOAT_SPEED = 0.18;
const FLOAT_AMPLITUDE = 0.08;

const TURBULENCE_SPEED = 0.07;
const TURBULENCE_AMPLITUDE = 0.035;

// Magnetic field
const MAGNET_RADIUS = 2.4;
const MAGNET_STRENGTH = 0.5;

const raycaster = new THREE.Raycaster();

const interactionPlane = new THREE.Plane();

const mouseWorld = new THREE.Vector3();

export function updateParticleMotion(
  particles: ParticleData[],
  mouse: MouseState,
  camera: THREE.PerspectiveCamera,
  elapsed: number,
  liveliness = 0,
  lorenzProgress = 0
) {
  // ---------------------------------------------------------------------------
  // Convert mouse from Normalized Device Coordinates to world space.
  // ---------------------------------------------------------------------------

  // Build a ray from the current mouse position.
  raycaster.setFromCamera(mouse.normalized, camera);

  for (const particle of particles) {
    // -------------------------------------------------------------------------
    // Depth influence
    // -------------------------------------------------------------------------

    const depth = THREE.MathUtils.clamp((particle.position.z + 8) / 16, 0, 1);

    const depthSpeed = THREE.MathUtils.lerp(0.85, 1.15, depth);

    const depthAmplitude = THREE.MathUtils.lerp(0.8, 1.15, depth);

    const progress = scrollTimeline.getProgress();

    const motionProgress = progress * (1 - liveliness);

    const speed =
      FLOAT_SPEED * depthSpeed * particle.speed * THREE.MathUtils.lerp(1, 0.55, motionProgress);

    const turbulenceSpeed =
      TURBULENCE_SPEED *
      depthSpeed *
      particle.speed *
      THREE.MathUtils.lerp(1, 0.35, motionProgress);

    // As the system organizes, motion becomes calmer.
    const calmFactor = THREE.MathUtils.lerp(1, 0.25, motionProgress);

    const amplitude = FLOAT_AMPLITUDE * depthAmplitude * particle.amplitude * calmFactor;

    const turbulenceAmplitude =
      TURBULENCE_AMPLITUDE * depthAmplitude * particle.amplitude * calmFactor;

    const phase = particle.phase;

    // -------------------------------------------------------------------------
    // Floating
    // -------------------------------------------------------------------------

    const floatX = Math.sin(elapsed * speed + phase) * amplitude;

    const floatY = Math.cos(elapsed * speed * 1.15 + phase) * amplitude;

    const floatZ = Math.sin(elapsed * speed * 0.8 + phase) * amplitude * 0.6;

    // -------------------------------------------------------------------------
    // Turbulence
    // -------------------------------------------------------------------------

    const turbulenceX =
      (Math.sin(elapsed * turbulenceSpeed + phase * 2.3) +
        Math.cos(elapsed * turbulenceSpeed * 0.63 + phase * 1.7)) *
      0.5 *
      turbulenceAmplitude;

    const turbulenceY =
      (Math.cos(elapsed * turbulenceSpeed * 1.18 + phase * 3.1) +
        Math.sin(elapsed * turbulenceSpeed * 0.84 + phase * 0.9)) *
      0.5 *
      turbulenceAmplitude;

    const turbulenceZ =
      (Math.sin(elapsed * turbulenceSpeed * 0.92 + phase * 1.8) +
        Math.cos(elapsed * turbulenceSpeed * 1.07 + phase * 2.6)) *
      0.5 *
      turbulenceAmplitude *
      0.7;

    // -------------------------------------------------------------------------
    // Base animated position
    // -------------------------------------------------------------------------

    particle.position.lerpVectors(particle.originalPosition, particle.targetPosition, progress);

    if (lorenzProgress > 0) {
      const gridPosition = particle.position.clone();
      particle.position.lerpVectors(
        gridPosition,
        particle.lorenzPosition,
        THREE.MathUtils.smoothstep(lorenzProgress, 0, 1)
      );
    }

    const x = particle.position.x + floatX + turbulenceX;

    const y = particle.position.y + floatY + turbulenceY;

    const breathe = Math.sin(elapsed * 0.8) * THREE.MathUtils.lerp(0, 0.03, progress);

    const z = particle.position.z + floatZ + turbulenceZ + breathe;

    // -------------------------------------------------------------------------
    // Magnetic attraction
    // -------------------------------------------------------------------------

    // Create a plane at the particle's original depth.
    interactionPlane.set(new THREE.Vector3(0, 0, 1), -particle.position.z);

    // Find where the mouse ray intersects that plane.
    raycaster.ray.intersectPlane(interactionPlane, mouseWorld);

    const dx = mouseWorld.x - x;
    const dy = mouseWorld.y - y;

    const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

    let magnetX = 0;
    let magnetY = 0;

    if (distanceToMouse < MAGNET_RADIUS) {
      const influence = 1 - distanceToMouse / MAGNET_RADIUS;

      const strength = influence * influence * MAGNET_STRENGTH;

      magnetX = dx * strength;
      magnetY = dy * strength;
    }

    particle.mesh.position.x = THREE.MathUtils.lerp(particle.mesh.position.x, x + magnetX, 0.12);

    particle.mesh.position.y = THREE.MathUtils.lerp(particle.mesh.position.y, y + magnetY, 0.12);

    particle.mesh.position.z = THREE.MathUtils.lerp(particle.mesh.position.z, z, 0.12);
  }
}
