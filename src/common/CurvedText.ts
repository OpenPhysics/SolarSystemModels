import type { ReadOnlyProperty } from "scenerystack/axon";
import type { TPaint } from "scenerystack/scenery";
import { Node, Text } from "scenerystack/scenery";
import type { PhetFont } from "scenerystack/scenery-phet";

/**
 * Places each character of a string along the top arc of a circle centered at
 * (cx, cy) with the given radius. Characters are rotated to be tangent to the
 * circle (reading left-to-right along the top). Port of the Flash CurvedText
 * class used for orbit labels in the Configurations Simulator.
 */
export class CurvedText extends Node {
  private readonly font: PhetFont;
  private readonly fill: TPaint;
  private readonly charWidthEstimate: number;
  private readonly textProperty: ReadOnlyProperty<string>;
  private cx = 0;
  private cy = 0;
  private radius = 30;

  public constructor(textProperty: ReadOnlyProperty<string>, font: PhetFont, fill: TPaint) {
    super();
    this.font = font;
    this.fill = fill;
    this.textProperty = textProperty;

    // Estimate average character width from the font size.
    const sizeMatch = font.toString().match(/(\d+)px/);
    const fontSize = sizeMatch ? Number(sizeMatch[1]) : 10;
    this.charWidthEstimate = fontSize * 0.55;

    this.textProperty.link(() => this.rebuild());
  }

  public setCurve(cx: number, cy: number, radius: number): void {
    this.cx = cx;
    this.cy = cy;
    this.radius = Math.max(radius, 20);
    this.rebuild();
  }

  private rebuild(): void {
    this.removeAllChildren();
    const str = this.textProperty.value;
    if (!str) {
      return;
    }

    const n = str.length;
    const totalArc = Math.min(Math.PI * 0.6, (n * this.charWidthEstimate) / this.radius);
    const anglePerChar = n > 1 ? totalArc / (n - 1) : 0;
    const centerAngle = -Math.PI / 2;
    const r = this.radius + 4;

    for (let i = 0; i < n; i++) {
      const charAngle = centerAngle + (i - (n - 1) / 2) * anglePerChar;
      const x = this.cx + r * Math.cos(charAngle);
      const y = this.cy + r * Math.sin(charAngle);
      const rotation = charAngle + Math.PI / 2;

      const charText = new Text(str[i] ?? "", {
        font: this.font,
        fill: this.fill,
      });
      charText.centerX = x;
      charText.centerY = y;
      charText.rotation = rotation;
      this.addChild(charText);
    }
  }
}
