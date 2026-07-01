/**
 * PtolemaicScreenSummaryContent.ts
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
 * currentDetailsContent is a DerivedProperty over the current planet preset
 * and the play/pause + animation rate state, so the paragraph updates as the
 * sim runs.
 */
import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";
import { PRESET_KEYS } from "../model/PtolemaicPlanet.js";

export class PtolemaicScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: PtolemaicModel) {
    const a11y = StringManager.getInstance().getPtolemaicA11yStrings();
    const strings = StringManager.getInstance().getPtolemaicStrings();

    // Ordered to match PRESET_KEYS: venus, mars, jupiter, saturn.
    const presetLabelProperties = [
      strings.venusStringProperty,
      strings.marsStringProperty,
      strings.jupiterStringProperty,
      strings.saturnStringProperty,
    ] as const;

    const currentDetailsProperty = new DerivedProperty(
      [
        model.presetKeyProperty,
        model.timer.isPlayingProperty,
        model.timer.animationRateProperty,
        a11y.currentDetailsTemplateStringProperty,
        a11y.playingStringProperty,
        a11y.pausedStringProperty,
        ...presetLabelProperties,
      ] as const,
      (presetIndex, isPlaying, animationRate, template, playing, paused, ...presetLabels) => {
        const presetLabel = presetLabels[presetIndex] ?? presetLabels[PRESET_KEYS.indexOf("mars")];
        return template
          .replace("{0}", presetLabel ?? "")
          .replace("{1}", isPlaying ? playing : paused)
          .replace("{2}", animationRate.toFixed(1));
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
