import * as THREE from "../../libs/three.module.js";
import * as CSG from "../../libs/three-bvh-csg.js";
import { AbstractPiece } from "./AbstractPiece.js";

class Bishop extends AbstractPiece {
  constructor(material_set, row, col, color) {
    super(material_set, row, col, color, 0.35);

    const evaluator = new CSG.Evaluator();

    // ----- Diagonal cut -----
    var cut = new THREE.BoxGeometry(0.02, 0.7, color, 0.45);
    cut.rotateZ(Math.PI / 4);
    cut.translate(-0.16, 1.6, 0);
    var cutcut = new CSG.Brush(cut, material_set.piece_body);

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.315, 0);
    shape.quadraticCurveTo(0.26, 0.28, 0.21, 0.15);
    shape.quadraticCurveTo(0.175, 0.15, 0.12, 0.65);
    shape.quadraticCurveTo(0.12, 0.7, 0.1, 0.85);
    shape.quadraticCurveTo(0.17, 0.93, 0.14, 1.3);
    shape.lineTo(0, 1.3);

    var latheGeom = new THREE.LatheGeometry(shape.extractPoints(50).shape, 100);
    var body = new CSG.Brush(latheGeom, material_set.piece_body);
    this.add(body);

    var crownBase = new THREE.SphereGeometry(0.17, 32, 64);
    crownBase.translate(0, 1.45, 0);
    var crown = new CSG.Brush(crownBase, material_set.piece_body);

    var crossVert = new THREE.SphereGeometry(0.035, 64, 64);
    crossVert.translate(0, 1.65, 0);
    var top = new CSG.Brush(crossVert, material_set.piece_body);

    var q1 = evaluator.evaluate(body, crown, CSG.ADDITION);
    var q3 = evaluator.evaluate(q1, cutcut, CSG.SUBTRACTION);
    var q4 = evaluator.evaluate(q3, top, CSG.ADDITION);

    this.add(q4);
  }

  update() {}
}

export { Bishop };
