import type { TReadOnlyProperty } from "scenerystack/axon";
import { BooleanProperty, DerivedProperty, EnumerationProperty, NumberProperty, Property } from "scenerystack/axon";
import { Range, Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeModel } from "../../common/TimeModel.js";
import { PAUSE_TIME_RANGE, SEMIMAJOR_AXIS_RANGE } from "../../SolarSystemModelsConstants.js";
import type { PlanetPresetKey } from "./ConfigurationsPlanet.js";
import { PLANET_PRESETS, PRESET_KEYS } from "./ConfigurationsPlanet.js";
import { EventAction } from "./EventAction.js";
import type { EventNameKey } from "./EventNameKey.js";
import { INNER_OBSERVER_EVENT_KEYS, OUTER_OBSERVER_EVENT_KEYS } from "./EventNameKey.js";

const TWO_PI = 2 * Math.PI;

function mod2pi(x: number): number {
  return ((x % TWO_PI) + TWO_PI) % TWO_PI;
}

export class ConfigurationsModel implements TModel {
  // ── Composed timing model ──────────────────────────────────────────────────
  public readonly timer: TimeModel;

  // ── Orbital parameters ─────────────────────────────────────────────────────
  public readonly semimajorAxis1Property: NumberProperty;
  public readonly semimajorAxis2Property: NumberProperty;
  /**
   * Kepler period a^1.5 (years). Kept as a NumberProperty (not DerivedProperty)
   * so setSemimajorAxis can read the *previous* period after NumberControl has
   * already written the new axis — needed for epoch-preserving angle updates.
   * Always update via setSemimajorAxis / reset; never write axis alone.
   */
  public readonly period1Property: NumberProperty;
  public readonly period2Property: NumberProperty;
  public readonly epochAngle1Property: NumberProperty;
  public readonly epochAngle2Property: NumberProperty;

  // ── Dynamic time ───────────────────────────────────────────────────────────
  public readonly timeProperty: NumberProperty; // years
  /** Display-only offset for the time readout (AS: timelineTimeOffset). */
  public readonly timelineTimeOffsetProperty: NumberProperty;

  // ── Synodic / event schedule ───────────────────────────────────────────────
  public readonly synodicPeriodProperty: NumberProperty;
  public readonly cycleOffsetProperty: NumberProperty;
  // [0]: 0, [1]: t_q, [2]: T_syn/2, [3]: T_syn − t_q
  public readonly eventTimesListProperty: Property<readonly [number, number, number, number]>;
  /** Synodic event name keys (localized in views via StringManager). */
  public readonly eventNamesProperty: Property<readonly EventNameKey[]>;
  public readonly currentCycleNumberProperty: NumberProperty;

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
  /** Locked event name key, or "" when not locked on an event. */
  public readonly currentConfigurationProperty: TReadOnlyProperty<EventNameKey | "">;

  // ── Preset index tracking ──────────────────────────────────────────────────
  public readonly preset1IndexProperty: NumberProperty;
  public readonly preset2IndexProperty: NumberProperty;

  // ── Private navigation state ───────────────────────────────────────────────
  private nextEventNumber = 0;
  private nextCycleNumber = 0;
  private nextEventTime = 0;

  // ── Private slew state ─────────────────────────────────────────────────────
  private slewActive = false;
  private slewElapsed = 0;
  private readonly slewDuration = 0.65; // seconds
  private slewStartModelTime = 0;
  private slewDeltaModelTime = 0;
  private slewTargetCycle = 0;
  private slewTargetEvent = 0;

  // ── Private countdown state ────────────────────────────────────────────────
  private countdownElapsed = -1; // -1 = idle

