import { Multilink } from "scenerystack/axon";
import { Circle, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const STRIP_WIDTH = 600;
const STRIP_HEIGHT = 60;
const TWO_PI = 2 * Math.PI;

// Unicode zodiac glyphs, Leo→Cancer order matching the AS ecliptic convention.
// The AS strip starts at Leo (≈ 30° offset from Aries).
const ZODIAC_GLYPHS = ["♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "♈", "♉", "♊", "♋"];

function mod(x: number, m: number): number {
  return ((x % m) + m) % m;
}

export class ConfigurationsZodiacStrip extends Node {
  public constructor(model: ConfigurationsModel) {
    super();

    // Band background
    const band = new Rectangle(0, 0, STRIP_WIDTH, STRIP_HEIGHT, {
      fill: SolarSystemModelsColors.zodiacBandColorProperty,
      stroke: "#555577",
      lineWidth: 1,
    });
    this.addChild(band);

    // 12 sign glyphs (Leo-first)
    const segW = STRIP_WIDTH / 12;
    for (let i = 0; i < 12; i++) {
      const label = new Text(ZODIAC_GLYPHS[i] ?? "", {
        font: new PhetFont(14),
        fill: "#aaaacc",
        maxWidth: segW - 2,
      });
      label.centerX = (i + 0.5) * segW;
      label.centerY = STRIP_HEIGHT * 0.3;
      this.addChild(label);

      if (i > 0) {
        const divider = new Rectangle(i * segW, 0, 1, STRIP_HEIGHT, { fill: "#334455" });
        this.addChild(divider);
      }
    }

    // Sun marker (yellow)
    const sunMarker = new Circle(5, { fill: SolarSystemModelsColors.sunColorProperty });
    sunMarker.centerY = STRIP_HEIGHT * 0.7;
    this.addChild(sunMarker);

    // Planet/target marker
    const planetMarker = new Circle(5, { fill: SolarSystemModelsColors.targetPlanetColorProperty });
    planetMarker.centerY = STRIP_HEIGHT * 0.7;
    this.addChild(planetMarker);

    // Elongation arc (sun→planet)
    const arc = new Rectangle(0, 0, 0, 4, {
      fill: SolarSystemModelsColors.elongationColorProperty,
      visibleProperty: model.showElongationAngleProperty,
    });
    arc.centerY = STRIP_HEIGHT * 0.7;
    this.addChild(arc);

    // Elongation text
    const elongText = new Text("", {
      font: new PhetFont(11),
      fill: SolarSystemModelsColors.elongationColorProperty,
      maxWidth: 120,
    });
    elongText.centerY = STRIP_HEIGHT * 0.7;
    elongText.left = 4;
    this.addChild(elongText);

    Multilink.multilink(
      [model.pos1Property, model.pos2Property, model.elongationDegProperty, model.elongationLabelProperty] as const,
      (p1, p2, elongDeg, elongLabel) => {
        const sunLong = mod(Math.atan2(-p1.y, -p1.x), TWO_PI);
        const planetLong = mod(Math.atan2(p2.y - p1.y, p2.x - p1.x), TWO_PI);

        // Leo-first: offset by 120° (5 signs × 30°) so λ=0 maps to Leo segment start.
        const LEO_OFFSET = (5 * TWO_PI) / 12;
        sunMarker.centerX = mod(((sunLong + LEO_OFFSET) * STRIP_WIDTH) / TWO_PI, STRIP_WIDTH);
        planetMarker.centerX = mod(((planetLong + LEO_OFFSET) * STRIP_WIDTH) / TWO_PI, STRIP_WIDTH);

        // Elongation arc from sun to planet (wrap-aware)
        const sunX = sunMarker.centerX;
        const planetX = planetMarker.centerX;
        let arcX = Math.min(sunX, planetX);
        let arcW = Math.abs(planetX - sunX);
        if (arcW > STRIP_WIDTH / 2) {
          // Shorter arc wraps around
          arcX = Math.max(sunX, planetX);
          arcW = STRIP_WIDTH - arcW;
        }
        arc.rectX = arcX;
        arc.rectWidth = arcW;

        elongText.string = `${Math.abs(elongDeg).toFixed(1)}° ${elongLabel}`;
      },
    );
  }
}
