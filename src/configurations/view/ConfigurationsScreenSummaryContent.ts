/**
 * ConfigurationsScreenSummaryContent.ts
 *
 * The accessible screen summary read by screen readers (SceneryStack's
 * Interactive Description). It appears at the top of the parallel DOM and gives
 * a non-visual user a way to orient themselves and to re-read the simulation's
 * current state at any time.
 *
 * A summary has four regions (all optional, but provide at least the first
 * three in every sim for consistency across OpenPhysics):
 *   - playAreaContent       — what the play area contains
 *   - controlAreaContent    — what the controls do
 *   - currentDetailsContent — a LIVE paragraph describing current state
 *   - interactionHintContent — a short hint on how to get started
 *
 * currentDetailsContent is a DerivedProperty over the observer/target planet
 * presets, the current time, and (if locked) the current configuration name,
 * so the paragraph updates as the sim runs.
 */
import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";
import { PRESET_KEYS } from "../model/ConfigurationsPlanet.js";

export class ConfigurationsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ConfigurationsModel) {
    const a11y = StringManager.getInstance().getConfigurationsA11yStrings();
    const strings = StringManager.getInstance().getConfigurationsStrings();

    // Ordered to match PRESET_KEYS: mercury, venus, earth, mars, jupiter, saturn.
    const planetLabelProperties = [
      strings.mercuryStringProperty,
      strings.venusStringProperty,
      strings.earthStringProperty,
      strings.marsStringProperty,
      strings.jupiterStringProperty,
      strings.saturnStringProperty,
    ] as const;

    const currentDetailsProperty = new DerivedProperty(
      [
        model.preset1IndexProperty,
        model.preset2IndexProperty,
        model.timeProperty,
        model.currentConfigurationProperty,
        a11y.currentDetailsTemplateStringProperty,
        a11y.currentConfigurationTemplateStringProperty,
        ...planetLabelProperties,
      ] as const,
      (preset1Index, preset2Index, time, currentConfiguration, template, configTemplate, ...planetLabels) => {
        const earthIndex = PRESET_KEYS.indexOf("earth");
        const observerLabel = planetLabels[preset1Index] ?? planetLabels[earthIndex];
        const targetLabel = planetLabels[preset2Index] ?? planetLabels[earthIndex];
        const configPart = currentConfiguration === "" ? "" : configTemplate.replace("{0}", currentConfiguration);

        return template
          .replace("{0}", observerLabel ?? "")
          .replace("{1}", targetLabel ?? "")
          .replace("{2}", time.toFixed(2))
          .replace("{3}", configPart)
          .trim();
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
