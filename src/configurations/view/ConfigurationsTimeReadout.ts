import { Multilink } from "scenerystack/axon";
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const READOUT_FONT = new PhetFont(13);
const FONT_OPTS = {
  font: READOUT_FONT,
  fill: SolarSystemModelsColors.textColorProperty,
  maxWidth: PANEL_WIDTH - 24,
} as const;

const DAYS_PER_YEAR = 365.24;

export class ConfigurationsTimeReadout extends SolarSystemModelsPanel {
  public constructor(model: ConfigurationsModel) {
    StringManager.getInstance().getConfigurationsStrings();

    const timeText = new Text("", FONT_OPTS);
    const synodicText = new Text("", FONT_OPTS);
    const configText = new Text("", FONT_OPTS);
    const countdownText = new Text("", FONT_OPTS);

    Multilink.multilink([model.timeProperty, model.synodicPeriodProperty], (time, synodic) => {
      const absTime = Math.abs(time);
      const totalDays = absTime * DAYS_PER_YEAR;
      const yrs = Math.floor(absTime);
      const days = totalDays - yrs * DAYS_PER_YEAR;
      const sign = time < 0 ? "-" : "";
      timeText.string = `${sign}${absTime.toFixed(3)} yr (${sign}${yrs} yr, ${sign}${days.toFixed(1)} d)`;
      synodicText.string = `Synodic: ${synodic.toFixed(3)} yr`;
    });

    model.currentConfigurationProperty.link((cfg) => {
      configText.string = cfg.length > 0 ? cfg : "";
    });

    model.countdownRemainingProperty.link((remaining) => {
      if (remaining > 0) {
        const secs = Math.ceil(remaining);
        const unit = secs === 1 ? "second" : "seconds";
        countdownText.string = `Paused for ${secs} more ${unit}`;
      } else {
        countdownText.string = "";
      }
    });

    const content = new VBox({
      children: [timeText, synodicText, configText, countdownText],
      spacing: 4,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
