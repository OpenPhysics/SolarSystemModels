import { beforeEach, describe, expect, it } from "vitest";
import { ConfigurationsModel } from "../src/configurations/model/ConfigurationsModel.js";
import { EventAction } from "../src/configurations/model/EventAction.js";

describe("ConfigurationsModel", () => {
  let model: ConfigurationsModel;

  beforeEach(() => {
    model = new ConfigurationsModel();
  });

  // Kepler's third law

  it("Earth has orbital period 1 yr", () => {
    model.setSemimajorAxis(1, 1.0, true);
    expect(model.period1Property.value).toBeCloseTo(1.0, 5);
  });

  it("Jupiter period = 5.2^1.5 yr", () => {
    model.setSemimajorAxis(1, 5.2, true);
    expect(model.period1Property.value).toBeCloseTo(5.2 ** 1.5, 3);
  });

  it("Mars period = 1.52^1.5 yr", () => {
    model.setSemimajorAxis(2, 1.52, true);
    expect(model.period2Property.value).toBeCloseTo(1.52 ** 1.5, 4);
  });

  // Angle advances with time

  it("planet angle advances proportionally to time", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.epochAngle1Property.value = 0;
    model.setTime(0.5); // half year
    const expected = ((2 * Math.PI * 0.5) / 1.0) % (2 * Math.PI);
    expect(model.angle1Property.value).toBeCloseTo(expected, 4);
  });

  // Elongation geometry (inner observer a1=1, outer target a2=2.4)

  it("opposition: both at same angle => elongation ~180 deg", () => {
    // inner observer (a1) and outer target (a2) at same angle = opposition
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    model.epochAngle1Property.value = 0;
    model.epochAngle2Property.value = 0; // same direction
    model.setTime(0);
    const elong = model.elongationDegProperty.value;
    expect(Math.abs(Math.abs(elong) - 180)).toBeLessThan(1);
  });

  it("conjunction: target at opposite side => elongation ~0 deg", () => {
    // inner observer (a1) and outer target (a2) at opposite angles = conjunction
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    model.epochAngle1Property.value = 0;
    model.epochAngle2Property.value = Math.PI; // opposite side
    model.setTime(0);
    const elong = model.elongationDegProperty.value;
    expect(Math.abs(elong)).toBeLessThan(1);
  });

  it("inferior conjunction (outer obs, inner target, same angle) => elongation ~0 deg", () => {
    // a1=2.4 (outer observer), a2=0.5 (inner target), both at same angle
    model.setSemimajorAxis(2, 0.5, true); // change a2 first to avoid conflict
    model.setSemimajorAxis(1, 2.4, true);
    model.epochAngle1Property.value = 0;
    model.epochAngle2Property.value = 0; // both at same angle => inferior conjunction
    model.setTime(0);
    const elong = model.elongationDegProperty.value;
    expect(Math.abs(elong)).toBeLessThan(1);
  });

  it("elongation label matches sign", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    model.epochAngle1Property.value = 0;
    model.epochAngle2Property.value = Math.PI / 2;
    model.setTime(0);
    const elong = model.elongationDegProperty.value;
    const label = model.elongationLabelProperty.value;
    if (elong < 0) {
      expect(label).toBe("E");
    } else if (elong > 0 && Math.abs(elong - 180) > 0.001) {
      expect(label).toBe("W");
    } else {
      expect(label).toBe("");
    }
  });

  // Synodic period

  it("Earth + Mars synodic period matches formula", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 1.52, true);
    const p1 = 1.0 ** 1.5;
    const p2 = 1.52 ** 1.5;
    const expected = 1 / (1 / p1 - 1 / p2);
    expect(model.synodicPeriodProperty.value).toBeCloseTo(expected, 3);
  });

  // Event times list

  it("eventTimesList[0] = 0", () => {
    expect(model.eventTimesListProperty.value[0]).toBe(0);
  });

  it("eventTimesList[2] = synodicPeriod/2", () => {
    const T = model.synodicPeriodProperty.value;
    expect(model.eventTimesListProperty.value[2]).toBeCloseTo(T / 2, 5);
  });

  it("eventTimesList[1] + eventTimesList[3] = synodicPeriod", () => {
    const T = model.synodicPeriodProperty.value;
    const times = model.eventTimesListProperty.value;
    expect(times[1] + times[3]).toBeCloseTo(T, 5);
  });

  // Guard equal axes

  it("setSemimajorAxis returns false when equal to other axis", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    const result = model.setSemimajorAxis(1, 2.4, true); // same as axis 2
    expect(result).toBe(false);
    expect(model.semimajorAxis1Property.value).toBeCloseTo(1.0, 5);
  });

  // setSemimajorAxis preserves angle

  it("setSemimajorAxis keepEpoch=false preserves current angle", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.epochAngle1Property.value = 0;
    model.setTime(0.25);
    const angleBefore = model.angle1Property.value;
    model.setSemimajorAxis(1, 2.0, false);
    const angleAfter = model.angle1Property.value;
    expect(Math.abs(angleBefore - angleAfter)).toBeLessThan(0.01);
  });

  // Giant outer planet

  it("a=10 AU synodic period is finite and positive", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 10.0, true);
    expect(Number.isFinite(model.synodicPeriodProperty.value)).toBe(true);
    expect(model.synodicPeriodProperty.value).toBeGreaterThan(0);
  });

  // reset()

  it("reset() restores defaults", () => {
    model.setSemimajorAxis(2, 5.2, true);
    model.setTime(10);
    model.reset();
    expect(model.semimajorAxis1Property.value).toBeCloseTo(1.0, 5);
    expect(model.semimajorAxis2Property.value).toBeCloseTo(2.4, 5);
    expect(model.timeProperty.value).toBeCloseTo(0, 5);
  });

  // resetTime()

  it("resetTime() sets time to 0 and clears epoch angles", () => {
    model.setTime(5);
    model.epochAngle1Property.value = 1.5;
    model.epochAngle2Property.value = 2.0;
    model.resetTime();
    expect(model.timeProperty.value).toBeCloseTo(0, 5);
    expect(model.epochAngle1Property.value).toBeCloseTo(0, 5);
    expect(model.epochAngle2Property.value).toBeCloseTo(0, 5);
  });

  // EventAction enum

  it("default eventAction is RUN", () => {
    expect(model.eventActionProperty.value).toBe(EventAction.RUN);
  });

  // Event names for inner observer

  it("inner observer (a1 < a2): event[0] = opposition", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    const names = model.eventNamesProperty.value;
    expect(names[0]).toBe("opposition");
    expect(names[2]).toBe("conjunction");
  });

  // Event names for outer observer

  it("outer observer (a1 > a2): event[0] = inferior conjunction", () => {
    // Must change a2 first to avoid conflict with initial a2=2.4
    model.setSemimajorAxis(2, 0.5, true); // now a2=0.5
    model.setSemimajorAxis(1, 2.4, true); // now a1=2.4 > a2=0.5
    const names = model.eventNamesProperty.value;
    expect(names[0]).toBe("inferiorConjunction");
    expect(names[2]).toBe("superiorConjunction");
  });

  it("rejects equal semimajor axes and leaves periods consistent", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    const p1Before = model.period1Property.value;
    const p2Before = model.period2Property.value;
    expect(model.setSemimajorAxis(1, 2.4, true)).toBe(false);
    expect(model.semimajorAxis1Property.value).toBeCloseTo(1.0, 8);
    expect(model.period1Property.value).toBeCloseTo(p1Before, 8);
    expect(model.period2Property.value).toBeCloseTo(p2Before, 8);
  });

  it("slewToEvent locks onto the target cycle and event", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    model.setTime(0);
    model.slewToEvent(1, 0);
    // Advance past the slew duration
    for (let i = 0; i < 40; i++) {
      model.step(0.05);
    }
    expect(model.lockedOnEventProperty.value).toBe(true);
    expect(model.lockedEventIndexProperty.value).toBe(0);
    expect(model.currentCycleNumberProperty.value).toBe(1);
  });

  it("setTimeFromTimelineDrag snaps within time threshold", () => {
    model.setSemimajorAxis(1, 1.0, true);
    model.setSemimajorAxis(2, 2.4, true);
    model.setTime(0);
    const synodic = model.synodicPeriodProperty.value;
    const nearOpposition = 0.01; // years from t=0 opposition
    model.setTimeFromTimelineDrag(nearOpposition, true, 0.05);
    expect(model.lockedOnEventProperty.value).toBe(true);
    expect(model.lockedEventIndexProperty.value).toBe(0);
    expect(model.timeProperty.value).toBeCloseTo(0, 5);
    // Far from events: no snap
    model.setTimeFromTimelineDrag(synodic * 0.25, true, 0.001);
    expect(model.lockedOnEventProperty.value).toBe(false);
  });
});
