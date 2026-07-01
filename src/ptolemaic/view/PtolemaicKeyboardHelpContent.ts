/**
 * PtolemaicKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 * Covers the screen's keyboard-accessible interactions: basic actions (Tab,
 * Reset All), the planet preset combo box, and the NumberControl sliders
 * (epicycle size, eccentricity, motion rate, apogee angle, animation rate,
 * path duration). Sun dragging is mouse/touch only — it has no keyboard
 * equivalent, so it isn't documented here.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class PtolemaicKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection(), new ComboBoxKeyboardHelpSection()],
      [new SliderControlsKeyboardHelpSection()],
    );
  }
}
