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

export const STAGE6_CONFIG = {
  // Progress window where the DOM dashboard fades back out and the WebGL canvas fades back in
  CROSSFADE_REVERSE_END: 0.15,
  // Dashboard slot rect -> collapsed left column
  HANDOFF_REVERSE_END: 0.45,
  // Collapsed left column -> grid position, shrink back to particle size
  UNCOLLAPSE_START: 0.35,
  UNCOLLAPSE_END: 0.75,
  // Dissolved (background) particles fade back in
  REJOIN_START: 0.3,
  REJOIN_END: 0.7,
  // Camera drift + particle turbulence ramp back to full liveliness
  LIVELINESS_START: 0.5,
  LIVELINESS_END: 1.0,
} as const;

export const STAGE7_CONFIG = {
  SIGMA: 10,
  RHO: 28,
  BETA: 8 / 3,

  // Fine-resolution integration: far more raw points than particles.
  // These get resampled by arc length below — this is what removes the
  // gaps, since it decouples "how many points we compute" from "how
  // evenly spaced the final 2500 are."
  TRAJECTORY_DT: 0.004,
  TRAJECTORY_STEPS: 40000,
  WARMUP_STEPS: 2000,

  DISPLAY_RADIUS: 11,

  // Particles scale up slightly once fully joined so neighboring
  // particles along the curve visually overlap instead of leaving
  // sub-pixel gaps even after even spacing.
  PARTICLE_JOIN_SCALE: 2.4,

  // Camera orbit
  ORBIT_RADIUS: 22,
  ORBIT_BASE_ELEVATION: 0.3, // radians, slight default tilt once formed
  ORBIT_MAX_SCROLL_ANGLE: Math.PI * 0.6,
  ORBIT_AUTO_ROTATE_SPEED: 0.06,
  ORBIT_LERP_FACTOR: 0.04,

  // Mouse-drag 360 control
  DRAG_ENABLE_THRESHOLD: 0.9, // only draggable once the attractor is mostly formed
  DRAG_SENSITIVITY: 0.006,
  DRAG_ELEVATION_LIMIT: Math.PI / 2.2,
  DRAG_INERTIA_DECAY: 0.92,
} as const;
