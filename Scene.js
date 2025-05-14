import * as THREE from "../libs/three.module.js";
import * as Pieces from "./Objects/Pieces/AllPieces.js";
import { AbstractPiece } from "./Objects/Pieces/AbstractPiece.js";
import * as PiceMaterialSets from "./Objects/Pieces/Materials/MaterialSetLibrary.js";
import { Board } from "./Objects/Board.js";
import { ChessGame } from "./our_libs/chess/game_handler.js";
import * as TWEEN from "../../libs/tween.module.js";

const STATE = {
  SELECTING_PIECE: 0,
  SELECTED_PIECE: 1,
  PLAYING_ANIMATION: 2,
  FINISHED_GAME: 3,
  BOARD_NOT_SET_UP: 4,
};

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
    this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.chessEngine = null;
    this.board = new Board();
    this.board.name = "chessBoard";
    this.add(this.board);
    this.white_pieces = null;
    this.black_pieces = null;
    this.n_white_lost_pieces = 0;
    this.n_black_lost_pieces = 0;
    this.createPieces();
    this.positionAllPiecesAsLost();
    this.setUpGame(500);
  }

  getNextLostPiecePosition(color) {
    let squareSize = Board.squareSize;
    let squareHeight = Board.squareHeight;

    let n_lost_pieces;
    let start_pos = new THREE.Vector3();
    let h_dir;
    let v_dir;
    if (color === "black") {
      h_dir = -1;
      v_dir = 1;
      this.board.squares[0][7].getWorldPosition(start_pos);
      n_lost_pieces = this.n_black_lost_pieces;
    } else {
      h_dir = 1;
      v_dir = -1;
      this.board.squares[7][0].getWorldPosition(start_pos);
      n_lost_pieces = this.n_white_lost_pieces;
    }
    start_pos.y -= squareHeight;
    start_pos.x += squareSize * 2 * h_dir;

    return new THREE.Vector3(
      start_pos.x + squareSize * h_dir * (n_lost_pieces % 2 === 0 ? 0 : 1),
      start_pos.y,
      start_pos.z + squareSize * v_dir * Math.floor(n_lost_pieces / 2)
    );
  }

  positionPieceAsLost(piece, color, duration) {
    /**
     * Must not be already in lost, if it is, it will break the state
     */
    piece.arc_to(this.getNextLostPiecePosition(color), duration, 0.2);
    if (color === "white") {
      this.n_white_lost_pieces++;
    }
    if (color === "black") {
      this.n_black_lost_pieces++;
    }
    piece.row = null;
    piece.col = null;
  }

  async positionAllPiecesAsLost(duration = 0) {
    for (let piece of Object.values(this.white_pieces)) {
      if (piece.row !== null && piece.col != null) continue;
      this.positionPieceAsLost(piece, "white", duration);
    }
    for (let piece of Object.values(this.black_pieces)) {
      if (piece.row !== null && piece.col != null) continue;
      this.positionPieceAsLost(piece, "black", duration);
    }
  }

  pieceToStartingPos(piece_name, color) {
    const king_row = color === "white" ? 0 : 7;
    const pawn_row = color === "white" ? 1 : 6;
    switch (piece_name) {
      case "r1":
        return [king_row, 0];
      case "n1":
        return [king_row, 1];
      case "b1":
        return [king_row, 2];
      case "q1":
        return [king_row, 3];
      case "k1":
        return [king_row, 4];
      case "b2":
        return [king_row, 5];
      case "n2":
        return [king_row, 6];
      case "r2":
        return [king_row, 7];
      default:
        let pawn_index = Number(piece_name[1]);
        return [pawn_row, pawn_index - 1];
    }
  }

  gameSetUpDesiredDuration() {
    let max_distance = 0;
    for (let color of ["white", "black"]) {
      let pieces = color === "white" ? this.white_pieces : this.black_pieces;
      for (const [piece_name, piece] of Object.entries(pieces)) {
        const starting_pos = this.pieceToStartingPos(piece_name, color);
        const targetPos = new THREE.Vector3();
        this.board.squares[starting_pos[0]][starting_pos[1]].getWorldPosition(
          targetPos
        );
        const distance = piece.position.distanceTo(targetPos);
        if (distance > max_distance) {
          max_distance = distance;
        }
      }
    }
    console.log(
      "DESIRED SET UP DURATION: ",
      max_distance * AbstractPiece.SPEED
    );
    return max_distance * AbstractPiece.SPEED;
  }

  async setUpGame(wait_time = 0) {
    await new Promise((resolve) => setTimeout(resolve, wait_time));

    this.chessEngine = new ChessGame();
    for (let color of ["white", "black"]) {
      let pieces = color === "white" ? this.white_pieces : this.black_pieces;
      for (const [piece_name, piece] of Object.entries(pieces)) {
        const starting_pos = this.pieceToStartingPos(piece_name, color);
        piece.row = starting_pos[0];
        piece.col = starting_pos[1];
      }
      let target_and_distances = [];
      let max_distance = 0;
      for (let piece of Object.values(pieces)) {
        let targetPos = new THREE.Vector3();
        this.board.squares[piece.row][piece.col].getWorldPosition(targetPos);
        let distance = piece.position.distanceTo(targetPos);
        target_and_distances.push([targetPos, distance]);
        if (distance > max_distance) {
          max_distance = distance;
        }
      }

      for (let i = 0; i < Object.values(pieces).length; i++) {
        let piece = Object.values(pieces)[i];
        let targetPos = target_and_distances[i][0];
        let distance = target_and_distances[i][1];
        this.board.squares[piece.row][piece.col].getWorldPosition(targetPos);
        piece.arc_to(
          targetPos,
          (this.gameSetUpDesiredDuration() * distance) / max_distance,
          0.2
        );
      }
    }
    this.n_black_lost_pieces = 0;
    this.n_white_lost_pieces = 0;
  }

  rotateCameraAroundBoard(duration) {
    const center = new THREE.Vector3(0, 0, 0);

    const startAngle = this.currentTurn === "white" ? Math.PI : 0;
    const endAngle = this.currentTurn === "white" ? 0 : -Math.PI;

    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const angle =
        startAngle + (endAngle - startAngle) * TWEEN.Easing.Quadratic.InOut(t);

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

    this.white_pieces = {
      r1: null,
      n1: null,
      b1: null,
      q1: null,
      k1: null,
      b2: null,
      n2: null,
      r2: null,
      p1: null,
      p2: null,
      p3: null,
      p4: null,
      p5: null,
      p6: null,
      p7: null,
      p8: null,
    };
    this.black_pieces = JSON.parse(JSON.stringify(this.white_pieces));
    this.createColorPieces("white");
    this.createColorPieces("black");
  }
  createColorPieces(color) {
    let material_set =
      color === "white"
        ? PiceMaterialSets.classic_white
        : PiceMaterialSets.classic_black;
    let pieces = [
      new Pieces.Rook(material_set.clone(), undefined, undefined, color),
      new Pieces.Knight(material_set.clone(), undefined, undefined, color),
      new Pieces.Bishop(material_set.clone(), undefined, undefined, color),
      new Pieces.Queen(material_set.clone(), undefined, undefined, color),
      new Pieces.King(material_set.clone(), undefined, undefined, color),
      new Pieces.Bishop(material_set.clone(), undefined, undefined, color),
      new Pieces.Knight(material_set.clone(), undefined, undefined, color),
      new Pieces.Rook(material_set.clone(), undefined, undefined, color),
    ];

    let changing = color === "white" ? this.white_pieces : this.black_pieces;

    pieces[color === "white" ? 1 : 6].rotation.y += -Math.PI / 2;

    for (let i = 0; i < 8; i++)
      pieces.push(
        new Pieces.Pawn(material_set.clone(), undefined, undefined, color)
      );

    const scale_factor = 0.5 / 8;
    for (let piece of pieces) {
      let row = piece.row;
      let col = piece.col;
      piece.scale.set(
        piece.scale.x * scale_factor,
        piece.scale.y * scale_factor,
        piece.scale.z * scale_factor
      );
      piece.name = "piece";
      if (color === "black") {
        piece.rotation.y += Math.PI;
      }
      this.add(piece);
    }
    0;
    changing.r1 = pieces[0];
    changing.n1 = pieces[1];
    changing.b1 = pieces[2];
    changing.q1 = pieces[3];
    changing.k1 = pieces[4];
    changing.b2 = pieces[5];
    changing.n2 = pieces[6];
    changing.r2 = pieces[7];
    changing.p1 = pieces[8];
    changing.p2 = pieces[9];
    changing.p3 = pieces[10];
    changing.p4 = pieces[11];
    changing.p5 = pieces[12];
    changing.p6 = pieces[13];
    changing.p7 = pieces[14];
    changing.p8 = pieces[15];
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

  async tryToMove(piece, square) {
    const targetrow = Number(square.name[square.name.length - 3]);
    const targetcol = Number(square.name[square.name.length - 1]);
    let isvalidmove = false;
    for (let move of this.chessEngine.availableMoves(
      this.selectedPiece.row,
      this.selectedPiece.col
    )) {
      if (move[0] === targetrow && move[1] === targetcol) {
        isvalidmove = true;
        break;
      }
    }
    if (!isvalidmove) {
      return;
    }

    const pieces_before = this.chessEngine.getNumberOfPiecesInBoard();
    const board_before = this.chessEngine.getBoardCopy();
    this.chessEngine.applyMove(
      [this.selectedPiece.row, this.selectedPiece.col],
      [targetrow, targetcol]
    );
    const pieces_after = this.chessEngine.getNumberOfPiecesInBoard();
    const target_pos = new THREE.Vector3();
    square.getWorldPosition(target_pos);
    const distance = this.selectedPiece.position.distanceTo(target_pos);

    let move_duration;
    if (pieces_after < pieces_before) {
      const pawn_dir = piece.color === "white" ? 1 : -1;
      let captured_square =
        board_before[targetrow][targetcol] !== null
          ? [targetrow, targetcol]
          : [targetrow - pawn_dir, targetcol];
      let captured_piece = null;
      const all_posible_captures =
        piece.color === "white" ? this.black_pieces : this.white_pieces;
      for (let posible_capture of Object.values(all_posible_captures)) {
        if (
          posible_capture.row === captured_square[0] &&
          posible_capture.col === captured_square[1]
        ) {
          captured_piece = posible_capture;
          break;
        }
      }
      move_duration = piece.getDesiredCaptureDuration(
        captured_piece,
        target_pos,
        this
      );
      const all_other_pieces = [];
      for (let piece of Object.values(this.white_pieces)) {
        if (piece !== captured_piece) {
          all_other_pieces.push(piece);
        }
      }
      for (let piece of Object.values(this.black_pieces)) {
        if (piece !== captured_piece) {
          all_other_pieces.push(piece);
        }
      }
      piece.capture(
        captured_piece,
        all_other_pieces,
        target_pos,
        move_duration,
        this
      );
    } else {
      move_duration = distance * AbstractPiece.SPEED;
      this.selectedPiece.move(target_pos, move_duration);
    }
    this.selectedPiece.row = targetrow;
    this.selectedPiece.col = targetcol;
    this.selectedPiece = null;
    this.resetSquareHighlights();

    await new Promise((resolve) => setTimeout(resolve, move_duration));
    this.rotateCameraAroundBoard(1000);
  }

  onClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.children);

    // Original code continues...
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (this.selectedPiece) {
        if (clickedObject.name.startsWith("square_")) {
          this.tryToMove(this.selectedPiece, clickedObject);
          return;
        }
      }

      let piece = this.getPiece(clickedObject);
      if (
        piece !== null &&
        this.chessEngine.availableMoves(piece.row, piece.col).length !== 0
      ) {
        piece.position.y = 0.2;
        this.selectedPiece = piece;
        this.highlightSquares(
          this.chessEngine.availableMoves(piece.row, piece.col)
        );
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
      this.board.squares[square[0]][square[1]].material.emissive.set(0x00ff00);
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
      if (current.name === "piece") {
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
  window.addEventListener("click", (event) => scene.onClick());
  window.addEventListener("mousemove", (event) => scene.onMouseMove(event));
  scene.update();
});
