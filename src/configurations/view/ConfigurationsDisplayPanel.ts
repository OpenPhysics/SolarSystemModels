import { Text, VBox } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const LABEL_OPTS = {
  font: "14px sans-serif",
  fill: SolarSystemModelsColors.textColorProperty,
  maxWidth: PANEL_WIDTH - 60,
} as const;

export class ConfigurationsDisplayPanel extends SolarSystemModelsPanel {
  public constructor(model: ConfigurationsModel) {
    const s = StringManager.getInstance().getConfigurationsStrings();
    const a11y = StringManager.getInstance().getConfigurationsA11yStrings();

    const labelOrbitsCheckbox = new Checkbox(
      model.showOrbitLabelsProperty,
      new Text(s.labelOrbitsStringProperty, LABEL_OPTS),
      { accessibleName: a11y.controls.labelOrbitsStringProperty },
    );

    const showElongationCheckbox = new Checkbox(
      model.showElongationAngleProperty,
      new Text(s.showElongationStringProperty, LABEL_OPTS),
      { accessibleName: a11y.controls.showElongationStringProperty },
    );

    const snapToEventsCheckbox = new Checkbox(
      model.snapToEventsProperty,
      new Text(s.snapToEventsStringProperty, LABEL_OPTS),
      { accessibleName: a11y.controls.snapToEventsStringProperty },
    );

    const content = new VBox({
      children: [labelOrbitsCheckbox, showElongationCheckbox, snapToEventsCheckbox],
      spacing: 8,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
