import type { ReadOnlyProperty } from "scenerystack/axon";
import { NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TPaint } from "scenerystack/scenery";
import { Circle, HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { RectangularPushButton } from "scenerystack/sun";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS } from "../../common/SolarSystemModelsButtonOptions.js";
import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { PANEL_CONTENT_SPACING, PANEL_WIDTH } from "../../SolarSystemModelsConstants.js";

const TITLE_FONT = new PhetFont({ size: 12, weight: "bold" });
const TAB_FONT = new PhetFont(11);
const TAB_FONT_BOLD = new PhetFont({ size: 11, weight: "bold" });
const INFO_FONT = new PhetFont(11);

interface KeyTab {
  swatchFill: TPaint;
  labelProperty: ReadOnlyProperty<string>;
  infoProperty: ReadOnlyProperty<string>;
}

/**
 * Interactive "Key" panel with 5 selectable tabs (Earth, Planet, Sun, Deferent
 * Center, Equant). Each tab shows a descriptive sentence in an info field.
 * Port of the Flash "Key" panel (DefineSprite_256).
 */
export class PtolemaicKeyPanel extends SolarSystemModelsPanel {
  public constructor() {
    const s = StringManager.getInstance().getPtolemaicStrings();

    const tabs: KeyTab[] = [
      {
        swatchFill: SolarSystemModelsColors.earthColorProperty,
        labelProperty: s.keyEarthStringProperty,
        infoProperty: s.keyEarthInfoStringProperty,
      },
      {
        swatchFill: SolarSystemModelsColors.planetColorProperty,
        labelProperty: s.keyPlanetStringProperty,
        infoProperty: s.keyPlanetInfoStringProperty,
      },
      {
        swatchFill: SolarSystemModelsColors.sunColorProperty,
        labelProperty: s.keySunStringProperty,
        infoProperty: s.keySunInfoStringProperty,
      },
      {
        swatchFill: SolarSystemModelsColors.eccentricColorProperty,
        labelProperty: s.keyDeferentCenterStringProperty,
        infoProperty: s.keyDeferentCenterInfoStringProperty,
      },
      {
        swatchFill: SolarSystemModelsColors.equantColorProperty,
        labelProperty: s.keyEquantStringProperty,
        infoProperty: s.keyEquantInfoStringProperty,
      },
    ];

    const selectedTabProperty = new NumberProperty(0, { range: new Range(0, tabs.length - 1) });

    const title = new Text(s.keyStringProperty, {
      font: TITLE_FONT,
      fill: SolarSystemModelsColors.textColorProperty,
    });

    // ── Tab buttons ───────────────────────────────────────────────────────
    const tabButtons: Node[] = [];
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      if (tab === undefined) {
        continue;
      }

      const swatch = new Circle(5, { fill: tab.swatchFill, stroke: SolarSystemModelsColors.panelBorderColorProperty });
      const label = new Text(tab.labelProperty, {
        font: TAB_FONT,
        fill: SolarSystemModelsColors.textColorProperty,
      });

      const tabIndex = i;
      const button = new RectangularPushButton({
        content: new HBox({ children: [swatch, label], spacing: 4, align: "center" }),
        listener: () => {
          selectedTabProperty.value = tabIndex;
        },
        accessibleName: tab.labelProperty,
        ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
      });

      // Bold the label of the selected tab
      selectedTabProperty.link((idx) => {
        label.font = idx === tabIndex ? TAB_FONT_BOLD : TAB_FONT;
      });

      tabButtons.push(button);
    }

    const tabRow = new HBox({ children: tabButtons, spacing: 2, align: "center" });

    // ── Info text field (updates with the selected tab) ──────────────────
    // biome-ignore lint/style/noNonNullAssertion: tabs array is never empty (5 entries)
    const infoText = new Text(tabs[0]!.infoProperty, {
      font: INFO_FONT,
      fill: SolarSystemModelsColors.textColorProperty,
      maxWidth: PANEL_WIDTH - 20,
    });

    selectedTabProperty.link((idx) => {
      const tab = tabs[idx];
      if (tab !== undefined) {
        infoText.string = tab.infoProperty.value;
      }
    });

    const content = new VBox({
      children: [title, tabRow, infoText],
      spacing: PANEL_CONTENT_SPACING,
      align: "left",
    });

    super(content, { minWidth: PANEL_WIDTH });
  }
}
