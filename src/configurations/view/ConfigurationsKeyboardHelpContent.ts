/**
 * ConfigurationsKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 * Covers the screen's keyboard-accessible interactions: basic actions (Tab,
 * Reset All), the observer/target planet combo boxes, and the NumberControl
 * sliders (orbit radii, animation rate, pause time). Dragging the planets
 * (and Shift-dragging to set epoch angle) and scrubbing/clicking the timeline
 * are mouse/touch only — they have no keyboard equivalent, so they aren't
 * documented here.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class ConfigurationsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection(), new ComboBoxKeyboardHelpSection()],
      [new SliderControlsKeyboardHelpSection()],
    );
  }
}
