import Point from "../geometry/point.js";

function regularPolygonVertices(n, radius = 1) {
  let angle_step = (2 * Math.PI) / n;
  let curr_angle = -Math.PI / 2 + angle_step / 2;
  let vertices = [];
  for (let i = 0; i < n; i++) {
    vertices.push(
      new Point(Math.cos(curr_angle), Math.sin(curr_angle)).times(radius)
    );
    curr_angle += angle_step;
  }
  return vertices;
}

function arc(start_angle, end_angle, radius, steps) {
  let step = (end_angle - start_angle) / (steps - 1);
  let vertices = [];
  for (let i = 0; i < steps; i++) {
    vertices.push(
      new Point(
        Math.cos(start_angle + step * i),
        Math.sin(start_angle + step * i)
      ).times(radius)
    );
  }
  return vertices;
}

export { regularPolygonVertices, arc };
