import { DerivedProperty } from "scenerystack/axon";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { DAYS_PER_YEAR, PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const READOUT_FONT = new PhetFont(13);
const FONT_OPTS = {
  font: READOUT_FONT,
  fill: SolarSystemModelsColors.textColorProperty,
  maxWidth: PANEL_WIDTH - 24,
} as const;

export class ConfigurationsTimeReadout extends SolarSystemModelsPanel {
  public constructor(model: ConfigurationsModel) {
    const s = StringManager.getInstance().getConfigurationsStrings();

    const timeStringProperty = new DerivedProperty(
      [model.timeProperty, s.yearsStringProperty, s.daysStringProperty] as const,
      (time, yr, d) => {
        const absTime = Math.abs(time);
        const totalDays = absTime * DAYS_PER_YEAR;
        const yrs = Math.floor(absTime);
        const days = totalDays - yrs * DAYS_PER_YEAR;
        const sign = time < 0 ? "-" : "";
        return `${sign}${absTime.toFixed(3)} ${yr} (${sign}${yrs} ${yr}, ${sign}${days.toFixed(1)} ${d})`;
      },
    );

    const synodicStringProperty = new DerivedProperty(
      [model.synodicPeriodProperty, s.synodicPeriodStringProperty, s.yearsStringProperty] as const,
      (synodic, label, yr) => `${label} ${synodic.toFixed(3)} ${yr}`,
    );

    const countdownStringProperty = new DerivedProperty(
      [
        model.countdownRemainingProperty,
        s.pausedForStringProperty,
        s.secondStringProperty,
        s.secondsStringProperty,
      ] as const,
      (remaining, pausedFor, second, seconds) => {
        if (remaining <= 0) {
          return "";
        }
        const secs = Math.ceil(remaining);
        const unit = secs === 1 ? second : seconds;
        return pausedFor.replace("{0}", String(secs)).replace("{1}", unit);
      },
    );

    const timeText = new Text(timeStringProperty, FONT_OPTS);
    const synodicText = new Text(synodicStringProperty, FONT_OPTS);
    const configText = new Text("", FONT_OPTS);
    const countdownText = new Text(countdownStringProperty, FONT_OPTS);

    model.currentConfigurationProperty.link((cfg) => {
      configText.string = cfg;
    });

    const content = new VBox({
      children: [timeText, synodicText, configText, countdownText],
      spacing: 4,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
