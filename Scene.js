import * as THREE from "../libs/three.module.js";
import { TrackballControls } from "../libs/TrackballControls.js";

import * as Pieces from "./Objects/Pieces/AllPieces.js";
import * as PiceMaterialSets from "./Objects/Pieces/Materials/MateralSetLibrary.js";

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();
    this.renderer = this.createRenderer(myCanvas);
    this.createLights();
    this.createCamera();
    this.axis = new THREE.AxesHelper(1);
    this.add(this.axis);

    let i = 0;
    for (let material_set of [
      PiceMaterialSets.classic_white,
      PiceMaterialSets.classic_black,
    ]) {
      let king = new Pieces.Rey(material_set);
      let queen = new Pieces.Reina(material_set);
      let bishop = new Pieces.Alfil(material_set);
      let knight = new Pieces.Knight(material_set);
      let rook = new Pieces.Rook(material_set);
      let pawn = new Pieces.Peon(material_set);

      king.position.set(0, 0, i * 1.5);
      queen.position.set(1, 0, i * 1.5);
      bishop.position.set(2, 0, i * 1.5);
      knight.position.set(3, 0, i * 1.5);
      rook.position.set(4, 0, i * 1.5);
      pawn.position.set(5, 0, i * 1.5);

      this.add(king);
      this.add(queen);
      this.add(bishop);
      this.add(knight);
      this.add(rook);
      this.add(pawn);

      i += 1;
    }
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(2, 1, 2);
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
  scene.update();
});
