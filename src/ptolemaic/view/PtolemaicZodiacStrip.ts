import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { ZODIAC_STRIP_HEIGHT, ZODIAC_STRIP_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

const TWO_PI = 2 * Math.PI;
const W = ZODIAC_STRIP_WIDTH;
const H = ZODIAC_STRIP_HEIGHT;
const LONGITUDE_TO_X = W / TWO_PI;
const BAR_HALF = 12; // half-height of ghosting bars (px)
const WRAP_LOW = 150; // Flash _loc13_ : wrap-edge thresholds (W/4)
const WRAP_HIGH = W - WRAP_LOW;

// Ghosting parameters (Flash Zodiac Strip.as)
const NUM_SEGMENTS = 20;
const MIN_ALPHA = 5;
const ALPHA_SPREAD = 50;

const SIGN_NAMES = [
  "Pisces",
  "Aquarius",
  "Capricorn",
  "Sagittarius",
  "Scorpius",
  "Libra",
  "Virgo",
  "Leo",
  "Cancer",
  "Gemini",
  "Taurus",
  "Aries",
];

/** Map ecliptic longitude to strip x — AS convention: x = (−λ · width/2π) mod width. */
function lonToX(lon: number): number {
  return (((-lon * LONGITUDE_TO_X) % W) + W) % W;
}

/**
 * Draw a wrap-aware filled bar between two strip x-coordinates into `shape`.
 * Port of Zodiac Strip.as setPlanetLongitude rectangle logic (lines 88–121).
 */
function addBar(shape: Shape, prevX: number, curX: number, top: number, bottom: number): void {
  if (curX > WRAP_HIGH && prevX < WRAP_LOW) {
    // Forward wrap: prevX → 0 and W → curX
    shape.rect(prevX, top, W - prevX, bottom - top).rect(0, top, curX, bottom - top);
  } else if (curX < WRAP_LOW && prevX > WRAP_HIGH) {
    // Backward wrap: curX → 0 and W → prevX
    shape.rect(curX, top, W - curX, bottom - top).rect(0, top, prevX, bottom - top);
  } else {
    shape.rect(Math.min(prevX, curX), top, Math.abs(curX - prevX), bottom - top);
  }
}

/** Ghosting bar color from the apparent angular step (Flash lines 80–86). */
function speedColor(deltaPx: number): string {
  let factor = 1 - deltaPx / 3;
  if (factor < 0) {
    factor = 0;
  }
  const g = Math.floor(216 - 112 * factor);
  return `rgb(${21 + g},${g},${g})`;
}

export class PtolemaicZodiacStrip extends Node {
  private readonly ghostSegments: Path[] = [];
  private readonly liveBar: Path;

  public constructor(model: PtolemaicModel) {
    super();

    // Background band
    const band = new Rectangle(0, 0, W, H, {
      fill: SolarSystemModelsColors.zodiacBandColorProperty,
      stroke: SolarSystemModelsColors.orbitColorProperty,
      lineWidth: 1,
    });
    this.addChild(band);

    // ── Ghosting segment layers (behind everything) ───────────────────────
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const p = new Path(null, {});
      this.ghostSegments.push(p);
      this.addChild(p);
    }
    this.liveBar = new Path(null, {});
    this.addChild(this.liveBar);

    // ── Dividers and sign labels ──────────────────────────────────────────
    const segW = W / 12;
    for (let i = 0; i < 12; i++) {
      const x = i * segW;
      const divider = new Rectangle(x, 0, 1, H, {
        fill: SolarSystemModelsColors.orbitColorProperty,
        opacity: 0.4,
      });
      this.addChild(divider);

      const label = new Text(SIGN_NAMES[i] ?? "", {
        font: new PhetFont(9),
        fill: SolarSystemModelsColors.textColorProperty,
        opacity: 0.5,
        centerX: (i + 0.5) * segW,
        centerY: H * 0.5,
        maxWidth: segW - 4,
      });
      this.addChild(label);
    }

    // ── Sun marker (yellow circle + "S" label) ────────────────────────────
    const sunMarker = new Circle(7, {
      fill: SolarSystemModelsColors.sunColorProperty,
      centerY: H / 2 + 12,
    });
    const sunLabel = new Text("S", {
      font: new PhetFont({ size: 9, weight: "bold" }),
      fill: SolarSystemModelsColors.sunColorProperty,
      centerY: H / 2 + 12,
    });
    this.addChild(sunMarker);
    this.addChild(sunLabel);

    // ── Planet marker (orange circle + "P" label) ─────────────────────────
    const planetMarker = new Circle(5, {
      fill: SolarSystemModelsColors.planetColorProperty,
      centerY: H / 2 - 12,
    });
    const planetLabel = new Text("P", {
      font: new PhetFont({ size: 9, weight: "bold" }),
      fill: SolarSystemModelsColors.planetColorProperty,
      centerY: H / 2 - 12,
    });
    this.addChild(planetMarker);
    this.addChild(planetLabel);

    // Sun marker: lonToX(sunAngle) — matches the planet-marker sign convention
    // (Flash setSunLongitude receives −sunAngle and multiplies by +W/2π, net lonToX).
    model.sunAngleProperty.link((sunAngle) => {
      const x = lonToX(sunAngle);
      sunMarker.centerX = x;
      sunLabel.centerX = x;
    });

    model.eclipticLongitudeProperty.link((lon) => {
      const x = lonToX(lon);
      planetMarker.centerX = x;
      planetLabel.centerX = x;
    });
  }

  /**
   * Rebuild the ghosting trail from the trail's longitude array (oldest→newest).
   * Port of Zodiac Strip.as setPlanetLongitude. Call after the trail updates.
   */
  public updateGhosting(lonArray: number[]): void {
    const top = H / 2 - BAR_HALF;
    const bottom = H / 2 + BAR_HALF;
    const alphaStep = ALPHA_SPREAD / NUM_SEGMENTS;

    const n = lonArray.length;
    if (n < 2) {
      for (const seg of this.ghostSegments) {
        seg.shape = null;
      }
      this.liveBar.shape = null;
      return;
    }

    const perSegment = (n - 1) / NUM_SEGMENTS;
    for (let s = 0; s < NUM_SEGMENTS; s++) {
      const segPath = this.ghostSegments[s];
      if (segPath === undefined) {
        continue;
      }
      const segStart = Math.floor(s * perSegment);
      const segEnd = Math.max(segStart + 1, Math.floor((s + 1) * perSegment));
      // Newest segment brightest (AS: current segment reaches minAlpha + alphaSpread).
      segPath.opacity = (MIN_ALPHA + (s + 1) * alphaStep) / 100;

      const shape = new Shape();
      let deltaSum = 0;
      let deltaCount = 0;
      for (let i = segStart + 1; i <= segEnd; i++) {
        const prevLon = lonArray[i - 1];
        const curLon = lonArray[i];
        if (prevLon === undefined || curLon === undefined) {
          continue;
        }
        const prevX = lonToX(prevLon);
        const curX = lonToX(curLon);
        let delta = (((curX - prevX) % W) + W) % W;
        if (delta > W / 2) {
          delta = W - delta;
        }
        deltaSum += delta;
        deltaCount++;
        addBar(shape, prevX, curX, top, bottom);
      }
      const avgDelta = deltaCount > 0 ? deltaSum / deltaCount : 0;
      segPath.fill = speedColor(avgDelta);
      segPath.shape = shape;
    }

    // Live bar: from the last sampled longitude to the current planet longitude.
    const lastLon = lonArray[n - 1];
    const curLon = lonArray[n - 2];
    if (lastLon !== undefined && curLon !== undefined) {
      const prevX = lonToX(curLon);
      const curX = lonToX(lastLon);
      let delta = (((curX - prevX) % W) + W) % W;
      if (delta > W / 2) {
        delta = W - delta;
      }
      this.liveBar.fill = speedColor(delta);
      const shape = new Shape();
      addBar(shape, prevX, curX, top, bottom);
      this.liveBar.shape = shape;
      this.liveBar.opacity = (MIN_ALPHA + ALPHA_SPREAD) / 100;
    }
  }
}
