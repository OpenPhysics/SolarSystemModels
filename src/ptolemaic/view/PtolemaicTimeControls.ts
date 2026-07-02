import { Dimension2, Range } from "scenerystack/dot";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont, TimeControlNode } from "scenerystack/scenery-phet";
import { HSlider, RectangularPushButton } from "scenerystack/sun";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RECTANGULAR_BUTTON_OPTIONS,
} from "../../common/SolarSystemModelsButtonOptions.js";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { ANIMATION_RATE_RANGE, PANEL_WIDTH, PATH_DURATION_RANGE } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

const LABEL_FONT = new PhetFont(12);
const MAX_LABEL_WIDTH = PANEL_WIDTH - 40;
const TRACK_SIZE = new Dimension2(PANEL_WIDTH - 50, 3);

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
    });

    const animRateLabel = new Text(strings.animationRateStringProperty, {
      font: LABEL_FONT,
      fill: SolarSystemModelsColors.textColorProperty,
      maxWidth: MAX_LABEL_WIDTH,
    });
    const animRateSlider = new HSlider(
      model.timer.animationRateProperty,
      new Range(ANIMATION_RATE_RANGE.min, ANIMATION_RATE_RANGE.max),
      {
        trackSize: TRACK_SIZE,
        accessibleName: a11y.controls.animationRateStringProperty,
      },
    );

    const pathDurLabel = new Text(strings.pathDurationStringProperty, {
      font: LABEL_FONT,
      fill: SolarSystemModelsColors.textColorProperty,
      maxWidth: MAX_LABEL_WIDTH,
    });
    const pathDurSlider = new HSlider(
      model.pathDurationProperty,
      new Range(PATH_DURATION_RANGE.min, PATH_DURATION_RANGE.max),
      {
        trackSize: TRACK_SIZE,
        accessibleName: a11y.controls.pathDurationStringProperty,
      },
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
      children: [timeControlNode, animRateLabel, animRateSlider, pathDurLabel, pathDurSlider, resetTimeButton],
      spacing: 8,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
