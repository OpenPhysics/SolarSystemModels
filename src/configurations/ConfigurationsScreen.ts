/**
 * ConfigurationsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * For multi-screen simulations, duplicate this file (e.g. IntroScreen.ts,
 * LabScreen.ts) and add each screen to the screens array in src/main.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createConfigurationsIcon } from "../common/SolarSystemModelsScreenIcons.js";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";
import { ConfigurationsModel } from "./model/ConfigurationsModel.js";
import { ConfigurationsKeyboardHelpContent } from "./view/ConfigurationsKeyboardHelpContent.js";
import { ConfigurationsScreenView } from "./view/ConfigurationsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ConfigurationsScreenOptions = ScreenOptions & { tandem: Tandem };

export class ConfigurationsScreen extends Screen<ConfigurationsModel, ConfigurationsScreenView> {
  public constructor(options: ConfigurationsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ConfigurationsModel(),
      // View factory — receives the model instance
      (model) =>
        new ConfigurationsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ConfigurationsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: SolarSystemModelsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ConfigurationsKeyboardHelpContent(),
          homeScreenIcon: createConfigurationsIcon(),
          navigationBarIcon: createConfigurationsIcon(),
        },
        options,
      ),
    );
  }
}
