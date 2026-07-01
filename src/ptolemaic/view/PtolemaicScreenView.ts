import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, DragListener, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import type { ScreenViewOptions } from "scenerystack/sim";
import { ScreenView } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { CelestialBodyNode } from "../../common/CelestialBodyNode.js";
import { ZodiacConstellationNode } from "../../common/ZodiacConstellationNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import SolarSystemModelsColors from "../../SolarSystemModelsColors.js";
import {
  ORBIT_VIEW_CENTER_X,
  ORBIT_VIEW_CENTER_Y,
  ORBIT_VIEW_SCALE,
  PTOLEMAIC_DEFERENT_RADIUS,
  PTOLEMAIC_SUN_ORBIT_RADIUS,
  SCREEN_VIEW_MARGIN,
  ZODIAC_LABEL_MAX_WIDTH,
  ZODIAC_LABEL_RADIUS,
  ZODIAC_TICK_INNER_RADIUS,
  ZODIAC_TICK_OUTER_RADIUS,
} from "../../SolarSystemModelsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";
import { PtolemaicControlPanel } from "./PtolemaicControlPanel.js";
import { PtolemaicDisplayPanel } from "./PtolemaicDisplayPanel.js";
import { PtolemaicPathTrail } from "./PtolemaicPathTrail.js";
import { PtolemaicScreenSummaryContent } from "./PtolemaicScreenSummaryContent.js";
import { PtolemaicTimeControls } from "./PtolemaicTimeControls.js";
import { PtolemaicTimeReadout } from "./PtolemaicTimeReadout.js";
import { PtolemaicZodiacStrip } from "./PtolemaicZodiacStrip.js";

export class PtolemaicScreenView extends ScreenView {
  private readonly pathTrail: PtolemaicPathTrail;
  private readonly model: PtolemaicModel;
  private readonly mvt: ModelViewTransform2;

  public constructor(model: PtolemaicModel, options?: ScreenViewOptions) {
    super({
      screenSummaryContent: new PtolemaicScreenSummaryContent(model),
      ...options,
    });

    this.model = model;

    const zodiacStrings = StringManager.getInstance().getZodiacStrings();
    const ZODIAC_SIGN_PROPS = [
      zodiacStrings.ariesStringProperty,
      zodiacStrings.taurusStringProperty,
      zodiacStrings.geminiStringProperty,
      zodiacStrings.cancerStringProperty,
      zodiacStrings.leoStringProperty,
      zodiacStrings.virgoStringProperty,
      zodiacStrings.libraStringProperty,
      zodiacStrings.scorpiusStringProperty,
      zodiacStrings.sagittariusStringProperty,
      zodiacStrings.capricornStringProperty,
      zodiacStrings.aquariusStringProperty,
      zodiacStrings.piscesStringProperty,
    ];

    // ── Model–view transform ───────────────────────────────────────────────
    // Earth at model origin → view center-left; y inverted (Flash screen-y down)
    this.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2(ORBIT_VIEW_CENTER_X, ORBIT_VIEW_CENTER_Y),
      ORBIT_VIEW_SCALE,
    );

    const mvt = this.mvt;

    // ── Background ─────────────────────────────────────────────────────────
    const background = new Rectangle(0, 0, this.layoutBounds.width, this.layoutBounds.height, {
      fill: SolarSystemModelsColors.backgroundColorProperty,
    });
    this.addChild(background);

    // ── Orbital area background ────────────────────────────────────────────
    const orbitAreaBg = new Rectangle(0, 0, ORBIT_VIEW_CENTER_X * 2 + 20, this.layoutBounds.height, {
      fill: SolarSystemModelsColors.orbitAreaBackgroundColorProperty,
    });
    this.addChild(orbitAreaBg);

    // ── Zodiac constellation star field ──────────────────────────────────
    const constellationNode = new ZodiacConstellationNode(ORBIT_VIEW_CENTER_X, ORBIT_VIEW_CENTER_Y);
    this.addChild(constellationNode);

