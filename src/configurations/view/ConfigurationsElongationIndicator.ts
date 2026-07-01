import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Path, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { CONFIGURATIONS_ELONGATION_ARC_RADIUS } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

export class ConfigurationsElongationIndicator extends Node {
  private mvt: ModelViewTransform2;
  private readonly model: ConfigurationsModel;
  private readonly sunArrow: ArrowNode;
  private readonly planetArrow: ArrowNode;
  private readonly arcPath: Path;
  private readonly elongLabel: Text;

  public constructor(model: ConfigurationsModel, mvt: ModelViewTransform2) {
    super({ visibleProperty: model.showElongationAngleProperty });

    this.model = model;
    this.mvt = mvt;

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

    Multilink.multilink(
      [model.pos1Property, model.pos2Property, model.elongationDegProperty, model.elongationLabelProperty] as const,
      (p1, p2, elongDeg, elongLabel_) => this.update(p1, p2, elongDeg, elongLabel_),
    );
  }

  /** Called by the screen view when the orbit scale changes and a new transform is built. */
  public setModelViewTransform(mvt: ModelViewTransform2): void {
    this.mvt = mvt;
    this.update(
      this.model.pos1Property.value,
      this.model.pos2Property.value,
      this.model.elongationDegProperty.value,
      this.model.elongationLabelProperty.value,
    );
  }

  private update(p1: Vector2, p2: Vector2, elongDeg: number, elongLabel_: string): void {
    // Convert model positions to view
    const vp1 = this.mvt.modelToViewPosition(p1);
    const vp2 = this.mvt.modelToViewPosition(p2);
    const vSun = this.mvt.modelToViewPosition(Vector2.ZERO);

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

    // Arc — draw from sunDir to planetDir in the elongation direction
    const arcShape = new Shape();
    if (Math.abs(elongDeg) > 0.5) {
      // AS: if elongationValue < 0 (East): drawArc from -sunDir to -planetDir
      // In view coords (y-down), angles are negated vs model
      // We draw CW or CCW depending on sign
      const startAngle = sunDir;
      const endAngle = planetDir;
      // Determine sweep direction: elongDeg < 0 (East) means target is east of Sun
      const anticlockwise = elongDeg > 0; // W = clockwise sweep, E = anticlockwise
      arcShape.arc(vp1.x, vp1.y, CONFIGURATIONS_ELONGATION_ARC_RADIUS, startAngle, endAngle, anticlockwise);
    }
    this.arcPath.shape = arcShape;

    // Label at midpoint angle
    const midAngle = (sunDir + planetDir) / 2;
    const labelR = CONFIGURATIONS_ELONGATION_ARC_RADIUS + 14;
    this.elongLabel.string = `${Math.abs(elongDeg).toFixed(1)}° ${elongLabel_}`;
    this.elongLabel.centerX = vp1.x + labelR * Math.cos(midAngle);
    this.elongLabel.centerY = vp1.y + labelR * Math.sin(midAngle);
  }
}
