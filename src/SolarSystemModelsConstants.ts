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
export const DAYS_PER_YEAR = 365.24667;
export const PTOLEMAIC_DAYS_PER_SECOND = 40; // tunable wall-clock speed
export const CONFIGURATIONS_YEARS_PER_SECOND = 0.8;

// ── Ptolemaic parameter bounds (create Range instances in models) ──────────────

export const EPICYCLE_SIZE_RANGE = { min: 0, max: 1 } as const;
export const ECCENTRICITY_RANGE = { min: 0, max: 0.5 } as const;
export const MOTION_RATE_RANGE = { min: 0, max: 4.5 } as const; // deg/day
export const APOGEE_ANGLE_RANGE = { min: 0, max: 360 } as const; // degrees
export const ANIMATION_RATE_RANGE = { min: 0.1, max: 5 } as const;
export const PATH_DURATION_RANGE = { min: 0.5, max: 5 } as const; // years

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
  PTOLEMAIC_DAYS_PER_SECOND,
  CONFIGURATIONS_YEARS_PER_SECOND,
  EPICYCLE_SIZE_RANGE,
  ECCENTRICITY_RANGE,
  MOTION_RATE_RANGE,
  APOGEE_ANGLE_RANGE,
  ANIMATION_RATE_RANGE,
  PATH_DURATION_RANGE,
  PRESET_RADII,
});