    // ── Zodiac sign border tick marks at sign boundaries ─────────────────
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6; // 0°, 30°, 60°, ... (sign boundaries)
      const tick = new Path(null, {
        stroke: SolarSystemModelsColors.zodiacTickColorProperty,
        lineWidth: 1,
      });
      const x1 = ORBIT_VIEW_CENTER_X + Math.cos(angle) * ZODIAC_TICK_INNER_RADIUS;
      const y1 = ORBIT_VIEW_CENTER_Y - Math.sin(angle) * ZODIAC_TICK_INNER_RADIUS;
      const x2 = ORBIT_VIEW_CENTER_X + Math.cos(angle) * ZODIAC_TICK_OUTER_RADIUS;
      const y2 = ORBIT_VIEW_CENTER_Y - Math.sin(angle) * ZODIAC_TICK_OUTER_RADIUS;
      tick.shape = new Shape().moveTo(x1, y1).lineTo(x2, y2);
      this.addChild(tick);
    }

    // ── Zodiac sign labels at sign centers (+15°) ─────────────────────────
    ZODIAC_SIGN_PROPS.forEach((signStringProperty, i) => {
      const angle = ((i + 0.5) * Math.PI) / 6; // 15°, 45°, 75°, ... (sign centers)
      const vx = ORBIT_VIEW_CENTER_X + Math.cos(angle) * ZODIAC_LABEL_RADIUS;
      // Inverted Y: positive y in model = up in view, so negate for angle
      const vy = ORBIT_VIEW_CENTER_Y - Math.sin(angle) * ZODIAC_LABEL_RADIUS;
      const label = new Text(signStringProperty, {
        font: new PhetFont(10),
        fill: SolarSystemModelsColors.zodiacLabelColorProperty,
        maxWidth: ZODIAC_LABEL_MAX_WIDTH,
      });
      label.centerX = vx;
      label.centerY = vy;
      this.addChild(label);
    });

    // ── Path trail (behind orbit circles) ─────────────────────────────────
    this.pathTrail = new PtolemaicPathTrail(model, mvt);
    this.addChild(this.pathTrail);

    // ── Deferent circle ────────────────────────────────────────────────────
    const deferentCircle = new Path(null, {
      stroke: SolarSystemModelsColors.deferentColorProperty,
      lineWidth: 1.5,
      visibleProperty: model.showDeferentProperty,
    });
    this.addChild(deferentCircle);

    model.deferentCenterProperty.link((center) => {
      const vc = mvt.modelToViewPosition(center);
      const vr = ORBIT_VIEW_SCALE * PTOLEMAIC_DEFERENT_RADIUS;
      deferentCircle.shape = Shape.circle(vc.x, vc.y, vr);
    });

    // ── Epicycle circle ────────────────────────────────────────────────────
    const epicycleCircle = new Path(null, {
      stroke: SolarSystemModelsColors.epicycleColorProperty,
      lineWidth: 1.5,
      visibleProperty: model.showEpicycleProperty,
    });
    this.addChild(epicycleCircle);

    Multilink.multilink([model.epicycleCenterProperty, model.epicycleSizeProperty], (center, size) => {
      const vc = mvt.modelToViewPosition(center);
      const vr = ORBIT_VIEW_SCALE * size;
      epicycleCircle.shape = Shape.circle(vc.x, vc.y, vr);
    });

    // ── Sun orbit reference circle (faint) ────────────────────────────────
    const sunOrbitVr = ORBIT_VIEW_SCALE * PTOLEMAIC_SUN_ORBIT_RADIUS;
    const sunOrbitViewCenter = mvt.modelToViewPosition(Vector2.ZERO);
    const sunOrbitCircle = new Path(Shape.circle(sunOrbitViewCenter.x, sunOrbitViewCenter.y, sunOrbitVr), {
      stroke: SolarSystemModelsColors.sunOrbitReferenceColorProperty,
      lineWidth: 1,
    });
    this.addChild(sunOrbitCircle);

    // ── Equant crosshair ───────────────────────────────────────────────────
    const equantCross = new Path(null, {
      stroke: SolarSystemModelsColors.equantColorProperty,
      lineWidth: 1.5,
      visibleProperty: model.showEquantVectorProperty,
    });
    this.addChild(equantCross);

    model.equantPositionProperty.link((eq) => {
      const ve = mvt.modelToViewPosition(eq);
      const arm = 6;
      equantCross.shape = new Shape()
        .moveTo(ve.x - arm, ve.y)
        .lineTo(ve.x + arm, ve.y)
        .moveTo(ve.x, ve.y - arm)
        .lineTo(ve.x, ve.y + arm);
    });

    // ── Eccentric (deferent) center dot ────────────────────────────────────
    const eccentricDot = new Circle(4, {
      fill: SolarSystemModelsColors.eccentricColorProperty,
    });
    this.addChild(eccentricDot);
    model.deferentCenterProperty.link((center) => {
      const vc = mvt.modelToViewPosition(center);
      eccentricDot.translation = vc;
    });

    // ── Earth–Sun arrow (optional) ─────────────────────────────────────────
    const earthSunArrow = new ArrowNode(0, 0, 1, 0, {
      stroke: null,
      fill: SolarSystemModelsColors.vectorColorProperty,
      headWidth: 8,
      headHeight: 6,
      tailWidth: 2,
      visibleProperty: model.showEarthSunLineProperty,
    });
    this.addChild(earthSunArrow);

    model.sunPositionProperty.link((sunPos) => {
      const vs = mvt.modelToViewPosition(sunPos);
      const vEarth = mvt.modelToViewPosition(Vector2.ZERO);
      earthSunArrow.setTailAndTip(vEarth.x, vEarth.y, vs.x, vs.y);
    });

    // ── Epicycle–planet arrow (optional) ──────────────────────────────────
    const epicyclePlanetArrow = new ArrowNode(0, 0, 1, 0, {
      stroke: null,
      fill: SolarSystemModelsColors.vectorColorProperty,
      headWidth: 8,
      headHeight: 6,
      tailWidth: 2,
      visibleProperty: model.showEpicyclePlanetLineProperty,
    });
    this.addChild(epicyclePlanetArrow);

    Multilink.multilink([model.epicycleCenterProperty, model.planetPositionProperty], (epiCenter, planet) => {
      const ve = mvt.modelToViewPosition(epiCenter);
      const vp = mvt.modelToViewPosition(planet);
      epicyclePlanetArrow.setTailAndTip(ve.x, ve.y, vp.x, vp.y);
    });

    // ── Planet vector arrow (Earth→planet) ────────────────────────────────
    const planetVectorArrow = new ArrowNode(0, 0, 1, 0, {
      stroke: null,
      fill: SolarSystemModelsColors.vectorColorProperty,
      headWidth: 10,
      headHeight: 8,
      tailWidth: 2,
      visibleProperty: model.showPlanetVectorProperty,
    });
    this.addChild(planetVectorArrow);

    model.planetPositionProperty.link((planet) => {
      const vEarth = mvt.modelToViewPosition(Vector2.ZERO);
      const vp = mvt.modelToViewPosition(planet);
      planetVectorArrow.setTailAndTip(vEarth.x, vEarth.y, vp.x, vp.y);
    });

    // ── Earth at origin (static) ───────────────────────────────────────────
    const earthViewPos = mvt.modelToViewPosition(Vector2.ZERO);
    const earthNode = new Circle(9, {
      fill: SolarSystemModelsColors.earthColorProperty,
      centerX: earthViewPos.x,
      centerY: earthViewPos.y,
    });
    this.addChild(earthNode);

    // ── Sun node (draggable) ───────────────────────────────────────────────
    const sunNode = new CelestialBodyNode(model.sunPositionProperty, mvt, {
      radius: 11,
      fill: SolarSystemModelsColors.sunColorProperty,
      cursor: "pointer",
      tagName: "div",
      focusable: true,
      accessibleName: StringManager.getInstance().getPtolemaicA11yStrings().controls.sunDragStringProperty,
    });
    this.addChild(sunNode);

    sunNode.addInputListener(
      new DragListener({
        tandem: Tandem.OPT_OUT,
        drag: (_event, listener) => {
          const modelPos = mvt.viewToModelPosition(listener.modelPoint);
          model.setSunAngle(Math.atan2(modelPos.y, modelPos.x));
        },
      }),
    );

    // ── Planet node ────────────────────────────────────────────────────────
    const planetNode = new CelestialBodyNode(model.planetPositionProperty, mvt, {
      radius: 7,
      fill: SolarSystemModelsColors.planetColorProperty,
    });
    this.addChild(planetNode);

    // ── Zodiac strip (below orbit area) ───────────────────────────────────
    const zodiacStrip = new PtolemaicZodiacStrip(model);
    zodiacStrip.left = 0;
    zodiacStrip.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;
    this.addChild(zodiacStrip);

    // ── Right-side panels ──────────────────────────────────────────────────
    const controlPanel = new PtolemaicControlPanel(model, this);
    controlPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = SCREEN_VIEW_MARGIN;
    this.addChild(controlPanel);

    const displayPanel = new PtolemaicDisplayPanel(model);
    displayPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    displayPanel.top = controlPanel.bottom + 8;
    this.addChild(displayPanel);

    const timeControls = new PtolemaicTimeControls(model);
    timeControls.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    timeControls.top = displayPanel.bottom + 8;
    this.addChild(timeControls);

    const timeReadout = new PtolemaicTimeReadout(model);
    timeReadout.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    timeReadout.top = timeControls.bottom + 8;
    this.addChild(timeReadout);

    // ── Reset All button ───────────────────────────────────────────────────
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    // ── pdomOrder (Tab order) ──────────────────────────────────────────────
    this.addChild(
      new Node({
        pdomOrder: [controlPanel, displayPanel, timeControls, resetAllButton],
      }),
    );
  }

  public reset(): void {
    // Path trail clears automatically via model param change listeners
  }

  public override step(dt: number): void {
    this.model.step(dt);
    if (this.model.timer.isPlayingProperty.value) {
      this.pathTrail.addPoint(this.model.planetPositionProperty.value, this.model);
    }
  }
}
