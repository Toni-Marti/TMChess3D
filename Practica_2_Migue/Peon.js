import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Peon extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();

    // Se crea la parte de la interfaz que corresponde a la caja
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    // Material básico

const loader = new THREE.TextureLoader();
const texture = loader.load('Materiales/metallic-background-with-grunge-scratched-effect.jpg'); // puede ser JPG o PNG

 var material= new THREE.MeshNormalMaterial({ flatShading: false }) ;

const evaluator = new CSG.Evaluator();

    const baseRadius = 0.3;
    const baseHeight = 0.15;
 
    var baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
    var base = new CSG.Brush(baseGeom, material);
    base.position.y = baseHeight / 2;

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.29, 0);
    shape.quadraticCurveTo(0.26, 0.28, 0.21, 0.15);

    var latheGeom = new THREE.LatheGeometry(shape.extractPoints(50).shape, 100);
    var body = new CSG.Brush(latheGeom, material);
    body.position.y = baseHeight;

  var cuerpoCompleto = evaluator.evaluate(body, base, CSG.ADDITION);
    this.add(cuerpoCompleto);

    var brazo1Geom = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16);
    var brazo3Geom = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    var brazo1 = new CSG.Brush(brazo1Geom, material);
     brazo1.rotation.x = -Math.PI / 4;
    brazo1.position.set(-0.1, 0.3, -0.1);



    var brazo2 = new CSG.Brush(brazo1Geom, material);
    brazo2.rotation.x = -Math.PI / 4;
    brazo2.position.set(0.1, 0.3, -0.1);


    var brazo3 = new CSG.Brush(brazo3Geom, material);
     brazo3.rotation.z = Math.PI/2;
    brazo3.position.set(0, 0.55, -0.35);


    var brazo4 = new CSG.Brush(brazo1Geom, material);
    brazo4.rotation.x = Math.PI / 4;
    brazo4.position.set(0.1, 0.8, -0.1);


    var brazo5 = new CSG.Brush(brazo1Geom, material);
     brazo5.rotation.x = Math.PI/4;
     brazo5.position.set(-0.1, 0.8, -0.1);


    var brazo6 = new CSG.Brush(brazo3Geom, material);
     brazo6.rotation.z = Math.PI/2;
    brazo6.position.set(0, 1.05, 0.17);



    var boxGeom = new THREE.CylinderGeometry(0.1, 0.2, 0.1, 4);
    boxGeom.rotateY(Math.PI / 4);
    boxGeom.translate(0, 1.15, 0.4); // Altura centrada dentro del casco
    var cilExtBrush = new CSG.Brush(boxGeom, material);

//  Casco (LatheGeometry deformada con estrías)
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

    helmetGeometry.translate(0, 1.05, 0.2); // Casco encima del cuerpo

    const helmet = new CSG.Brush(helmetGeometry, material);

    // ✂️ CSG sustracción en casco
    var evaluador = new CSG.Evaluator();
    var cascoConHueco = evaluador.evaluate(helmet, cilExtBrush, CSG.SUBTRACTION);




    this.add(brazo1);
    this.add(base);
    this.add(brazo2);
     this.add(brazo3);
     this.add(brazo4);
     this.add(brazo5);
      this.add(brazo6);
      this.add(cascoConHueco);


}

  createGUI (gui,titleGui) {
    // Controles para el tamaño, la orientación y la posición de la caja
    this.guiControls = {
      sizeX : 1.0,
      sizeY : 1.0,
      sizeZ : 1.0,

      rotX : 0.0,
      rotY : 0.0,
      rotZ : 0.0,

      posX : 0.0,
      posY : 0.0,
      posZ : 0.0,

      // Un botón para dejarlo todo en su posición inicial
      // Cuando se pulse se ejecutará esta función.
      reset : () => {
        this.guiControls.sizeX = 1.0;
        this.guiControls.sizeY = 1.0;
        this.guiControls.sizeZ = 1.0;

        this.guiControls.rotX = 0.0;
        this.guiControls.rotY = 0.0;
        this.guiControls.rotZ = 0.0;

        this.guiControls.posX = 0.0;
        this.guiControls.posY = 0.0;
        this.guiControls.posZ = 0.0;
      }
    }

    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder (titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    // El método   listen()   permite que si se cambia el valor de la variable en código, el deslizador de la interfaz se actualice
    folder.add (this.guiControls, 'sizeX', 0.1, 5.0, 0.01).name ('Tamaño X : ').listen();
    folder.add (this.guiControls, 'sizeY', 0.1, 5.0, 0.01).name ('Tamaño Y : ').listen();
    folder.add (this.guiControls, 'sizeZ', 0.1, 5.0, 0.01).name ('Tamaño Z : ').listen();

    folder.add (this.guiControls, 'rotX', 0.0, Math.PI/2, 0.01).name ('Rotación X : ').listen();
    folder.add (this.guiControls, 'rotY', 0.0, Math.PI/2, 0.01).name ('Rotación Y : ').listen();
    folder.add (this.guiControls, 'rotZ', 0.0, Math.PI/2, 0.01).name ('Rotación Z : ').listen();

    folder.add (this.guiControls, 'posX', -20.0, 20.0, 0.01).name ('Posición X : ').listen();
    folder.add (this.guiControls, 'posY', 0.0, 10.0, 0.01).name ('Posición Y : ').listen();
    folder.add (this.guiControls, 'posZ', -20.0, 20.0, 0.01).name ('Posición Z : ').listen();

    folder.add (this.guiControls, 'reset').name ('[ Reset ]');
  }

  update () {
    // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
    // Primero, el escalado
    // Segundo, la rotación en Z
    // Después, la rotación en Y
    // Luego, la rotación en X
    // Y por último la traslación

    this.position.set (this.guiControls.posX,this.guiControls.posY,this.guiControls.posZ);
    this.rotation.set (this.guiControls.rotX,this.guiControls.rotY,this.guiControls.rotZ);
    this.scale.set (this.guiControls.sizeX,this.guiControls.sizeY,this.guiControls.sizeZ);
  }
}

export { Peon };



