import { Circle, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { ZODIAC_STRIP_HEIGHT, ZODIAC_STRIP_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

const TWO_PI = 2 * Math.PI;

// AS factor: strip width / 2π ≈ 600/2π ≈ 95.49
const LONGITUDE_TO_X = ZODIAC_STRIP_WIDTH / TWO_PI;

const SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

function longitudeToX(lon: number): number {
  // Wrap longitude to [0, 2π) then map to strip x
  const wrapped = ((lon % TWO_PI) + TWO_PI) % TWO_PI;
  return wrapped * LONGITUDE_TO_X;
}

export class PtolemaicZodiacStrip extends Node {
  public constructor(model: PtolemaicModel) {
    super();

    // Background band
    const band = new Rectangle(0, 0, ZODIAC_STRIP_WIDTH, ZODIAC_STRIP_HEIGHT, {
      fill: SolarSystemModelsColors.zodiacBandColorProperty,
      stroke: SolarSystemModelsColors.orbitColorProperty,
      lineWidth: 1,
    });
    this.addChild(band);

    // Dividers and sign labels
    for (let i = 0; i < 12; i++) {
      const x = (i * ZODIAC_STRIP_WIDTH) / 12;
      const divider = new Rectangle(x, 0, 1, ZODIAC_STRIP_HEIGHT, {
        fill: SolarSystemModelsColors.orbitColorProperty,
      });
      this.addChild(divider);

      const label = new Text(SIGN_NAMES[i] ?? "", {
        font: new PhetFont(9),
        fill: SolarSystemModelsColors.textColorProperty,
        left: x + 2,
        top: 3,
        maxWidth: ZODIAC_STRIP_WIDTH / 12 - 4,
      });
      this.addChild(label);
    }

    // Sun marker (yellow circle)
    const sunMarker = new Circle(7, {
      fill: SolarSystemModelsColors.sunColorProperty,
      centerY: ZODIAC_STRIP_HEIGHT / 2 + 10,
    });
    this.addChild(sunMarker);

    // Planet marker (orange circle)
    const planetMarker = new Circle(5, {
      fill: SolarSystemModelsColors.planetColorProperty,
      centerY: ZODIAC_STRIP_HEIGHT / 2 - 10,
    });
    this.addChild(planetMarker);

    // Link sun: AS uses -sunAngle for strip positioning
    model.sunAngleProperty.link((sunAngle) => {
      sunMarker.centerX = longitudeToX(-sunAngle);
    });

    // Link planet ecliptic longitude
    model.eclipticLongitudeProperty.link((lon) => {
      planetMarker.centerX = longitudeToX(lon);
    });
  }
}
