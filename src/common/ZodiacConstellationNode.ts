import { Shape } from "scenerystack/kite";
import { Node, Path } from "scenerystack/scenery";
import { ECLIPTIC_CONSTELLATIONS } from "./ZodiacConstellationsData.js";

// Radius at which constellation stars are drawn (in pixels) — inside the
// zodiac label ring so the stars appear between the orbits and the labels.
const STAR_RADIUS = 235;
// How much ecliptic latitude (radians) offsets the star radially from the ring.
const LAT_SCALE = 120;

// Build a Shape for each constellation's stick figure so we can batch them into
// a single Path for performance.
export class ZodiacConstellationNode extends Node {
  private readonly viewCenterX: number;
  private readonly viewCenterY: number;

  public constructor(viewCenterX: number, viewCenterY: number) {
    super();

    this.viewCenterX = viewCenterX;
    this.viewCenterY = viewCenterY;

    // ── Constellation stick-figure lines ────────────────────────────────
    const linesShape = new Shape();
    for (const constel of ECLIPTIC_CONSTELLATIONS) {
      for (const poly of constel.polylines) {
        let first = true;
        for (const idx of poly) {
          const star = constel.eclipticStars[idx];
          if (star === undefined) {
            continue;
          }
          const pos = this.starViewPos(star);
          if (pos === null) {
            continue;
          }
          if (first) {
            linesShape.moveTo(pos.x, pos.y);
            first = false;
          } else {
            linesShape.lineTo(pos.x, pos.y);
          }
        }
      }
    }
    const linesPath = new Path(linesShape, {
      stroke: "#556688",
      lineWidth: 0.5,
      opacity: 0.6,
    });
    this.addChild(linesPath);

    // ── Individual star dots ────────────────────────────────────────────
    const starsShape = new Shape();
    for (const constel of ECLIPTIC_CONSTELLATIONS) {
      for (const star of constel.eclipticStars) {
        const pos = this.starViewPos(star);
        if (pos !== null) {
          starsShape.circle(pos.x, pos.y, 1.2);
        }
      }
    }
    const starsPath = new Path(starsShape, {
      fill: "#aabbdd",
      stroke: null,
      opacity: 0.7,
    });
    this.addChild(starsPath);
  }

  /**
   * Project an ecliptic-coordinate star into view (screen) coordinates.
   * Ecliptic longitude → angle around the orbital centre.
   * Ecliptic latitude → small radial offset (above/below the ecliptic ring).
   */
  private starViewPos(star: { lon: number; lat: number }): { x: number; y: number } | null {
    const cx = this.viewCenterX;
    const cy = this.viewCenterY;

    // radial offset from star's ecliptic latitude (± ~0.3 rad for zodiac
    // constellations, giving roughly ± 36 px visual offset).
    const r = STAR_RADIUS + star.lat * LAT_SCALE;
    if (r <= 0) {
      return null;
    }

    return {
      x: cx + r * Math.cos(star.lon),
      y: cy - r * Math.sin(star.lon), // inverted Y for screen coords
    };
  }
}
