import { Multilink, NumberProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, DragListener, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const STRIP_WIDTH = 600;
const STRIP_HEIGHT = 60;
const TWO_PI = 2 * Math.PI;

// Unicode zodiac glyphs, Leo→Cancer order matching the AS ecliptic convention.
const ZODIAC_GLYPHS = ["♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "♈", "♉", "♊", "♋"];

function mod(x: number, m: number): number {
  return ((x % m) + m) % m;
}

export class ConfigurationsZodiacStrip extends Node {
  public constructor(model: ConfigurationsModel) {
    super();

    const s = StringManager.getInstance().getConfigurationsStrings();

    // Panning offset (px) — drag the strip horizontally.
    const offsetProperty = new NumberProperty(0);

    // ── Band background (also the drag surface) ──────────────────────────
    const band = new Rectangle(0, 0, STRIP_WIDTH, STRIP_HEIGHT, {
      fill: SolarSystemModelsColors.zodiacBandColorProperty,
      stroke: SolarSystemModelsColors.zodiacBorderColorProperty,
      lineWidth: 1,
      cursor: "pointer",
    });
    this.addChild(band);

    // ── 12 sign glyphs + dividers (shift with offset) ─────────────────────
    const segW = STRIP_WIDTH / 12;
    const glyphLayer = new Node();
    this.addChild(glyphLayer);

    const glyphNodes: Text[] = [];
    const dividerNodes: Rectangle[] = [];
    for (let i = 0; i < 12; i++) {
      const label = new Text(ZODIAC_GLYPHS[i] ?? "", {
        font: new PhetFont(14),
        fill: SolarSystemModelsColors.configurationsZodiacGlyphColorProperty,
        maxWidth: segW - 2,
      });
      glyphNodes.push(label);
      glyphLayer.addChild(label);

      if (i > 0) {
        const divider = new Rectangle(i * segW, 0, 1, STRIP_HEIGHT, {
          fill: SolarSystemModelsColors.configurationsZodiacDividerColorProperty,
        });
        dividerNodes.push(divider);
        glyphLayer.addChild(divider);
      }
    }

    // ── Sun marker ────────────────────────────────────────────────────────
    const sunMarker = new Circle(5, { fill: SolarSystemModelsColors.sunColorProperty });
    this.addChild(sunMarker);

    // ── Planet marker ────────────────────────────────────────────────────
    const planetMarker = new Circle(5, { fill: SolarSystemModelsColors.targetPlanetColorProperty });
    this.addChild(planetMarker);

    // ── Elongation bar (sun→planet, wrap-aware) ──────────────────────────
    const elongationBar = new Rectangle(0, 0, 0, 4, {
      fill: SolarSystemModelsColors.elongationColorProperty,
      visibleProperty: model.showElongationAngleProperty,
    });
    this.addChild(elongationBar);

    // ── "sun" / "planet" tick labels above the strip ─────────────────────
    const sunTickFont = new PhetFont({ size: 9, weight: "bold" });
    const sunLabel = new Text(s.zodiacSunLabelStringProperty, {
      font: sunTickFont,
      fill: SolarSystemModelsColors.sunColorProperty,
    });
    const planetLabel = new Text(s.zodiacPlanetLabelStringProperty, {
      font: sunTickFont,
      fill: SolarSystemModelsColors.targetPlanetColorProperty,
    });
    this.addChild(sunLabel);
    this.addChild(planetLabel);

    // Tick lines for sun and planet labels
    const sunTick = new Path(null, {
      stroke: SolarSystemModelsColors.zodiacBorderColorProperty,
      lineWidth: 1,
    });
    const planetTick = new Path(null, {
      stroke: SolarSystemModelsColors.zodiacBorderColorProperty,
      lineWidth: 1,
    });
    this.addChild(sunTick);
    this.addChild(planetTick);

    // ── Elongation text readout ──────────────────────────────────────────
    const elongText = new Text("", {
      font: new PhetFont(11),
      fill: SolarSystemModelsColors.elongationColorProperty,
      maxWidth: 120,
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

    // ── Update positions whenever positions, elongation, or offset change ─
    const update = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      elongDeg: number,
      elongLabel: string,
      offset: number,
    ) => {
      const sunLong = mod(Math.atan2(-p1.y, -p1.x), TWO_PI);
      const planetLong = mod(Math.atan2(p2.y - p1.y, p2.x - p1.x), TWO_PI);

      const LEO_OFFSET = (5 * TWO_PI) / 12;
      const sunX = mod(((sunLong + LEO_OFFSET) * STRIP_WIDTH) / TWO_PI + offset, STRIP_WIDTH);
      const planetX = mod(((planetLong + LEO_OFFSET) * STRIP_WIDTH) / TWO_PI + offset, STRIP_WIDTH);

      sunMarker.centerX = sunX;
      sunMarker.centerY = STRIP_HEIGHT * 0.7;
      planetMarker.centerX = planetX;
      planetMarker.centerY = STRIP_HEIGHT * 0.7;

      // Shift glyphs + dividers by offset (wrapping)
      for (let i = 0; i < 12; i++) {
        const g = glyphNodes[i];
        if (g) {
          g.centerX = mod((i + 0.5) * segW + offset, STRIP_WIDTH);
          g.centerY = STRIP_HEIGHT * 0.3;
        }
      }
      for (let i = 0; i < dividerNodes.length; i++) {
        const d = dividerNodes[i];
        if (d) {
          d.rectX = mod((i + 1) * segW + offset, STRIP_WIDTH);
        }
      }

      // Elongation bar (wrap-aware: use shorter arc)
      let arcX = Math.min(sunX, planetX);
      let arcW = Math.abs(planetX - sunX);
      if (arcW > STRIP_WIDTH / 2) {
        arcX = Math.max(sunX, planetX);
        arcW = STRIP_WIDTH - arcW;
      }
      elongationBar.rectX = arcX;
      elongationBar.rectWidth = arcW;
      elongationBar.centerY = STRIP_HEIGHT * 0.7;

      // Tick labels: position above the strip at marker x, with tick lines
      sunLabel.centerX = sunX;
      sunLabel.bottom = STRIP_HEIGHT * 0.3 - 4;
      sunTick.shape = new Shape().moveTo(sunX, STRIP_HEIGHT * 0.3 - 3).lineTo(sunX, STRIP_HEIGHT * 0.45);

      planetLabel.centerX = planetX;
      planetLabel.bottom = STRIP_HEIGHT * 0.3 - 4;
      planetTick.shape = new Shape().moveTo(planetX, STRIP_HEIGHT * 0.3 - 3).lineTo(planetX, STRIP_HEIGHT * 0.45);

      // Elongation text
      elongText.string = `${toFixed(Math.abs(elongDeg), 1)}° ${elongLabel}`;
      elongText.centerY = STRIP_HEIGHT * 0.7;
      elongText.left = 4;
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

    // ── Inferior-planet depth swap ───────────────────────────────────────
    // When the target planet is inferior (a1 > a2), the planet icon should
    // appear behind the sun during the back half of the synodic cycle (near
    // superior conjunction) and in front otherwise (near inferior conjunction).
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
            planetMarker.moveToBack();
          } else {
            // Planet in front of sun (near inferior conjunction)
            planetMarker.moveToFront();
          }
        } else {
          // Superior planet or equal — planet always on top
          planetMarker.moveToFront();
        }
      },
    );
  }
}
