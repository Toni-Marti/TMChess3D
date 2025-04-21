import * as THREE from '../../libs/three.module.js'
import * as CSG from '../../libs/three-bvh-csg.js'
import { Base } from './base.js'

class Peon extends THREE.Object3D {
  constructor(material_set) {
    super();



    this.add(new Base(material_set, 0.3));



    var brazo1Geom = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16);
    var brazo3Geom = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    var brazo1 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo1.rotation.x = -Math.PI / 4;
    brazo1.position.set(-0.1, 0.3, -0.1);



    var brazo2 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo2.rotation.x = -Math.PI / 4;
    brazo2.position.set(0.1, 0.3, -0.1);


    var brazo3 = new CSG.Brush(brazo3Geom, material_set.piece_body);
    brazo3.rotation.z = Math.PI / 2;
    brazo3.position.set(0, 0.55, -0.35);


    var brazo4 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo4.rotation.x = Math.PI / 4;
    brazo4.position.set(0.1, 0.8, -0.1);


    var brazo5 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo5.rotation.x = Math.PI / 4;
    brazo5.position.set(-0.1, 0.8, -0.1);


    var brazo6 = new CSG.Brush(brazo3Geom, material_set.piece_body);
    brazo6.rotation.z = Math.PI / 2;
    brazo6.position.set(0, 1.05, 0.17);



    var boxGeom = new THREE.CylinderGeometry(0.1, 0.2, 0.1, 4);
    boxGeom.rotateY(Math.PI / 4);
    boxGeom.translate(0, 1.15, 0.4); 
    var cilExtBrush = new CSG.Brush(boxGeom, material_set.piece_body);

    //  Helmet (LatheGeometry deformed with stretch marks)
    var shape = new THREE.Shape();
    shape.moveTo(-0.25, 0);
    shape.quadraticCurveTo(-0.3, 0.15, 0, 0.3);
    shape.quadraticCurveTo(0.3, 0.15, 0.25, 0);
    shape.closePath();

    const v2 = shape.extractPoints(36).shape;
    var helmetGeometry = new THREE.LatheGeometry(v2, 50);
    var position = helmetGeometry.attributes.position;
    const vertex = new THREE.Vector3();
    const frequency = 10;
    const amplitude = 0.1;

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      let angle = Math.atan2(vertex.z, vertex.x);
      let offset = Math.sin(angle * frequency) * amplitude;
      vertex.x += vertex.x * offset;
      vertex.z += vertex.z * offset;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    helmetGeometry.translate(0, 1.05, 0.2);

    const helmet = new CSG.Brush(helmetGeometry, material_set.piece_body);

   
    var evaluador = new CSG.Evaluator();
    var cascoConHueco = evaluador.evaluate(helmet, cilExtBrush, CSG.SUBTRACTION);




    this.add(brazo1);
    this.add(brazo2);
    this.add(brazo3);
    this.add(brazo4);
    this.add(brazo5);
    this.add(brazo6);
    this.add(cascoConHueco);


  }
  
  update() {
   
    this.position.set(this.guiControls.posX, this.guiControls.posY, this.guiControls.posZ);
    this.rotation.set(this.guiControls.rotX, this.guiControls.rotY, this.guiControls.rotZ);
    this.scale.set(this.guiControls.sizeX, this.guiControls.sizeY, this.guiControls.sizeZ);
  }
}

export { Peon };



