import * as THREE from "../libs/three.module.js";
import { TrackballControls } from "../libs/TrackballControls.js";

import * as Pieces from "./Objects/Pieces/AllPieces.js";
import * as PiceMaterialSets from "./Objects/Pieces/Materials/MaterialSetLibrary.js";
import { Board } from "./Objects/Board.js";

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.renderer = this.createRenderer(myCanvas);
    this.createLights();
    this.createCamera();
    this.axis = new THREE.AxesHelper(1);
    this.add(this.axis);

    this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green highlight
    this.normalMaterials = {}; // To store original square materials

    this.createPieces();
    var board = new Board();
    board.position.set(0, 0, 0);
    board.name = "chessBoard";
    this.add(board);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(12, 11, 12);
    var look = new THREE.Vector3(3, 3, 3);
    this.camera.lookAt(look);
    this.add(this.camera);

    this.cameraControl = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );

    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = 2;
    this.cameraControl.panSpeed = 0.5;
    this.cameraControl.target = look;
  }

  createPieces() {
    let i = 0;

    // Materiales de las piezas (blanco y negro)
    let whiteMaterial = PiceMaterialSets.classic_white;
    let blackMaterial = PiceMaterialSets.classic_black;

    // Piezas blancas
    this.createRow(whiteMaterial, 0, 1, "white"); // Filas 1 y 2 (blancas)

    // Piezas negras
    this.createRow(blackMaterial, 7, 6, "black"); // Filas 7 y 8 (negras)
  }

  createRow(material, row, pawnRow, color) {
    // Crea las piezas de una fila
    let king = new Pieces.King(material);
    let queen = new Pieces.Queen(material);
    let bishop1 = new Pieces.Bishop(material);
    let bishop2 = new Pieces.Bishop(material);
    let knight1 = new Pieces.Knight(material);
    let knight2 = new Pieces.Knight(material);
    let rook1 = new Pieces.Rook(material);
    let rook2 = new Pieces.Rook(material);

    // Asignar nombres a las piezas mayores
    king.name = `${color}_king`;
    queen.name = `${color}_queen`;
    bishop1.name = `${color}_bishop1`;
    bishop2.name = `${color}_bishop2`;
    knight1.name = `${color}_knight1`;
    knight2.name = `${color}_knight2`;
    rook1.name = `${color}_rook1`;
    rook2.name = `${color}_rook2`;

    const offset = 8 / 2;

    king.position.set(3 - offset, 0, row - offset);
    queen.position.set(4 - offset, 0, row - offset);
    bishop1.position.set(2 - offset, 0, row - offset);
    bishop2.position.set(5 - offset, 0, row - offset); // Alfil 2
    knight1.position.set(1 - offset, 0, row - offset); // Caballo 1
    knight2.position.set(6 - offset, 0, row - offset); // Caballo 2
    rook1.position.set(0 - offset, 0, row - offset); // Torre 1
    rook2.position.set(7 - offset, 0, row - offset); // Torre 2

    if (color === "black") {
      king.rotation.y = Math.PI;
      queen.rotation.y = Math.PI;
      bishop1.rotation.y = Math.PI;
      bishop2.rotation.y = Math.PI;
      knight1.rotation.y = Math.PI;
      knight2.rotation.y = Math.PI;
      rook1.rotation.y = Math.PI;
      rook2.rotation.y = Math.PI;
    }
    this.add(king);
    this.add(queen);
    this.add(bishop1);
    this.add(bishop2);
    this.add(knight1);
    this.add(knight2);
    this.add(rook1);
    this.add(rook2);

    for (let i = 0; i < 8; i++) {
      let pawn = new Pieces.Pawn(material);
      pawn.name = `${color}_pawn${i}`;

      if (color === "black") {
        pawn.rotation.y = Math.PI;
      }

      pawn.position.set(i - offset, 0, pawnRow - offset); // <-- Aquí corregido

      this.add(pawn);
    }
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  createLights() {
    this.ambientLight = new THREE.AmbientLight("white", 0.5);
    this.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xffffff, 1, 0, 0);
    this.pointLight.position.set(-10, 10, 1.5);
    this.add(this.pointLight);
  }

  createRenderer(myCanvas) {
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xffffff), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  onClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const validPieceNames = [
      "white_king",
      "white_queen",
      "white_bishop1",
      "white_bishop2",
      "white_knight1",
      "white_knight2",
      "white_rook1",
      "white_rook2",
      "white_pawn1",
      "white_pawn2",
      "white_pawn3",
      "white_pawn4",
      "white_pawn5",
      "white_pawn6",
      "white_pawn7",
      "white_pawn8", // Peones blancos
      "black_king",
      "black_queen",
      "black_bishop1",
      "black_bishop2",
      "black_knight1",
      "black_knight2",
      "black_rook1",
      "black_rook2",
      "black_pawn1",
      "black_pawn2",
      "black_pawn3",
      "black_pawn4",
      "black_pawn5",
      "black_pawn6",
      "black_pawn7",
      "black_pawn8", // Peones negros
    ];

    const intersects = this.raycaster.intersectObjects(this.children);

    console.log("Raycaster intersects:", intersects);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      console.log("Clicked object:", clickedObject.name);

      if (this.selectedPiece) {
        if (clickedObject.name.startsWith("square_")) {
          const targetPos = clickedObject.position.clone();
          this.selectedPiece.position.set(targetPos.x, 0, targetPos.z);
          this.selectedPiece.position.y = 0;
          this.selectedPiece = null;
          this.resetSquareHighlights();
        }
        return;
      }

      let pieceGroup = this.findPieceGroup(clickedObject, validPieceNames);

      if (pieceGroup) {
        pieceGroup.position.y = 2;
        this.selectedPiece = pieceGroup;
        this.highlightAllSquares();
        return;
      }
    }

    if (this.selectedPiece) {
      this.selectedPiece.position.y = 0;
      this.selectedPiece = null;
      this.resetSquareHighlights();
    }
  }

  highlightAllSquares() {
    const board = this.getObjectByName("chessBoard");

    board.traverse((child) => {
      if (child.isMesh && child.name.startsWith("square_")) {
        // Save original emissive color
        this.normalMaterials[child.uuid] = child.material.emissive
          ? child.material.emissive.clone()
          : new THREE.Color(0x000000);

        if (child.material.emissive) {
          child.material.emissive.set(0x00ff00);
          child.material.emissive.set(0x00ff00);
        }
      }
    });
  }

  resetSquareHighlights() {
    const board = this.getObjectByName("chessBoard");

    board.traverse((child) => {
      if (child.isMesh && child.name.startsWith("square_")) {
        const originalEmissive = this.normalMaterials[child.uuid];
        if (child.material.emissive && originalEmissive) {
          child.material.emissive.copy(originalEmissive);
        }
      }
    });

    this.normalMaterials = {}; // Clear saved emissives
  }

  findPieceGroup(object, validNames) {
    let current = object;
    while (current) {
      if (validNames.includes(current.name)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  getCamera() {
    return this.camera;
  }

  setCameraAspect(ratio) {
    this.camera.aspect = ratio;
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    this.setCameraAspect(window.innerWidth / window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    this.renderer.render(this, this.getCamera());
    this.cameraControl.update();
    requestAnimationFrame(() => this.update());
  }
}

$(function () {
  var scene = new MyScene("#WebGL-output");
  window.addEventListener("resize", () => scene.onWindowResize());
  window.addEventListener("click", (event) => scene.onClick(event));
  window.addEventListener("mousemove", (event) => scene.onMouseMove(event));
  scene.update();
});
