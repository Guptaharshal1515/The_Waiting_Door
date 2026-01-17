// Game Configuration
export const TILE_SIZE = 40;
export const PLAYER_SPEED = 2; // Slow movement
export const PLAYER_RADIUS = 10;
export const VISIBILITY_RADIUS = 150; // Fog of war radius

export const WAITING_THRESHOLD_MS = 10000; // 10 seconds of stillness required
export const DOOR_OPEN_TIME_MS = 2000; // Time for door to animate open

export const GHOST_SPAWN_CHANCE = 0.005; // Per frame chance
export const GHOST_MIN_DIST = 180;
export const GHOST_MAX_DIST = 300;
export const GHOST_FADE_SPEED = 0.01;

// Colors
export const COLOR_BG = '#09090b';
export const COLOR_WALL = '#18181b';
export const COLOR_FLOOR = '#27272a';
export const COLOR_PLAYER = '#e5e5e5';
export const COLOR_GHOST = 'rgba(200, 200, 255, 0.1)';
export const COLOR_DOOR_LOCKED = '#3f3f46';
export const COLOR_DOOR_OPEN = '#f4f4f5';
export const COLOR_DOOR_GLOW = 'rgba(255, 255, 255, 0.1)';

// Audio Frequencies
export const DRONE_FREQ_BASE = 65; // Hz
export const DRONE_FREQ_TENSION = 110; // Hz
