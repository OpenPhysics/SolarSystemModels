import { HBox, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { PANEL_CONTENT_SPACING, PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const LABEL_OPTS = {
  font: new PhetFont(12),
  fill: SolarSystemModelsColors.textColorProperty,
  maxWidth: PANEL_WIDTH / 2 - 40,
} as const;

const CHECKBOX_OPTS = {
  boxWidth: 16,
  spacing: 4,
  checkboxColor: SolarSystemModelsColors.textColorProperty,
  checkboxColorBackground: SolarSystemModelsColors.panelBackgroundColorProperty,
} as const;

export class ConfigurationsDisplayPanel extends SolarSystemModelsPanel {
  public constructor(model: ConfigurationsModel) {
    const s = StringManager.getInstance().getConfigurationsStrings();
    const a11y = StringManager.getInstance().getConfigurationsA11yStrings();

    const labelOrbitsCheckbox = new Checkbox(
      model.showOrbitLabelsProperty,
      new Text(s.labelOrbitsStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.labelOrbitsStringProperty },
    );

    const showElongationCheckbox = new Checkbox(
      model.showElongationAngleProperty,
      new Text(s.showElongationStringProperty, LABEL_OPTS),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.showElongationStringProperty },
    );

    const snapToEventsCheckbox = new Checkbox(
      model.snapToEventsProperty,
      new Text(s.snapToEventsStringProperty, {
        ...LABEL_OPTS,
        maxWidth: PANEL_WIDTH - 60,
      }),
      { ...CHECKBOX_OPTS, accessibleName: a11y.controls.snapToEventsStringProperty },
    );

    // Two short toggles side-by-side; longer snap toggle on its own row.
    const content = new VBox({
      children: [
        new HBox({
          children: [labelOrbitsCheckbox, showElongationCheckbox],
          spacing: 12,
          align: "top",
        }),
        snapToEventsCheckbox,
      ],
      spacing: PANEL_CONTENT_SPACING,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
