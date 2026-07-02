import type { TReadOnlyProperty } from "scenerystack/axon";
import { BooleanProperty, DerivedProperty, EnumerationProperty, NumberProperty } from "scenerystack/axon";
import { Range, Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeModel } from "../../common/TimeModel.js";
import { CONFIGURATIONS_YEARS_PER_SECOND } from "../../SolarSystemModelsConstants.js";
import type { PlanetPresetKey } from "./ConfigurationsPlanet.js";
import { PLANET_PRESETS, PRESET_KEYS } from "./ConfigurationsPlanet.js";
import { EventAction } from "./EventAction.js";

const TWO_PI = 2 * Math.PI;

function mod2pi(x: number): number {
  return ((x % TWO_PI) + TWO_PI) % TWO_PI;
}

// Idle between animated moves; slewing eases the clock toward a target event;
// countingDown pauses play at an event for pauseTimeProperty seconds before resuming.
type AnimationState = "idle" | "slewing" | "countingDown";

type SystemProperties = {
  readonly synodicPeriod: number;
  readonly cycleOffset: number;
  // [0]: 0, [1]: t_q, [2]: T_syn/2, [3]: T_syn − t_q
  readonly eventTimesList: readonly [number, number, number, number];
  readonly eventNames: readonly string[];
};

export class ConfigurationsModel implements TModel {
  // ── Composed timing model ──────────────────────────────────────────────────
  public readonly timer: TimeModel;

  // ── Orbital parameters ─────────────────────────────────────────────────────
  public readonly semimajorAxis1Property: NumberProperty;
  public readonly semimajorAxis2Property: NumberProperty;
  public readonly period1Property: NumberProperty;
  public readonly period2Property: NumberProperty;
  public readonly epochAngle1Property: NumberProperty;
  public readonly epochAngle2Property: NumberProperty;

  // ── Dynamic time ───────────────────────────────────────────────────────────
  public readonly timeProperty: NumberProperty; // years

  // ── Synodic / event schedule (derived from the orbital parameters above) ───
  public readonly synodicPeriodProperty: TReadOnlyProperty<number>;
  public readonly cycleOffsetProperty: TReadOnlyProperty<number>;
  public readonly eventTimesListProperty: TReadOnlyProperty<readonly [number, number, number, number]>;
  public readonly eventNamesProperty: TReadOnlyProperty<readonly string[]>;
  public readonly currentCycleNumberProperty: TReadOnlyProperty<number>;

  // ── Event navigation ───────────────────────────────────────────────────────
  public readonly lockedOnEventProperty: BooleanProperty;
  public readonly lockedEventIndexProperty: NumberProperty; // -1 = not locked

  // ── Display toggles ────────────────────────────────────────────────────────
  public readonly showOrbitLabelsProperty: BooleanProperty;
  public readonly showElongationAngleProperty: BooleanProperty;
  public readonly snapToEventsProperty: BooleanProperty;

  // ── Animation event actions ────────────────────────────────────────────────
  public readonly eventActionProperty: EnumerationProperty<EventAction>;
  public readonly pauseTimeProperty: NumberProperty; // seconds
  public readonly countdownRemainingProperty: NumberProperty; // seconds, 0 = idle

  // ── Derived positions (y-up, Sun at origin, AU) ───────────────────────────
  public readonly angle1Property: TReadOnlyProperty<number>;
  public readonly angle2Property: TReadOnlyProperty<number>;
  public readonly pos1Property: TReadOnlyProperty<Vector2>;
  public readonly pos2Property: TReadOnlyProperty<Vector2>;
  public readonly elongationDegProperty: TReadOnlyProperty<number>; // signed (−=E, +=W)
  public readonly elongationLabelProperty: TReadOnlyProperty<string>; // "E", "W", or ""
  public readonly currentConfigurationProperty: TReadOnlyProperty<string>;

  // ── Preset index tracking ──────────────────────────────────────────────────
  public readonly preset1IndexProperty: NumberProperty;
  public readonly preset2IndexProperty: NumberProperty;

  // ── Private navigation state ───────────────────────────────────────────────
  private nextEventNumber = 0;
  private nextCycleNumber = 0;
  private nextEventTime = 0;

  // ── Private animation state ────────────────────────────────────────────────
  private animationState: AnimationState = "idle";
  private slewElapsed = 0;
  private readonly slewDuration = 0.65; // seconds
  private slewStartModelTime = 0;
  private slewDeltaModelTime = 0;
  private slewTargetCycle = 0;
  private slewTargetEvent = 0;
  private countdownElapsed = 0;

