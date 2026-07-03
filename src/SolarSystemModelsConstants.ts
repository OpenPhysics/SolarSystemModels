import SolarSystemModelsNamespace from "./SolarSystemModelsNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

export const SCREEN_VIEW_MARGIN = 20;
export const PANEL_CORNER_RADIUS = 6;
export const PANEL_WIDTH = 310;

// ── Ptolemaic orbital view layout ──────────────────────────────────────────────

export const ORBIT_VIEW_SCALE = 95; // px per model unit
export const ORBIT_VIEW_CENTER_X = 295; // px — model origin maps here (x)
export const ORBIT_VIEW_CENTER_Y = 300; // px — model origin maps here (y)
export const ZODIAC_LABEL_RADIUS = 285; // px — zodiac sign label ring
export const ZODIAC_STRIP_HEIGHT = 80; // px — "view from Earth" strip height
export const ZODIAC_STRIP_WIDTH = 600; // px — width matching AS factor 600/2π

// ── Ptolemaic physics (normalized units, deferent = 1) ─────────────────────────

export const PTOLEMAIC_DEFERENT_RADIUS = 1; // deferent radius in model units
export const PTOLEMAIC_SUN_ORBIT_RADIUS = 2.25; // AS: 225 px / 100 px deferent
// Physics days-per-year (used for orbital rates); the Flash Ptolemaic uses this value.
export const DAYS_PER_YEAR = 365.24667;
// Display-only days-per-year (Flash Timeline.as:150 uses 365.24 for readouts).
export const DISPLAY_DAYS_PER_YEAR = 365.24;

// Ptolemaic animation: slider value is days-per-second directly (AS: 1–500).
export const PTOLEMAIC_ANIMATION_RATE_RANGE = { min: 1, max: 500 } as const;
export const PTOLEMAIC_DEFAULT_ANIMATION_RATE = 100; // AS default

// ── Ptolemaic parameter bounds (create Range instances in models) ──────────────
// Ranges transcribed from the Flash slider init values (frame_1 CLIPACTIONRECORDs).

export const EPICYCLE_SIZE_RANGE = { min: 0, max: 0.75 } as const; // AS slider 0–0.75
export const ECCENTRICITY_RANGE = { min: 0, max: 0.2 } as const; // AS slider 0–0.2
export const MOTION_RATE_RANGE = { min: 0.01, max: 4.5 } as const; // AS slider 0.01–4.5, deg/day
export const APOGEE_ANGLE_RANGE = { min: 0, max: 360 } as const; // degrees
export const PATH_DURATION_RANGE = { min: 0.3, max: 10 } as const; // AS slider 0.3–10 yr

// Configurations animation: user-facing speed multiplier (both screens share a
// generic animation-rate concept via TimeModel, but each screen scales it).
export const ANIMATION_RATE_RANGE = { min: 0.1, max: 5 } as const;

// ── Configurations orbital view layout ────────────────────────────────────────

export const CONFIGURATIONS_ORBIT_CENTER_X = 285; // px — Sun maps here (x)
export const CONFIGURATIONS_ORBIT_CENTER_Y = 285; // px — Sun maps here (y)
export const CONFIGURATIONS_ORBIT_MARGIN = 60; // px — margin around orbit area
export const CONFIGURATIONS_TIMELINE_WIDTH = 210; // px
export const CONFIGURATIONS_TIMELINE_HEIGHT = 350; // px
export const CONFIGURATIONS_ELONGATION_ARC_RADIUS = 35; // px — elongation indicator arc radius

// ── Configurations parameter bounds (AS slider ranges) ─────────────────────────

export const SEMIMAJOR_AXIS_RANGE = { min: 0.25, max: 10 } as const; // AS slider 0.25–10 AU
export const PAUSE_TIME_RANGE = { min: 1, max: 15 } as const; // AS slider 1–15 s

// ── Configurations preset orbital radii (AU) ───────────────────────────────────

export const PRESET_RADII = {
  mercury: 0.39,
  venus: 0.72,
  earth: 1.0,
  mars: 1.52,
  jupiter: 5.2,
  saturn: 9.54,
} as const;

SolarSystemModelsNamespace.register("SolarSystemModelsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PANEL_WIDTH,
  ORBIT_VIEW_SCALE,
  ORBIT_VIEW_CENTER_X,
  ORBIT_VIEW_CENTER_Y,
  ZODIAC_LABEL_RADIUS,
  ZODIAC_STRIP_HEIGHT,
  ZODIAC_STRIP_WIDTH,
  PTOLEMAIC_DEFERENT_RADIUS,
  PTOLEMAIC_SUN_ORBIT_RADIUS,
  DAYS_PER_YEAR,
  DISPLAY_DAYS_PER_YEAR,
  PTOLEMAIC_ANIMATION_RATE_RANGE,
  PTOLEMAIC_DEFAULT_ANIMATION_RATE,
  CONFIGURATIONS_ORBIT_CENTER_X,
  CONFIGURATIONS_ORBIT_CENTER_Y,
  CONFIGURATIONS_ORBIT_MARGIN,
  CONFIGURATIONS_TIMELINE_WIDTH,
  CONFIGURATIONS_TIMELINE_HEIGHT,
  CONFIGURATIONS_ELONGATION_ARC_RADIUS,
  SEMIMAJOR_AXIS_RANGE,
  PAUSE_TIME_RANGE,
  EPICYCLE_SIZE_RANGE,
  ECCENTRICITY_RANGE,
  MOTION_RATE_RANGE,
  APOGEE_ANGLE_RANGE,
  ANIMATION_RATE_RANGE,
  PATH_DURATION_RANGE,
  PRESET_RADII,
});
