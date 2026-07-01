import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import { ECLIPTIC_CONSTELLATIONS } from "../../common/ZodiacConstellationsData.js";
import { ZodiacStripBackground } from "../../common/ZodiacStripBackground.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { ZODIAC_STRIP_HEIGHT, ZODIAC_STRIP_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

const TWO_PI = 2 * Math.PI;
const LONGITUDE_TO_X = ZODIAC_STRIP_WIDTH / TWO_PI;

/** Map ecliptic longitude to strip x — AS convention: x = (−λ · width/2π) mod width. */
function lonToX(lon: number): number {
  return (((-lon * LONGITUDE_TO_X) % ZODIAC_STRIP_WIDTH) + ZODIAC_STRIP_WIDTH) % ZODIAC_STRIP_WIDTH;
}

/** Map ecliptic latitude to vertical offset from strip midline (positive = up). */
function latToY(lat: number): number {
  return -lat * LONGITUDE_TO_X;
}

/**
 * Build a single Path shape containing all constellation stick-figure lines
 * plus star dots for the strip.  Three copies are drawn at x-offsets of 0,
 * STRIP_WIDTH, and 2·STRIP_WIDTH so the pattern wraps seamlessly.
 */
function buildConstellationShape(width: number, height: number): Shape {
  const shape = new Shape();

  for (let copy = 0; copy < 3; copy++) {
    const xOff = copy * width;

    for (const constel of ECLIPTIC_CONSTELLATIONS) {
      // Polylines
      for (const poly of constel.polylines) {
        let first = true;
        for (const idx of poly) {
          const star = constel.eclipticStars[idx];
          if (star === undefined) {
            continue;
          }
          const sx = lonToX(star.lon) + xOff;
          const sy = height / 2 + latToY(star.lat);
          if (first) {
            shape.moveTo(sx, sy);
            first = false;
          } else {
            shape.lineTo(sx, sy);
          }
        }
      }

      // Dots
      for (const star of constel.eclipticStars) {
        const cx = lonToX(star.lon) + xOff;
        const cy = height / 2 + latToY(star.lat);
        shape.circle(cx, cy, 1.2);
      }
    }
  }

  return shape;
}

export class PtolemaicZodiacStrip extends Node {
  public constructor(model: PtolemaicModel) {
    super();

    const z = StringManager.getInstance().getZodiacStrings();
    // Reversed order: ecliptic strip maps increasing longitude rightward, but
    // the AS convention maps longitude leftward (negative x), so Pisces appears first.
    const SIGN_NAME_PROPS = [
      z.piscesStringProperty,
      z.aquariusStringProperty,
      z.capricornStringProperty,
      z.sagittariusStringProperty,
      z.scorpiusStringProperty,
      z.libraStringProperty,
      z.virgoStringProperty,
      z.leoStringProperty,
      z.cancerStringProperty,
      z.geminiStringProperty,
      z.taurusStringProperty,
      z.ariesStringProperty,
    ];

    // ── Shared band + sign labels + dividers ──────────────────────────────
    this.addChild(new ZodiacStripBackground(ZODIAC_STRIP_WIDTH, ZODIAC_STRIP_HEIGHT, SIGN_NAME_PROPS));

    // ── Constellation stick figures ──────────────────────────────────────
    const constelShape = buildConstellationShape(ZODIAC_STRIP_WIDTH, ZODIAC_STRIP_HEIGHT);
    // Clip to the strip
    const clipRect = new Rectangle(0, 0, ZODIAC_STRIP_WIDTH, ZODIAC_STRIP_HEIGHT);
    const constelPath = new Path(constelShape, {
      fill: null,
      stroke: SolarSystemModelsColors.constellationLineColorProperty,
      lineWidth: 0.5,
      opacity: 0.5,
      clipArea: clipRect.shape,
    });
    this.addChild(constelPath);

    // ── Sun marker (yellow circle) ──────────────────────────────────────
    const sunMarker = new Circle(7, {
      fill: SolarSystemModelsColors.sunColorProperty,
      centerY: ZODIAC_STRIP_HEIGHT / 2 + 10,
    });
    this.addChild(sunMarker);

    // ── Planet marker (orange circle) ───────────────────────────────────
    const planetMarker = new Circle(5, {
      fill: SolarSystemModelsColors.planetColorProperty,
      centerY: ZODIAC_STRIP_HEIGHT / 2 - 10,
    });
    this.addChild(planetMarker);

    // Link sun
    model.sunAngleProperty.link((sunAngle) => {
      sunMarker.centerX = lonToX(-sunAngle);
    });

    // Link planet ecliptic longitude
    model.eclipticLongitudeProperty.link((lon) => {
      planetMarker.centerX = lonToX(lon);
    });
  }
}
