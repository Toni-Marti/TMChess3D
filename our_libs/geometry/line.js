import { areEqual } from "../utility/utils.js";
import Point from "./point.js";

class Line {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    if (p1.equals(p2)) {
      throw new Error("Need two different points to create a line");
    }
  }

  static fromSlopeAndPoint(slope, point) {
    if (Math.abs(slope) === Infinity) {
      return new Line(point, new Point(point.x, point.y + 1));
    }
    const x = point.x + 1;
    const y = slope * (x - point.x) + point.y;
    return new Line(point, new Point(x, y));
  }

  get slope() {
    if (areEqual(this.p1.x, this.p2.x)) {
      return Infinity;
    }
    return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
  }

  get perpendicular_slope() {
    if (areEqual(this.slope, 0)) {
      return Infinity;
    }
    if (this.slope === Infinity) {
      return 0;
    }
    return -1 / this.slope;
  }

  heightAt(x) {
    let slope = this.slope;
    if (slope === Infinity) {
      throw new Error("Line is vertical, cannot calculate height");
    }
    return slope * (x - this.p1.x) + this.p1.y;
  }

  interceptionWith(line) {
    let m1 = this.slope;
    let m2 = line.slope;
    if (areEqual(m1, m2)) {
      throw new Error("Lines are parallel, cannot calculate interception");
    }

    if (m1 === Infinity) {
      return new Point(this.p1.x, line.heightAt(this.p1.x));
    }
    if (m2 === Infinity) {
      return new Point(line.p1.x, this.heightAt(line.p1.x));
    }
    const x =
      (line.p1.y - this.p1.y + m1 * this.p1.x - m2 * line.p1.x) / (m1 - m2);
    return new Point(x, this.heightAt(x));
  }

  perpendicularThrough(point) {
    return Line.fromSlopeAndPoint(this.perpendicular_slope, point);
  }

  parallelThrough(point) {
    return Line.fromSlopeAndPoint(this.slope, point);
  }

  parallelAt(distance, below) {
    /**
     * Creates a new line parallel to this line at a specified distance.
     *
     * @param {number} distance - The perpendicular distance between the lines
     * @param {boolean} below - If true, the new line will be "below" the original line
     *                         For vertical lines, "below" means to the left
     * @returns {Line} A new Line that is parallel to this line
     */
    const slope = this.slope;
    if (areEqual(slope, 0)) {
      return new Line(
        new Point(this.p1.x, this.p1.y + (below ? -distance : distance)),
        new Point(this.p2.x, this.p2.y + (below ? -distance : distance))
      );
    }

    const perp_slope = this.perpendicular_slope;
    let move_above = new Point(
      slope < 0 || slope === Infinity ? 1 : -1,
      Math.abs(perp_slope)
    );
    let translation = move_above.normalized.times(below ? -distance : distance);

    let dx = translation.x;
    let dy = translation.y;

    return new Line(
      new Point(this.p1.x + dx, this.p1.y + dy),
      new Point(this.p2.x + dx, this.p2.y + dy)
    );
  }

  isBelow(point) {
    /**
     * Determines if a point is "below" this line.
     *
     * @param {Point} point - The point to check
     * @returns {boolean} true if the point is below the line, false otherwise
     *
     * For vertical lines (slope = Infinity):
     *   - "below" means the point's x-coordinate is less than the line's x-coordinate
     *   - (point is to the left of the line)
     */

    if (this.slope === Infinity) {
      return point.x < this.p1.x;
    }

    const heigh_at_px = this.heightAt(point.x);
    if (areEqual(heigh_at_px, point.y)) {
      throw new Error("Point is on the line");
    }

    return point.y < heigh_at_px;
  }

  get angle() {
    return Math.atan(this.slope);
  }

  projection(point) {
    return this.perpendicularThrough(point).interceptionWith(this);
  }
}

export default Line;
