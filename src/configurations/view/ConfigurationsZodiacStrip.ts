import { Multilink } from "scenerystack/axon";
import { Circle, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const STRIP_WIDTH = 600;
const STRIP_HEIGHT = 60;
const TWO_PI = 2 * Math.PI;

function mod(x: number, m: number): number {
  return ((x % m) + m) % m;
}

export class ConfigurationsZodiacStrip extends Node {
  public constructor(model: ConfigurationsModel) {
    super();

    const z = StringManager.getInstance().getZodiacStrings();
    const ZODIAC_SIGN_PROPS = [
      z.ariesStringProperty,
      z.taurusStringProperty,
      z.geminiStringProperty,
      z.cancerStringProperty,
      z.leoStringProperty,
      z.virgoStringProperty,
      z.libraStringProperty,
      z.scorpiusStringProperty,
      z.sagittariusStringProperty,
      z.capricornStringProperty,
      z.aquariusStringProperty,
      z.piscesStringProperty,
    ];

    // Band background
    const band = new Rectangle(0, 0, STRIP_WIDTH, STRIP_HEIGHT, {
      fill: SolarSystemModelsColors.zodiacBandColorProperty,
      stroke: SolarSystemModelsColors.zodiacBorderColorProperty,
      lineWidth: 1,
    });
    this.addChild(band);

    // 12 sign labels
    const segW = STRIP_WIDTH / 12;
    for (let i = 0; i < 12; i++) {
      const label = new Text(ZODIAC_SIGN_PROPS[i]!, {
        font: new PhetFont(9),
        fill: SolarSystemModelsColors.zodiacLabelColorProperty,
        maxWidth: segW - 4,
      });
      label.centerX = (i + 0.5) * segW;
      label.centerY = STRIP_HEIGHT * 0.25;
      this.addChild(label);

      // Divider
      if (i > 0) {
        const divider = new Rectangle(i * segW, 0, 1, STRIP_HEIGHT, {
          fill: SolarSystemModelsColors.zodiacDividerColorProperty,
        });
        this.addChild(divider);
      }
    }

    // Sun marker (yellow circle)
    const sunMarker = new Circle(5, { fill: SolarSystemModelsColors.sunColorProperty });
    sunMarker.centerY = STRIP_HEIGHT * 0.7;
    this.addChild(sunMarker);

    // Planet/target marker (grey circle)
    const planetMarker = new Circle(5, { fill: SolarSystemModelsColors.targetPlanetColorProperty });
    planetMarker.centerY = STRIP_HEIGHT * 0.7;
    this.addChild(planetMarker);

    // Elongation label
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
        // Sun longitude = direction from observer (p1) to Sun (origin)
        const sunLong = ((Math.atan2(-p1.y, -p1.x) % TWO_PI) + TWO_PI) % TWO_PI;
        // Planet longitude = direction from observer (p1) to target (p2)
        const planetLong = ((Math.atan2(p2.y - p1.y, p2.x - p1.x) % TWO_PI) + TWO_PI) % TWO_PI;

        sunMarker.centerX = mod((sunLong * STRIP_WIDTH) / TWO_PI, STRIP_WIDTH);
        planetMarker.centerX = mod((planetLong * STRIP_WIDTH) / TWO_PI, STRIP_WIDTH);

        elongText.string = `${Math.abs(elongDeg).toFixed(1)}° ${elongLabel}`;
      },
    );
  }
}
