export const PARTICLE_COUNT = 2500;

export const PARTICLE_COLORS = {
  primary: '#5EEAD4', // Turquoise
  secondary: '#60A5FA', // Blue
  accent: '#7C3AED', // Purple
  highlight: '#FFFFFF', // White
} as const;

// Particle volume/distribution boundaries
export const VOLUME = {
  SPREAD_X: 30,
  SPREAD_Y: 20,
  SPREAD_Z: 16,
} as const;

// Camera settings
export const CAMERA_SETTINGS = {
  FOV: 38,
  NEAR: 0.1,
  FAR: 100,
  BASE_DISTANCE_Z: 14,
} as const;

// Animation and rendering configuration
export const ANIMATION_CONFIG = {
  RENDERER_BACKGROUND: '#050816',
  MAX_PIXEL_RATIO: 2,
  CAMERA_LERP_FACTOR: 0.03,
} as const;

export const STAGE2_CONFIG = {
  MIN_CONNECTION_RADIUS: 0,
  MAX_CONNECTION_RADIUS: 3.2,
  MAX_CONNECTIONS: 6,
  NEIGHBOR_UPDATE_INTERVAL: 0.1,
} as const;

export const STAGE4_CONFIG = {
  CARD_COUNT: 6,
  CARD_COLUMNS: 3,
  CARD_WIDTH: 3.2,
  CARD_HEIGHT: 2,
  CARD_GAP_X: 0.6,
  CARD_GAP_Y: 0.6,
  CARD_CORNER_RADIUS: 0.18,
  CARD_OPACITY: 0.95,
  BORDER_OPACITY: 0.9,
  BORDER_SCALE_MULTIPLIER: 0.6,
  MAX_BORDER_PARTICLES_PER_CARD: 60,
} as const;
