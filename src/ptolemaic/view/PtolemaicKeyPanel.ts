import type { TPaint } from "scenerystack/scenery";
import { Circle, HBox, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { PANEL_CONTENT_SPACING, PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";

const TITLE_FONT = new PhetFont({ size: 12, weight: "bold" });
const LABEL_FONT = new PhetFont(11);

/**
 * "Key" / legend panel listing each celestial body and marker with its color.
 * Port of the Flash "Key" panel (Ptolemaic System frame layout).
 */
export class PtolemaicKeyPanel extends SolarSystemModelsPanel {
  public constructor() {
    const s = StringManager.getInstance().getPtolemaicStrings();

    const swatch = (fill: TPaint) => new Circle(5, { fill, stroke: SolarSystemModelsColors.panelBorderColorProperty });

    const row = (swatchNode: Circle, label: Text) =>
      new HBox({ children: [swatchNode, label], spacing: 5, align: "center" });

    const content = new VBox({
      children: [
        new Text(s.keyStringProperty, {
          font: TITLE_FONT,
          fill: SolarSystemModelsColors.textColorProperty,
        }),
        row(
          swatch(SolarSystemModelsColors.earthColorProperty),
          new Text(s.keyEarthStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
        ),
        row(
          swatch(SolarSystemModelsColors.sunColorProperty),
          new Text(s.keySunStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
        ),
        row(
          swatch(SolarSystemModelsColors.planetColorProperty),
          new Text(s.keyPlanetStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
        ),
        row(
          swatch(SolarSystemModelsColors.deferentColorProperty),
          new Text(s.keyDeferentStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
        ),
        row(
          swatch(SolarSystemModelsColors.epicycleColorProperty),
          new Text(s.keyEpicycleStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
        ),
        row(
          swatch(SolarSystemModelsColors.equantColorProperty),
          new Text(s.keyEquantStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
        ),
      ],
      spacing: PANEL_CONTENT_SPACING - 1,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
