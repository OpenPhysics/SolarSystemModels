/**
 * ConfigurationsZodiacStrip.ts
 *
 * "View from the observer" zodiac strip for the Planetary Configurations screen.
 * Port of Flash `configurationsSimulator` / `Zodiac Strip.as`: constellation
 * starfield, east/west labels, sun + planet markers with vertical ticks, wrap-
 * aware elongation readout, and drag-to-pan.
 *
 * Longitude → x uses the Flash convention: `x = (−λ · W / 2π) mod W`.
 * Latitude → y uses the same angular scale about the strip midline.
 * Constellation art comes from shared `ECLIPTIC_CONSTELLATIONS` (same NAAP data
 * as the Flash strip bitmap overlays).
 */

import { Multilink, NumberProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, DragListener, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Tandem } from "scenerystack/tandem";
import { ECLIPTIC_CONSTELLATIONS } from "../../common/ZodiacConstellationsData.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { ZODIAC_STRIP_HEIGHT, ZODIAC_STRIP_WIDTH } from "../../SolarSystemModelsConstants.js";
import SolarSystemModelsNamespace from "../../SolarSystemModelsNamespace.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const W = ZODIAC_STRIP_WIDTH;
const H = ZODIAC_STRIP_HEIGHT;
const TWO_PI = 2 * Math.PI;
const LONGITUDE_TO_X = W / TWO_PI;
const STAR_RADIUS = 1.15;
const ELONGATION_Y = H + 14;
const TICK_FONT = new PhetFont({ size: 10, weight: "bold" });
const DIRECTION_FONT = new PhetFont({ size: 11, weight: "bold" });

function mod(x: number, m: number): number {
  return ((x % m) + m) % m;
}

/** Flash / MotionsOfTheSun strip mapping: x = (−λ · W / 2π) mod W. */
function lonToX(lon: number): number {
  return mod(-lon * LONGITUDE_TO_X, W);
}

