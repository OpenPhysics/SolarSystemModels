import { ProfileColorProperty } from "scenerystack/scenery";
import SolarSystemModelsNamespace from "./SolarSystemModelsNamespace.js";

const SolarSystemModelsColors = {
  backgroundColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),
  accentColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),
  panelBackgroundColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),
  panelBorderColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),
  textColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Celestial body colors (from AS hex values) ─────────────────────────────

  sunColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "sun", {
    default: "#f5c242",
    projector: "#cc8800",
  }),
  earthColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "earth", {
    default: "#4488ff",
    projector: "#0033cc",
  }),
  planetColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "planet", {
    default: "#ff8844",
    projector: "#cc4400",
  }),
  observerPlanetColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "observerPlanet", {
    default: "#8398bc",
    projector: "#334466",
  }),
  targetPlanetColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "targetPlanet", {
    default: "#989898",
    projector: "#555555",
  }),
  orbitColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "orbit", {
    default: "#c8c8c8",
    projector: "#888888",
  }),
  deferentColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "deferent", {
    default: "#4fc3f7",
    projector: "#0077aa",
  }),
  epicycleColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "epicycle", {
    default: "#81c784",
    projector: "#2e7d32",
  }),
  equantColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "equant", {
    default: "#ffb74d",
    projector: "#e65100",
  }),
  eccentricColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "eccentric", {
    default: "#ce93d8",
    projector: "#6a1b9a",
  }),
  vectorColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "vector", {
    default: "#a0a0a0",
    projector: "#444444",
  }),
  elongationColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "elongation", {
    default: "#ffcc02",
    projector: "#cc9900",
  }),
  zodiacBandColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "zodiacBand", {
    default: "#1e293b",
    projector: "#e8eaf6",
  }),

  // ── Sky / background ──────────────────────────────────────────────────────

  orbitAreaBackgroundColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "orbitAreaBackground", {
    default: "#0a0a18",
    projector: "#edf0f5",
  }),

  // ── Zodiac ring decorations ────────────────────────────────────────────────

  zodiacTickColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "zodiacTick", {
    default: "#888899",
    projector: "#555566",
  }),
  zodiacLabelColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "zodiacLabel", {
    default: "#aabbcc",
    projector: "#334455",
  }),
  zodiacBorderColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "zodiacBorder", {
    default: "#555577",
    projector: "#9999bb",
  }),
  zodiacDividerColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "zodiacDivider", {
    default: "#444455",
    projector: "#9999bb",
  }),

  // ── Constellation decorations ──────────────────────────────────────────────

  constellationLineColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "constellationLine", {
    default: "#4d6080",
    projector: "#99aacc",
  }),
  constellationStarColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "constellationStar", {
    default: "#aabbdd",
    projector: "#556677",
  }),

  // ── Ptolemaic reference geometry ──────────────────────────────────────────

  sunOrbitReferenceColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "sunOrbitReference", {
    default: "#333355",
    projector: "#99aabb",
  }),

  // ── Configurations timeline ────────────────────────────────────────────────

  timelineBackgroundColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineBackground", {
    default: "#0d1117",
    projector: "#f0f4f8",
  }),
  timelineBorderColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineBorder", {
    default: "#334466",
    projector: "#aabbcc",
  }),
  timelineEventColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineEvent", {
    default: "#446688",
    projector: "#334466",
  }),
  timelineSelectedColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineSelected", {
    default: "#223355",
    projector: "#ccd8e8",
  }),
  timelineCursorColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineCursor", {
    default: "#aabbcc",
    projector: "#334466",
  }),
  timelineLabelColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineLabel", {
    default: "#9999bb",
    projector: "#445566",
  }),
};

export default SolarSystemModelsColors;