  public constructor() {
    this.timer = new TimeModel(false);

    // default a1=1 (Earth), a2=2.4
    this.semimajorAxis1Property = new NumberProperty(1, {
      range: new Range(SEMIMAJOR_AXIS_RANGE.min, SEMIMAJOR_AXIS_RANGE.max),
    });
    this.semimajorAxis2Property = new NumberProperty(2.4, {
      range: new Range(SEMIMAJOR_AXIS_RANGE.min, SEMIMAJOR_AXIS_RANGE.max),
    });
    this.period1Property = new NumberProperty(1 ** 1.5);
    this.period2Property = new NumberProperty(2.4 ** 1.5);
    this.epochAngle1Property = new NumberProperty(0, { range: new Range(0, TWO_PI) });
    this.epochAngle2Property = new NumberProperty(0, { range: new Range(0, TWO_PI) });

    this.timeProperty = new NumberProperty(0);
    this.timelineTimeOffsetProperty = new NumberProperty(0);

    this.synodicPeriodProperty = new NumberProperty(1);
    this.cycleOffsetProperty = new NumberProperty(0);
    this.eventTimesListProperty = new Property<readonly [number, number, number, number]>([0, 0, 0, 0]);
    this.eventNamesProperty = new Property<readonly EventNameKey[]>([]);
    this.currentCycleNumberProperty = new NumberProperty(0, { numberType: "Integer" });

    this.lockedOnEventProperty = new BooleanProperty(false);
    this.lockedEventIndexProperty = new NumberProperty(-1, {
      range: new Range(-1, 3),
      numberType: "Integer",
    });

    this.showOrbitLabelsProperty = new BooleanProperty(true);
    this.showElongationAngleProperty = new BooleanProperty(false);
    this.snapToEventsProperty = new BooleanProperty(true);

    this.eventActionProperty = new EnumerationProperty(EventAction.RUN);
    this.pauseTimeProperty = new NumberProperty(5, {
      range: new Range(PAUSE_TIME_RANGE.min, PAUSE_TIME_RANGE.max),
    });
    this.countdownRemainingProperty = new NumberProperty(0);

    this.preset1IndexProperty = new NumberProperty(-1, {
      range: new Range(-1, PRESET_KEYS.length - 1),
      numberType: "Integer",
    }); // -1 = <presets> placeholder
    this.preset2IndexProperty = new NumberProperty(-1, {
      range: new Range(-1, PRESET_KEYS.length - 1),
      numberType: "Integer",
    });

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

    // ── Current configuration key (localized in views) ────────────────────
    this.currentConfigurationProperty = new DerivedProperty(
      [
        this.elongationDegProperty,
        this.eventNamesProperty,
        this.lockedOnEventProperty,
        this.lockedEventIndexProperty,
      ] as const,
      (_elong, eventNames, locked, lockedIdx): EventNameKey | "" => {
        if (locked && lockedIdx >= 0) {
          return eventNames[lockedIdx] ?? "";
        }
        return "";
      },
    );

    // Initialize system properties
    this.calculateSystemProperties();
    this.syncPresetIndices();
    this.setTime(0);
  }

