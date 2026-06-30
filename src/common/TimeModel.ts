import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { ANIMATION_RATE_RANGE } from "../SolarSystemModelsConstants.js";

export class TimeModel {
  public readonly isPlayingProperty: BooleanProperty;

  public readonly timeProperty: NumberProperty;

  /** Animation speed multiplier — both screens scale by this. */
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
