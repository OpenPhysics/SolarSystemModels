import { Multilink } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { DISPLAY_DAYS_PER_YEAR, PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";
import { eventNameLabel } from "./eventNameLabel.js";

const READOUT_FONT = new PhetFont(12);
const FONT_OPTS = {
  font: READOUT_FONT,
  fill: SolarSystemModelsColors.textColorProperty,
  maxWidth: PANEL_WIDTH - 24,
} as const;

export class ConfigurationsTimeReadout extends SolarSystemModelsPanel {
  public constructor(model: ConfigurationsModel) {
    const s = StringManager.getInstance().getConfigurationsStrings();

    const timeText = new Text("", FONT_OPTS);
    const synodicText = new Text("", FONT_OPTS);
    const configText = new Text("", FONT_OPTS);
    const countdownText = new Text("", FONT_OPTS);

    Multilink.multilink(
      [model.timeProperty, model.synodicPeriodProperty, s.synodicPeriodStringProperty] as const,
      (time, synodic, synodicLabel) => {
        const absTime = Math.abs(time);
        const totalDays = absTime * DISPLAY_DAYS_PER_YEAR;
        const yrs = Math.floor(absTime);
        const days = totalDays - yrs * DISPLAY_DAYS_PER_YEAR;
        const sign = time < 0 ? "-" : "";
        timeText.string = `${sign}${toFixed(absTime, 3)} yr (${sign}${yrs} yr, ${sign}${toFixed(days, 1)} d)`;
        synodicText.string = `${synodicLabel} ${toFixed(synodic, 3)} yr`;
      },
    );

    Multilink.multilink(
      [
        model.currentConfigurationProperty,
        s.oppositionStringProperty,
        s.quadratureEasternStringProperty,
        s.conjunctionStringProperty,
        s.quadratureWesternStringProperty,
        s.inferiorConjunctionStringProperty,
        s.greatestElongationWesternStringProperty,
        s.superiorConjunctionStringProperty,
        s.greatestElongationEasternStringProperty,
      ] as const,
      (cfg) => {
        configText.string = eventNameLabel(cfg);
      },
    );

    Multilink.multilink(
      [
        model.countdownRemainingProperty,
        s.pausedForStringProperty,
        s.secondStringProperty,
        s.secondsStringProperty,
      ] as const,
      (remaining, pausedFor, second, seconds) => {
        if (remaining > 0) {
          const secs = Math.ceil(remaining);
          const unit = secs === 1 ? second : seconds;
          countdownText.string = StringUtils.fillIn(pausedFor, { seconds: String(secs), unit });
        } else {
          countdownText.string = "";
        }
      },
    );

    const content = new VBox({
      children: [timeText, synodicText, configText, countdownText],
      spacing: 4,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