export class ConfigurationsZodiacStrip extends Node {
  public constructor(model: ConfigurationsModel) {
    super();

    const s = StringManager.getInstance().getConfigurationsStrings();

    // Panning offset (px) — drag the strip horizontally (Flash setOffset).
    const offsetProperty = new NumberProperty(0);

    // ── Band background (also the drag surface) ──────────────────────────
    const band = new Rectangle(0, 0, W, H, {
      fill: SolarSystemModelsColors.zodiacBandColorProperty,
      stroke: SolarSystemModelsColors.zodiacBorderColorProperty,
      lineWidth: 1,
      cursor: "ew-resize",
    });
    this.addChild(band);

    // ── Clipped starfield with triple copies for wrap-pan (Flash ×3) ─────
    const starfieldClip = new Node({ clipArea: Shape.rectangle(0, 0, W, H) });
    this.addChild(starfieldClip);

    const starfieldSlider = new Node({ pickable: false });
    starfieldClip.addChild(starfieldSlider);

    for (const dx of [-W, 0, W]) {
      const layer = buildConstellationArtNode();
      layer.x = dx;
      starfieldSlider.addChild(layer);
    }

    // ── East / west end labels ───────────────────────────────────────────
    const eastLabel = new Text(s.eastDirectionStringProperty, {
      font: DIRECTION_FONT,
      fill: SolarSystemModelsColors.zodiacLabelColorProperty,
      rotation: -Math.PI / 2,
      pickable: false,
    });
    eastLabel.centerX = 10;
    eastLabel.centerY = H / 2;
    this.addChild(eastLabel);

    const westLabel = new Text(s.westDirectionStringProperty, {
      font: DIRECTION_FONT,
      fill: SolarSystemModelsColors.zodiacLabelColorProperty,
      rotation: Math.PI / 2,
      pickable: false,
    });
    westLabel.centerX = W - 10;
    westLabel.centerY = H / 2;
    this.addChild(westLabel);

    // ── Markers layer (reorder sun/planet without sinking behind the band) ─
    const markerLayer = new Node({ pickable: false });
    this.addChild(markerLayer);

    const sunMarker = new Circle(6, {
      fill: SolarSystemModelsColors.sunColorProperty,
      centerY: H / 2,
    });
    const planetMarker = new Circle(5, {
      fill: SolarSystemModelsColors.targetPlanetColorProperty,
      centerY: H / 2,
    });
    markerLayer.addChild(sunMarker);
    markerLayer.addChild(planetMarker);

    const sunTick = new Path(null, {
      stroke: SolarSystemModelsColors.zodiacTickColorProperty,
      lineWidth: 1,
      pickable: false,
    });
    const planetTick = new Path(null, {
      stroke: SolarSystemModelsColors.zodiacTickColorProperty,
      lineWidth: 1,
      pickable: false,
    });
    this.addChild(sunTick);
    this.addChild(planetTick);

    const sunLabel = new Text(s.zodiacSunLabelStringProperty, {
      font: TICK_FONT,
      fill: SolarSystemModelsColors.sunColorProperty,
      pickable: false,
    });
    const planetLabel = new Text(s.zodiacPlanetLabelStringProperty, {
      font: TICK_FONT,
      fill: SolarSystemModelsColors.targetPlanetColorProperty,
      pickable: false,
    });
    this.addChild(sunLabel);
    this.addChild(planetLabel);

    // ── Elongation bar + readout below the strip (Flash elongationLabelMC) ─
    const elongationBar = new Rectangle(0, 0, 0, 3, {
      fill: SolarSystemModelsColors.elongationColorProperty,
      visibleProperty: model.showElongationAngleProperty,
      pickable: false,
    });
    this.addChild(elongationBar);

    const elongText = new Text("", {
      font: new PhetFont(11),
      fill: SolarSystemModelsColors.elongationColorProperty,
      maxWidth: 140,
      pickable: false,
      visibleProperty: model.showElongationAngleProperty,
    });
    this.addChild(elongText);

    // ── Drag-to-pan ──────────────────────────────────────────────────────
    let initX = 0;
    let initOffset = 0;
    band.addInputListener(
      new DragListener({
        tandem: Tandem.OPT_OUT,
        press: (_event, listener) => {
          initX = listener.parentPoint.x;
          initOffset = offsetProperty.value;
        },
        drag: (_event, listener) => {
          offsetProperty.value = initOffset + (listener.parentPoint.x - initX);
        },
      }),
    );

    // ── Update positions ─────────────────────────────────────────────────
    const update = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      elongDeg: number,
      elongLabel: string,
      offset: number,
    ) => {
      const sunLong = mod(Math.atan2(-p1.y, -p1.x), TWO_PI);
      const planetLong = mod(Math.atan2(p2.y - p1.y, p2.x - p1.x), TWO_PI);

      // Flash setOffset: shift starfield; markers use (lonToX + offset) mod W.
      const wrappedOffset = mod(offset, W);
      starfieldSlider.x = wrappedOffset > W / 2 ? wrappedOffset - W : wrappedOffset;

      const sunX = mod(lonToX(sunLong) + offset, W);
      const planetX = mod(lonToX(planetLong) + offset, W);

      sunMarker.centerX = sunX;
      planetMarker.centerX = planetX;

      sunTick.shape = tickShape(sunX, 7);
      planetTick.shape = tickShape(planetX, 6);

      sunLabel.centerX = sunX;
      sunLabel.bottom = -18;
      planetLabel.centerX = planetX;
      // Slightly lower than sun so overlapping labels stay readable.
      planetLabel.bottom = -6;

      // Elongation bar (shorter wrap-aware arc), below the strip.
      let arcX = Math.min(sunX, planetX);
      let arcW = Math.abs(planetX - sunX);
      if (arcW > W / 2) {
        arcX = Math.max(sunX, planetX);
        arcW = W - arcW;
      }
      elongationBar.rectX = arcX;
      elongationBar.rectWidth = Math.max(arcW, 0);
      elongationBar.centerY = ELONGATION_Y;

      const absDeg = Math.abs(elongDeg);
      elongText.string = elongLabel ? `${toFixed(absDeg, 1)}° ${elongLabel}` : `${toFixed(absDeg, 1)}°`;
      elongText.centerY = ELONGATION_Y + 12;
      elongText.centerX = arcX + arcW / 2;
      // Keep the readout on-strip when the arc wraps near an edge.
      if (elongText.left < 4) {
        elongText.left = 4;
      }
      if (elongText.right > W - 4) {
        elongText.right = W - 4;
      }
    };

