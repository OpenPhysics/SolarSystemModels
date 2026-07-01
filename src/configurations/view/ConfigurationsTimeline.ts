import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { DragListener, FireListener, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Tandem } from "scenerystack/tandem";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import {
  CONFIGURATIONS_TIMELINE_CYCLE_HEIGHT,
  CONFIGURATIONS_TIMELINE_HEIGHT,
  CONFIGURATIONS_TIMELINE_WIDTH,
} from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const W = CONFIGURATIONS_TIMELINE_WIDTH;
const H = CONFIGURATIONS_TIMELINE_HEIGHT;
const CYCLE_HEIGHT_PX = CONFIGURATIONS_TIMELINE_CYCLE_HEIGHT;

// Which (cycle, event) a pooled label currently represents — read by that
// label's FireListener at click-time, so clicking always slews to whatever
// event the label is currently showing.
type EventBinding = { cycle: number; event: number };

function plotEventMark(
  shape: Shape,
  labelPool: Text[],
  bindings: EventBinding[],
  labelIdx: number,
  y: number,
  name: string,
  cycle: number,
  event: number,
): number {
  shape.moveTo(0, y).lineTo(W * 0.4, y);
  const lbl = labelPool[labelIdx];
  const binding = bindings[labelIdx];
  if (lbl !== undefined && binding !== undefined) {
    lbl.string = name;
    lbl.left = W * 0.42;
    lbl.centerY = y;
    lbl.visible = true;
    binding.cycle = cycle;
    binding.event = event;
    return labelIdx + 1;
  }
  return labelIdx;
}

function checkLocked(
  selectedEventBg: Rectangle,
  model: ConfigurationsModel,
  e: number,
  t: number,
  time: number,
  synodic: number,
  y: number,
): void {
  if (
    model.lockedOnEventProperty.value &&
    model.lockedEventIndexProperty.value === e &&
    Math.abs(t - time) < synodic * 0.01
  ) {
    selectedEventBg.centerY = y;
    selectedEventBg.visible = true;
  }
}

export class ConfigurationsTimeline extends Node {
  public constructor(model: ConfigurationsModel) {
    super();

    const bg = new Rectangle(0, 0, W, H, {
      fill: SolarSystemModelsColors.timelineBackgroundColorProperty,
      stroke: SolarSystemModelsColors.timelineBorderColorProperty,
      lineWidth: 1,
    });
    this.addChild(bg);

    const eventLayer = new Path(null, {
      stroke: SolarSystemModelsColors.timelineEventColorProperty,
      lineWidth: 1,
    });
    this.addChild(eventLayer);

    const selectedEventBg = new Rectangle(0, 0, W, 18, {
      fill: SolarSystemModelsColors.timelineSelectedColorProperty,
      visible: false,
    });
    this.addChild(selectedEventBg);

    const cursorLine = new Path(new Shape().moveTo(0, H / 2).lineTo(W, H / 2), {
      stroke: SolarSystemModelsColors.timelineCursorColorProperty,
      lineWidth: 1.5,
    });
    this.addChild(cursorLine);

    const labelPool: Text[] = [];
    const labelBindings: EventBinding[] = [];
    for (let i = 0; i < 20; i++) {
      const binding: EventBinding = { cycle: 0, event: 0 };
      labelBindings.push(binding);

      const t = new Text("", {
        font: new PhetFont(9),
        fill: SolarSystemModelsColors.timelineLabelColorProperty,
        maxWidth: W - 8,
        cursor: "pointer",
      });
      t.visible = false;
      t.addInputListener(
        new FireListener({
          tandem: Tandem.OPT_OUT,
          fire: () => model.slewToEvent(binding.cycle, binding.event),
        }),
      );
      labelPool.push(t);
      this.addChild(t);
    }

    const update = () => {
      const synodic = model.synodicPeriodProperty.value;
      if (synodic <= 0) {
        return;
      }

      const scale = CYCLE_HEIGHT_PX / synodic;
      const time = model.timeProperty.value;
      const cycleOffset = model.cycleOffsetProperty.value;
      const eventTimes = model.eventTimesListProperty.value;
      const eventNames = model.eventNamesProperty.value;
      const currentCycle = model.currentCycleNumberProperty.value;

      const shape = new Shape();
      let labelIdx = 0;

      for (let dc = -3; dc <= 3; dc++) {
        const cycle = currentCycle + dc;
        for (let e = 0; e < 4; e++) {
          const t = cycleOffset + cycle * synodic + (eventTimes[e] ?? 0);
          const y = H / 2 - (t - time) * scale;
          if (y < -20 || y > H + 20) {
            continue;
          }
          labelIdx = plotEventMark(shape, labelPool, labelBindings, labelIdx, y, eventNames[e] ?? "", cycle, e);
          checkLocked(selectedEventBg, model, e, t, time, synodic, y);
        }
      }

      for (let i = labelIdx; i < labelPool.length; i++) {
        const lbl = labelPool[i];
        if (lbl !== undefined) {
          lbl.visible = false;
        }
      }

      eventLayer.shape = shape;

      if (!model.lockedOnEventProperty.value) {
        selectedEventBg.visible = false;
      }
    };

    Multilink.multilink(
      [
        model.synodicPeriodProperty,
        model.eventTimesListProperty,
        model.eventNamesProperty,
        model.timeProperty,
        model.currentCycleNumberProperty,
        model.lockedOnEventProperty,
        model.lockedEventIndexProperty,
      ] as const,
      update,
    );

    let initY = 0;
    let initTime = 0;

    bg.addInputListener(
      new DragListener({
        tandem: Tandem.OPT_OUT,
        press: (_event, listener) => {
          initY = listener.parentPoint.y;
          initTime = model.timeProperty.value;
          model.timer.isPlayingProperty.value = false;
        },
        drag: (_event, listener) => {
          const synodic = model.synodicPeriodProperty.value;
          if (synodic <= 0) {
            return;
          }
          const scale = CYCLE_HEIGHT_PX / synodic;
          const deltaY = initY - listener.parentPoint.y;
          const newTime = initTime + deltaY / scale;
          model.setTime(newTime);
        },
      }),
    );
  }
}
