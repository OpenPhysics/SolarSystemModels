import { Range } from "scenerystack/dot";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont, TimeControlNode } from "scenerystack/scenery-phet";
import { RectangularPushButton } from "scenerystack/sun";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RECTANGULAR_BUTTON_OPTIONS,
} from "../../common/SolarSystemModelsButtonOptions.js";
import { createCompactSliderRow } from "../../common/SolarSystemModelsControlOptions.js";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import {
  PANEL_CONTENT_SPACING,
  PANEL_WIDTH,
  PATH_DURATION_RANGE,
  PTOLEMAIC_ANIMATION_RATE_RANGE,
} from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

const LABEL_FONT = new PhetFont(12);

export class PtolemaicTimeControls extends SolarSystemModelsPanel {
  public constructor(model: PtolemaicModel) {
    const strings = StringManager.getInstance().getPtolemaicStrings();
    const a11y = StringManager.getInstance().getPtolemaicA11yStrings();

    const timeControlNode = new TimeControlNode(model.timer.isPlayingProperty, {
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => {
            if (!model.timer.isPlayingProperty.value) {
              model.step(1 / 60);
            }
          },
        },
      },
      scale: 0.85,
    });

    // Flash: "animation rate:" and "path duration:" share a row with their slider.
    const animRateRow = createCompactSliderRow(
      strings.animationRateStringProperty,
      model.animationRateProperty,
      new Range(PTOLEMAIC_ANIMATION_RATE_RANGE.min, PTOLEMAIC_ANIMATION_RATE_RANGE.max),
      { accessibleName: a11y.controls.animationRateStringProperty },
    );
    const pathDurRow = createCompactSliderRow(
      strings.pathDurationStringProperty,
      model.pathDurationProperty,
      new Range(PATH_DURATION_RANGE.min, PATH_DURATION_RANGE.max),
      { accessibleName: a11y.controls.pathDurationStringProperty },
    );

    const resetTimeButton = new RectangularPushButton({
      content: new Text(strings.resetTimeStringProperty, {
        font: LABEL_FONT,
        fill: SolarSystemModelsColors.textColorProperty,
      }),
      listener: () => model.resetTime(),
      accessibleName: a11y.controls.resetTimeStringProperty,
      ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    });

    const content = new VBox({
      children: [timeControlNode, animRateRow, pathDurRow, resetTimeButton],
      spacing: PANEL_CONTENT_SPACING,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
