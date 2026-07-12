import { Range } from "scenerystack/dot";
import { HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, ComboBox, RectangularPushButton } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import {
  FLAT_RECTANGULAR_BUTTON_OPTIONS,
  SOLAR_SYSTEM_MODELS_COMBO_BOX_OPTIONS,
} from "../../common/SolarSystemModelsButtonOptions.js";
import { createCompactNumberControlOptions } from "../../common/SolarSystemModelsControlOptions.js";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import {
  APOGEE_ANGLE_RANGE,
  ECCENTRICITY_RANGE,
  EPICYCLE_SIZE_RANGE,
  MOTION_RATE_RANGE,
  PANEL_CONTENT_SPACING,
  PANEL_WIDTH,
} from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";
import type { PlanetPresetKey } from "../model/PtolemaicPlanet.js";
import { PlanetType, PRESET_KEYS } from "../model/PtolemaicPlanet.js";

const TITLE_FONT = new PhetFont({ size: 12, weight: "bold" });
const LABEL_FONT = new PhetFont(12);
const MAX_LABEL_WIDTH = PANEL_WIDTH - 60;

export class PtolemaicControlPanel extends SolarSystemModelsPanel {
  public constructor(model: PtolemaicModel, listParent: Node) {
    const strings = StringManager.getInstance().getPtolemaicStrings();
    const a11y = StringManager.getInstance().getPtolemaicA11yStrings();

    // ── Planet preset ComboBox ─────────────────────────────────────────────
    const presetKeys: PlanetPresetKey[] = ["venus", "mars", "jupiter", "saturn"];
    const presetLabels = [
      strings.venusStringProperty,
      strings.marsStringProperty,
      strings.jupiterStringProperty,
      strings.saturnStringProperty,
    ];

    const comboItems = presetKeys.map((key, i) => {
      const labelProp = presetLabels[i] ?? strings.marsStringProperty;
      return {
        value: i,
        createNode: (_tandem: Tandem) =>
          new Text(labelProp, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
            maxWidth: MAX_LABEL_WIDTH,
          }),
        tandemName: `${key}Item`,
      };
    });

    const presetComboBox = new ComboBox(model.presetKeyProperty, comboItems, listParent, {
      ...SOLAR_SYSTEM_MODELS_COMBO_BOX_OPTIONS,
      accessibleName: a11y.controls.planetPresetStringProperty,
    });

    // ── NumberControls (Flash: label | value | slider on one row) ───────────
    const epicycleSizeControl = new NumberControl(
      strings.epicycleSizeStringProperty,
      model.epicycleSizeProperty,
      new Range(EPICYCLE_SIZE_RANGE.min, EPICYCLE_SIZE_RANGE.max),
      createCompactNumberControlOptions({
        delta: 0.01,
        numberDisplayOptions: { decimalPlaces: 3 },
        accessibleName: a11y.controls.epicycleSizeStringProperty,
      }),
    );
    const eccentricityControl = new NumberControl(
      strings.eccentricityStringProperty,
      model.eccentricityProperty,
      new Range(ECCENTRICITY_RANGE.min, ECCENTRICITY_RANGE.max),
      createCompactNumberControlOptions({
        delta: 0.001,
        numberDisplayOptions: { decimalPlaces: 3 },
        accessibleName: a11y.controls.eccentricityStringProperty,
      }),
    );
    const motionRateControl = new NumberControl(
      strings.motionRateStringProperty,
      model.motionRateProperty,
      new Range(MOTION_RATE_RANGE.min, MOTION_RATE_RANGE.max),
      createCompactNumberControlOptions({
        delta: 0.01,
        numberDisplayOptions: { decimalPlaces: 3 },
        accessibleName: a11y.controls.motionRateStringProperty,
      }),
    );
    const apogeeAngleControl = new NumberControl(
      strings.apogeeAngleStringProperty,
      model.apogeeAngleProperty,
      new Range(APOGEE_ANGLE_RANGE.min, APOGEE_ANGLE_RANGE.max),
      createCompactNumberControlOptions({
        delta: 1,
        numberDisplayOptions: { decimalPlaces: 1 },
        accessibleName: a11y.controls.apogeeAngleStringProperty,
      }),
    );

    // ── Planet type radio group ────────────────────────────────────────────
    const radioItems = [
      {
        value: PlanetType.SUPERIOR,
        createNode: (_tandem: Tandem) =>
          new Text(strings.superiorStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
      },
      {
        value: PlanetType.INFERIOR,
        createNode: (_tandem: Tandem) =>
          new Text(strings.inferiorStringProperty, {
            font: LABEL_FONT,
            fill: SolarSystemModelsColors.textColorProperty,
          }),
      },
    ];

    const planetTypeGroup = new AquaRadioButtonGroup(model.planetTypeProperty, radioItems, {
      orientation: "horizontal",
      spacing: 10,
      stretch: false,
      accessibleName: a11y.controls.planetTypeStringProperty,
    });

    // ── Memory store / recall buttons ──────────────────────────────────────
    const storeButton = new RectangularPushButton({
      content: new Text(strings.memoryStoreStringProperty, {
        font: LABEL_FONT,
        fill: SolarSystemModelsColors.textColorProperty,
      }),
      listener: () => model.storeMemory(),
      accessibleName: a11y.controls.memoryStoreStringProperty,
      ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    });
    const recallButton = new RectangularPushButton({
      content: new Text(strings.memoryRecallStringProperty, {
        font: LABEL_FONT,
        fill: SolarSystemModelsColors.textColorProperty,
      }),
      listener: () => model.recallMemory(),
      // Disabled until a snapshot is stored (AS: memoryRecallButton.setEnabled(false)).
      enabledProperty: model.hasMemoryProperty,
      accessibleName: a11y.controls.memoryRecallStringProperty,
      ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    });

    // ── OK / re-apply selected preset button (AS setPresets "OK") ──────────
    // OK starts disabled and enables when the combo/sliders/radio diverge from
    // the selected preset (AS: setPresetsButton state machine).
    const okButton = new RectangularPushButton({
      content: new Text(strings.okStringProperty, {
        font: LABEL_FONT,
        fill: SolarSystemModelsColors.textColorProperty,
      }),
      listener: () => {
        const key = PRESET_KEYS[model.presetKeyProperty.value];
        if (key !== undefined) {
          model.applyPreset(key);
        }
      },
      enabledProperty: model.presetIsDirtyProperty,
      accessibleName: a11y.controls.setPresetStringProperty,
      ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    });

    const content = new VBox({
      children: [
        new Text(strings.planetStringProperty, {
          font: TITLE_FONT,
          fill: SolarSystemModelsColors.textColorProperty,
        }),
        new HBox({ children: [presetComboBox, okButton], spacing: 8, align: "center" }),
        epicycleSizeControl,
        eccentricityControl,
        motionRateControl,
        apogeeAngleControl,
        planetTypeGroup,
        new HBox({ children: [storeButton, recallButton], spacing: 8 }),
      ],
      spacing: PANEL_CONTENT_SPACING,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
