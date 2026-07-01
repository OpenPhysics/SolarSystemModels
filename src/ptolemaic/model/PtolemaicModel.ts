import type { TReadOnlyProperty } from "scenerystack/axon";
import { BooleanProperty, DerivedProperty, EnumerationProperty, NumberProperty } from "scenerystack/axon";
import { Range, Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeModel } from "../../common/TimeModel.js";
import {
  APOGEE_ANGLE_RANGE,
  DAYS_PER_YEAR,
  ECCENTRICITY_RANGE,
  EPICYCLE_SIZE_RANGE,
  MOTION_RATE_RANGE,
  PATH_DURATION_RANGE,
  PTOLEMAIC_DAYS_PER_SECOND,
  PTOLEMAIC_DEFERENT_RADIUS,
  PTOLEMAIC_SUN_ORBIT_RADIUS,
} from "../../SolarSystemModelsConstants.js";
import type { PlanetPresetKey } from "./PtolemaicPlanet.js";
import { PLANET_PRESETS, PlanetType, PRESET_KEYS } from "./PtolemaicPlanet.js";

type MemorySnapshot = {
  epicycleSize: number;
  eccentricity: number;
  motionRate: number;
  apogeeAngle: number;
  planetType: PlanetType;
};

export class PtolemaicModel implements TModel {
  // ── Composed timing model ──────────────────────────────────────────────────
  public readonly timer: TimeModel;

  // ── Physical parameters ────────────────────────────────────────────────────
  public readonly epicycleSizeProperty: NumberProperty;
  public readonly eccentricityProperty: NumberProperty;
  public readonly motionRateProperty: NumberProperty;
  public readonly apogeeAngleProperty: NumberProperty;
  public readonly planetTypeProperty: EnumerationProperty<PlanetType>;
  public readonly presetKeyProperty: NumberProperty; // index into preset keys

  // ── Dynamic state (angles in radians, time in days) ───────────────────────
  public readonly sunAngleProperty: NumberProperty;
  public readonly anomalyProperty: NumberProperty;
  public readonly ptolemaicTimeProperty: NumberProperty;

  // ── Display toggles ────────────────────────────────────────────────────────
  public readonly showDeferentProperty: BooleanProperty;
  public readonly showEpicycleProperty: BooleanProperty;
  public readonly showPlanetVectorProperty: BooleanProperty;
  public readonly showEquantVectorProperty: BooleanProperty;
  public readonly showEarthSunLineProperty: BooleanProperty;
  public readonly showEpicyclePlanetLineProperty: BooleanProperty;

  // ── Path trail duration ────────────────────────────────────────────────────
  public readonly pathDurationProperty: NumberProperty; // years

  // ── Derived positions (model coords, y-up) ────────────────────────────────
  public readonly deferentCenterProperty: TReadOnlyProperty<Vector2>;
  public readonly equantPositionProperty: TReadOnlyProperty<Vector2>;
  public readonly epicycleCenterProperty: TReadOnlyProperty<Vector2>;
  public readonly planetPositionProperty: TReadOnlyProperty<Vector2>;
  public readonly sunPositionProperty: TReadOnlyProperty<Vector2>;
  public readonly eclipticLongitudeProperty: TReadOnlyProperty<number>;
  public readonly sunLongitudeProperty: TReadOnlyProperty<number>;

  private memory: MemorySnapshot | null = null;

