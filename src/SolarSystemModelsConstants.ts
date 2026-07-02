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
export const ZODIAC_LABEL_MAX_WIDTH = 55; // px — max width of a zodiac sign label
export const ZODIAC_TICK_INNER_RADIUS = 250; // px — zodiac sign boundary tick, inner end
export const ZODIAC_TICK_OUTER_RADIUS = 270; // px — zodiac sign boundary tick, outer end
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

// ── Configurations orbital view layout ────────────────────────────────────────

export const CONFIGURATIONS_ORBIT_CENTER_X = 285; // px — Sun maps here (x)
export const CONFIGURATIONS_ORBIT_CENTER_Y = 285; // px — Sun maps here (y)
export const CONFIGURATIONS_ORBIT_MARGIN = 60; // px — margin around orbit area
export const CONFIGURATIONS_TIMELINE_WIDTH = 210; // px
export const CONFIGURATIONS_TIMELINE_HEIGHT = 350; // px
export const CONFIGURATIONS_TIMELINE_CYCLE_HEIGHT = 120; // px — vertical px per synodic cycle
export const CONFIGURATIONS_ELONGATION_ARC_RADIUS = 35; // px — elongation indicator arc radius

// Configurations preset orbital radii (AU) live in
// configurations/model/ConfigurationsPlanet.ts, next to the screen that uses
// them — not duplicated here.

SolarSystemModelsNamespace.register("SolarSystemModelsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PANEL_WIDTH,
  ORBIT_VIEW_SCALE,
  ORBIT_VIEW_CENTER_X,
  ORBIT_VIEW_CENTER_Y,
  ZODIAC_LABEL_RADIUS,
  ZODIAC_LABEL_MAX_WIDTH,
  ZODIAC_TICK_INNER_RADIUS,
  ZODIAC_TICK_OUTER_RADIUS,
  ZODIAC_STRIP_HEIGHT,
  ZODIAC_STRIP_WIDTH,
  PTOLEMAIC_DEFERENT_RADIUS,
  PTOLEMAIC_SUN_ORBIT_RADIUS,
  DAYS_PER_YEAR,
  PTOLEMAIC_DAYS_PER_SECOND,
  CONFIGURATIONS_YEARS_PER_SECOND,
  CONFIGURATIONS_ORBIT_CENTER_X,
  CONFIGURATIONS_ORBIT_CENTER_Y,
  CONFIGURATIONS_ORBIT_MARGIN,
  CONFIGURATIONS_TIMELINE_WIDTH,
  CONFIGURATIONS_TIMELINE_HEIGHT,
  CONFIGURATIONS_TIMELINE_CYCLE_HEIGHT,
  CONFIGURATIONS_ELONGATION_ARC_RADIUS,
  EPICYCLE_SIZE_RANGE,
  ECCENTRICITY_RANGE,
  MOTION_RATE_RANGE,
  APOGEE_ANGLE_RANGE,
  ANIMATION_RATE_RANGE,
  PATH_DURATION_RANGE,
});
