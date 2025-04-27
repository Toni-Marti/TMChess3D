import * as THREE from "../libs/three.module.js";
import { TrackballControls } from "../libs/TrackballControls.js";
import {
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King,
} from "../Objects/Pieces/AllPieces.js";

import {
  classic_white,
  classic_black,
} from "../Objects/Pieces/Materials/MaterialSetLibrary.js";

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();
    this.renderer = this.createRenderer(myCanvas);
    this.createLights();
    this.createCamera();
    this.axis = new THREE.AxesHelper(1);
    this.add(this.axis);
    this.current_piece = new Pawn(classic_white);
    this.add(this.current_piece);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(2, 2, 4);
    var look = new THREE.Vector3(0, 0, 0);
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

  createLights() {
    this.ambientLight = new THREE.AmbientLight("white", 0.5);
    this.add(this.ambientLight);

    this.pointLight1 = new THREE.SpotLight(0xffffff);
    this.pointLight1.power = 50;
    this.pointLight1.position.set(2, 3, 1);
    this.add(this.pointLight1);

    this.pointLight2 = new THREE.SpotLight(0xffffff);
    this.pointLight2.power = 50;
    this.pointLight2.position.set(-2, -3, -1);
    this.add(this.pointLight2);
  }

  createRenderer(myCanvas) {
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xffffff), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    $(myCanvas).append(renderer.domElement);

    return renderer;
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

let scene = null;
$(function () {
  scene = new MyScene("#WebGL-output");
  window.addEventListener("resize", () => scene.onWindowResize());
  scene.update();
});

let selected_material = classic_white;
let selected_piece = "pawn";
function changePiece() {
  scene.remove(scene.current_piece);
  scene.current_piece = null;
  switch (selected_piece) {
    case "pawn":
      scene.current_piece = new Pawn(selected_material);
      break;
    case "knight":
      scene.current_piece = new Knight(selected_material);
      break;
    case "bishop":
      scene.current_piece = new Bishop(selected_material);
      break;
    case "rook":
      scene.current_piece = new Rook(selected_material);
      break;
    case "queen":
      scene.current_piece = new Queen(selected_material);
      break;
    case "king":
      scene.current_piece = new King(selected_material);
      break;
    default:
      console.error("Unknown piece type selected");
  }
  scene.add(scene.current_piece);
}
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("piece-select")
    .addEventListener("change", (event) => {
      selected_piece = event.target.value;
      changePiece();
    });

  document
    .getElementById("color-select")
    .addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      if (selectedValue === "white") {
        selected_material = classic_white;
      } else if (selectedValue === "black") {
        selected_material = classic_black;
      } else {
        console.error("Unknown material type selected");
      }
      changePiece();
    });
});
