import type { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Path } from "scenerystack/scenery";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { PATH_DURATION_RANGE } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

const MAX_POINTS = 2000;

export class PtolemaicPathTrail extends Node {
  private readonly points: Vector2[] = [];
  private readonly trailPath: Path;
  private readonly mvt: ModelViewTransform2;

  public constructor(model: PtolemaicModel, mvt: ModelViewTransform2) {
    super();
    this.mvt = mvt;

    this.trailPath = new Path(null, {
      stroke: SolarSystemModelsColors.planetColorProperty,
      lineWidth: 1.5,
      opacity: 0.7,
    });
    this.addChild(this.trailPath);

    // Clear trail when physical parameters change
    const clearTrail = () => {
      this.points.length = 0;
      this.trailPath.shape = null;
    };
    model.epicycleSizeProperty.lazyLink(clearTrail);
    model.eccentricityProperty.lazyLink(clearTrail);
    model.apogeeAngleProperty.lazyLink(clearTrail);
    model.planetTypeProperty.lazyLink(clearTrail);
    model.motionRateProperty.lazyLink(clearTrail);
    model.pathDurationProperty.lazyLink(clearTrail);
  }

  public addPoint(modelPos: Vector2, model: PtolemaicModel): void {
    const viewPos = this.mvt.modelToViewPosition(modelPos);
    this.points.push(viewPos);

    // Cap buffer: keep only as many points as correspond to pathDuration years,
    // scaled against the longest selectable path duration (which fills the
    // whole MAX_POINTS buffer).
    const maxPts = Math.max(1, Math.round((model.pathDurationProperty.value * MAX_POINTS) / PATH_DURATION_RANGE.max));
    if (this.points.length > MAX_POINTS || this.points.length > maxPts) {
      this.points.shift();
    }

    this.redraw();
  }

  private redraw(): void {
    if (this.points.length < 2) {
      this.trailPath.shape = null;
      return;
    }
    const shape = new Shape();
    const first = this.points[0];
    if (first === undefined) {
      return;
    }
    shape.moveTo(first.x, first.y);
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      if (p !== undefined) {
        shape.lineTo(p.x, p.y);
      }
    }
    this.trailPath.shape = shape;
  }
}
