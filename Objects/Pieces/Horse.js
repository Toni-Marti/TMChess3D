import * as THREE from "../../libs/three.module.js";
import * as CSG from "../../libs/three-bvh-csg.js";
import Line from "../../our_libs/geometry/line.js";
import Point from "../../our_libs/geometry/point.js";
import * as THREE_SHAPES from "../../our_libs/three_helpers/shapes.js";
import { areEqual } from "../../our_libs/utility/utils.js";

class Horse extends THREE.Object3D {
  constructor() {
    super();
    this.material = new THREE.MeshNormalMaterial();
    this.horse = this.createHorse();
    this.add(this.horse);
  }

  createHorseShape() {
    let shape = new THREE.Shape();

    let first_point = new Point(0, 0.45);

    let aux_line1 = new Line(first_point, new Point(0.75, 1.4));
    let aux_line2 = new Line(new Point(0.85, 2.45), new Point(0.6, 4.2));
    let intersection = aux_line1.interceptionWith(aux_line2);
    // 1
    shape.moveTo(aux_line1.p1.x, aux_line1.p1.y);
    // 2
    shape.lineTo(aux_line1.p2.x, aux_line1.p2.y);
    // 3
    shape.quadraticCurveTo(
      intersection.x,
      intersection.y,
      aux_line2.p1.x,
      aux_line2.p1.y
    );
    // 4
    shape.lineTo(aux_line2.p2.x, aux_line2.p2.y);

    aux_line1 = aux_line2;
    aux_line2 = new Line(new Point(0.8, 6.7), new Point(1.2, 7.95));
    intersection = aux_line1.interceptionWith(aux_line2);
    // 5
    shape.quadraticCurveTo(
      intersection.x,
      intersection.y,
      aux_line2.p1.x,
      aux_line2.p1.y
    );
    // 6
    shape.lineTo(aux_line2.p2.x, aux_line2.p2.y);
    // 7
    shape.lineTo(1.1, 8.9);
    // 8
    shape.lineTo(2.35, 7.95);
    // 9
    // shape.quadraticCurveTo(3.35, 7.5, 4.3, 7.65);
    shape.lineTo(4.3, 7.65);
    // 10
    shape.quadraticCurveTo(5.4, 6, 7.2, 5.4);
    // 11
    shape.quadraticCurveTo(7.4, 4.6, 6.95, 3.95);
    // 12
    shape.lineTo(6.2, 4.3);
    // 13
    shape.lineTo(6.2, 3.7);
    // 14
    shape.lineTo(4.8, 4.7);

    aux_line1 = new Line(new Point(3.55, 5.15), new Point(2.85, 5.2));
    // 15
    shape.lineTo(aux_line1.p1.x, aux_line1.p1.y);
    // 16
    shape.lineTo(aux_line1.p2.x, aux_line1.p2.y);

    aux_line2 = new Line(new Point(2.1, 0), new Point(2.1, 1));
    intersection = aux_line1.interceptionWith(aux_line2);
    // 17
    shape.bezierCurveTo(intersection.x, intersection.y, 4.8, 3.05, 4.8, 0.6);

    // Close
    shape.quadraticCurveTo(2.1, 0, first_point.x, first_point.y);

    return shape;
  }

  createManeShape(roundness) {
    let mane_vertices = [
      // 1
      new Point(0.7, 0.7),
      // 2
      new Point(-0.85, 1.7),
      // 3
      new Point(-0.05, 2.5),
      // 4
      new Point(-0.7, 3.55),
      // 5
      new Point(0, 4.35),
      // 6
      new Point(-0.55, 5.55),
      // 7
      new Point(0.3, 6.15),
      // 8
      new Point(0, 7.25),
      // 9
      new Point(1.6, 7.4),
      // 10
      new Point(2, 2),
    ];
    if (areEqual(roundness, 0)) {
      return THREE_SHAPES.createPolygon(mane_vertices);
    } else {
      return THREE_SHAPES.createRoundedPolygon(mane_vertices, roundness);
    }
  }

  createJunction() {
    let junction = new THREE.CylinderGeometry(1, 1.75, 1, 4);
    junction.rotateY(Math.PI / 4);
    let material = this.material.clone();
    material.flatShading = true;
    material.needsUpdate = true;
    return new THREE.Mesh(junction, material);
  }

