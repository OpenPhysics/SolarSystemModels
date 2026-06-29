/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. It triggers the full bootstrap chain:
 *
 *   brand.ts → splash.ts → assert.ts → init.ts
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first — triggers: init.ts → assert.ts → splash.ts → brand.ts
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { ConfigurationsScreen } from "./configurations/ConfigurationsScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { SolarSystemModelsPreferencesModel } from "./preferences/SolarSystemModelsPreferencesModel.js";
import { SolarSystemModelsPreferencesNode } from "./preferences/SolarSystemModelsPreferencesNode.js";
import { PtolemaicScreen } from "./ptolemaic/PtolemaicScreen.js";
import SolarSystemModelsColors from "./SolarSystemModelsColors.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();
  const screenNames = stringManager.getScreenNames();

  // Simulation-specific preferences; initial values come from solarSystemModelsQueryParameters.
  const simPreferences = new SolarSystemModelsPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  // Screen name Properties update automatically when the locale changes.
  const screens = [
    new PtolemaicScreen({
      name: screenNames.ptolemaicStringProperty,
      tandem: Tandem.ROOT.createTandem("ptolemaicScreen"),
      backgroundColorProperty: SolarSystemModelsColors.backgroundColorProperty,
    }),
    new ConfigurationsScreen({
      name: screenNames.configurationsStringProperty,
      tandem: Tandem.ROOT.createTandem("configurationsScreen"),
      backgroundColorProperty: SolarSystemModelsColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new SolarSystemModelsPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
