import { Color, ProfileColorProperty } from "scenerystack/scenery";
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
    default: "#ff6666",
    projector: "#cc4400",
  }),
  observerPlanetColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "observerPlanet", {
    default: "#83a2fc",
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
  activeConstellationColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "activeConstellation", {
    default: "#1b6f4b",
    projector: "#1b6f4b",
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
  configurationsOrbitAreaBackgroundColorProperty: new ProfileColorProperty(
    SolarSystemModelsNamespace,
    "configurationsOrbitAreaBackground",
    {
      default: "#060d1a",
      projector: "#e8ecf2",
    },
  ),

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
  configurationsZodiacGlyphColorProperty: new ProfileColorProperty(
    SolarSystemModelsNamespace,
    "configurationsZodiacGlyph",
    {
      default: "#aaaacc",
      projector: "#445566",
    },
  ),
  configurationsZodiacDividerColorProperty: new ProfileColorProperty(
    SolarSystemModelsNamespace,
    "configurationsZodiacDivider",
    {
      default: "#334455",
      projector: "#99aabb",
    },
  ),

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
  timelineAxisColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineAxis", {
    default: "#1a2a44",
    projector: "#ccd8e8",
  }),
  timelineEventColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineEvent", {
    default: "#446688",
    projector: "#334466",
  }),
  timelineSelectedHighlightColorProperty: new ProfileColorProperty(
    SolarSystemModelsNamespace,
    "timelineSelectedHighlight",
    {
      default: new Color(51, 85, 119, 170 / 255),
      projector: new Color(136, 153, 187, 136 / 255),
    },
  ),
  timelineSelectedColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineSelected", {
    default: "#223355",
    projector: "#ccd8e8",
  }),
  timelineCursorColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineCursor", {
    default: "#aabbcc",
    projector: "#334466",
  }),
  timelineDirectionLabelColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineDirectionLabel", {
    default: "#5577aa",
    projector: "#334466",
  }),
  timelineEventNameLabelColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineEventNameLabel", {
    default: "#99aabb",
    projector: "#445566",
  }),
  timelineTickLabelColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineTickLabel", {
    default: "#556677",
    projector: "#667788",
  }),
  timelineLabelColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "timelineLabel", {
    default: "#9999bb",
    projector: "#445566",
  }),

  // ── Ptolemaic path trail ───────────────────────────────────────────────────

  pathTrailLiveSegmentColorProperty: new ProfileColorProperty(SolarSystemModelsNamespace, "pathTrailLiveSegment", {
    default: "#ff0000",
    projector: "#cc0000",
  }),
};

/** Ghosting bar tint from apparent zodiac-strip angular step (Flash Zodiac Strip.as). */
export function zodiacGhostBarColor(deltaPx: number): Color {
  let factor = 1 - deltaPx / 3;
  if (factor < 0) {
    factor = 0;
  }
  const g = Math.floor(216 - 112 * factor);
  return new Color(21 + g, g, g);
}

export default SolarSystemModelsColors;
