import { Multilink } from "scenerystack/axon";
import { Circle, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { wrapToWidth, ZodiacStripBackground } from "../../common/ZodiacStripBackground.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { ZODIAC_STRIP_HEIGHT, ZODIAC_STRIP_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const TWO_PI = 2 * Math.PI;

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

    // ── Shared band + sign labels + dividers ──────────────────────────────
    this.addChild(new ZodiacStripBackground(ZODIAC_STRIP_WIDTH, ZODIAC_STRIP_HEIGHT, ZODIAC_SIGN_PROPS));

    // Sun marker (yellow circle)
    const sunMarker = new Circle(5, { fill: SolarSystemModelsColors.sunColorProperty });
    sunMarker.centerY = ZODIAC_STRIP_HEIGHT * 0.7;
    this.addChild(sunMarker);

    // Planet/target marker (grey circle)
    const planetMarker = new Circle(5, { fill: SolarSystemModelsColors.targetPlanetColorProperty });
    planetMarker.centerY = ZODIAC_STRIP_HEIGHT * 0.7;
    this.addChild(planetMarker);

    // Elongation label
    const elongText = new Text("", {
      font: new PhetFont(11),
      fill: SolarSystemModelsColors.elongationColorProperty,
      maxWidth: 120,
    });
    elongText.centerY = ZODIAC_STRIP_HEIGHT * 0.7;
    elongText.left = 4;
    this.addChild(elongText);

    Multilink.multilink(
      [model.pos1Property, model.pos2Property, model.elongationDegProperty, model.elongationLabelProperty] as const,
      (p1, p2, elongDeg, elongLabel) => {
        // Sun longitude = direction from observer (p1) to Sun (origin)
        const sunLong = wrapToWidth(Math.atan2(-p1.y, -p1.x), TWO_PI);
        // Planet longitude = direction from observer (p1) to target (p2)
        const planetLong = wrapToWidth(Math.atan2(p2.y - p1.y, p2.x - p1.x), TWO_PI);

        sunMarker.centerX = wrapToWidth((sunLong * ZODIAC_STRIP_WIDTH) / TWO_PI, ZODIAC_STRIP_WIDTH);
        planetMarker.centerX = wrapToWidth((planetLong * ZODIAC_STRIP_WIDTH) / TWO_PI, ZODIAC_STRIP_WIDTH);

        elongText.string = `${Math.abs(elongDeg).toFixed(1)}° ${elongLabel}`;
      },
    );
  }
}
