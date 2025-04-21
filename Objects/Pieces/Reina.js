import * as THREE from '../../libs/three.module.js'
import * as CSG from '../../libs/three-bvh-csg.js'
import { Base } from './base.js'

class Reina extends THREE.Object3D {
  constructor(material_set) {
    super();


    var loader = new THREE.TextureLoader();


    this.add(new Base(material_set, 0.39));

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.37, 0);
    shape.quadraticCurveTo(0.175, 0.6, 0.16, 1.4);
    shape.lineTo(0.07, 1.7);

    const latheGeom = new THREE.LatheGeometry(shape.extractPoints(50).shape, 100);
    const body = new THREE.Mesh(latheGeom, material_set.piece_body);
    body.position.y = 0.25;
    this.add(body);



    // ------- HEAD -------
    const headRadius = 0.20;
    const headGeometry = new THREE.SphereGeometry(headRadius, 32, 32);
    const headMesh = new THREE.Mesh(headGeometry, material_set.piece_body);
    headMesh.position.y = 1.85;
    this.add(headMesh);

    // ------- CROWN -------
    const coronaRadius = 0.20;
    const coronaTube = 0.04;

    const coronaBaseGeometry = new THREE.TorusGeometry(coronaRadius, coronaTube, 16, 100);
    const coronaBase = new THREE.Mesh(coronaBaseGeometry, material_set.metal);
    coronaBase.rotation.x = Math.PI / 2;
    coronaBase.position.y = 1.85 + 0.15;
    this.add(coronaBase);



    // ------- DRESS -------
    const capaShape = new THREE.Shape();
    capaShape.moveTo(0, 0);
    capaShape.quadraticCurveTo(0.05, -0.2, 0.1, -0.4);
    capaShape.quadraticCurveTo(0.2, -0.8, 0.35, -1.4);
    capaShape.quadraticCurveTo(0.37, -1.5, 0.4, -1.55);
    capaShape.lineTo(0, -1.55);

    const capaPoints = capaShape.extractPoints(50).shape;
    const capaGeometry = new THREE.LatheGeometry(capaPoints, 100);


    const capaMesh = new THREE.Mesh(capaGeometry, material_set.cloth);
    capaMesh.position.y = 1.85;
    this.add(capaMesh);


  }


  update() {

    this.position.set(this.guiControls.posX, this.guiControls.posY, this.guiControls.posZ);
    this.rotation.set(this.guiControls.rotX, this.guiControls.rotY, this.guiControls.rotZ);
    this.scale.set(this.guiControls.sizeX, this.guiControls.sizeY, this.guiControls.sizeZ);
  }
}

export { Reina }

