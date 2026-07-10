import type { TReadOnlyProperty } from "scenerystack/axon";
import { Multilink } from "scenerystack/axon";
import { toFixed, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Path, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { CONFIGURATIONS_ELONGATION_ARC_RADIUS } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

export class ConfigurationsElongationIndicator extends Node {
  private readonly sunArrow: ArrowNode;
  private readonly planetArrow: ArrowNode;
  private readonly arcPath: Path;
  private readonly elongLabel: Text;

  public constructor(model: ConfigurationsModel, mvtProperty: TReadOnlyProperty<ModelViewTransform2>) {
    super({ visibleProperty: model.showElongationAngleProperty });

    this.sunArrow = new ArrowNode(0, 0, 1, 0, {
      stroke: null,
      fill: SolarSystemModelsColors.elongationColorProperty,
      headWidth: 8,
      headHeight: 6,
      tailWidth: 2,
    });
    this.planetArrow = new ArrowNode(0, 0, 1, 0, {
      stroke: null,
      fill: SolarSystemModelsColors.elongationColorProperty,
      headWidth: 8,
      headHeight: 6,
      tailWidth: 2,
    });
    this.arcPath = new Path(null, {
      stroke: SolarSystemModelsColors.elongationColorProperty,
      lineWidth: 1.5,
    });
    this.elongLabel = new Text("", {
      font: new PhetFont(11),
      fill: SolarSystemModelsColors.elongationColorProperty,
    });

    this.addChild(this.arcPath);
    this.addChild(this.sunArrow);
    this.addChild(this.planetArrow);
    this.addChild(this.elongLabel);

    // Combining pos1/pos2/elongation with mvtProperty here (rather than the
    // screen view manually pushing an update after rebuilding the transform)
    // means this node always redraws itself consistently, whichever of its
    // dependencies changed.
    Multilink.multilink(
      [
        model.pos1Property,
        model.pos2Property,
        model.elongationDegProperty,
        model.elongationLabelProperty,
        mvtProperty,
      ] as const,
      (p1, p2, elongDeg, elongLabel_, mvt) => this.update(p1, p2, elongDeg, elongLabel_, mvt),
    );
  }

  private update(p1: Vector2, p2: Vector2, elongDeg: number, elongLabel_: string, mvt: ModelViewTransform2): void {
    // Convert model positions to view
    const vp1 = mvt.modelToViewPosition(p1);
    const vp2 = mvt.modelToViewPosition(p2);
    const vSun = mvt.modelToViewPosition(Vector2.ZERO);

    // Direction from p1 toward Sun (view)
    const sunDir = Math.atan2(vSun.y - vp1.y, vSun.x - vp1.x);
    // Direction from p1 toward p2 (view)
    const planetDir = Math.atan2(vp2.y - vp1.y, vp2.x - vp1.x);

    // Arrow endpoints — extend to edge of diagram
    const arrowLen = 180;
    this.sunArrow.setTailAndTip(vp1.x, vp1.y, vp1.x + arrowLen * Math.cos(sunDir), vp1.y + arrowLen * Math.sin(sunDir));
    this.planetArrow.setTailAndTip(
      vp1.x,
      vp1.y,
      vp1.x + arrowLen * Math.cos(planetDir),
      vp1.y + arrowLen * Math.sin(planetDir),
    );

    // Arc — draw the elongation wedge between the Sun and planet rays.
    // Flash Orbits Diagram.as drawArc always sweeps the CCW math arc; it swaps
    // start/end by sign so the drawn wedge matches |elongation| (not the reflex).
    // In view coords (y-down), that is the opposite of the previous sweep flag.
    const arcShape = new Shape();
    if (Math.abs(elongDeg) > 0.5) {
      const startAngle = sunDir;
      const endAngle = planetDir;
      // elongDeg < 0 (East): increasing-angle sweep; > 0 (West): decreasing-angle
      const anticlockwise = elongDeg < 0;
      arcShape.arc(vp1.x, vp1.y, CONFIGURATIONS_ELONGATION_ARC_RADIUS, startAngle, endAngle, anticlockwise);
    }
    this.arcPath.shape = arcShape;

    // Label at the midpoint of the elongation arc (Flash: sunDir + elong/2)
    const midAngle = sunDir + (elongDeg * Math.PI) / 360;
    const labelR = CONFIGURATIONS_ELONGATION_ARC_RADIUS + 14;
    this.elongLabel.string = `${toFixed(Math.abs(elongDeg), 1)}° ${elongLabel_}`;
    this.elongLabel.centerX = vp1.x + labelR * Math.cos(midAngle);
    this.elongLabel.centerY = vp1.y + labelR * Math.sin(midAngle);
  }
}
