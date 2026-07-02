/**
 * SolarSystemModelsButtonOptions.ts
 *
 * Shared flat button appearance for the sim. Rectangular and round push buttons
 * (RectangularPushButton, ResetAllButton, TimeControlNode's nested play/pause/step
 * buttons) default to SceneryStack's 3-D beveled appearance; spread these options
 * (or the nested bundle) in to get a flat look everywhere instead.
 *
 * Also exports the ComboBox chrome used for preset selectors: the sim's default
 * color profile is dark (SolarSystemModelsColors.backgroundColorProperty /
 * panelBackgroundColorProperty), and ComboBox item labels are drawn with the
 * near-white SolarSystemModelsColors.textColorProperty, so the ComboBox itself
 * must be given matching dark buttonFill/listFill — otherwise it silently falls
 * back to SceneryStack's default white chrome, producing near-invisible
 * near-white-on-white text in the default profile.
 */

import type { PlayPauseStepButtonGroupOptions } from "scenerystack/scenery-phet";
import { ButtonNode, type ComboBoxOptions } from "scenerystack/sun";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";

export const FLAT_BUTTON_APPEARANCE_OPTIONS = {
  buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
} as const;

/** Options for RectangularPushButton and similar rectangular buttons. */
export const FLAT_RECTANGULAR_BUTTON_OPTIONS = FLAT_BUTTON_APPEARANCE_OPTIONS;

/** Options for ResetAllButton (extends RoundPushButton). */
export const FLAT_RESET_ALL_BUTTON_OPTIONS = FLAT_BUTTON_APPEARANCE_OPTIONS;

/** Nested options for TimeControlNode's play / pause / step round buttons. */
export const FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS = {
  playPauseButtonOptions: FLAT_BUTTON_APPEARANCE_OPTIONS,
  stepForwardButtonOptions: FLAT_BUTTON_APPEARANCE_OPTIONS,
  stepBackwardButtonOptions: FLAT_BUTTON_APPEARANCE_OPTIONS,
} satisfies PlayPauseStepButtonGroupOptions;

/**
 * Combo-box chrome for preset selectors on the dark panel. Pairs the panel's own
 * dark background/border colors with the ComboBox so its near-white item text
 * (SolarSystemModelsColors.textColorProperty) stays readable in both the default
 * (dark) and projector (light) profiles.
 */
export const SOLAR_SYSTEM_MODELS_COMBO_BOX_OPTIONS = {
  buttonFill: SolarSystemModelsColors.panelBackgroundColorProperty,
  listFill: SolarSystemModelsColors.panelBackgroundColorProperty,
  buttonStroke: SolarSystemModelsColors.panelBorderColorProperty,
  listStroke: SolarSystemModelsColors.panelBorderColorProperty,
  highlightFill: SolarSystemModelsColors.panelBorderColorProperty,
} satisfies Pick<ComboBoxOptions, "buttonFill" | "listFill" | "buttonStroke" | "listStroke" | "highlightFill">;
