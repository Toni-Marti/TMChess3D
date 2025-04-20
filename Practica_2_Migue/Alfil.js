import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Alfil extends THREE.Object3D {
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

const baseRadius = 0.35; // proporcional al 0.8
  const baseHeight = 0.25;

  const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
  const base = new CSG.Brush(baseGeom, material);
  base.position.y = baseHeight / 2;

// ----- Corte diagonal -----
var cut = new THREE.BoxGeometry(0.02, 0.7, 0.45); // proporciones pequeñas
cut.rotateZ(Math.PI / 4);
cut.translate(-0.16, 1.6, 0); // reposicionado a escala real
var cutcut = new CSG.Brush(cut, material);

// ----- Perfil para el cuerpo principal -----
var shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(0.315, 0);                         // equivalente a 1.8 * (0.35 / 2)
shape.quadraticCurveTo(0.26, 0.28, 0.21, 0.15);
shape.quadraticCurveTo(0.175, 0.15, 0.12, 0.65);
shape.quadraticCurveTo(0.12, 0.7, 0.1, 0.85);
shape.quadraticCurveTo(0.17, 0.93, 0.14, 1.3);
shape.lineTo(0, 1.3);

var latheGeom = new THREE.LatheGeometry(shape.extractPoints(50).shape, 100);
var body = new CSG.Brush(latheGeom, material);


var crownBase = new THREE.SphereGeometry(0.17, 32, 64); // más pequeña
crownBase.translate(0, 1.45, 0); // un poco por encima del cuerpo
var crown = new CSG.Brush(crownBase, material);


var crossVert = new THREE.SphereGeometry(0.035, 64, 64);
crossVert.translate(0, 1.65, 0); // justo arriba de la corona
var top = new CSG.Brush(crossVert, material);

// ----- Operaciones CSG -----
var q1 = evaluator.evaluate(body, base, CSG.ADDITION);
var q2 = evaluator.evaluate(q1, crown, CSG.ADDITION);
var q3 = evaluator.evaluate(q2, cutcut, CSG.SUBTRACTION);
var q4 = evaluator.evaluate(q3, top, CSG.ADDITION);

// Añadir resultado a escena
this.add(q4);


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

export { Alfil };



