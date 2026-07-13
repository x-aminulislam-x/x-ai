import * as THREE from 'three';

export type ParticleType = 'circle' | 'square' | 'line' | 'cross';

export interface ParticleData {
  type: ParticleType;
  mesh: THREE.Object3D;

  originalPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  position: THREE.Vector3;

  speed: number;
  amplitude: number;
  phase: number;

  neighbors: number[];
  stableNeighbors: Set<number>;

  // Stage 4 — Node → Interface morph
  cardIndex: number; // -1 until assigned by assignParticlesToCards()
  isCardSeed: boolean;
  dissolves: boolean;
  cardPosition: THREE.Vector3;
  cardWidth: number;
  cardHeight: number;

  lorenzPosition: THREE.Vector3;
  flowPosition: THREE.Vector3; // live position, advected forward each frame once joined

  originalQuaternion: THREE.Quaternion;

  baseScale: number;
  baseOpacity: number;

  shadowMesh?: THREE.Mesh;
}

export interface ParticleSettings {
  count: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
  };
  volume: {
    SPREAD_X: number;
    SPREAD_Y: number;
    SPREAD_Z: number;
  };
}
