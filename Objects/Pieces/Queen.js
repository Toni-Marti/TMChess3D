import * as THREE from "../../libs/three.module.js";
import { AbstractPiece } from "./AbstractPiece.js";

class Queen extends AbstractPiece {
  static height_piece = 1.79;
  constructor(material_set, row, col, color) {
    super(material_set, row, col, color, 2, 0.39);
    var loader = new THREE.TextureLoader();

    const shape = new THREE.Shape();
    shape.moveTo(0.35, 0.25);
    shape.lineTo(0.3, 0.25);
    shape.quadraticCurveTo(0.4, 0.3, 0.3, 0.4);
    shape.lineTo(0.2, 0.6);
    shape.quadraticCurveTo(0, 1, 0.2, 1.2);
    shape.quadraticCurveTo(0.36, 1.25, 0.4, 1.3);
    shape.quadraticCurveTo(0.4, 1.3, 0.36, 1.35);
    shape.quadraticCurveTo(0.3, 1.35, 0.35, 1.4);
    shape.lineTo(0.2, 1.45);
    shape.lineTo(0.4, 1.45);
    shape.lineTo(0.2, 1.55);
    shape.quadraticCurveTo(0.2, 1.55, 0.3, 1.7);
    shape.quadraticCurveTo(0.3, 1.7, 0, 1.75);

    const latheGeom = new THREE.LatheGeometry(
      shape.extractPoints(12).shape,
      24
    );
    const body = new THREE.Mesh(latheGeom, material_set.piece_body);

    this.add(body);

    // ------- CROWN -------
    const coronaRadius = 0.2;
    const coronaTube = 0.04;

    const coronaBaseGeometry = new THREE.TorusGeometry(
      coronaRadius,
      coronaTube,
      8,
      24
    );
    const coronaBase = new THREE.Mesh(coronaBaseGeometry, material_set.metal);
    coronaBase.rotation.x = Math.PI / 2;
    coronaBase.position.y = 1.75;
    this.add(coronaBase);

    // ------- DRESS -------
    const capaShape = new THREE.Shape();
    capaShape.moveTo(0, 0);
    capaShape.quadraticCurveTo(0.05, -0.2, 0.1, -0.4);
    capaShape.quadraticCurveTo(0.2, -0.8, 0.35, -1.4);
    capaShape.quadraticCurveTo(0.37, -1.5, 0.4, -1.55);

    const capaPoints = capaShape.extractPoints(50).shape;
    const capaGeometry = new THREE.LatheGeometry(capaPoints, 100);

    const capaMesh = new THREE.Mesh(capaGeometry, material_set.cloth);
    capaMesh.position.y = 1.6;
    this.add(capaMesh);
  }

  update() {}
}

export { Queen };
