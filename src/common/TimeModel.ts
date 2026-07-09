/**
 * Composable play/pause + wall-clock elapsed-time model.
 *
 * Animation-rate semantics differ by screen:
 * - **Configurations** uses `animationRateProperty` here as a dimensionless
 *   speed multiplier (0.1–5×) that scales orbital time advance.
 * - **Ptolemaic** uses only `isPlayingProperty` from this class; its own
 *   `PtolemaicModel.animationRateProperty` is days-per-second (1–500) and is
 *   independent of `TimeModel.animationRateProperty` (which stays at default 1).
 */
import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { ANIMATION_RATE_RANGE } from "../SolarSystemModelsConstants.js";

export class TimeModel {
  public readonly isPlayingProperty: BooleanProperty;

  public readonly timeProperty: NumberProperty;

  /**
   * Configurations speed multiplier (0.1–5). Unused by Ptolemaic physics —
   * see class doc above.
   */
  public readonly animationRateProperty: NumberProperty;

  public constructor(initiallyPlaying = false) {
    this.isPlayingProperty = new BooleanProperty(initiallyPlaying);
    this.timeProperty = new NumberProperty(0, { units: "s" });
    this.animationRateProperty = new NumberProperty(1, {
      range: new Range(ANIMATION_RATE_RANGE.min, ANIMATION_RATE_RANGE.max),
    });
  }

  public step(dt: number): void {
    if (this.isPlayingProperty.value) {
      this.timeProperty.value += dt;
    }
  }

  public reset(): void {
    this.isPlayingProperty.reset();
    this.timeProperty.reset();
    this.animationRateProperty.reset();
  }

  public dispose(): void {
    this.isPlayingProperty.dispose();
    this.timeProperty.dispose();
    this.animationRateProperty.dispose();
  }
}
