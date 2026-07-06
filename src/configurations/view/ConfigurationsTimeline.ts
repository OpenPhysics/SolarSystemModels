import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { DragListener, Node, Path, PressListener, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import { CONFIGURATIONS_TIMELINE_HEIGHT, CONFIGURATIONS_TIMELINE_WIDTH } from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

const W = CONFIGURATIONS_TIMELINE_WIDTH;
const H = CONFIGURATIONS_TIMELINE_HEIGHT;
const CYCLE_HEIGHT_PX = 120;
const MIN_UNIT_PX = 20;
const SNAP_ANGLE = Math.PI / 12;

/**
 * Compute a "nice" unit time for the year-axis (1, 2, 5, 10, 20, 50, …).
 * Matches the AS algorithm: power of 10, then divide by 4 or 2 if it fits.
 */
function niceUnitTime(unitTimeMin: number): { unitTime: number; decimals: number } {
  const exp = Math.ceil(Math.log(unitTimeMin) / Math.LN10);
  let unitTime = 10 ** exp;
  let decimals = -exp;
  if (unitTime / 4 > unitTimeMin) {
    unitTime /= 4;
    decimals += 2;
  } else if (unitTime / 2 > unitTimeMin) {
    unitTime /= 2;
    decimals += 1;
  }
  return { unitTime, decimals };
}

export class ConfigurationsTimeline extends Node {
  public constructor(model: ConfigurationsModel) {
    super();

    const s = StringManager.getInstance().getConfigurationsStrings();

    const bg = new Rectangle(0, 0, W, H, {
      fill: SolarSystemModelsColors.timelineBackgroundColorProperty,
      stroke: SolarSystemModelsColors.timelineBorderColorProperty,
      lineWidth: 1,
    });
    this.addChild(bg);

    // Year-axis grid lines
    const axisLayer = new Path(null, {
      lineWidth: 1,
      stroke: SolarSystemModelsColors.timelineAxisColorProperty,
    });
    this.addChild(axisLayer);

    // Event marks
    const eventLayer = new Path(null, {
      stroke: SolarSystemModelsColors.timelineEventColorProperty,
      lineWidth: 1,
    });
    this.addChild(eventLayer);

    // Selected-event highlight bar
    const selectedEventBg = new Rectangle(0, 0, W, 14, {
      fill: SolarSystemModelsColors.timelineSelectedHighlightColorProperty,
      visible: false,
      cornerRadius: 2,
    });
    this.addChild(selectedEventBg);

    // Cursor line (center = current time)
    const cursorLine = new Path(new Shape().moveTo(0, H / 2).lineTo(W, H / 2), {
      stroke: SolarSystemModelsColors.timelineCursorColorProperty,
      lineWidth: 1.5,
    });
    this.addChild(cursorLine);

    // Past / Future labels
    const pastLabel = new Text(s.timelinePastStringProperty, {
      font: new PhetFont({ size: 9, weight: "bold" }),
      fill: SolarSystemModelsColors.timelineDirectionLabelColorProperty,
    });
    pastLabel.right = W - 4;
    pastLabel.bottom = H / 2 - 3;
    this.addChild(pastLabel);

    const futureLabel = new Text(s.timelineFutureStringProperty, {
      font: new PhetFont({ size: 9, weight: "bold" }),
      fill: SolarSystemModelsColors.timelineDirectionLabelColorProperty,
    });
    futureLabel.right = W - 4;
    futureLabel.top = H / 2 + 3;
    this.addChild(futureLabel);

    // Event-name label pool
    const labelPool: Text[] = [];
    for (let i = 0; i < 20; i++) {
      const t = new Text("", {
        font: new PhetFont(9),
        fill: SolarSystemModelsColors.timelineEventNameLabelColorProperty,
        maxWidth: W * 0.4 - 4,
      });
      t.visible = false;
      labelPool.push(t);
      this.addChild(t);
    }

    // Year tick-label pool
    const tickPool: Text[] = [];
    for (let i = 0; i < 16; i++) {
      const t = new Text("", {
        font: new PhetFont(8),
        fill: SolarSystemModelsColors.timelineTickLabelColorProperty,
      });
      t.visible = false;
      tickPool.push(t);
      this.addChild(t);
    }

    // Selected event name text
    const selectedEventText = new Text("", {
      font: new PhetFont({ size: 10, weight: "bold" }),
      fill: SolarSystemModelsColors.textColorProperty,
      maxWidth: W * 0.35,
    });
    selectedEventText.visible = false;
    this.addChild(selectedEventText);

    // Hotspot layer for clickable events
    const hotspotLayer = new Node();
    this.addChild(hotspotLayer);

    const drawAxisGrid = (time: number, scale: number): void => {
      const unitTimeMin = MIN_UNIT_PX / scale;
      const { unitTime, decimals } = niceUnitTime(unitTimeMin);
      const tickSpacingPx = unitTime * scale;
      const halfRangeTicks = Math.ceil(H / 2 / tickSpacingPx) + 1;
      const axisShape = new Shape();
      let tickIdx = 0;
      const baseTick = Math.round(time / unitTime) * unitTime;

      for (let tk = -halfRangeTicks; tk <= halfRangeTicks; tk++) {
        const tickTime = baseTick + tk * unitTime;
        const y = H / 2 - (tickTime - time) * scale;
        if (y < -10 || y > H + 10) {
          continue;
        }
        axisShape.moveTo(0, y).lineTo(W, y);
        const tickLabel = tickPool[tickIdx];
        if (tickLabel !== undefined) {
          const lbl = decimals <= 0 ? String(Math.round(tickTime)) : tickTime.toFixed(decimals);
          tickLabel.string = `${lbl} yr`;
          tickLabel.right = W - 2;
          tickLabel.centerY = y;
          tickLabel.visible = true;
          tickIdx++;
        }
      }
      for (let i = tickIdx; i < tickPool.length; i++) {
        const lbl = tickPool[i];
        if (lbl !== undefined) {
          lbl.visible = false;
        }
      }
      axisLayer.shape = axisShape;
    };

    const drawEventMark = (
      shape: Shape,
      y: number,
      e: number,
      eventNames: readonly string[],
      time: number,
      synodic: number,
    ): void => {
      shape.moveTo(0, y).lineTo(W * 0.4, y);
      const lbl = labelPool[labelIdx];
      if (lbl !== undefined) {
        lbl.string = eventNames[e] ?? "";
        lbl.left = W * 0.42;
        lbl.centerY = y;
        lbl.visible = true;
        labelIdx++;
      }
      const hs = new Rectangle(0, y - 6, W * 0.4, 12, {
        fill: "rgba(0,0,0,0)",
        cursor: "pointer",
      });
      hs.addInputListener(
        new PressListener({
          press: () => model.slewToEvent(cycle, e),
        }),
      );
      hotspotLayer.addChild(hs);
      if (
        model.lockedOnEventProperty.value &&
        model.lockedEventIndexProperty.value === e &&
        Math.abs(t - time) < synodic * 0.01
      ) {
        selectedEventBg.centerY = y - 1;
        selectedEventBg.visible = true;
      }
    };
    let cycle = 0;
    let t = 0;
    let labelIdx = 0;
    const drawEventMarks = (
      time_: number,
      scale: number,
      cycleOffset: number,
      currentCycle: number,
      synodic: number,
      eventTimes: readonly number[],
      eventNames: readonly string[],
    ): void => {
      const shape = new Shape();
      labelIdx = 0;
      hotspotLayer.children = [];

      for (let dc = -3; dc <= 3; dc++) {
        cycle = currentCycle + dc;
        for (let e = 0; e < 4; e++) {
          t = cycleOffset + cycle * synodic + (eventTimes[e] ?? 0);
          const y = H / 2 - (t - time_) * scale;
          if (y < -20 || y > H + 20) {
            continue;
          }
          drawEventMark(shape, y, e, eventNames, time_, synodic);
        }
      }

      for (let i = labelIdx; i < labelPool.length; i++) {
        const lbl = labelPool[i];
        if (lbl !== undefined) {
          lbl.visible = false;
        }
      }
      eventLayer.shape = shape;
    };

    const updateSelectedEventLabel = (eventNames: readonly string[]): void => {
      if (model.lockedOnEventProperty.value && model.lockedEventIndexProperty.value >= 0) {
        selectedEventText.string = eventNames[model.lockedEventIndexProperty.value] ?? "";
        selectedEventText.left = W * 0.42;
        selectedEventText.top = 2;
        selectedEventText.visible = true;
      } else {
        selectedEventBg.visible = false;
        selectedEventText.visible = false;
      }
    };

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

      drawAxisGrid(time, scale);
      drawEventMarks(time, scale, cycleOffset, currentCycle, synodic, eventTimes, eventNames);
      updateSelectedEventLabel(eventNames);
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

    // ── Drag-to-scrub with freeze/thaw + optional snap ──────────────────────
    let initY = 0;
    let initTime = 0;
    let wasPlaying = false;

    bg.addInputListener(
      new DragListener({
        tandem: Tandem.OPT_OUT,
        press: (_event, listener) => {
          initY = listener.parentPoint.y;
          initTime = model.timeProperty.value;
          wasPlaying = model.timer.isPlayingProperty.value;
          model.freezeAnimation();
          model.timer.isPlayingProperty.value = false;
        },
        drag: (_event, listener) => {
          const synodic = model.synodicPeriodProperty.value;
          const scale = CYCLE_HEIGHT_PX / synodic;
          const deltaY = initY - listener.parentPoint.y;
          const newTime = initTime + deltaY / scale;
          model.setTimeFromTimelineDrag(newTime, model.snapToEventsProperty.value, SNAP_ANGLE);
        },
        release: () => {
          model.thawAnimation(wasPlaying);
        },
      }),
    );
  }
}
