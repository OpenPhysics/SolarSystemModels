/**
 * SolarSystemModelsPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to SolarSystemModelsPreferencesModel Properties (whose initial values come from
 * solarSystemModelsQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";
import SolarSystemModelsNamespace from "../SolarSystemModelsNamespace.js";
import type { SolarSystemModelsPreferencesModel } from "./SolarSystemModelsPreferencesModel.js";

export class SolarSystemModelsPreferencesNode extends VBox {
  public constructor(preferencesModel: SolarSystemModelsPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: SolarSystemModelsColors.textColorProperty,
    });

    const exampleToggleCheckbox = new Checkbox(
      preferencesModel.exampleToggleProperty,
      new Text(prefStrings.exampleToggleStringProperty, {
        font: new PhetFont(14),
        fill: SolarSystemModelsColors.textColorProperty,
      }),
      {
        checkboxColor: SolarSystemModelsColors.textColorProperty,
        checkboxColorBackground: SolarSystemModelsColors.panelBackgroundColorProperty,
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("exampleToggleCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, exampleToggleCheckbox],
    });
  }
}

SolarSystemModelsNamespace.register("SolarSystemModelsPreferencesNode", SolarSystemModelsPreferencesNode);
