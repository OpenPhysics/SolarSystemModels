import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import type { NodeOptions, TPaint } from "scenerystack/scenery";
import { Circle, Node, Text } from "scenerystack/scenery";

export type CelestialBodyNodeOptions = {
  radius?: number;
  fill?: TPaint;
  label?: string;
} & NodeOptions;

/**
 * A Circle + optional label Text, auto-positioned via a model Vector2 Property
 * and a ModelViewTransform2. Used for Earth, Sun, planets, and markers.
 */
export class CelestialBodyNode extends Node {
  public constructor(
    positionProperty: TReadOnlyProperty<Vector2>,
    mvt: ModelViewTransform2,
    providedOptions?: CelestialBodyNodeOptions,
  ) {
    const radius = providedOptions?.radius ?? 8;
    const fill = providedOptions?.fill ?? "#ffffff";
    const label = providedOptions?.label;

    // Extract CelestialBodyNode-specific keys, pass remaining to super
    const { radius: _r, fill: _f, label: _l, ...nodeOptions } = providedOptions ?? {};

    const body = new Circle(radius, { fill });
    const children: Node[] = [body];

    if (label !== undefined) {
      children.push(
        new Text(label, {
          font: "12px sans-serif",
          fill: "#ffffff",
          centerX: 0,
          top: radius + 3,
        }),
      );
    }

    super({ children, cursor: "default", ...nodeOptions });

    positionProperty.link((pos) => {
      const viewPos = mvt.modelToViewPosition(pos);
      this.translation = viewPos;
    });
  }
}
