import * as THREE from "../../libs/three.module.js";
import * as CSG from "../../libs/three-bvh-csg.js";
import { AbstractPiece } from "./AbstractPiece.js";

class King extends AbstractPiece {
  constructor(material_set, row, col) {
    super(material_set, row, col, 0.4);

    const evaluator = new CSG.Evaluator();

    // ----- Body (Lathe) -----
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
    shape.lineTo(0.4, 1.65);
    shape.quadraticCurveTo(0.4, 1.7, 0, 1.8);

    const latheGeom = new THREE.LatheGeometry(
      shape.extractPoints(50).shape,
      100
    );
    const body = new THREE.Mesh(latheGeom, material_set.piece_body);

    this.add(body);

    // ------- CROWN -------
    const coronaRadius = 0.2;
    const coronaTube = 0.04;

    const coronaBaseGeometry = new THREE.TorusGeometry(
      coronaRadius,
      coronaTube,
      16,
      100
    );
    const coronaBase = new THREE.Mesh(
      coronaBaseGeometry,
      this.material_set.metal
    );
    coronaBase.rotation.x = Math.PI / 2;
    coronaBase.position.y = 1.8; // encima de la cabeza
    this.add(coronaBase);

    // ------- SPIKES -------
    const spikeRadius = 0.03;
    const spikeHeight = 0.18;
    const spikeGeometry = new THREE.ConeGeometry(spikeRadius, spikeHeight, 8);
    const numSpikes = 8;
    const spikes = [];

    for (let i = 0; i < numSpikes; i++) {
      const angle = (i / numSpikes) * Math.PI * 2;
      const x = coronaRadius * Math.cos(angle);
      const z = coronaRadius * Math.sin(angle);

      const spike = new THREE.Mesh(spikeGeometry, material_set.metal);
      spike.position.set(x, 1.84 + spikeHeight / 2, z);
      spike.lookAt(0, 2.0, 0);
      this.add(spike);
      spikes.push(spike);
    }

    // ------- JEWELS -------
    const jewelRadius = 0.015;
    const jewelGeometry = new THREE.SphereGeometry(jewelRadius, 16, 16);

    for (let i = 0; i < spikes.length; i++) {
      const spike = spikes[i];
      const jewel = new THREE.Mesh(jewelGeometry, material_set.crystal);
      jewel.position.copy(spike.position);
      jewel.position.y += 0.03;
      this.add(jewel);
    }

    //------- Cape from neck to down  -------
    const capaShape = new THREE.Shape();
    capaShape.moveTo(0, 0);
    capaShape.quadraticCurveTo(0.05, -0.2, 0.2, -0.4);
    capaShape.quadraticCurveTo(0.2, -0.8, 0.35, -1.4);
    capaShape.quadraticCurveTo(0.37, -1.5, 0.4, -1.55);

    // Geometry with 180° of revolutión
    const capaGeometry = new THREE.LatheGeometry(
      capaShape.extractPoints(1000).shape,
      100,
      Math.PI / 2, // Starts from behind
      Math.PI // only takes half about turn
    );

    const capaMesh = new THREE.Mesh(capaGeometry, material_set.cloth);
    capaMesh.position.y = 1.6;

    this.add(capaMesh);
  }

  update() {}
}

export { King };