  public constructor() {
    this.timer = new TimeModel(false);

    this.epicycleSizeProperty = new NumberProperty(PLANET_PRESETS.mars.epicycleSize, {
      range: new Range(EPICYCLE_SIZE_RANGE.min, EPICYCLE_SIZE_RANGE.max),
    });
    this.eccentricityProperty = new NumberProperty(PLANET_PRESETS.mars.eccentricity, {
      range: new Range(ECCENTRICITY_RANGE.min, ECCENTRICITY_RANGE.max),
    });
    this.motionRateProperty = new NumberProperty(PLANET_PRESETS.mars.motionRate, {
      range: new Range(MOTION_RATE_RANGE.min, MOTION_RATE_RANGE.max),
    });
    this.apogeeAngleProperty = new NumberProperty(PLANET_PRESETS.mars.apogeeAngle, {
      range: new Range(APOGEE_ANGLE_RANGE.min, APOGEE_ANGLE_RANGE.max),
    });
    this.planetTypeProperty = new EnumerationProperty(PLANET_PRESETS.mars.planetType);

    // Index into PRESET_KEYS (1 = mars)
    this.presetKeyProperty = new NumberProperty(1, {
      range: new Range(0, PRESET_KEYS.length - 1),
      numberType: "Integer",
    });

    this.sunAngleProperty = new NumberProperty(0);
    this.anomalyProperty = new NumberProperty(0);
    this.ptolemaicTimeProperty = new NumberProperty(0);

    this.showDeferentProperty = new BooleanProperty(true);
    this.showEpicycleProperty = new BooleanProperty(true);
    this.showPlanetVectorProperty = new BooleanProperty(false);
    this.showEquantVectorProperty = new BooleanProperty(false);
    this.showEarthSunLineProperty = new BooleanProperty(false);
    this.showEpicyclePlanetLineProperty = new BooleanProperty(false);

    this.pathDurationProperty = new NumberProperty(2.5, {
      range: new Range(PATH_DURATION_RANGE.min, PATH_DURATION_RANGE.max),
    });

    // Shared dependencies array for geometry derived properties
    const geomDeps = [
      this.epicycleSizeProperty,
      this.eccentricityProperty,
      this.apogeeAngleProperty,
      this.planetTypeProperty,
      this.sunAngleProperty,
      this.anomalyProperty,
    ] as const;

    this.deferentCenterProperty = new DerivedProperty(geomDeps, (_re, ecc, apogDeg, _type, _sun, _an) => {
      const ap = (apogDeg * Math.PI) / 180;
      return new Vector2(ecc * Math.cos(ap), ecc * Math.sin(ap));
    });

    this.equantPositionProperty = new DerivedProperty(geomDeps, (_re, ecc, apogDeg, _type, _sun, _an) => {
      const ap = (apogDeg * Math.PI) / 180;
      return new Vector2(2 * ecc * Math.cos(ap), 2 * ecc * Math.sin(ap));
    });

    this.epicycleCenterProperty = new DerivedProperty(geomDeps, (_re, ecc, apogDeg, type, sun, anomaly) => {
      return PtolemaicModel.computeEpicycleCenter(ecc, apogDeg, type, sun, anomaly);
    });

    this.planetPositionProperty = new DerivedProperty(geomDeps, (re, ecc, apogDeg, type, sun, anomaly) => {
      const epicCenter = PtolemaicModel.computeEpicycleCenter(ecc, apogDeg, type, sun, anomaly);
      const epiDrive = type === PlanetType.SUPERIOR ? sun : anomaly;
      return epicCenter.plusXY(re * Math.cos(epiDrive), re * Math.sin(epiDrive));
    });

    this.sunPositionProperty = new DerivedProperty(
      [this.sunAngleProperty],
      (sun) => new Vector2(PTOLEMAIC_SUN_ORBIT_RADIUS * Math.cos(sun), PTOLEMAIC_SUN_ORBIT_RADIUS * Math.sin(sun)),
    );

    this.eclipticLongitudeProperty = new DerivedProperty([this.planetPositionProperty], (pos) =>
      Math.atan2(pos.y, pos.x),
    );

    this.sunLongitudeProperty = new DerivedProperty([this.sunAngleProperty], (sun) => sun);

    // Apply Mars preset to keep presetKeyProperty in sync
    this.presetKeyProperty.lazyLink((idx) => {
      const key = PRESET_KEYS[idx];
      if (key !== undefined) {
        this.applyPresetData(PLANET_PRESETS[key]);
      }
    });
  }

  // ── Geometry helpers ───────────────────────────────────────────────────────

