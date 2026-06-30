import { Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { DAYS_PER_YEAR } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

export class PtolemaicTimeReadout extends Node {
  public constructor(model: PtolemaicModel) {
    super();

    const readout = new Text("0 yr 0 d", {
      font: new PhetFont(14),
      fill: SolarSystemModelsColors.textColorProperty,
    });
    this.addChild(readout);

    model.ptolemaicTimeProperty.link((days) => {
      const yr = Math.floor(days / DAYS_PER_YEAR);
      const d = Math.round(days % DAYS_PER_YEAR);
      readout.string = `${yr} yr ${d} d`;
    });
  }
}