  createHorse() {
    let width = 3.5;
    let object = new THREE.Object3D();
    let shape = this.createHorseShape();
    let horse_shape_geometry = new THREE.ExtrudeGeometry(shape, {
      curveSegments: 12,
      steps: 1,
      depth: width,
      bevelEnabled: false,
    });

    let r = 11;
    let cylinder_geometry1 = new THREE.CylinderGeometry(r, r, 10, 64);
    cylinder_geometry1.rotateZ(Math.PI / 2);
    cylinder_geometry1.translate(5, 4.5, -r + 1);
    let cylinder_geometry2 = new THREE.CylinderGeometry(r, r, 10, 64);
    cylinder_geometry2.rotateZ(Math.PI / 2);
    cylinder_geometry2.translate(5, 4.5, r + width - 1);

    let horse_shape_brush = new CSG.Brush(horse_shape_geometry, this.material);
    let subtraction_brush1 = new CSG.Brush(cylinder_geometry1, this.material);
    let subtraction_brush2 = new CSG.Brush(cylinder_geometry2, this.material);
    let evaluator = new CSG.Evaluator();

    let result = evaluator.evaluate(
      horse_shape_brush,
      subtraction_brush1,
      CSG.SUBTRACTION
    );
    result = evaluator.evaluate(result, subtraction_brush2, CSG.SUBTRACTION);

    let ears_hole_vs = [
      new Point(-0.185, 1.2),
      new Point(width + 0.185, 1.2),
      new Point(width - 1, 0),
      new Point(1, 0),
    ];
    let ears_hole_shape = THREE_SHAPES.createPolygon(ears_hole_vs);
    let ears_hole_geometry = new THREE.ExtrudeGeometry(ears_hole_shape, {
      curveSegments: 4,
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    });
    ears_hole_geometry.rotateY(Math.PI / 2);
    ears_hole_geometry.translate(1, 7.95, width);
    let ears_hole_brush = new CSG.Brush(ears_hole_geometry, this.material);

    result = evaluator.evaluate(result, ears_hole_brush, CSG.SUBTRACTION);

    object.add(result);

    let mane_roundness = 0.2;
    let mane_shape = this.createManeShape(mane_roundness);
    let mane_width = 0.75;
    let mane_geometry = new THREE.ExtrudeGeometry(mane_shape, {
      curveSegments: 20,
      steps: 1,
      depth: mane_width,
      bevelEnabled: false,
    });
    let mane_intersect_vertices = [
      new Point(0, 0),
      new Point(mane_width, 0),
      new Point(mane_width / 2, 4),
    ];
    let mane_intersect_shape = areEqual(mane_roundness, 0)
      ? THREE_SHAPES.createPolygon(mane_intersect_vertices)
      : THREE_SHAPES.createRoundedPolygon(
          mane_intersect_vertices,
          mane_roundness
        );
    let mane_intersect_geometry = new THREE.ExtrudeGeometry(
      mane_intersect_shape,
      {
        curveSegments: 20,
        steps: 1,
        depth: 15,
        bevelEnabled: false,
      }
    );
    mane_intersect_geometry.rotateY(Math.PI / 2);
    mane_intersect_geometry.rotateZ(Math.PI / 2);
    mane_intersect_geometry.translate(2, 0, mane_width);
    mane_intersect_geometry.rotateZ(-Math.PI / 50);

    let mane_brush = new CSG.Brush(mane_geometry, this.material);
    let mane_intersect_brush = new CSG.Brush(
      mane_intersect_geometry,
      this.material
    );
    let mane_result = evaluator.evaluate(
      mane_brush,
      mane_intersect_brush,
      CSG.INTERSECTION
    );

    mane_result.position.z = width / 2 - mane_width / 2;

    object.add(mane_result);

    let junction = this.createJunction();
    junction.position.z = width / 2;
    junction.position.x = 2.5;
    object.add(junction);

    let base = new THREE.CylinderGeometry(3, 3, 2);
    base.translate(2.5, -1.5, width / 2);
    object.add(new THREE.Mesh(base, this.material));

    return object;
  }
}

export { Horse };
