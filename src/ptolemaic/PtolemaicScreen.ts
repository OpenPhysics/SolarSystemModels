/**
 * PtolemaicScreen.ts
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
import { createPtolemaicIcon } from "../common/SolarSystemModelsScreenIcons.js";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";
import { PtolemaicModel } from "./model/PtolemaicModel.js";
import { PtolemaicKeyboardHelpContent } from "./view/PtolemaicKeyboardHelpContent.js";
import { PtolemaicScreenView } from "./view/PtolemaicScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type PtolemaicScreenOptions = ScreenOptions & { tandem: Tandem };

export class PtolemaicScreen extends Screen<PtolemaicModel, PtolemaicScreenView> {
  public constructor(options: PtolemaicScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new PtolemaicModel(),
      // View factory — receives the model instance
      (model) =>
        new PtolemaicScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<PtolemaicScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: SolarSystemModelsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new PtolemaicKeyboardHelpContent(),
          homeScreenIcon: createPtolemaicIcon(),
          navigationBarIcon: createPtolemaicIcon(),
        },
        options,
      ),
    );
  }
}
