/**
 * SolarSystemModelsPanel.ts
 *
 * A pre-themed Panel that automatically uses SolarSystemModelsColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { SolarSystemModelsPanel } from "../../common/SolarSystemModelsPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 5,
 *   });
 *   const panel = new SolarSystemModelsPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new SolarSystemModelsPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new SolarSystemModelsPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";
import { PANEL_CORNER_RADIUS, PANEL_X_MARGIN, PANEL_Y_MARGIN } from "../SolarSystemModelsConstants.js";

export type SolarSystemModelsPanelOptions = PanelOptions;

export class SolarSystemModelsPanel extends Panel {
  public constructor(content: Node, providedOptions?: SolarSystemModelsPanelOptions) {
    const options = optionize<SolarSystemModelsPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: SolarSystemModelsColors.panelBackgroundColorProperty,
        stroke: SolarSystemModelsColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: PANEL_X_MARGIN,
        yMargin: PANEL_Y_MARGIN,
      },
      providedOptions,
    );
    super(content, options);
  }
}
