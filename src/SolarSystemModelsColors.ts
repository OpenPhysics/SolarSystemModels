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
};

export default SolarSystemModelsColors;
