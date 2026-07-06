import type { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Path } from "scenerystack/scenery";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { DAYS_PER_YEAR } from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

// Faithful port of the Flash orbit-trail reconstruction (Ptolemaic System.as
// updatePath). The path is resimulated at a fixed 1.5-day sampling interval over
// exactly `pathDuration` years, split into NUM_SEGMENTS alpha-graded segments
// (newest brightest), plus a red "live" segment bridging the last sample to the
// planet's current position. This is frame-rate independent.
const NUM_SEGMENTS = 20;
const SAMPLING_INTERVAL = 1.5; // days

export class PtolemaicPathTrail extends Node {
  private readonly mvt: ModelViewTransform2;
  private readonly segmentPaths: Path[] = [];
  private readonly tempSegment: Path;

  /** Ecliptic longitudes (model, y-up) of the most recent resimulation, oldest→newest. */
  public lonArray: number[] = [];

  public constructor(model: PtolemaicModel, mvt: ModelViewTransform2) {
    super();

    this.mvt = mvt;

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const p = new Path(null, {
        stroke: SolarSystemModelsColors.planetColorProperty,
        lineWidth: 1,
      });
      this.segmentPaths.push(p);
      this.addChild(p);
    }

    this.tempSegment = new Path(null, {
      stroke: SolarSystemModelsColors.pathTrailLiveSegmentColorProperty,
      lineWidth: 1,
    });
    this.addChild(this.tempSegment);

    this.update(model);
  }

  /**
   * Resimulate the trail ending at the model's current state. Call on every
   * frame / parameter change. Mirrors AS updatePath but reconstructs the whole
   * window each update for simplicity (cheap: O(pathDays/1.5) trig ops).
   */
  public update(model: PtolemaicModel): void {
    const pathDays = model.pathDurationProperty.value * DAYS_PER_YEAR;
    const anomalyRate = model.getAnomalyRate();
    const sunRate = model.getSunRate();

    const endAnomaly = model.anomalyProperty.value;
    const endSun = model.sunAngleProperty.value;

    const nSamples = Math.max(2, Math.floor(pathDays / SAMPLING_INTERVAL));
    const startAnomaly = endAnomaly - anomalyRate * pathDays;
    const startSun = endSun - sunRate * pathDays;

    // Sample positions + longitudes.
    const viewPoints: Vector2[] = new Array(nSamples + 1);
    const longitudes: number[] = new Array(nSamples + 1);
    for (let i = 0; i <= nSamples; i++) {
      const an = startAnomaly + anomalyRate * SAMPLING_INTERVAL * i;
      const su = startSun + sunRate * SAMPLING_INTERVAL * i;
      const pos = model.samplePlanetPosition(an, su);
      viewPoints[i] = this.mvt.modelToViewPosition(pos);
      longitudes[i] = Math.atan2(pos.y, pos.x);
    }
    this.lonArray = longitudes;

    // Split samples across NUM_SEGMENTS, alpha-graduated: oldest faint, newest bright.
    const perSegment = nSamples / NUM_SEGMENTS;
    const baseAlpha = 100 / NUM_SEGMENTS; // 5
    for (let s = 0; s < NUM_SEGMENTS; s++) {
      const segPath = this.segmentPaths[s];
      if (segPath === undefined) {
        continue;
      }
      const segStart = Math.floor(s * perSegment);
      const segEnd = Math.floor((s + 1) * perSegment);
      // Segment s holds samples [segStart, segEnd]. Alpha increases with s so that
      // the newest segment (s = NUM_SEGMENTS-1) is brightest — matching AS where the
      // current segment reaches alpha 100.
      segPath.opacity = baseAlpha * (s + 1);
      if (segEnd <= segStart) {
        segPath.shape = null;
        continue;
      }
      const shape = new Shape();
      const first = viewPoints[segStart];
      if (first === undefined) {
        segPath.shape = null;
        continue;
      }
      shape.moveTo(first.x, first.y);
      for (let i = segStart + 1; i <= segEnd; i++) {
        const p = viewPoints[i];
        if (p !== undefined) {
          shape.lineTo(p.x, p.y);
        }
      }
      segPath.shape = shape;
    }

    // Red "live" segment: from the last sampled point to the planet's current position.
    const lastSample = viewPoints[nSamples];
    const livePos = this.mvt.modelToViewPosition(model.planetPositionProperty.value);
    if (lastSample !== undefined) {
      this.tempSegment.shape = new Shape().moveTo(lastSample.x, lastSample.y).lineTo(livePos.x, livePos.y);
    } else {
      this.tempSegment.shape = null;
    }
  }
}
