import * as THREE from "../../libs/three.module.js";
import Line from "../geometry/line.js";
import { regularPolygonVertices } from "../geometry/shapes.js";

function createPolygon(vertices) {
  let polygon = new THREE.Shape();
  let last_vertex = vertices[vertices.length - 1];
  polygon.moveTo(last_vertex.x, last_vertex.y);

  for (let i = 0; i < vertices.length; i++) {
    polygon.lineTo(vertices[i].x, vertices[i].y);
  }

  return polygon;
}

function createRegularPolygon(n, radius = 1) {
  return createPolygon(regularPolygonVertices(n, radius));
}

function createRoundedPolygon(vertices, corner_distance) {
  let polygon = new THREE.Shape();

  let bv = vertices[vertices.length - 1];
  let v = vertices[0];
  let nv = vertices[1];

  let line1 = new Line(bv, v);
  let line2 = new Line(v, nv);
  let parallel1 = line1.parallelAt(corner_distance, line1.isBelow(nv));
  let parallel2 = line2.parallelAt(corner_distance, line2.isBelow(bv));
  let corner_center = parallel1.interceptionWith(parallel2);
  let end_curve = line2.projection(corner_center);

  polygon.moveTo(end_curve.x, end_curve.y);

  for (let i = 0; i < vertices.length; i++) {
    bv = v;
    v = nv;
    nv = vertices[i + 2 < vertices.length ? i + 2 : i + 2 - vertices.length];

    line1 = line2;
    line2 = new Line(v, nv);
    parallel1 = line1.parallelAt(corner_distance, line1.isBelow(nv));
    parallel2 = line2.parallelAt(corner_distance, line2.isBelow(bv));
    corner_center = parallel1.interceptionWith(parallel2);
    let start_curve = line1.projection(corner_center);
    end_curve = line2.projection(corner_center);

    polygon.lineTo(start_curve.x, start_curve.y);
    polygon.quadraticCurveTo(v.x, v.y, end_curve.x, end_curve.y);
  }

  return polygon;
}

function createObjectFromShape(
  shape,
  material = new THREE.MeshNormalMaterial()
) {
  return new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
}

function createRenderableLine(
  vertices,
  material = new THREE.MeshNormalMaterial()
) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(vertices),
    material
  );
}

export {
  createRoundedPolygon,
  createPolygon,
  createRegularPolygon,
  createObjectFromShape,
  createRenderableLine,
};
