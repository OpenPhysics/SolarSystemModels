import { describe, expect, it } from "vitest";
import { PtolemaicModel } from "../src/ptolemaic/model/PtolemaicModel.js";
import { PLANET_PRESETS, PlanetType } from "../src/ptolemaic/model/PtolemaicPlanet.js";
import { DAYS_PER_YEAR, PTOLEMAIC_DEFERENT_RADIUS } from "../src/SolarSystemModelsConstants.js";

const TWO_PI: number = 2 * Math.PI;

describe("PtolemaicModel", () => {
  it("computes correct positions at zero eccentricity (ecc=0, superior)", () => {
    const model = new PtolemaicModel();
    model.eccentricityProperty.value = 0;
    model.apogeeAngleProperty.value = 0;
    model.epicycleSizeProperty.value = 0.5;
    model.planetTypeProperty.value = PlanetType.SUPERIOR;
    model.anomalyProperty.value = Math.PI / 2;
    model.sunAngleProperty.value = 0;

    // deferentCenter = (0,0) since ecc=0
    const dc = model.deferentCenterProperty.value;
    expect(dc.x).toBeCloseTo(0, 10);
    expect(dc.y).toBeCloseTo(0, 10);

    // phi=π/2, s=0, psi=π/2, thetaDef=π/2 → epicycleCenter=(0,1)
    const ec = model.epicycleCenterProperty.value;
    expect(ec.x).toBeCloseTo(0, 10);
    expect(ec.y).toBeCloseTo(PTOLEMAIC_DEFERENT_RADIUS, 10);

    // epiDrive=sunAngle=0 → planet=(0.5, 1)
    const planet = model.planetPositionProperty.value;
    expect(planet.x).toBeCloseTo(0.5, 10);
    expect(planet.y).toBeCloseTo(1, 10);

    const lon = model.eclipticLongitudeProperty.value;
    expect(lon).toBeCloseTo(Math.atan2(1, 0.5), 10);
  });

  it("shows retrograde (non-monotonic ecliptic longitude) for Mars over one synodic cycle", () => {
    const model = new PtolemaicModel();
    model.applyPreset("mars");
    model.timer.isPlayingProperty.value = true;

    // Simulate ~780 days (Mars synodic period) in steps of 5 days
    const dtDays = 5;
    const steps = Math.ceil(780 / dtDays);
    const dtWall = dtDays / model.animationRateProperty.value; // days / (days/sec) = sec

    const longitudes: number[] = [];
    for (let i = 0; i < steps; i++) {
      model.step(dtWall);
      longitudes.push(model.eclipticLongitudeProperty.value);
    }

    let hadDecrease = false;
    for (let i = 1; i < longitudes.length; i++) {
      const prev = longitudes[i - 1];
      const curr = longitudes[i];
      if (prev === undefined || curr === undefined) {
        continue;
      }
      let diff = curr - prev;
      while (diff > Math.PI) {
        diff -= TWO_PI;
      }
      while (diff < -Math.PI) {
        diff += TWO_PI;
      }
      if (diff < -0.005) {
        hadDecrease = true;
        break;
      }
    }
    expect(hadDecrease).toBe(true);
  });

  it("SUPERIOR/INFERIOR swap: deferent driven by different angle", () => {
    const model = new PtolemaicModel();
    model.eccentricityProperty.value = 0;
    model.apogeeAngleProperty.value = 0;
    model.epicycleSizeProperty.value = 0.3;
    model.anomalyProperty.value = 1.0;
    model.sunAngleProperty.value = 0.5;

    // SUPERIOR: drive=anomaly=1.0 → epicycleCenter=(cos 1, sin 1)
    model.planetTypeProperty.value = PlanetType.SUPERIOR;
    const ecSup = model.epicycleCenterProperty.value;

    // INFERIOR: drive=sunAngle=0.5 → epicycleCenter=(cos 0.5, sin 0.5)
    model.planetTypeProperty.value = PlanetType.INFERIOR;
    const ecInf = model.epicycleCenterProperty.value;

    expect(ecSup.x).toBeCloseTo(Math.cos(1.0), 8);
    expect(ecSup.y).toBeCloseTo(Math.sin(1.0), 8);
    expect(ecInf.x).toBeCloseTo(Math.cos(0.5), 8);
    expect(ecInf.y).toBeCloseTo(Math.sin(0.5), 8);
  });

  it("reset() restores Mars defaults and zeroes time", () => {
    const model = new PtolemaicModel();
    model.applyPreset("venus");
    model.sunAngleProperty.value = 3.0;
    model.anomalyProperty.value = 2.0;
    model.ptolemaicTimeProperty.value = 500;

    model.reset();

    expect(model.epicycleSizeProperty.value).toBeCloseTo(PLANET_PRESETS.mars.epicycleSize, 8);
    expect(model.eccentricityProperty.value).toBeCloseTo(PLANET_PRESETS.mars.eccentricity, 8);
    expect(model.motionRateProperty.value).toBeCloseTo(PLANET_PRESETS.mars.motionRate, 8);
    expect(model.apogeeAngleProperty.value).toBeCloseTo(PLANET_PRESETS.mars.apogeeAngle, 8);
    expect(model.planetTypeProperty.value).toBe(PlanetType.SUPERIOR);
    expect(model.ptolemaicTimeProperty.value).toBe(0);
  });

  it("resetTime() zeroes sunAngle, anomaly, and time without changing params", () => {
    const model = new PtolemaicModel();
    model.applyPreset("mars");
    model.sunAngleProperty.value = 1.5;
    model.anomalyProperty.value = 2.5;
    model.ptolemaicTimeProperty.value = 365;

    const epicycleSizeBefore = model.epicycleSizeProperty.value;
    model.resetTime();

    expect(model.sunAngleProperty.value).toBe(0);
    expect(model.anomalyProperty.value).toBe(0);
    expect(model.ptolemaicTimeProperty.value).toBe(0);
    expect(model.epicycleSizeProperty.value).toBe(epicycleSizeBefore);
  });

  it("step() advances time correctly when playing", () => {
    const model = new PtolemaicModel();
    model.timer.isPlayingProperty.value = true;
    model.motionRateProperty.value = PLANET_PRESETS.mars.motionRate;

    const dt = 0.1; // wall-clock seconds
    const dtDays = dt * model.animationRateProperty.value; // sec * days/sec = days
    model.step(dt);

    expect(model.ptolemaicTimeProperty.value).toBeCloseTo(dtDays, 8);
    expect(model.sunAngleProperty.value).toBeCloseTo((2 * Math.PI * dtDays) / DAYS_PER_YEAR, 8);
  });

  it("step() does nothing when paused", () => {
    const model = new PtolemaicModel();
    model.timer.isPlayingProperty.value = false;
    model.step(1);
    expect(model.ptolemaicTimeProperty.value).toBe(0);
    expect(model.sunAngleProperty.value).toBe(0);
  });
});
