import { areEqual } from "../utility/utils.js";

class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  equals(point) {
    return areEqual(this.x, point.x) && areEqual(this.y, point.y);
  }

  add(point) {
    return new Point(this.x + point.x, this.y + point.y);
  }

  sub(point) {
    return new Point(this.x - point.x, this.y - point.y);
  }

  times(n) {
    return new Point(this.x * n, this.y * n);
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  rotate(angle, center = new Point(0, 0)) {
    if (!center.equals(new Point(0, 0))) {
      this.x -= center.x;
      this.y -= center.y;
      this.rotate(angle);
      this.x += center.x;
      this.y += center.y;
    }

    let curr_angle = Math.atan2(this.y, this.x);
    let length = this.magnitude();
    let final_angle = curr_angle + angle;
    this.x = Math.cos(final_angle) * length;
    this.y = Math.sin(final_angle) * length;

    return this;
  }

  get normalized() {
    const length = Math.sqrt(this.x ** 2 + this.y ** 2);
    if (areEqual(length, 0)) {
      throw new Error("Cannot normalize a zero vector");
    }
    return new Point(this.x / length, this.y / length);
  }
}

export default Point;
