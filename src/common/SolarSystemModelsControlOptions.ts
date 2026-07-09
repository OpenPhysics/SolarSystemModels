/**
 * Compact control layouts matching the NAAP Flash panels:
 *   NumberControl:  [label] [value] [========slider========]
 *   Label+slider:   [label] [========slider========]
 */

import type { PhetioProperty, TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, type Range } from "scenerystack/dot";
import { HBox, type Node, Text } from "scenerystack/scenery";
import { type NumberControlOptions, PhetFont } from "scenerystack/scenery-phet";
import { HSlider } from "scenerystack/sun";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";
import { PANEL_WIDTH } from "../SolarSystemModelsConstants.js";

const LABEL_FONT = new PhetFont(12);
const VALUE_FONT = new PhetFont(11);
const THUMB_SIZE = new Dimension2(12, 22);
const NUMBER_TRACK_SIZE = new Dimension2(110, 3);
const INLINE_TRACK_SIZE = new Dimension2(150, 3);
const LABEL_MAX_WIDTH = 105;

/** Single-row NumberControl: label | value | slider (no arrow buttons). */
export function createCompactNumberControlOptions(overrides?: NumberControlOptions): NumberControlOptions {
  const base: NumberControlOptions = {
    includeArrowButtons: false,
    layoutFunction: (titleNode, numberDisplay, slider) =>
      new HBox({
        spacing: 6,
        align: "center",
        children: [titleNode, numberDisplay, slider],
      }),
    titleNodeOptions: {
      font: LABEL_FONT,
      fill: SolarSystemModelsColors.textColorProperty,
      maxWidth: LABEL_MAX_WIDTH,
    },
    numberDisplayOptions: {
      textOptions: {
        font: VALUE_FONT,
        fill: SolarSystemModelsColors.textColorProperty,
      },
      backgroundFill: SolarSystemModelsColors.panelBackgroundColorProperty,
      backgroundStroke: SolarSystemModelsColors.panelBorderColorProperty,
      xMargin: 4,
      yMargin: 2,
      minBackgroundWidth: 42,
      cornerRadius: 2,
    },
    sliderOptions: {
      trackSize: NUMBER_TRACK_SIZE,
      thumbSize: THUMB_SIZE,
    },
  };
  return {
    ...base,
    ...overrides,
    numberDisplayOptions: {
      ...base.numberDisplayOptions,
      ...overrides?.numberDisplayOptions,
    },
    sliderOptions: {
      ...base.sliderOptions,
      ...overrides?.sliderOptions,
    },
    titleNodeOptions: {
      ...base.titleNodeOptions,
      ...overrides?.titleNodeOptions,
    },
  };
}

/** Single-row label + HSlider, as used for animation rate / path duration in Flash. */
export function createCompactSliderRow(
  label: string | TReadOnlyProperty<string>,
  property: PhetioProperty<number>,
  range: Range,
  options?: { accessibleName?: TReadOnlyProperty<string> | string; trackWidth?: number },
): Node {
  const labelNode = new Text(label, {
    font: LABEL_FONT,
    fill: SolarSystemModelsColors.textColorProperty,
    maxWidth: LABEL_MAX_WIDTH,
  });
  const slider = new HSlider(property, range, {
    trackSize: new Dimension2(options?.trackWidth ?? INLINE_TRACK_SIZE.width, INLINE_TRACK_SIZE.height),
    thumbSize: THUMB_SIZE,
    ...(options?.accessibleName !== undefined ? { accessibleName: options.accessibleName } : {}),
  });
  return new HBox({
    spacing: 8,
    align: "center",
    children: [labelNode, slider],
    maxWidth: PANEL_WIDTH - 20,
  });
}

export { LABEL_FONT, THUMB_SIZE };
