/**
 * TimeModel.test.ts
 *
 * Unit tests for the composable play/pause + elapsed-time model in
 * src/common/TimeModel.ts (used by both screens).
 */

import { describe, expect, it } from "vitest";
import { TimeModel } from "../src/common/TimeModel.js";

describe("TimeModel", () => {
  it("starts paused at time 0 by default", () => {
    const model = new TimeModel();
    expect(model.isPlayingProperty.value).toBe(false);
    expect(model.timeProperty.value).toBe(0);
    model.dispose();
  });

  it("can start playing when constructed with initiallyPlaying", () => {
    const model = new TimeModel(true);
    expect(model.isPlayingProperty.value).toBe(true);
    model.dispose();
  });

  it("does not advance time while paused", () => {
    const model = new TimeModel();
    model.step(1);
    expect(model.timeProperty.value).toBe(0);
    model.dispose();
  });

  it("accumulates time while playing", () => {
    const model = new TimeModel(true);
    model.step(0.5);
    model.step(0.25);
    expect(model.timeProperty.value).toBeCloseTo(0.75);
    model.dispose();
  });

  it("reset() restores the initial playback state and clears time", () => {
    const model = new TimeModel();
    model.isPlayingProperty.value = true;
    model.step(2);
    model.reset();
    expect(model.isPlayingProperty.value).toBe(false);
    expect(model.timeProperty.value).toBe(0);
    model.dispose();
  });

  it("animationRateProperty defaults to 1 and resets", () => {
    const model = new TimeModel();
    expect(model.animationRateProperty.value).toBe(1);
    model.animationRateProperty.value = 2.5;
    model.reset();
    expect(model.animationRateProperty.value).toBe(1);
    model.dispose();
  });
});
