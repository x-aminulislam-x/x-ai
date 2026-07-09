import * as THREE from 'three';

export type ParticleType = 'circle' | 'square' | 'line' | 'cross';

export interface ParticleData {
  type: ParticleType;
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  speed: number;
  amplitude: number;
  phase: number;
  neighbors: number[];
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
