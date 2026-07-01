import { Multilink } from "scenerystack/axon";
import { Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { DAYS_PER_YEAR } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

export class PtolemaicTimeReadout extends Node {
  public constructor(model: PtolemaicModel) {
    super();

    const strings = StringManager.getInstance().getPtolemaicStrings();

    const readout = new Text("", {
      font: new PhetFont(14),
      fill: SolarSystemModelsColors.textColorProperty,
    });
    this.addChild(readout);

    Multilink.multilink(
      [model.ptolemaicTimeProperty, strings.yearsStringProperty, strings.daysStringProperty] as const,
      (days, yr, d) => {
        const years = Math.floor(days / DAYS_PER_YEAR);
        const daysRem = Math.round(days % DAYS_PER_YEAR);
        readout.string = `${years} ${yr} ${daysRem} ${d}`;
      },
    );
  }
}
