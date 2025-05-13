import * as THREE from "../libs/three.module.js";
import * as Pieces from "./Objects/Pieces/AllPieces.js";
import * as PiceMaterialSets from "./Objects/Pieces/Materials/MaterialSetLibrary.js";
import { Board } from "./Objects/Board.js";
import { ChessGame } from "./our_libs/chess/game_handler.js";

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.renderer = this.createRenderer(myCanvas);
    this.createLights();
    this.cam_height = 0.6;
    this.cam_radius = 0.55;
    this.createCamera();
    this.currentTurn = "white";
    this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green highlight
    this.normalMaterials = {}; // To store original square materials
    this.chessEngine = new ChessGame();
    this.board = new Board();
    this.board.name = "chessBoard";
    this.add(this.board);
    this.createPieces();
  }

  rotateCameraAroundBoard() {
    const center = new THREE.Vector3(0, 0, 0);
    const duration = 2000;

    const startAngle = this.currentTurn === "white" ? Math.PI : 0;
    const endAngle = this.currentTurn === "white" ? 0 : -Math.PI;

    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const angle = startAngle + (endAngle - startAngle) * t;

      const x = this.cam_radius * Math.sin(angle);
      const z = this.cam_radius * Math.cos(angle);
      this.camera.position.set(x, this.cam_height, z);

      // Ahora, sin controles, sólo usamos lookAt para enfocar el centro
      this.camera.lookAt(center);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Alternar turno antes de iniciar animación
    this.currentTurn = this.currentTurn === "white" ? "black" : "white";

    requestAnimationFrame(animate);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(0, this.cam_height, -this.cam_radius);
    var look = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(look);
    this.add(this.camera);
  }

  createPieces() {
    let i = 0;

    let white_set = PiceMaterialSets.classic_white;
    let black_set = PiceMaterialSets.classic_black;

    this.createRow(white_set, 0, 1, "white");
    this.createRow(black_set, 7, 6, "black");
  }

  createRow(material_set, row, pawnRow, color) {
    let pieces = [
      new Pieces.Rook(material_set.clone(), row, 0),
      new Pieces.Knight(material_set.clone(), row, 1),
      new Pieces.Bishop(material_set.clone(), row, 2),
      new Pieces.Queen(material_set.clone(), row, 3),
      new Pieces.King(material_set.clone(), row, 4),
      new Pieces.Bishop(material_set.clone(), row, 5),
      new Pieces.Knight(material_set.clone(), row, 6),
      new Pieces.Rook(material_set.clone(), row, 7),
    ];

    pieces[color === "white" ? 1: 6].rotation.y += -Math.PI / 2;

    for (let i = 0; i < 8; i++)
      pieces.push(new Pieces.Pawn(material_set.clone(), pawnRow, i));

    const scale_factor = 0.5 / 8;
    for (let piece of pieces) {
      let row = piece.row;
      let col = piece.col;
      piece.scale.set(
        piece.scale.x * scale_factor,
        piece.scale.y * scale_factor,
        piece.scale.z * scale_factor
      );
      let square_position = this.board.squares[row][col].position;
      piece.position.set(square_position.x, 0, square_position.z);
      piece.name = "piece";
      if (color === "black") {
        piece.rotation.y += Math.PI;
      }
      this.add(piece);
    }
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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
    this.pointLight2.position.set(-2, 3, -1);
    this.add(this.pointLight2);
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
    const intersects = this.raycaster.intersectObjects(this.children);

    // Original code continues...
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (this.selectedPiece) {
        if (clickedObject.name.startsWith("square_")) {
          const square = clickedObject;
          const targetrow = Number(square.name[square.name.length - 3]);
          const targetcol = Number(square.name[square.name.length - 1]);
          let isvalidmove = false;
          for(let move of this.chessEngine.availableMoves(this.selectedPiece.row, this.selectedPiece.col)) {
            if (move[0] == targetrow && move[1] == targetcol) {
              isvalidmove = true;
              break;
            }
          }
          if (!isvalidmove) {
            return;
          }

          this.chessEngine.applyMove([this.selectedPiece.row, this.selectedPiece.col], [targetrow, targetcol]);
          const targetPos = clickedObject.position.clone();
          targetPos.y = 0;
          const distance = this.selectedPiece.position.distanceTo(targetPos);  //TODO Enroquebro

          this.selectedPiece.move(targetPos, distance * 1500);
          this.selectedPiece.row = targetrow;
          this.selectedPiece.col = targetcol;
          this.selectedPiece = null;
          this.resetSquareHighlights();
          this.rotateCameraAroundBoard();
        }
        return;
      }
    
      let piece = this.getPiece(clickedObject)
      if (piece !==null && this.chessEngine.availableMoves(piece.row, piece.col).length !== 0) {
        piece.position.y = 0.2;
        this.selectedPiece = piece;
        this.highlightSquares(this.chessEngine.availableMoves(piece.row, piece.col));
        return;
    }
    if (this.selectedPiece) {
      this.selectedPiece.position.y = 0;
      this.selectedPiece = null;
      this.resetSquareHighlights();
    }
  }
}


  highlightSquares(squares) {
    for (let square of squares) {
      this.board.squares[square[0]][square[1]].material.emissive.set(0X00ff00);
    }
  }

  resetSquareHighlights() {
   for (let row of this.board.squares) {
      for (let square of row) {
        square.material.emissive.set(0x000000);
      }
    }
  }

  getPiece(object) {
    /**
     * Check if the object is a piece
     *
     * @returns {THREE.Object3D|null} The piece object if found, otherwise null
     */
    let current = object;
    while (current) {
      if (current.name == "piece") {
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