  /**
   * Sync the preset combobox indices to the current semimajor-axis values.
   * When the axis matches a planet preset exactly, show that planet; otherwise
   * show the `<presets>` placeholder (index −1). Matches AS slider→combobox reset.
   */
  private syncPresetIndices(): void {
    const a1 = this.semimajorAxis1Property.value;
    const a2 = this.semimajorAxis2Property.value;
    this.preset1IndexProperty.value = PRESET_KEYS.findIndex((k) => Math.abs(PLANET_PRESETS[k] - a1) < 0.001);
    this.preset2IndexProperty.value = PRESET_KEYS.findIndex((k) => Math.abs(PLANET_PRESETS[k] - a2) < 0.001);
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

  private calculateSystemProperties(): void {
    const a1 = this.semimajorAxis1Property.value;
    const a2 = this.semimajorAxis2Property.value;
    const p1 = this.period1Property.value;
    const p2 = this.period2Property.value;
    const epoch1 = this.epochAngle1Property.value;
    const epoch2 = this.epochAngle2Property.value;

    let innerPeriod: number;
    let outerPeriod: number;
    let innerEpoch: number;
    let outerEpoch: number;
    if (a1 < a2) {
      innerPeriod = p1;
      outerPeriod = p2;
      innerEpoch = epoch1;
      outerEpoch = epoch2;
      const synodicPeriod = 1 / (1 / innerPeriod - 1 / outerPeriod);
      const omegaSyn = TWO_PI / synodicPeriod;
      const cycleOffset = mod2pi(outerEpoch - innerEpoch) / omegaSyn;
      const tQ = Math.acos(a1 / a2) / omegaSyn;
      const eventTimesList: [number, number, number, number] = [0, tQ, synodicPeriod / 2, synodicPeriod - tQ];
      this.synodicPeriodProperty.value = synodicPeriod;
      this.cycleOffsetProperty.value = cycleOffset;
      this.eventTimesListProperty.value = eventTimesList;
      this.eventNamesProperty.value = OUTER_OBSERVER_EVENT_KEYS;
    } else {
      innerPeriod = p2;
      outerPeriod = p1;
      innerEpoch = epoch2;
      outerEpoch = epoch1;
      const synodicPeriod = 1 / (1 / innerPeriod - 1 / outerPeriod);
      const omegaSyn = TWO_PI / synodicPeriod;
      const cycleOffset = mod2pi(outerEpoch - innerEpoch) / omegaSyn;
      const tQ = Math.acos(a2 / a1) / omegaSyn;
      const eventTimesList: [number, number, number, number] = [0, tQ, synodicPeriod / 2, synodicPeriod - tQ];
      this.synodicPeriodProperty.value = synodicPeriod;
      this.cycleOffsetProperty.value = cycleOffset;
      this.eventTimesListProperty.value = eventTimesList;
      this.eventNamesProperty.value = INNER_OBSERVER_EVENT_KEYS;
    }
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

    this.calculateSystemProperties();
    this.syncPresetIndices();

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

  public setTime(newTime: number): void {
    this.timeProperty.value = newTime;
    const cycleOffset = this.cycleOffsetProperty.value;
    const synodic = this.synodicPeriodProperty.value;
    const eventTimes = this.eventTimesListProperty.value;

    const currentCycle = Math.floor((newTime - cycleOffset) / synodic);
    this.currentCycleNumberProperty.value = currentCycle;

    let timeInCycle = newTime - cycleOffset - currentCycle * synodic;
    if (timeInCycle < 0) {
      timeInCycle = 0;
    }

    let nextEvt = 0;
    while (nextEvt < 4 && timeInCycle >= (eventTimes[nextEvt] ?? 0)) {
      nextEvt++;
    }

    if (nextEvt < 4) {
      this.nextEventNumber = nextEvt;
      this.nextCycleNumber = currentCycle;
    } else {
      this.nextEventNumber = 0;
      this.nextCycleNumber = currentCycle + 1;
    }

    this.nextEventTime = cycleOffset + this.nextCycleNumber * synodic + (eventTimes[this.nextEventNumber] ?? 0);
    this.lockedOnEventProperty.value = false;
    this.lockedEventIndexProperty.value = -1;
  }

  public setTimeByCycleAndEventNumbers(cycleNumber: number, eventNumber: number, noLock = false): void {
    const cycleOffset = this.cycleOffsetProperty.value;
    const synodic = this.synodicPeriodProperty.value;
    const eventTimes = this.eventTimesListProperty.value;

    this.timeProperty.value = cycleOffset + cycleNumber * synodic + (eventTimes[eventNumber] ?? 0);
    this.currentCycleNumberProperty.value = cycleNumber;

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

  private findSnappedEvent(
    newTime: number,
    period: number,
    angleThreshold: number,
  ): { cycle: number; event: number } | null {
    const cycleOffset = this.cycleOffsetProperty.value;
    const synodic = this.synodicPeriodProperty.value;
    const eventTimes = this.eventTimesListProperty.value;

    const cycle = Math.floor((newTime - cycleOffset) / synodic);
    let timeInCycle = newTime - cycleOffset - cycle * synodic;
    if (timeInCycle < 0) {
      timeInCycle = 0;
    }

    let nextEvt = 0;
    while (nextEvt < 4 && timeInCycle >= (eventTimes[nextEvt] ?? 0)) {
      nextEvt++;
    }

    const prevEvt = nextEvt - 1;
    let nextCycleFinal = cycle;
    let nextEvtFinal = nextEvt;
    if (nextEvt >= 4) {
      nextEvtFinal = 0;
      nextCycleFinal = cycle + 1;
    }

    const prevTime =
      prevEvt >= 0
        ? cycleOffset + cycle * synodic + (eventTimes[prevEvt] ?? 0)
        : cycleOffset + (cycle - 1) * synodic + (eventTimes[3] ?? 0);
    const nextTime = cycleOffset + nextCycleFinal * synodic + (eventTimes[nextEvtFinal] ?? 0);

    const prevDeltaAngle = (Math.abs(newTime - prevTime) * TWO_PI) / period;
    const nextDeltaAngle = (Math.abs(nextTime - newTime) * TWO_PI) / period;
    const minDelta = Math.min(prevDeltaAngle, nextDeltaAngle);

    if (minDelta >= angleThreshold) {
      return null;
    }
    if (minDelta === nextDeltaAngle) {
      return { cycle: nextCycleFinal, event: nextEvtFinal };
    }
    const effectivePrevEvt = prevEvt >= 0 ? prevEvt : 3;
    const effectivePrevCycle = prevEvt >= 0 ? cycle : cycle - 1;
    return { cycle: effectivePrevCycle, event: effectivePrevEvt };
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
        this.calculateSystemProperties();

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
    this.calculateSystemProperties();
    this.setTime(this.timeProperty.value);
  }

  public slewToEvent(cycleNumber: number, eventNumber: number): void {
    const eventTimes = this.eventTimesListProperty.value;
    const targetTime =
      this.cycleOffsetProperty.value + cycleNumber * this.synodicPeriodProperty.value + (eventTimes[eventNumber] ?? 0);

    // Don't slew if already locked on this cycle + event (Flash checks both).
    if (
      this.lockedOnEventProperty.value &&
      this.lockedEventIndexProperty.value === eventNumber &&
      this.currentCycleNumberProperty.value === cycleNumber
    ) {
      return;
    }

    this.slewActive = true;
    this.slewElapsed = 0;
    this.slewStartModelTime = this.timeProperty.value;
    this.slewDeltaModelTime = targetTime - this.slewStartModelTime;
    this.slewTargetCycle = cycleNumber;
    this.slewTargetEvent = eventNumber;
    this.timer.isPlayingProperty.value = false;
    this.countdownElapsed = -1;
    this.countdownRemainingProperty.value = 0;
  }

  public resetTime(): void {
    this.slewActive = false;
    this.countdownElapsed = -1;
    this.countdownRemainingProperty.value = 0;
    this.epochAngle1Property.value = 0;
    this.epochAngle2Property.value = 0;
    this.calculateSystemProperties();
    this.setTime(0);
  }

  /** Zero the timeline display offset (AS: zeroTimelineTime). Display-only. */
  public zeroTimelineCounter(): void {
    this.timelineTimeOffsetProperty.value = -this.timeProperty.value;
  }

  private startCountdown(): void {
    this.countdownElapsed = 0;
    this.countdownRemainingProperty.value = this.pauseTimeProperty.value;
  }

  /**
   * Cancel an active pause-countdown (Flash: clickToCancelMC.onPress →
   * cancelAnimationCountdown). Leaves the sim paused at the event.
   */
  public cancelCountdown(): void {
    this.countdownElapsed = -1;
    this.countdownRemainingProperty.value = 0;
  }

  /**
   * Freeze the animation onEnterFrame during a planet drag (Flash:
   * freezeAnimation). Cancels any active countdown and stops stepping.
   */
  public freezeAnimation(): void {
    this.cancelCountdown();
  }

  /**
   * Restore the animation onEnterFrame after a drag ends (Flash: thawAnimation).
   * Only resumes if the sim was playing before the drag.
   */
  public thawAnimation(wasPlaying: boolean): void {
    if (wasPlaying) {
      this.timer.isPlayingProperty.value = true;
    }
  }

  /**
   * Set time from a timeline drag, optionally snapping to the nearest event.
   * Flash Timeline.as: timeThreshold = snapDistance / scale (years), not an angle.
   */
  public setTimeFromTimelineDrag(newTime: number, snap: boolean, timeThresholdYears: number): void {
    if (snap) {
      const snapped = this.findSnappedEventByTime(newTime, timeThresholdYears);
      if (snapped !== null) {
        this.setTimeByCycleAndEventNumbers(snapped.cycle, snapped.event);
        return;
      }
    }
    this.setTime(newTime);
  }

  /** Snap by absolute time proximity (Flash timeline scrub). */
  private findSnappedEventByTime(newTime: number, timeThreshold: number): { cycle: number; event: number } | null {
    const cycleOffset = this.cycleOffsetProperty.value;
    const synodic = this.synodicPeriodProperty.value;
    const eventTimes = this.eventTimesListProperty.value;

    const cycle = Math.floor((newTime - cycleOffset) / synodic);
    let timeInCycle = newTime - cycleOffset - cycle * synodic;
    if (timeInCycle < 0) {
      timeInCycle = 0;
    }

    let nextEvt = 0;
    while (nextEvt < 4 && timeInCycle >= (eventTimes[nextEvt] ?? 0)) {
      nextEvt++;
    }

    const prevEvt = nextEvt - 1;
    let nextCycleFinal = cycle;
    let nextEvtFinal = nextEvt;
    if (nextEvt >= 4) {
      nextEvtFinal = 0;
      nextCycleFinal = cycle + 1;
    }

    const prevTime =
      prevEvt >= 0
        ? cycleOffset + cycle * synodic + (eventTimes[prevEvt] ?? 0)
        : cycleOffset + (cycle - 1) * synodic + (eventTimes[3] ?? 0);
    const nextTime = cycleOffset + nextCycleFinal * synodic + (eventTimes[nextEvtFinal] ?? 0);

    const prevDelta = Math.abs(newTime - prevTime);
    const nextDelta = Math.abs(nextTime - newTime);
    const minDelta = Math.min(prevDelta, nextDelta);

    if (minDelta >= timeThreshold) {
      return null;
    }
    if (minDelta === nextDelta) {
      return { cycle: nextCycleFinal, event: nextEvtFinal };
    }
    const effectivePrevEvt = prevEvt >= 0 ? prevEvt : 3;
    const effectivePrevCycle = prevEvt >= 0 ? cycle : cycle - 1;
    return { cycle: effectivePrevCycle, event: effectivePrevEvt };
  }

  private advanceSlew(dt: number): void {
    this.slewElapsed += dt;
    const u = this.slewElapsed / this.slewDuration;
    if (u < 1) {
      const ease = 1 - (1 - u) ** 3;
      this.timeProperty.value = this.slewStartModelTime + ease * this.slewDeltaModelTime;
    } else {
      this.slewActive = false;
      this.setTimeByCycleAndEventNumbers(this.slewTargetCycle, this.slewTargetEvent);
    }
  }

  private advanceCountdown(dt: number): void {
    this.countdownElapsed += dt;
    const remaining = this.pauseTimeProperty.value - this.countdownElapsed;
    if (remaining <= 0) {
      this.countdownElapsed = -1;
      this.countdownRemainingProperty.value = 0;
      this.timer.isPlayingProperty.value = true;
    } else {
      this.countdownRemainingProperty.value = remaining;
    }
  }

  public step(dt: number): void {
    if (this.slewActive) {
      this.advanceSlew(dt);
      return;
    }
    if (this.countdownElapsed >= 0 && this.countdownRemainingProperty.value > 0) {
      this.advanceCountdown(dt);
      return;
    }
    if (!this.timer.isPlayingProperty.value) {
      return;
    }

    // Flash: animationRate = sliderVal * min(period1,period2) / TWO_PI (yr/sec).
    // The slider value IS the inner planet's angular speed in rad/sec (default 1).
    const minPeriod = Math.min(this.period1Property.value, this.period2Property.value);
    const dtYears = (dt * this.timer.animationRateProperty.value * minPeriod) / TWO_PI;
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

  public applyPreset(id: 1 | 2, key: PlanetPresetKey): boolean {
    // setSemimajorAxis → syncPresetIndices updates the combobox index automatically.
    return this.setSemimajorAxis(id, PLANET_PRESETS[key], false);
  }

  public reset(): void {
    this.timer.reset();
    this.slewActive = false;
    this.countdownElapsed = -1;

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

    this.calculateSystemProperties();
    this.syncPresetIndices();
    this.setTime(0);
    this.zeroTimelineCounter();
  }
}
