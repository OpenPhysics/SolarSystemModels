/**
 * SolarSystemModelsPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in solarSystemModelsQueryParameters.
 *
 * Remove the example preference (and its query parameter / UI control) if the
 * sim has no sim-specific preferences.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import SolarSystemModelsNamespace from "../SolarSystemModelsNamespace.js";
import solarSystemModelsQueryParameters from "./solarSystemModelsQueryParameters.js";

export class SolarSystemModelsPreferencesModel {
  /** Example preference; initial value comes from the `exampleToggle` query parameter. */
  public readonly exampleToggleProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.exampleToggleProperty = new BooleanProperty(
      solarSystemModelsQueryParameters.exampleToggle,
      tandem ? { tandem: tandem.createTandem("exampleToggleProperty") } : undefined,
    );
  }

  public reset(): void {
    this.exampleToggleProperty.reset();
  }
}

SolarSystemModelsNamespace.register("SolarSystemModelsPreferencesModel", SolarSystemModelsPreferencesModel);