    Multilink.multilink(
      [
        model.pos1Property,
        model.pos2Property,
        model.elongationDegProperty,
        model.elongationLabelProperty,
        offsetProperty,
      ] as const,
      update,
    );

    // ── Inferior-planet depth swap (Flash onSimulatorUpdated) ────────────
    Multilink.multilink(
      [
        model.semimajorAxis1Property,
        model.semimajorAxis2Property,
        model.timeProperty,
        model.cycleOffsetProperty,
        model.synodicPeriodProperty,
      ] as const,
      (a1, a2, time, cycleOffset, synodic) => {
        if (a1 > a2 && synodic > 0) {
          const cycleFraction = mod((time - cycleOffset) / synodic, 1);
          if (cycleFraction > 0.25 && cycleFraction < 0.75) {
            // Planet behind sun (near superior conjunction)
            markerLayer.setChildren([planetMarker, sunMarker]);
          } else {
            markerLayer.setChildren([sunMarker, planetMarker]);
          }
        } else {
          markerLayer.setChildren([sunMarker, planetMarker]);
        }
      },
    );
  }
}

/** Vertical tick through a marker, gapped for the disc (Flash sun/planet label ticks). */
function tickShape(x: number, gap: number): Shape {
  return new Shape()
    .moveTo(x, -16)
    .lineTo(x, H / 2 - gap)
    .moveTo(x, H / 2 + gap)
    .lineTo(x, ELONGATION_Y);
}

/** One full-width constellation starfield layer (lines + stars). */
function buildConstellationArtNode(): Node {
  const linesShape = new Shape();
  const starsShape = new Shape();
  const cy = H / 2;

  for (const constellation of ECLIPTIC_CONSTELLATIONS) {
    const positions = constellation.eclipticStars.map((star) => ({
      x: lonToX(star.lon),
      y: cy - star.lat * LONGITUDE_TO_X,
    }));

    for (const poly of constellation.polylines) {
      let penDown = false;
      let prev: { x: number; y: number } | null = null;
      for (const idx of poly) {
        const pos = positions[idx];
        if (!pos) {
          penDown = false;
          prev = null;
          continue;
        }
        if (!penDown || prev === null) {
          linesShape.moveTo(pos.x, pos.y);
          penDown = true;
        } else if (Math.abs(pos.x - prev.x) > W / 2) {
          linesShape.moveTo(pos.x, pos.y);
        } else {
          linesShape.lineTo(pos.x, pos.y);
        }
        prev = pos;
      }
    }

    for (const pos of positions) {
      starsShape.circle(pos.x, pos.y, STAR_RADIUS);
    }
  }

  const lines = new Path(linesShape, {
    stroke: SolarSystemModelsColors.zodiacStripConstellationLineColorProperty,
    lineWidth: 1,
  });
  const stars = new Path(starsShape, {
    fill: SolarSystemModelsColors.zodiacStripStarColorProperty,
    stroke: null,
  });
  return new Node({ children: [lines, stars], pickable: false });
}

SolarSystemModelsNamespace.register("ConfigurationsZodiacStrip", ConfigurationsZodiacStrip);
