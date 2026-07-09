import { HBox, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { PANEL_CONTENT_SPACING, PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

const LABEL_OPTS = {
  font: new PhetFont(12),
  fill: SolarSystemModelsColors.textColorProperty,
  maxWidth: PANEL_WIDTH / 2 - 40,
} as const;

const CHECKBOX_OPTS = {
  boxWidth: 16,
  spacing: 4,
} as const;

export class PtolemaicDisplayPanel extends SolarSystemModelsPanel {
  public constructor(model: PtolemaicModel) {
    const vis = StringManager.getInstance().getPtolemaicStrings();
    const a11y = StringManager.getInstance().getPtolemaicA11yStrings();

    const deferentCheckbox = new Checkbox(
      model.showDeferentProperty,
      new Text(vis.deferentStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.deferentStringProperty },
    );
    const epicycleCheckbox = new Checkbox(
      model.showEpicycleProperty,
      new Text(vis.epicycleStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.epicycleStringProperty },
    );
    const planetVectorCheckbox = new Checkbox(
      model.showPlanetVectorProperty,
      new Text(vis.planetVectorStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.planetVectorStringProperty },
    );
    const equantVectorCheckbox = new Checkbox(
      model.showEquantVectorProperty,
      new Text(vis.equantVectorStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.equantVectorStringProperty },
    );
    const earthSunLineCheckbox = new Checkbox(
      model.showEarthSunLineProperty,
      new Text(vis.earthSunLineStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.earthSunLineStringProperty },
    );
    const epicyclePlanetLineCheckbox = new Checkbox(
      model.showEpicyclePlanetLineProperty,
      new Text(vis.epicyclePlanetLineStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.epicyclePlanetLineStringProperty },
    );

    // Flash layout: two columns of visibility toggles, then the longer line toggles below.
    const content = new VBox({
      children: [
        new HBox({
          children: [
            new VBox({
              children: [deferentCheckbox, epicycleCheckbox],
              spacing: PANEL_CONTENT_SPACING,
              align: "left",
            }),
            new VBox({
              children: [planetVectorCheckbox, equantVectorCheckbox],
              spacing: PANEL_CONTENT_SPACING,
              align: "left",
            }),
          ],
          spacing: 12,
          align: "top",
        }),
        earthSunLineCheckbox,
        epicyclePlanetLineCheckbox,
      ],
      spacing: PANEL_CONTENT_SPACING,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
