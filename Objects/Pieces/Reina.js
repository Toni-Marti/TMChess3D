import * as THREE from '../../libs/three.module.js'
import * as CSG from '../../libs/three-bvh-csg.js'

class Reina extends THREE.Object3D {
  constructor(gui,titleGui) {
       super();
    this.createGUI(gui, titleGui);


    var loader = new THREE.TextureLoader();

  var material= new THREE.MeshNormalMaterial({ flatShading: false }) ;

const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1, roughness: 0.4 });
const evaluator = new CSG.Evaluator();


  // ----- BASE -----
  const baseRadius = 0.38;
  const baseHeight = 0.25;

  const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
  const base = new CSG.Brush(baseGeom, material);
  base.position.y = baseHeight / 2;

    const shape = new THREE.Shape();
 shape.moveTo(0, 0);
shape.lineTo(0.37, 0);                         // equivalente a 1.8 * (0.35 / 2)
shape.quadraticCurveTo(0.26, 0.28, 0.21, 0.15);
shape.quadraticCurveTo(0.175, 0.15, 0.12, 0.65);
  shape.quadraticCurveTo(0.175, 0.6, 0.16, 1.4);
  shape.lineTo(0.09,1.7);

  const latheGeom = new THREE.LatheGeometry(shape.extractPoints(50).shape, 100);
  const body = new CSG.Brush(latheGeom, material);
  body.position.y = baseHeight;

  const cuerpoCompleto = evaluator.evaluate(body, base, CSG.ADDITION);
  this.add(cuerpoCompleto);

  // ------- HEAD -------
  const headRadius = 0.20; // max ancho de la cabeza
  const headGeometry = new THREE.SphereGeometry(headRadius, 32, 32);
  const headMesh = new THREE.Mesh(headGeometry, material);
  headMesh.position.y = 1.85; // base(0.25) + cuerpo(1.4) + radio cabeza(0.2)
  this.add(headMesh);

  // ------- CORONA -------
  const coronaRadius = 0.20;
  const coronaTube = 0.04;

  const coronaBaseGeometry = new THREE.TorusGeometry(coronaRadius, coronaTube, 16, 100);
  const coronaBase = new THREE.Mesh(coronaBaseGeometry, goldMaterial);
  coronaBase.rotation.x = Math.PI / 2;
  coronaBase.position.y = 1.85 + 0.15; // encima de la cabeza
  this.add(coronaBase);



// ------- CAPA -------
 const capaShape = new THREE.Shape();
 capaShape.moveTo(0, 0);
 capaShape.quadraticCurveTo(0.05, -0.2, 0.1, -0.4);
 capaShape.quadraticCurveTo(0.2, -0.8, 0.35, -1.4);
 capaShape.quadraticCurveTo(0.37, -1.5, 0.4, -1.55);
capaShape.lineTo(0, -1.55);

 const capaPoints = capaShape.extractPoints(50).shape;
 const capaGeometry = new THREE.LatheGeometry(capaPoints, 100);

 const capaMaterial = new THREE.MeshStandardMaterial({
   color: 0x3b3b3b, // Gris oscuro para la tela
  metalness: 0.1,
  roughness: 0.9,
  side: THREE.DoubleSide, // Para que se vea por dentro y fuera
});

const capaMesh = new THREE.Mesh(capaGeometry, capaMaterial);
 capaMesh.position.y = 1.85; // Comienza en la base de la cabeza
 this.add(capaMesh);


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
        this.guiControls.posY = 0.0;// Base del rey
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.4, 32),
      material
    );

    // Cuerpo del rey
    const cuerpo1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.5, 1.2, 32),
      material
    );
    cuerpo1.position.y = 0.8;

    const cuerpo2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.2, 1.2, 32),
      material
    );
    cuerpo2.position.y = 2.0;

    const cuerpo3 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 1.0, 1.2, 32),
      material
    );
    cuerpo3.position.y = 3.2;

    // Cabeza del rey
    const cabeza = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      material
    );
    cabeza.position.y = 4.3;

    // Cruz del rey
    const cruzVertical = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.8, 0.15),
      material
    );
    cruzVertical.position.y = 5.0;

    const cruzHorizontal = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.15, 0.15),
      material
    );
    cruzHorizontal.position.y = 5.0;

    // Agregamos todas las piezas al grupo del rey
    grupoRey.add(base);
    grupoRey.add(cuerpo1);
    grupoRey.add(cuerpo2);
    grupoRey.add(cuerpo3);
    grupoRey.add(cabeza);
    grupoRey.add(cruzVertical);
    grupoRey.add(cruzHorizontal);

    // Centramos el grupo respecto a la base
    grupoRey.position.y = 0;

    this.add(grupoRey);
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

export { Reina }