  private static computeEpicycleCenter(
    ecc: number,
    apogDeg: number,
    type: PlanetType,
    sun: number,
    anomaly: number,
  ): Vector2 {
    const ap = (apogDeg * Math.PI) / 180;
    const deferentCenter = new Vector2(ecc * Math.cos(ap), ecc * Math.sin(ap));
    const equantAngle = ap;
    const equantDistance = ecc;

    const drive = type === PlanetType.SUPERIOR ? anomaly : sun;
    const phi = drive - equantAngle;
    const sRaw = (equantDistance / PTOLEMAIC_DEFERENT_RADIUS) * Math.sin(Math.PI - phi);
    const s = Math.max(-1, Math.min(1, sRaw));
    const psi = phi - Math.asin(s);
    const thetaDef = equantAngle + psi;

    return deferentCenter.plusXY(
      PTOLEMAIC_DEFERENT_RADIUS * Math.cos(thetaDef),
      PTOLEMAIC_DEFERENT_RADIUS * Math.sin(thetaDef),
    );
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  public applyPreset(key: PlanetPresetKey): void {
    const idx = PRESET_KEYS.indexOf(key);
    this.presetKeyProperty.value = idx;
    this.applyPresetData(PLANET_PRESETS[key]);
  }

  private applyPresetData(preset: (typeof PLANET_PRESETS)[keyof typeof PLANET_PRESETS]): void {
    this.epicycleSizeProperty.value = preset.epicycleSize;
    this.eccentricityProperty.value = preset.eccentricity;
    this.apogeeAngleProperty.value = preset.apogeeAngle;
    this.motionRateProperty.value = preset.motionRate;
    this.planetTypeProperty.value = preset.planetType;
  }

  public setSunAngle(rad: number): void {
    this.sunAngleProperty.value = rad;
  }

  public resetTime(): void {
    this.ptolemaicTimeProperty.value = 0;
    this.sunAngleProperty.value = 0;
    this.anomalyProperty.value = 0;
  }

  public storeMemory(): void {
    this.memory = {
      epicycleSize: this.epicycleSizeProperty.value,
      eccentricity: this.eccentricityProperty.value,
      motionRate: this.motionRateProperty.value,
      apogeeAngle: this.apogeeAngleProperty.value,
      planetType: this.planetTypeProperty.value,
    };
  }

  public recallMemory(): void {
    if (this.memory !== null) {
      this.epicycleSizeProperty.value = this.memory.epicycleSize;
      this.eccentricityProperty.value = this.memory.eccentricity;
      this.motionRateProperty.value = this.memory.motionRate;
      this.apogeeAngleProperty.value = this.memory.apogeeAngle;
      this.planetTypeProperty.value = this.memory.planetType;
    }
  }

  public step(dt: number): void {
    if (!this.timer.isPlayingProperty.value) {
      return;
    }
    const dtDays = dt * PTOLEMAIC_DAYS_PER_SECOND * this.timer.animationRateProperty.value;
    const sunRate = (2 * Math.PI) / DAYS_PER_YEAR;
    const anomalyRate = (this.motionRateProperty.value * Math.PI) / 180;

    this.ptolemaicTimeProperty.value += dtDays;
    this.sunAngleProperty.value += sunRate * dtDays;
    this.anomalyProperty.value += anomalyRate * dtDays;
  }

  public reset(): void {
    this.timer.reset();
    this.epicycleSizeProperty.reset();
    this.eccentricityProperty.reset();
    this.motionRateProperty.reset();
    this.apogeeAngleProperty.reset();
    this.planetTypeProperty.reset();
    this.presetKeyProperty.reset();
    this.sunAngleProperty.reset();
    this.anomalyProperty.reset();
    this.ptolemaicTimeProperty.reset();
    this.showDeferentProperty.reset();
    this.showEpicycleProperty.reset();
    this.showPlanetVectorProperty.reset();
    this.showEquantVectorProperty.reset();
    this.showEarthSunLineProperty.reset();
    this.showEpicyclePlanetLineProperty.reset();
    this.pathDurationProperty.reset();
    this.memory = null;
    // restore Mars defaults (index 1)
    this.applyPresetData(PLANET_PRESETS.mars);
  }
}