  public constructor() {
    this.timer = new TimeModel(false);

    // default a1=1 (Earth), a2=2.4
    this.semimajorAxis1Property = new NumberProperty(1, { range: new Range(0.1, 15) });
    this.semimajorAxis2Property = new NumberProperty(2.4, { range: new Range(0.1, 15) });
    this.period1Property = new NumberProperty(1 ** 1.5);
    this.period2Property = new NumberProperty(2.4 ** 1.5);
    this.epochAngle1Property = new NumberProperty(0, { range: new Range(0, TWO_PI) });
    this.epochAngle2Property = new NumberProperty(0, { range: new Range(0, TWO_PI) });

    this.timeProperty = new NumberProperty(0);

    this.lockedOnEventProperty = new BooleanProperty(false);
    this.lockedEventIndexProperty = new NumberProperty(-1, {
      range: new Range(-1, 3),
      numberType: "Integer",
    });

    this.showOrbitLabelsProperty = new BooleanProperty(true);
    this.showElongationAngleProperty = new BooleanProperty(false);
    this.snapToEventsProperty = new BooleanProperty(true);

    this.eventActionProperty = new EnumerationProperty(EventAction.RUN);
    this.pauseTimeProperty = new NumberProperty(5, { range: new Range(1, 30) });
    this.countdownRemainingProperty = new NumberProperty(0);

    this.preset1IndexProperty = new NumberProperty(2, {
      range: new Range(0, PRESET_KEYS.length - 1),
      numberType: "Integer",
    }); // earth
    this.preset2IndexProperty = new NumberProperty(0, {
      range: new Range(0, PRESET_KEYS.length - 1),
      numberType: "Integer",
    }); // mercury (custom default 2.4)

    // ── Derived angles ────────────────────────────────────────────────────
    const angleDeps1 = [this.epochAngle1Property, this.timeProperty, this.period1Property] as const;
    this.angle1Property = new DerivedProperty(angleDeps1, (epoch, time, period) =>
      mod2pi(epoch + (TWO_PI * time) / period),
    );
    const angleDeps2 = [this.epochAngle2Property, this.timeProperty, this.period2Property] as const;
    this.angle2Property = new DerivedProperty(angleDeps2, (epoch, time, period) =>
      mod2pi(epoch + (TWO_PI * time) / period),
    );

    // ── Derived positions (y-up) ──────────────────────────────────────────
    this.pos1Property = new DerivedProperty(
      [this.semimajorAxis1Property, this.angle1Property] as const,
      (a, angle) => new Vector2(a * Math.cos(angle), a * Math.sin(angle)),
    );
    this.pos2Property = new DerivedProperty(
      [this.semimajorAxis2Property, this.angle2Property] as const,
      (a, angle) => new Vector2(a * Math.cos(angle), a * Math.sin(angle)),
    );

    // ── Elongation ────────────────────────────────────────────────────────
    this.elongationDegProperty = new DerivedProperty([this.pos1Property, this.pos2Property] as const, (p1, p2) =>
      ConfigurationsModel.computeElongation(p1, p2),
    );

    this.elongationLabelProperty = new DerivedProperty([this.elongationDegProperty] as const, (deg) => {
      if (deg < 0) {
        return "E";
      }
      if (deg > 0 && Math.abs(deg - 180) > 0.001) {
        return "W";
      }
      return "";
    });

    // ── Synodic / event schedule — recomputed automatically whenever the
    // orbital parameters change, instead of an imperatively-called method
    // that every mutation site has to remember to invoke. ───────────────────
    const systemPropertiesProperty: TReadOnlyProperty<SystemProperties> = new DerivedProperty(
      [
        this.semimajorAxis1Property,
        this.semimajorAxis2Property,
        this.period1Property,
        this.period2Property,
        this.epochAngle1Property,
        this.epochAngle2Property,
      ] as const,
      (a1, a2, p1, p2, epoch1, epoch2) => ConfigurationsModel.computeSystemProperties(a1, a2, p1, p2, epoch1, epoch2),
    );

    this.synodicPeriodProperty = new DerivedProperty([systemPropertiesProperty], (sp) => sp.synodicPeriod);
    this.cycleOffsetProperty = new DerivedProperty([systemPropertiesProperty], (sp) => sp.cycleOffset);
    this.eventTimesListProperty = new DerivedProperty([systemPropertiesProperty], (sp) => sp.eventTimesList);
    this.eventNamesProperty = new DerivedProperty([systemPropertiesProperty], (sp) => sp.eventNames);
    this.currentCycleNumberProperty = new DerivedProperty(
      [systemPropertiesProperty, this.timeProperty] as const,
      (sp, time) => Math.floor((time - sp.cycleOffset) / sp.synodicPeriod),
    );

    // ── Current configuration name ────────────────────────────────────────
    this.currentConfigurationProperty = new DerivedProperty(
      [
        this.elongationDegProperty,
        this.eventNamesProperty,
        this.lockedOnEventProperty,
        this.lockedEventIndexProperty,
      ] as const,
      (_elong, eventNames, locked, lockedIdx) => {
        if (locked && lockedIdx >= 0) {
          return eventNames[lockedIdx] ?? "";
        }
        return "";
      },
    );

    this.setTime(0);
  }

