import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import type { NodeOptions, TPaint } from "scenerystack/scenery";
import { Circle, Node } from "scenerystack/scenery";

export type CelestialBodyNodeOptions = {
  radius?: number;
  fill?: TPaint;
} & NodeOptions;

/**
 * A Circle, auto-positioned via a model Vector2 Property and a
 * ModelViewTransform2. Used for Earth, Sun, planets, and markers.
 */
export class CelestialBodyNode extends Node {
  public constructor(
    positionProperty: TReadOnlyProperty<Vector2>,
    mvt: ModelViewTransform2,
    providedOptions?: CelestialBodyNodeOptions,
  ) {
    const radius = providedOptions?.radius ?? 8;
    const fill = providedOptions?.fill ?? "#ffffff";

    // Extract CelestialBodyNode-specific keys, pass remaining to super
    const { radius: _r, fill: _f, ...nodeOptions } = providedOptions ?? {};

    const body = new Circle(radius, { fill });

    super({ children: [body], cursor: "default", ...nodeOptions });

    positionProperty.link((pos) => {
      const viewPos = mvt.modelToViewPosition(pos);
      this.translation = viewPos;
    });
  }
}
