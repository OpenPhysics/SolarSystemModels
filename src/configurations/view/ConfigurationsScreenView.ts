import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, DragListener, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import type { ScreenViewOptions } from "scenerystack/sim";
import { ScreenView } from "scenerystack/sim";
import { RectangularPushButton } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import { CelestialBodyNode } from "../../common/CelestialBodyNode.js";
import { ZodiacConstellationNode } from "../../common/ZodiacConstellationNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import {
  CONFIGURATIONS_ORBIT_CENTER_X,
  CONFIGURATIONS_ORBIT_CENTER_Y,
  CONFIGURATIONS_ORBIT_MARGIN,
  SCREEN_VIEW_MARGIN,
} from "../../SolarSystemModelsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";
import { ConfigurationsControlPanel } from "./ConfigurationsControlPanel.js";
import { ConfigurationsDisplayPanel } from "./ConfigurationsDisplayPanel.js";
import { ConfigurationsElongationIndicator } from "./ConfigurationsElongationIndicator.js";
import { ConfigurationsScreenSummaryContent } from "./ConfigurationsScreenSummaryContent.js";
import { ConfigurationsTimeline } from "./ConfigurationsTimeline.js";
import { ConfigurationsTimeReadout } from "./ConfigurationsTimeReadout.js";
import { ConfigurationsZodiacStrip } from "./ConfigurationsZodiacStrip.js";

const ORBIT_AREA_SIZE = CONFIGURATIONS_ORBIT_CENTER_X * 2 + 20;

function buildMvt(a1: number, a2: number): ModelViewTransform2 {
  const maxA = Math.max(a1, a2);
  // scale so that maxA AU fits within the orbit area minus margin
  const scale = (CONFIGURATIONS_ORBIT_CENTER_X - CONFIGURATIONS_ORBIT_MARGIN) / maxA;
  return ModelViewTransform2.createSinglePointScaleInvertedYMapping(
    Vector2.ZERO,
    new Vector2(CONFIGURATIONS_ORBIT_CENTER_X, CONFIGURATIONS_ORBIT_CENTER_Y),
    scale,
  );
}

export class ConfigurationsScreenView extends ScreenView {
  private readonly model: ConfigurationsModel;
  // Rebuilt whenever the orbital radii change, so its scale always fits both orbits.
  private readonly mvtProperty: DerivedProperty<ModelViewTransform2>;

