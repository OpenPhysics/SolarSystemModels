import { Dimension2, Range } from "scenerystack/dot";
import type { Node } from "scenerystack/scenery";
import { HBox, Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont, TimeControlNode } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, ComboBox, HSlider, RectangularPushButton } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { ANIMATION_RATE_RANGE, PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";
import { PRESET_KEYS } from "../model/ConfigurationsPlanet.js";
import { EventAction } from "../model/EventAction.js";

const LABEL_FONT = new PhetFont(12);
const TITLE_FONT = new PhetFont({ size: 13, weight: "bold" });
const TRACK_SIZE = new Dimension2(PANEL_WIDTH - 50, 3);
const MAX_LABEL_WIDTH = PANEL_WIDTH - 60;

export class ConfigurationsControlPanel extends SolarSystemModelsPanel {
  public constructor(model: ConfigurationsModel, listParent: Node) {
    const s = StringManager.getInstance().getConfigurationsStrings();
    const a11y = StringManager.getInstance().getConfigurationsA11yStrings();

    const labelOpts = {
      font: LABEL_FONT,
      fill: SolarSystemModelsColors.textColorProperty,
      maxWidth: MAX_LABEL_WIDTH,
    } as const;

    // ── Observer planet preset ComboBox ───────────────────────────────────
    const presetLabels = [
      s.mercuryStringProperty,
      s.venusStringProperty,
      s.earthStringProperty,
      s.marsStringProperty,
      s.jupiterStringProperty,
      s.saturnStringProperty,
    ];

    const observer1Items = PRESET_KEYS.map((key, i) => ({
      value: i,
      createNode: (_tandem: Tandem) => new Text(presetLabels[i] ?? s.earthStringProperty, { ...labelOpts }),
      tandemName: `${key}Observer1Item`,
    }));

    const observer2Items = PRESET_KEYS.map((key, i) => ({
      value: i,
      createNode: (_tandem: Tandem) => new Text(presetLabels[i] ?? s.earthStringProperty, { ...labelOpts }),
      tandemName: `${key}Observer2Item`,
    }));

    const preset1Combo = new ComboBox(model.preset1IndexProperty, observer1Items, listParent, {
      accessibleName: a11y.controls.observerPlanetStringProperty,
    });
    preset1Combo.addLinkedElement(model.preset1IndexProperty);

    const preset2Combo = new ComboBox(model.preset2IndexProperty, observer2Items, listParent, {
      accessibleName: a11y.controls.targetPlanetStringProperty,
    });

    // When preset index changes, apply preset. Both planets landing on the same
    // orbit has no synodic period, so revert the combo box if that's rejected.
    model.preset1IndexProperty.lazyLink((idx, oldIdx) => {
      const key = PRESET_KEYS[idx];
      if (key !== undefined && !model.applyPreset(1, key)) {
        model.preset1IndexProperty.value = oldIdx;
      }
    });
    model.preset2IndexProperty.lazyLink((idx, oldIdx) => {
      const key = PRESET_KEYS[idx];
      if (key !== undefined && !model.applyPreset(2, key)) {
        model.preset2IndexProperty.value = oldIdx;
      }
    });

    // ── Axis NumberControls ───────────────────────────────────────────────
    const axis1Control = new NumberControl(
      s.semimajorAxisStringProperty,
      model.semimajorAxis1Property,
      new Range(0.1, 15),
      {
        titleNodeOptions: { ...labelOpts },
        delta: 0.01,
        numberDisplayOptions: { decimalPlaces: 2 },
        accessibleName: a11y.controls.observerAxisStringProperty,
      },
    );
    const axis2Control = new NumberControl(
      s.semimajorAxisStringProperty,
      model.semimajorAxis2Property,
      new Range(0.1, 15),
      {
        titleNodeOptions: { ...labelOpts },
        delta: 0.01,
        numberDisplayOptions: { decimalPlaces: 2 },
        accessibleName: a11y.controls.targetAxisStringProperty,
      },
    );

    // Sync slider changes to the model's setSemimajorAxis
    model.semimajorAxis1Property.lazyLink((v) => {
      model.setSemimajorAxis(1, v, false);
    });
    model.semimajorAxis2Property.lazyLink((v) => {
      model.setSemimajorAxis(2, v, false);
    });

    // ── TimeControlNode ───────────────────────────────────────────────────
    const timeControlNode = new TimeControlNode(model.timer.isPlayingProperty, {
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            if (!model.timer.isPlayingProperty.value) {
              model.step(1 / 60);
            }
          },
        },
      },
    });

    // ── Animation rate slider ─────────────────────────────────────────────
    const animRateLabel = new Text(s.animationRateStringProperty, labelOpts);
    const animRateSlider = new HSlider(
      model.timer.animationRateProperty,
      new Range(ANIMATION_RATE_RANGE.min, ANIMATION_RATE_RANGE.max),
      {
        trackSize: TRACK_SIZE,
        accessibleName: a11y.controls.animationRateStringProperty,
      },
    );

    // ── Reset time button ─────────────────────────────────────────────────
    const resetTimeButton = new RectangularPushButton({
      content: new Text(s.resetTimeStringProperty, labelOpts),
      listener: () => model.resetTime(),
      accessibleName: a11y.controls.resetTimeStringProperty,
    });

    // ── Event action radio group ──────────────────────────────────────────
    const eventActionLabel = new Text(s.eventActionStringProperty, {
      font: TITLE_FONT,
      fill: SolarSystemModelsColors.textColorProperty,
      maxWidth: MAX_LABEL_WIDTH,
    });
    const eventActionItems = [
      {
        value: EventAction.RUN,
        createNode: (_t: Tandem) => new Text(s.runStringProperty, labelOpts),
      },
      {
        value: EventAction.PAUSE,
        createNode: (_t: Tandem) => new Text(s.pauseStringProperty, labelOpts),
      },
      {
        value: EventAction.LOCK,
        createNode: (_t: Tandem) => new Text(s.lockStringProperty, labelOpts),
      },
    ];
    const eventActionGroup = new AquaRadioButtonGroup(model.eventActionProperty, eventActionItems, {
      accessibleName: a11y.controls.eventActionStringProperty,
    });

    // ── Pause time control ────────────────────────────────────────────────
    const pauseTimeControl = new NumberControl(s.pauseTimeStringProperty, model.pauseTimeProperty, new Range(1, 30), {
      titleNodeOptions: { ...labelOpts },
      delta: 1,
      numberDisplayOptions: { decimalPlaces: 0 },
      accessibleName: a11y.controls.pauseTimeStringProperty,
    });

    const content = new VBox({
      children: [
        new Text(s.observerPlanetStringProperty, {
          font: TITLE_FONT,
          fill: SolarSystemModelsColors.textColorProperty,
        }),
        preset1Combo,
        axis1Control,
        new Text(s.targetPlanetStringProperty, {
          font: TITLE_FONT,
          fill: SolarSystemModelsColors.textColorProperty,
        }),
        preset2Combo,
        axis2Control,
        timeControlNode,
        animRateLabel,
        animRateSlider,
        new HBox({ children: [resetTimeButton], spacing: 8 }),
        eventActionLabel,
        eventActionGroup,
        pauseTimeControl,
      ],
      spacing: 8,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
