import * as THREE from '../../libs/three.module.js'
import * as CSG from '../../libs/three-bvh-csg.js'
import { Base } from './base.js'

class Rey extends THREE.Object3D {
  constructor(material_set) {
    super();

    this.material_set = material_set

    const evaluator = new CSG.Evaluator();


    this.add(new Base(material_set));

    // ----- Body (Lathe) -----
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.37, 0);                         // equivalente a 1.8 * (0.35 / 2)
    shape.quadraticCurveTo(0.26, 0.28, 0.21, 0.15);
    shape.quadraticCurveTo(0.175, 0.15, 0.12, 0.65);
    shape.quadraticCurveTo(0.175, 0.6, 0.16, 1.4);
    shape.lineTo(0.09, 1.7);

    const latheGeom = new THREE.LatheGeometry(shape.extractPoints(50).shape, 100);
    const body = new THREE.Mesh(latheGeom, material_set.piece_body);
    body.position.y = 0.2;

    this.add(body);

    // ------- HEAD -------
    const headRadius = 0.20; // max ancho de la cabeza
    const headGeometry = new THREE.SphereGeometry(headRadius, 32, 32);
    const headMesh = new THREE.Mesh(headGeometry, material_set.piece_body);
    headMesh.position.y = 1.85; // base(0.25) + cuerpo(1.4) + radio cabeza(0.2)
    this.add(headMesh);

    // ------- CROWN -------
    const coronaRadius = 0.20;
    const coronaTube = 0.04;

    const coronaBaseGeometry = new THREE.TorusGeometry(coronaRadius, coronaTube, 16, 100);
    const coronaBase = new THREE.Mesh(coronaBaseGeometry, goldMaterial);
    coronaBase.rotation.x = Math.PI / 2;
    coronaBase.position.y = 1.85 + 0.15; // encima de la cabeza
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
      spike.position.set(x, 2.0 + spikeHeight / 2, z);
      spike.lookAt(0, 2.0, 0);
      this.add(spike);
      spikes.push(spike);
    }

    // ------- JEWELS -------
    const jewelRadius = 0.015;
    const jewelGeometry = new THREE.SphereGeometry(jewelRadius, 16, 16);


    for (let i = 0; i < spikes.length; i++) {
      const spike = spikes[i];
      const jewel = new THREE.Mesh(jewelGeometry, material_set.cristal);
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
    capaShape.lineTo(0, -1.9); // cape's length


    // Geometry with 180° of revolutión
    const capaGeometry = new THREE.LatheGeometry(
      capaShape.extractPoints(1000).shape,
      100,
      Math.PI / 2, // Starts from behind
      Math.PI      // only takes half about turn
    );


    const capaMesh = new THREE.Mesh(capaGeometry, material_set.cloth);
    capaMesh.position.y = 2.070;

    this.add(capaMesh);


  }


  update() {
    this.position.set(this.guiControls.posX, this.guiControls.posY, this.guiControls.posZ);
    this.rotation.set(this.guiControls.rotX, this.guiControls.rotY, this.guiControls.rotZ);
    this.scale.set(this.guiControls.sizeX, this.guiControls.sizeY, this.guiControls.sizeZ);
  }
}

export { Rey }

