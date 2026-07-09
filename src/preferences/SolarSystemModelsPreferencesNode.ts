/**
 * SolarSystemModelsPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to SolarSystemModelsPreferencesModel Properties (whose initial values come from
 * solarSystemModelsQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";
import SolarSystemModelsNamespace from "../SolarSystemModelsNamespace.js";
import type { SolarSystemModelsPreferencesModel } from "./SolarSystemModelsPreferencesModel.js";

export class SolarSystemModelsPreferencesNode extends VBox {
  public constructor(_preferencesModel: SolarSystemModelsPreferencesModel, _tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: SolarSystemModelsColors.textColorProperty,
    });

    super({
      align: "left",
      spacing: 12,
      children: [header],
    });
  }
}

SolarSystemModelsNamespace.register("SolarSystemModelsPreferencesNode", SolarSystemModelsPreferencesNode);