  public constructor(model: ConfigurationsModel, options?: ScreenViewOptions) {
    super({
      screenSummaryContent: new ConfigurationsScreenSummaryContent(model),
      ...options,
    });

    this.model = model;
    this.mvtPropertyProperty = new DerivedProperty(
      [model.semimajorAxis1Property, model.semimajorAxis2Property] as const,
      (a1, a2) => buildMvt(a1, a2),
    );

    const a11y = StringManager.getInstance().getConfigurationsA11yStrings();

    // ── Background ──────────────────────────────────────────────────────────
    const background = new Rectangle(0, 0, this.layoutBounds.width, this.layoutBounds.height, {
      fill: SolarSystemModelsColors.backgroundColorProperty,
    });
    this.addChild(background);

    // ── Orbit area background ───────────────────────────────────────────────
    const orbitAreaBg = new Rectangle(0, 0, ORBIT_AREA_SIZE, this.layoutBounds.height, {
      fill: "#060d1a",
    });
    this.addChild(orbitAreaBg);

    // ── Zodiac constellation star field ─────────────────────────────────────
    const constellationNode = new ZodiacConstellationNode(CONFIGURATIONS_ORBIT_CENTER_X, CONFIGURATIONS_ORBIT_CENTER_Y);
    this.addChild(constellationNode);

    // ── Orbit circles (solid, matching AS) ──────────────────────────────────
    const orbit1Circle = new Path(null, {
      stroke: SolarSystemModelsColors.observerPlanetColorProperty,
      lineWidth: 1,
    });
    const orbit2Circle = new Path(null, {
      stroke: SolarSystemModelsColors.targetPlanetColorProperty,
      lineWidth: 1,
    });
    this.addChild(orbit1Circle);
    this.addChild(orbit2Circle);

    // ── Orbit labels ────────────────────────────────────────────────────────
    const orbitLabel1 = new Text("", {
      font: new PhetFont(10),
      fill: SolarSystemModelsColors.observerPlanetColorProperty,
      visibleProperty: model.showOrbitLabelsProperty,
    });
    const orbitLabel2 = new Text("", {
      font: new PhetFont(10),
      fill: SolarSystemModelsColors.targetPlanetColorProperty,
      visibleProperty: model.showOrbitLabelsProperty,
    });
    this.addChild(orbitLabel1);
    this.addChild(orbitLabel2);

    // ── Elongation indicator (Phase 7) ──────────────────────────────────────
    const elongationIndicator = new ConfigurationsElongationIndicator(model, this.mvtProperty);
    this.addChild(elongationIndicator);

    // ── Sun at origin ───────────────────────────────────────────────────────
    const sunNode = new Circle(12, { fill: SolarSystemModelsColors.sunColorProperty });
    this.addChild(sunNode);

    const updateSunPos = () => {
      sunNode.translation = this.mvtProperty.modelToViewPosition(Vector2.ZERO);
    };
    updateSunPos();

    // ── Observer planet (blue) ──────────────────────────────────────────────
    const observerNode = new CelestialBodyNode(model.pos1Property, this.mvtProperty, {
      radius: 8,
      fill: SolarSystemModelsColors.observerPlanetColorProperty,
      cursor: "pointer",
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.observerDragStringProperty,
    });
    this.addChild(observerNode);

    // ── Target planet (grey) ────────────────────────────────────────────────
    const targetNode = new CelestialBodyNode(model.pos2Property, this.mvtProperty, {
      radius: 8,
      fill: SolarSystemModelsColors.targetPlanetColorProperty,
      cursor: "pointer",
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.targetDragStringProperty,
    });
    this.addChild(targetNode);

    // ── Planet drag listeners (freeze/thaw animation during drag, matching AS) ─
    const makePlanetDrag = (id: 1 | 2, node: Node) => {
      let wasPlaying = false;
      node.addInputListener(
        new DragListener({
          tandem: Tandem.OPT_OUT,
          press: () => {
            wasPlaying = model.timer.isPlayingProperty.value;
            model.freezeAnimation();
            model.timer.isPlayingProperty.value = false;
          },
          drag: (event, listener) => {
            const shiftKey = (event.domEvent as MouseEvent | null)?.shiftKey ?? false;
            const modelPos = this.mvtProperty.viewToModelPosition(listener.modelPoint);
            const angle = Math.atan2(modelPos.y, modelPos.x);
            const snap = model.snapToEventsProperty.value;
            if (shiftKey) {
              model.setEpochAngleByPlanetAngle(id, angle, snap, Math.PI / 12);
            } else {
              model.setTimeByPlanetAngle(id, angle, snap, Math.PI / 12);
            }
          },
          release: () => {
            model.thawAnimation(wasPlaying);
          },
        }),
      );
    };
    makePlanetDrag(1, observerNode);
    makePlanetDrag(2, targetNode);

    // ── Update orbit circles + labels when radii change ─────────────────────
    const updateOrbits = () => {
      const a1 = model.semimajorAxis1Property.value;
      const a2 = model.semimajorAxis2Property.value;
      this.mvtProperty = buildMvt(a1, a2);

      // Update elongation indicator's MVT reference
      // (It holds a closure over mvt, so we need to re-link — simplest: rebuild shape via update)
      const center = this.mvtProperty.modelToViewPosition(Vector2.ZERO);

      const r1 = this.mvtProperty.modelToViewDeltaX(a1);
      orbit1Circle.shape = Shape.circle(center.x, center.y, r1);

      const r2 = this.mvtProperty.modelToViewDeltaX(a2);
      orbit2Circle.shape = Shape.circle(center.x, center.y, r2);

      // Labels at top of orbit circles
      orbitLabel1.string = `${a1.toFixed(2)} AU`;
      orbitLabel1.centerX = center.x;
      orbitLabel1.bottom = center.y - r1 - 4;

      orbitLabel2.string = `${a2.toFixed(2)} AU`;
      orbitLabel2.centerX = center.x;
      orbitLabel2.bottom = center.y - r2 - 4;

      // Update planet node positions to use new MVT
      updateSunPos();
    };

    Multilink.multilink([model.semimajorAxis1Property, model.semimajorAxis2Property] as const, updateOrbits);

    // ── Zodiac strip at bottom ──────────────────────────────────────────────
    const zodiacStrip = new ConfigurationsZodiacStrip(model);
    zodiacStrip.left = 0;
    zodiacStrip.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;
    this.addChild(zodiacStrip);

    // ── Timeline (right side, below controls) ───────────────────────────────
    const timeline = new ConfigurationsTimeline(model);
    // Positioned after panels are placed
    this.addChild(timeline);

    // ── Right-side panels ───────────────────────────────────────────────────
    const controlPanel = new ConfigurationsControlPanel(model, this);
    controlPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = SCREEN_VIEW_MARGIN;
    this.addChild(controlPanel);

    const displayPanel = new ConfigurationsDisplayPanel(model);
    displayPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    displayPanel.top = controlPanel.bottom + 8;
    this.addChild(displayPanel);

    const timeReadout = new ConfigurationsTimeReadout(model);
    timeReadout.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    timeReadout.top = displayPanel.bottom + 8;
    this.addChild(timeReadout);

    // ── Countdown cancel button (AS: clickToCancelMC) ───────────────────────
    const s = StringManager.getInstance().getConfigurationsStrings();
    const a11yCancel = StringManager.getInstance().getConfigurationsA11yStrings();
    const cancelButton = new RectangularPushButton({
      content: new Text(s.cancelCountdownStringProperty, {
        font: new PhetFont(12),
        fill: SolarSystemModelsColors.textColorProperty,
      }),
      listener: () => model.cancelCountdown(),
      visibleProperty: new DerivedProperty([model.countdownRemainingProperty], (r) => r > 0),
      accessibleName: a11yCancel.controls.cancelCountdownStringProperty,
    });
    cancelButton.centerX = CONFIGURATIONS_ORBIT_CENTER_X;
    cancelButton.centerY = CONFIGURATIONS_ORBIT_CENTER_Y;
    this.addChild(cancelButton);

    // Position timeline below time readout
    timeline.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    timeline.top = timeReadout.bottom + 8;

    // ── Reset All button ────────────────────────────────────────────────────
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    // ── pdomOrder ────────────────────────────────────────────────────────────
    this.addChild(
      new Node({
        pdomOrder: [controlPanel, displayPanel, timeReadout, observerNode, targetNode, resetAllButton],
      }),
    );

    // Trigger initial orbit draw
    updateOrbits();
  }

  public reset(): void {
    // model.reset() handles all state
  }

  public override step(dt: number): void {
    this.model.step(dt);
  }
}
