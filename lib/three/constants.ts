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
  AIZAWA_A: 0.95,
  AIZAWA_B: 0.7,
  AIZAWA_C: 0.6,
  AIZAWA_D: 3.5,
  AIZAWA_E: 0.25,
  AIZAWA_F: 0.1,

  TRAJECTORY_DT: 0.01,
  TRAJECTORY_STEPS: 30000,
  WARMUP_STEPS: 2000,

  DISPLAY_RADIUS: 11,
  PARTICLE_JOIN_SCALE: 2.4,

  // Live-flow seeding & integration (replaces static point assignment)
  FLOW_SEED_SCALE: 0.05, // scales particle.originalPosition down into the Aizawa basin
  FLOW_SEED_CLAMP: 1.4, // safety clamp so no seed starts outside the basin and diverges
  FLOW_DT: 0.006,
  FLOW_SUBSTEPS_PER_FRAME: 2, // RK4 steps run per rendered frame — tune this for faster/slower "assembly"

  // Camera orbit
  ORBIT_RADIUS: 22,
  ORBIT_BASE_ELEVATION: 0.3,
  ORBIT_MAX_SCROLL_ANGLE: Math.PI * 0.6,
  ORBIT_AUTO_ROTATE_SPEED: 0.006,
  ORBIT_LERP_FACTOR: 0.04,

  // Mouse-drag 360 control
  DRAG_ENABLE_THRESHOLD: 0.9,
  DRAG_SENSITIVITY: 0.006,
  DRAG_ELEVATION_LIMIT: Math.PI / 2.2,
  DRAG_INERTIA_DECAY: 0.92,

  // Scroll/pinch-wheel zoom
  ZOOM_MIN_RADIUS: 10,
  ZOOM_MAX_RADIUS: 55,
  ZOOM_SENSITIVITY: 0.02,

  // Hover dims the auto-rotate spin (not drag — drag stays full-speed
  // responsive) down to this fraction of normal speed
  HOVER_SPIN_DAMPING: 0,
  HOVER_LERP_FACTOR: 0.08,

  AZIMUTH_RETURN_LERP: 0.03, // how fast tilt eases back to level after releasing a drag
  OBJECT_HOVER_RADIUS_MARGIN: 1.15, // hit-sphere size for the zoom-hover check, item 1

  FLOW_SPEED: 0.025, // how fast particles advect along the live Aizawa flow once joined
} as const;
