/**
 * SolarSystemModelsScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for both Solar System Models
 * screens. Drawn on the standard PhET 548 × 373 canvas using SolarSystemModelsColors.
 *
 *   Ptolemaic      — Earth-centered deferent + epicycle with a planet.
 *   Configurations — Sun–Earth–planet geometry with an elongation angle.
 */
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import SolarSystemModelsColors from "../SolarSystemModelsColors.js";

const W = 548;
const H = 373;
const CX = W / 2;
const CY = H / 2;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: SolarSystemModelsColors.orbitAreaBackgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: SolarSystemModelsColors.orbitAreaBackgroundColorProperty,
  });
}

export function createPtolemaicIcon(): ScreenIcon {
  const earth = new Circle(28, {
    fill: SolarSystemModelsColors.earthColorProperty,
    centerX: CX,
    centerY: CY,
  });
  const deferent = new Path(Shape.ellipse(CX, CY, 150, 150, 0), {
    stroke: SolarSystemModelsColors.deferentColorProperty,
    lineWidth: 4,
  });
  // Epicycle center on the deferent (upper-right).
  const epicX = CX + 106;
  const epicY = CY - 106;
  const epicycle = new Path(Shape.ellipse(epicX, epicY, 48, 48, 0), {
    stroke: SolarSystemModelsColors.epicycleColorProperty,
    lineWidth: 4,
  });
  const arm = new Line(CX, CY, epicX, epicY, {
    stroke: SolarSystemModelsColors.vectorColorProperty,
    lineWidth: 3,
  });
  const planet = new Circle(14, {
    fill: SolarSystemModelsColors.planetColorProperty,
    centerX: epicX + 34,
    centerY: epicY - 34,
  });
  const equant = new Circle(7, {
    fill: SolarSystemModelsColors.equantColorProperty,
    centerX: CX + 36,
    centerY: CY,
  });

  return iconFrom(new Node({ children: [background(), deferent, arm, epicycle, earth, equant, planet] }));
}

export function createConfigurationsIcon(): ScreenIcon {
  const sun = new Circle(36, {
    fill: SolarSystemModelsColors.sunColorProperty,
    centerX: CX - 90,
    centerY: CY,
  });
  const earthOrbit = new Path(Shape.ellipse(CX - 90, CY, 120, 120, 0), {
    stroke: SolarSystemModelsColors.orbitColorProperty,
    lineWidth: 3,
  });
  const earth = new Circle(18, {
    fill: SolarSystemModelsColors.earthColorProperty,
    centerX: CX + 30,
    centerY: CY,
  });
  const planetOrbit = new Path(Shape.ellipse(CX - 90, CY, 200, 200, 0), {
    stroke: SolarSystemModelsColors.orbitColorProperty,
    lineWidth: 2,
    lineDash: [8, 8],
  });
  const planet = new Circle(14, {
    fill: SolarSystemModelsColors.targetPlanetColorProperty,
    centerX: CX + 70,
    centerY: CY - 120,
  });
  const sunEarth = new Line(CX - 90, CY, CX + 30, CY, {
    stroke: SolarSystemModelsColors.vectorColorProperty,
    lineWidth: 3,
  });
  const earthPlanet = new Line(CX + 30, CY, CX + 70, CY - 120, {
    stroke: SolarSystemModelsColors.vectorColorProperty,
    lineWidth: 3,
  });
  const elongation = new Path(new Shape().moveTo(CX + 30, CY).arc(CX + 30, CY, 48, Math.PI, -Math.PI * 0.65, true), {
    stroke: SolarSystemModelsColors.elongationColorProperty,
    lineWidth: 5,
    lineCap: "round",
  });

  return iconFrom(
    new Node({
      children: [background(), earthOrbit, planetOrbit, sunEarth, earthPlanet, elongation, sun, earth, planet],
    }),
  );
}
