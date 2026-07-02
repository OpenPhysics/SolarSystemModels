import type { TReadOnlyProperty } from "scenerystack/axon";
import { Multilink } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { optionize } from "scenerystack/phet-core";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import type { NodeOptions, TPaint } from "scenerystack/scenery";
import { Circle, Node } from "scenerystack/scenery";

type CelestialBodyNodeSelfOptions = {
  radius?: number;
  fill: TPaint; // no default — every use draws a different body, so callers must specify a color
};

export type CelestialBodyNodeOptions = CelestialBodyNodeSelfOptions & NodeOptions;

/**
 * A Circle, auto-positioned via a model Vector2 Property and a reactive
 * ModelViewTransform2 Property (so it redraws correctly if the transform's
 * scale changes, not just when the model position changes). Used for Earth,
 * Sun, planets, and markers.
 */
export class CelestialBodyNode extends Node {
  public constructor(
    positionProperty: TReadOnlyProperty<Vector2>,
    mvtProperty: TReadOnlyProperty<ModelViewTransform2>,
    providedOptions: CelestialBodyNodeOptions,
  ) {
    const options = optionize<CelestialBodyNodeOptions, CelestialBodyNodeSelfOptions, NodeOptions>()(
      { radius: 8, cursor: "default" },
      providedOptions,
    );
    const { radius, fill, ...nodeOptions } = options;

    const body = new Circle(radius, { fill });

    super({ ...nodeOptions, children: [body] });

    Multilink.multilink([positionProperty, mvtProperty], (pos, mvt) => {
      this.translation = mvt.modelToViewPosition(pos);
    });
  }
}