  // ── Physics helpers ────────────────────────────────────────────────────────

  private static computeElongation(p1: Vector2, p2: Vector2): number {
    const planetLong = mod2pi(Math.atan2(p2.y - p1.y, p2.x - p1.x));
    const sunLong = mod2pi(Math.atan2(-p1.y, -p1.x));
    let deg = (((sunLong - planetLong) * 180) / Math.PI) % 360;
    deg = ((deg % 360) + 360) % 360;
    if (deg > 180) {
      deg -= 360;
    }
    const elongValue = Math.abs(deg);
    // negative = East
    if (deg < 0 && Math.abs(elongValue - 180) > 0.001) {
      return -elongValue;
    }
    return elongValue;
  }

  /**
   * The four synodic events (opposition/conjunction pair for a superior
   * configuration, or inferior/superior conjunction pair for an inferior one)
   * depend only on which orbit is inner and which is outer — not on which
   * planet id (1 or 2) happens to be inner, so both cases share one formula.
   */
  private static computeSystemProperties(
    a1: number,
    a2: number,
    p1: number,
    p2: number,
    epoch1: number,
    epoch2: number,
  ): SystemProperties {
    const isPlanet1Inner = a1 < a2;
    const innerA = isPlanet1Inner ? a1 : a2;
    const outerA = isPlanet1Inner ? a2 : a1;
    const innerPeriod = isPlanet1Inner ? p1 : p2;
    const outerPeriod = isPlanet1Inner ? p2 : p1;
    const innerEpoch = isPlanet1Inner ? epoch1 : epoch2;
    const outerEpoch = isPlanet1Inner ? epoch2 : epoch1;

    const eventNames: readonly string[] = isPlanet1Inner
      ? ["opposition", "quadrature (eastern)", "conjunction", "quadrature (western)"]
      : [
          "inferior conjunction",
          "greatest elongation (western)",
          "superior conjunction",
          "greatest elongation (eastern)",
        ];

    const synodicPeriod = 1 / (1 / innerPeriod - 1 / outerPeriod);
    const omegaSyn = TWO_PI / synodicPeriod;
    const cycleOffset = mod2pi(outerEpoch - innerEpoch) / omegaSyn;
    const tQ = Math.acos(innerA / outerA) / omegaSyn;
    const eventTimesList: readonly [number, number, number, number] = [0, tQ, synodicPeriod / 2, synodicPeriod - tQ];

    return { synodicPeriod, cycleOffset, eventTimesList, eventNames };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  public setSemimajorAxis(id: 1 | 2, newA: number, keepEpochFixed = false): boolean {
    const otherA = id === 1 ? this.semimajorAxis2Property.value : this.semimajorAxis1Property.value;
    if (Math.abs(newA - otherA) < 1e-10) {
      return false;
    }

    const oldPeriod = id === 1 ? this.period1Property.value : this.period2Property.value;
    const epochProp = id === 1 ? this.epochAngle1Property : this.epochAngle2Property;
    const newPeriod = newA ** 1.5;

    if (!keepEpochFixed) {
      const currentAngle = epochProp.value + (TWO_PI * this.timeProperty.value) / oldPeriod;
      const newEpoch = mod2pi(currentAngle - (TWO_PI * this.timeProperty.value) / newPeriod);
      epochProp.value = newEpoch;
    }

    if (id === 1) {
      this.semimajorAxis1Property.value = newA;
      this.period1Property.value = newPeriod;
    } else {
      this.semimajorAxis2Property.value = newA;
      this.period2Property.value = newPeriod;
    }

    // AS behavior: when locked on an even event (opposition or conjunction), re-snap
    if (
      this.lockedOnEventProperty.value &&
      this.lockedEventIndexProperty.value >= 0 &&
      this.lockedEventIndexProperty.value % 2 === 0
    ) {
      const cycle = Math.round(
        (this.timeProperty.value - this.cycleOffsetProperty.value) / this.synodicPeriodProperty.value,
      );
      this.setTimeByCycleAndEventNumbers(cycle, this.lockedEventIndexProperty.value);
    } else {
      this.setTime(this.timeProperty.value);
    }
    return true;
  }

  /**
   * Where a given model time falls in the event schedule: which (cycle,
   * event) is the next upcoming event at or after that time. Shared by
   * setTime() and findSnappedEvent() so they can't drift apart.
   */
  private locateEvent(time: number): { cycle: number; event: number } {
    const cycleOffset = this.cycleOffsetProperty.value;
    const synodic = this.synodicPeriodProperty.value;
    const eventTimes = this.eventTimesListProperty.value;

    const cycle = Math.floor((time - cycleOffset) / synodic);
    let timeInCycle = time - cycleOffset - cycle * synodic;
    if (timeInCycle < 0) {
      timeInCycle = 0;
    }

    let event = 0;
    while (event < 4 && timeInCycle >= (eventTimes[event] ?? 0)) {
      event++;
    }

    if (event < 4) {
      return { cycle, event };
    }
    return { cycle: cycle + 1, event: 0 };
  }

  public setTime(newTime: number): void {
    this.timeProperty.value = newTime;

    const next = this.locateEvent(newTime);
    this.nextCycleNumber = next.cycle;
    this.nextEventNumber = next.event;
    this.nextEventTime =
      this.cycleOffsetProperty.value +
      next.cycle * this.synodicPeriodProperty.value +
      (this.eventTimesListProperty.value[next.event] ?? 0);

    this.lockedOnEventProperty.value = false;
    this.lockedEventIndexProperty.value = -1;
  }

  public setTimeByCycleAndEventNumbers(cycleNumber: number, eventNumber: number, noLock = false): void {
    const cycleOffset = this.cycleOffsetProperty.value;
    const synodic = this.synodicPeriodProperty.value;
    const eventTimes = this.eventTimesListProperty.value;

    this.timeProperty.value = cycleOffset + cycleNumber * synodic + (eventTimes[eventNumber] ?? 0);

    this.nextEventNumber = eventNumber + 1;
    this.nextCycleNumber = cycleNumber;
    if (this.nextEventNumber === 4) {
      this.nextEventNumber = 0;
      this.nextCycleNumber = cycleNumber + 1;
    }

    this.nextEventTime = cycleOffset + this.nextCycleNumber * synodic + (eventTimes[this.nextEventNumber] ?? 0);
    this.lockedOnEventProperty.value = !noLock;
    this.lockedEventIndexProperty.value = noLock ? -1 : eventNumber;
  }

  /**
   * The nearest event (previous or next) to newTime, or null if none is
   * within angleThreshold. "Previous" is derived from the same (cycle,
   * event) pair locateEvent() returns for "next," rather than re-scanning.
   */
  private findSnappedEvent(
    newTime: number,
    period: number,
    angleThreshold: number,
  ): { cycle: number; event: number } | null {
    const cycleOffset = this.cycleOffsetProperty.value;
    const synodic = this.synodicPeriodProperty.value;
    const eventTimes = this.eventTimesListProperty.value;

    const next = this.locateEvent(newTime);
    // event 0 only comes from locateEvent()'s cycle-boundary rollover (event
    // times always start at 0, so a scan can never land on event 0 otherwise).
    const prevEvent = next.event === 0 ? 3 : next.event - 1;
    const prevCycle = next.event === 0 ? next.cycle - 1 : next.cycle;

    const prevTime = cycleOffset + prevCycle * synodic + (eventTimes[prevEvent] ?? 0);
    const nextTime = cycleOffset + next.cycle * synodic + (eventTimes[next.event] ?? 0);

    const prevDeltaAngle = (Math.abs(newTime - prevTime) * TWO_PI) / period;
    const nextDeltaAngle = (Math.abs(nextTime - newTime) * TWO_PI) / period;
    const minDelta = Math.min(prevDeltaAngle, nextDeltaAngle);

    if (minDelta >= angleThreshold) {
      return null;
    }
    if (minDelta === nextDeltaAngle) {
      return { cycle: next.cycle, event: next.event };
    }
    return { cycle: prevCycle, event: prevEvent };
  }

  public setTimeByPlanetAngle(id: 1 | 2, newAngle: number, snapToEvents: boolean, angleThreshold: number): void {
    const epochProp = id === 1 ? this.epochAngle1Property : this.epochAngle2Property;
    const period = id === 1 ? this.period1Property.value : this.period2Property.value;
    const currentAngle = mod2pi(epochProp.value + (TWO_PI * this.timeProperty.value) / period);

    let angleDelta = newAngle - currentAngle;
    if (angleDelta < -Math.PI) {
      angleDelta += TWO_PI;
    }
    if (angleDelta > Math.PI) {
      angleDelta -= TWO_PI;
    }

    const newTime = this.timeProperty.value + (angleDelta * period) / TWO_PI;

    if (snapToEvents) {
      const snapped = this.findSnappedEvent(newTime, period, angleThreshold);
      if (snapped !== null) {
        this.setTimeByCycleAndEventNumbers(snapped.cycle, snapped.event);
        return;
      }
    }
    this.setTime(newTime);
  }

  /**
   * Compute the 4 event angles relative to the other planet's current position.
   * Returns [0]=opposition/infConj, [1]=quad/westElong, [2]=conj/supConj, [3]=quad/eastElong.
   */
  private computeEventAngles(thisA: number, otherA: number, otherAngle: number): [number, number, number, number] {
    const acosVal = thisA < otherA ? Math.acos(thisA / otherA) : -Math.acos(otherA / thisA);
    return [otherAngle, mod2pi(otherAngle + acosVal), mod2pi(otherAngle + Math.PI), mod2pi(otherAngle - acosVal)];
  }

  public setEpochAngleByPlanetAngle(id: 1 | 2, newAngle: number, snapToEvents: boolean, angleThreshold: number): void {
    const period = id === 1 ? this.period1Property.value : this.period2Property.value;
    const epochProp = id === 1 ? this.epochAngle1Property : this.epochAngle2Property;
    const otherId = (id === 1 ? 2 : 1) as 1 | 2;

    let snappedEvent = -1;

    if (snapToEvents) {
      const otherAngle = otherId === 1 ? this.angle1Property.value : this.angle2Property.value;
      const otherA = otherId === 1 ? this.semimajorAxis1Property.value : this.semimajorAxis2Property.value;
      const thisA = id === 1 ? this.semimajorAxis1Property.value : this.semimajorAxis2Property.value;

      const eventAngles = this.computeEventAngles(thisA, otherA, otherAngle);

      // Find the closest event angle to newAngle
      let minDiff = Infinity;
      for (let i = 0; i < 4; i++) {
        const evtAngle = eventAngles[i] as number;
        let diff = newAngle - evtAngle;
        if (diff < -Math.PI) {
          diff += TWO_PI;
        } else if (diff > Math.PI) {
          diff -= TWO_PI;
        }
        const absDiff = Math.abs(diff);
        if (absDiff < minDiff) {
          minDiff = absDiff;
          snappedEvent = i;
        }
      }

      if (minDiff < angleThreshold) {
        const snappedAngle = eventAngles[snappedEvent] as number;
        const newEpochAdj = mod2pi(snappedAngle - (TWO_PI * this.timeProperty.value) / period);
        epochProp.value = newEpochAdj;

        const eventTimes = this.eventTimesListProperty.value;
        const snappedEvtTime = eventTimes[snappedEvent] as number;
        const cycle = Math.round(
          (this.timeProperty.value - this.cycleOffsetProperty.value - snappedEvtTime) /
            this.synodicPeriodProperty.value,
        );
        this.setTimeByCycleAndEventNumbers(cycle, snappedEvent);
        return;
      }
    }

    const newEpoch = mod2pi(newAngle - (TWO_PI * this.timeProperty.value) / period);
    epochProp.value = newEpoch;
    this.setTime(this.timeProperty.value);
  }

  public slewToEvent(cycleNumber: number, eventNumber: number): void {
    const eventTimes = this.eventTimesListProperty.value;
    const targetTime =
      this.cycleOffsetProperty.value + cycleNumber * this.synodicPeriodProperty.value + (eventTimes[eventNumber] ?? 0);

    // Don't slew if already there
    if (this.lockedOnEventProperty.value && this.lockedEventIndexProperty.value === eventNumber) {
      return;
    }

    this.animationState = "slewing";
    this.slewElapsed = 0;
    this.slewStartModelTime = this.timeProperty.value;
    this.slewDeltaModelTime = targetTime - this.slewStartModelTime;
    this.slewTargetCycle = cycleNumber;
    this.slewTargetEvent = eventNumber;
    this.timer.isPlayingProperty.value = false;
    this.countdownRemainingProperty.value = 0;
  }

  public resetTime(): void {
    this.animationState = "idle";
    this.countdownRemainingProperty.value = 0;
    this.epochAngle1Property.value = 0;
    this.epochAngle2Property.value = 0;
    this.setTime(0);
  }

  private startCountdown(): void {
    this.animationState = "countingDown";
    this.countdownElapsed = 0;
    this.countdownRemainingProperty.value = this.pauseTimeProperty.value;
  }

  private advanceSlew(dt: number): void {
    this.slewElapsed += dt;
    const u = this.slewElapsed / this.slewDuration;
    if (u < 1) {
      const ease = 1 - (1 - u) ** 3;
      this.timeProperty.value = this.slewStartModelTime + ease * this.slewDeltaModelTime;
    } else {
      this.animationState = "idle";
      this.setTimeByCycleAndEventNumbers(this.slewTargetCycle, this.slewTargetEvent);
    }
  }

  private advanceCountdown(dt: number): void {
    this.countdownElapsed += dt;
    const remaining = this.pauseTimeProperty.value - this.countdownElapsed;
    if (remaining <= 0) {
      this.animationState = "idle";
      this.countdownRemainingProperty.value = 0;
      this.timer.isPlayingProperty.value = true;
    } else {
      this.countdownRemainingProperty.value = remaining;
    }
  }

  public step(dt: number): void {
    if (this.animationState === "slewing") {
      this.advanceSlew(dt);
      return;
    }
    if (this.animationState === "countingDown") {
      this.advanceCountdown(dt);
      return;
    }
    if (!this.timer.isPlayingProperty.value) {
      return;
    }

    const dtYears = dt * CONFIGURATIONS_YEARS_PER_SECOND * this.timer.animationRateProperty.value;
    const newTime = this.timeProperty.value + dtYears;

    if (newTime > this.nextEventTime && this.eventActionProperty.value !== EventAction.RUN) {
      this.setTimeByCycleAndEventNumbers(this.nextCycleNumber, this.nextEventNumber);
      this.timer.isPlayingProperty.value = false;
      if (this.eventActionProperty.value === EventAction.PAUSE) {
        this.startCountdown();
      }
    } else {
      this.setTime(newTime);
    }
  }

  /**
   * Applies a planet preset's semimajor axis. Returns false (and leaves the
   * preset index Properties untouched) when the preset would put both
   * planets on the same orbit — that configuration has no synodic period,
   * so the caller should revert the requesting UI element instead.
   */
  public applyPreset(id: 1 | 2, key: PlanetPresetKey): boolean {
    const a = PLANET_PRESETS[key];
    if (!this.setSemimajorAxis(id, a, false)) {
      return false;
    }
    const idx = PRESET_KEYS.indexOf(key);
    if (id === 1) {
      this.preset1IndexProperty.value = idx >= 0 ? idx : 0;
    } else {
      this.preset2IndexProperty.value = idx >= 0 ? idx : 0;
    }
    return true;
  }

  public reset(): void {
    this.timer.reset();
    this.animationState = "idle";

    // Reset to defaults (a1=1 Earth, a2=2.4)
    this.semimajorAxis1Property.value = 1;
    this.semimajorAxis2Property.value = 2.4;
    this.period1Property.value = 1 ** 1.5;
    this.period2Property.value = 2.4 ** 1.5;
    this.epochAngle1Property.value = 0;
    this.epochAngle2Property.value = 0;
    this.preset1IndexProperty.reset();
    this.preset2IndexProperty.reset();

    this.showOrbitLabelsProperty.reset();
    this.showElongationAngleProperty.reset();
    this.snapToEventsProperty.reset();
    this.eventActionProperty.reset();
    this.pauseTimeProperty.reset();
    this.countdownRemainingProperty.reset();

    this.setTime(0);
  }
}
