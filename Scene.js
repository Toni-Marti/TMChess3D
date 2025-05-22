import * as THREE from "../libs/three.module.js";
import * as Pieces from "./Objects/Pieces/AllPieces.js";
import { AbstractPiece } from "./Objects/Pieces/AbstractPiece.js";
import * as PiceMaterialSets from "./Objects/Pieces/Materials/MaterialSetLibrary.js";
import { Board } from "./Objects/Board.js";
import { ChessGame } from "./our_libs/chess/game_handler.js";
import * as TWEEN from "../../libs/tween.module.js";
import { MTLLoader } from "../libs/MTLLoader.js";
import { OBJLoader } from "../libs/OBJLoader.js";

const STATES = {
  SELECTING_PIECE: 0,
  SELECTED_PIECE: 1,
  PLAYING_ANIMATION: 2,
  FINISHED_GAME: 3,
  BOARD_NOT_SET_UP: 4,
  PAUSED: 5,
};

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();
    this.scale_factor = 0.5 / 8;

    var objectLoader = new OBJLoader();

    objectLoader.load("Models/woodenstool.obj", (object) => {
      const textureLoader = new THREE.TextureLoader();

      const maderaTexture = textureLoader.load("Models/color_wooden.jpg");
      const normalTexture = textureLoader.load("Models/normal_wooden.jpg");
      const roughnessTexture = textureLoader.load("Models/Roughness.jpg");

      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: maderaTexture,
            normalMap: normalTexture,
            roughnessMap: roughnessTexture,
            bumpScale: 0.05,
          });
          child.material.needsUpdate = true;
        }
      });

      object.scale.set(0.5, 0.2, 0.5);
      object.position.set(0, -0.8, 0);

      this.add(object);
    });

    this.gameState = STATES.BOARD_NOT_SET_UP;
    this.mouse = new THREE.Vector2();
    this.ray_caster = new THREE.Raycaster();
    this.renderer = this.createRenderer(myCanvas);
    this.createLights();
    this.board = new Board();
    this.add(this.board);
    this.cam_height = 0.6;
    this.cam_radius = 0.55;
    this.cam_low_pos = new THREE.Vector3(0, this.cam_height, -this.cam_radius);
    this.cam_high_pos = new THREE.Vector3(0, this.cam_height * 1.5, -0.01);
    this.createCamera();
    this.chessEngine = null;
    this.original_dark_material = this.board.squares[0][0].material.clone();
    this.original_light_material = this.board.squares[0][1].material.clone();
    this.highlight_dark_material = new THREE.MeshBasicMaterial({
      color: 0x999933,
    });
    this.highlight_light_material = new THREE.MeshBasicMaterial({
      color: 0xffff66,
    });
    this.white_pieces = null;
    this.black_pieces = null;
    this.n_white_lost_pieces = 0;
    this.n_black_lost_pieces = 0;
    this.cam_rotation_duration = 670;
    this.createPieces();
    this.positionAllPiecesAsLost();
    this.setUpGame(700);
    this.selectedHeight = 0.2;
    this.camera_high = false;
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
    return max_distance / AbstractPiece.SPEED;
  }

  async setUpGame(wait_time = 0) {
    await new Promise((resolve) => setTimeout(resolve, wait_time));

    if (
      this.chessEngine != null &&
      this.chessEngine.currentPlayer() == "black"
    ) {
      this.rotateCameraAroundBoard(this.cam_rotation_duration);
    }
    this.gameState = STATES.PLAYING_ANIMATION;
    this.chessEngine = new ChessGame();
    const set_up_duration = this.gameSetUpDesiredDuration();
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
          (set_up_duration * distance) / max_distance,
          0.2
        );

        new TWEEN.Tween(piece.scale)
          .to(
            {
              x: this.scale_factor,
              y: this.scale_factor,
              z: this.scale_factor,
            },
            200
          )
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }
    }
    this.n_black_lost_pieces = 0;
    this.n_white_lost_pieces = 0;
    await new Promise((resolve) => setTimeout(resolve, set_up_duration));
    this.gameState = STATES.SELECTING_PIECE;
  }

  rotateCameraAroundBoard(duration) {
    const startAngle = this.camera_parent.rotation.y;
    const endAngle = startAngle + Math.PI;

    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const angle =
        startAngle + (endAngle - startAngle) * TWEEN.Easing.Quadratic.InOut(t);

      this.camera_parent.rotation.y = angle;

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  createCamera() {
    this.camera_parent = new THREE.Object3D();
    this.add(this.camera_parent);
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(
      this.cam_low_pos.x,
      this.cam_low_pos.y,
      this.cam_low_pos.z
    );
    var look = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(this.board.position);
    this.camera_parent.add(this.camera);
  }

  createPieces() {
    let i = 0;

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

    for (let piece of pieces) {
      let row = piece.row;
      let col = piece.col;
      piece.scale.set(
        piece.scale.x * this.scale_factor,
        piece.scale.y * this.scale_factor,
        piece.scale.z * this.scale_factor
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

  updateMouseCursor() {
    let intersects;
    let piece;
    switch (this.gameState) {
      case STATES.BOARD_NOT_SET_UP:
      case STATES.FINISHED_GAME:
      case STATES.PLAYING_ANIMATION:
        break;
      case STATES.SELECTING_PIECE:
        this.ray_caster.setFromCamera(this.mouse, this.camera);
        intersects = this.ray_caster.intersectObjects(this.children);
        if (intersects.length === 0) break;
        piece = this.getPiece(intersects[0].object);
        if (piece === null) break;
        if (this.chessEngine.availableMoves(piece.row, piece.col).length === 0)
          break;
        document.body.style.cursor = "pointer";
        return;

      case STATES.SELECTED_PIECE:
        this.ray_caster.setFromCamera(this.mouse, this.camera);
        intersects = this.ray_caster.intersectObjects(this.children);
        if (intersects.length === 0) break;
        piece = this.getPiece(intersects[0].object);
        if (piece === null) {
          const click_object = intersects[0].object;
          if (click_object.name.startsWith("square_")) {
            const square = click_object;
            const square_row = Number(square.name[square.name.length - 3]);
            const square_col = Number(square.name[square.name.length - 1]);
            let can_move_there = false;
            for (let move of this.chessEngine.availableMoves(
              this.selectedPiece.row,
              this.selectedPiece.col
            )) {
              if (move[0] === square_row && move[1] === square_col) {
                can_move_there = true;
                break;
              }
            }
            if (can_move_there) {
              document.body.style.cursor = "pointer";
              return;
            }
          }
          break;
        }
        if (piece.color !== this.selectedPiece.color) {
          let can_capture = false;
          for (let move of this.chessEngine.availableMoves(
            this.selectedPiece.row,
            this.selectedPiece.col
          )) {
            if (move[0] === piece.row && move[1] === piece.col) {
              can_capture = true;
              break;
            }
          }

          if (can_capture) {
            document.body.style.cursor = "pointer";
            return;
          }
        } else {
          if (
            piece !== this.selectedPiece &&
            this.chessEngine.availableMoves(piece.row, piece.col).length > 0
          ) {
            document.body.style.cursor = "pointer";
            return;
          }
        }
    }

    document.body.style.cursor = "default";
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.updateMouseCursor();
  }

  flashLightsGreen(duration = 450) {
    const originalColor = new THREE.Color(0xffffff);
    const greenColor = new THREE.Color(0x00ff00);

    this.pointLight1.color.set(greenColor);
    this.pointLight2.color.set(greenColor);

    setTimeout(() => {
      this.ambientLight.color.set(originalColor);
      this.pointLight1.color.set(originalColor);
      this.pointLight2.color.set(originalColor);
    }, duration);
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

  async move(piece, square) {
    const target_row = Number(square.name[square.name.length - 3]);
    const target_col = Number(square.name[square.name.length - 1]);

    const pieces_before = this.chessEngine.getNumberOfPiecesInBoard();
    const board_before = this.chessEngine.getBoardCopy();
    this.chessEngine.applyMove(
      [this.selectedPiece.row, this.selectedPiece.col],
      [target_row, target_col]
    );
    const pieces_after = this.chessEngine.getNumberOfPiecesInBoard();
    const target_pos = new THREE.Vector3();
    square.getWorldPosition(target_pos);
    const distance = this.selectedPiece.position.distanceTo(target_pos);

    let move_duration;
    if (pieces_after < pieces_before) {
      const pawn_dir = piece.color === "white" ? 1 : -1;
      let captured_square =
        board_before[target_row][target_col] !== null
          ? [target_row, target_col]
          : [target_row - pawn_dir, target_col];
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
      this.resetSquareHighlights();
      await piece.capture(
        captured_piece,
        all_other_pieces,
        target_pos,
        move_duration,
        this
      );
      this.flashLightsGreen();
    } else {
      const moving_king =
        board_before[this.selectedPiece.row][
          this.selectedPiece.col
        ].toUpperCase() === "K";
      const castling =
        moving_king && Math.abs(target_col - this.selectedPiece.col) > 1;
      move_duration = distance / AbstractPiece.SPEED;
      this.resetSquareHighlights();
      await this.selectedPiece.move(target_pos, move_duration);
      if (castling) {
        const pieces =
          piece.color === "white" ? this.white_pieces : this.black_pieces;
        const dir = target_col === 2 ? -1 : 1;
        const rook_col = target_col === 2 ? 0 : 7;
        const rook = rook_col === 0 ? pieces.r1 : pieces.r2;
        const rook_destination =
          this.board.squares[this.selectedPiece.row][
            this.selectedPiece.col + dir
          ].position;
        const rook_move_duration =
          rook.position.distanceTo(rook_destination) / AbstractPiece.SPEED;
        move_duration += rook_move_duration;
        rook.col = this.selectedPiece.col + dir;
        await rook.arc_to(rook_destination, rook_move_duration, 0.2);
      }
    }
    this.selectedPiece.row = target_row;
    this.selectedPiece.col = target_col;
    this.rotateCameraAroundBoard(this.cam_rotation_duration);
    await new Promise((resolve) =>
      setTimeout(resolve, this.cam_rotation_duration)
    );
    this.selectedPiece = null;
    return;
  }

  async animate_y(piece, to_y, duration) {
    const startTime = performance.now();
    const starting_y = piece.position.y;
    let animator = {};
    animator.promise = new Promise((resolve, reject) => {
      animator.resolve = resolve;
    });

    const animate = (time) => {
      console.log();
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      piece.position.y =
        (to_y - starting_y) * TWEEN.Easing.Quadratic.Out(t) + starting_y;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        animator.resolve();
      }
    };
    requestAnimationFrame(animate);
    await animator.promise;
  }

  async release_selected_piece() {
    this.gameState = STATES.PLAYING_ANIMATION;
    await this.animate_y(
      this.selectedPiece,
      this.selectedPiece.position.y - this.selectedHeight,
      75
    );

    this.selectedPiece = null;
    this.gameState = STATES.SELECTING_PIECE;
  }
  async select_piece(piece) {
    if (this.selectedPiece) {
      this.resetSquareHighlights();
      this.highlightSquares(
        this.chessEngine.availableMoves(piece.row, piece.col)
      );
      await this.release_selected_piece();
    } else {
      this.highlightSquares(
        this.chessEngine.availableMoves(piece.row, piece.col)
      );
    }
    await this.animate_y(piece, piece.position.y + this.selectedHeight, 75);
    this.selectedPiece = piece;
    this.gameState = STATES.SELECTED_PIECE;
  }

  async onClick() {
    let intersects;
    switch (this.gameState) {
      case STATES.BOARD_NOT_SET_UP:
      case STATES.FINISHED_GAME:
      case STATES.PLAYING_ANIMATION:
        break;
      case STATES.SELECTING_PIECE:
        this.ray_caster.setFromCamera(this.mouse, this.camera);
        intersects = this.ray_caster.intersectObjects(this.children);
        if (intersects.length === 0) break;

        let piece = this.getPiece(intersects[0].object);
        if (piece === null) {
          break;
        }

        if (this.chessEngine.availableMoves(piece.row, piece.col).length === 0)
          break;

        this.select_piece(piece);
        break;

      case STATES.SELECTED_PIECE:
        this.ray_caster.setFromCamera(this.mouse, this.camera);
        intersects = this.ray_caster.intersectObjects(this.children);

        if (intersects.length === 0) {
          this.resetSquareHighlights();
          release_selected_piece();
          break;
        }
        const clicked_piece = this.getPiece(intersects[0].object);
        if (clicked_piece !== null) {
          if (clicked_piece.color !== this.selectedPiece.color) {
            let can_capture = false;
            for (let move of this.chessEngine.availableMoves(
              this.selectedPiece.row,
              this.selectedPiece.col
            )) {
              if (
                move[0] === clicked_piece.row &&
                move[1] === clicked_piece.col
              ) {
                can_capture = true;
                break;
              }
            }

            if (can_capture) {
              this.gameState = STATES.PLAYING_ANIMATION;
              await this.move(
                this.selectedPiece,
                this.board.squares[clicked_piece.row][clicked_piece.col]
              );
              this.gameState = STATES.SELECTING_PIECE;
              this.selectedPiece = null;
              break;
            }
          } else if (clicked_piece !== this.selectedPiece) {
            if (
              this.chessEngine.availableMoves(
                clicked_piece.row,
                clicked_piece.col
              ).length > 0
            ) {
              await this.select_piece(clicked_piece);
            }
            break;
          } else {
            break;
          }
        }

        let square = null;
        for (let intersect of intersects) {
          if (intersect.object.name.startsWith("square_")) {
            square = intersect.object;
            break;
          }
        }

        if (square === null) {
          this.resetSquareHighlights();
          this.release_selected_piece();
          break;
        }

        let square_row = Number(square.name[square.name.length - 3]);
        let square_col = Number(square.name[square.name.length - 1]);
        let can_move_to_square = false;
        for (let move of this.chessEngine.availableMoves(
          this.selectedPiece.row,
          this.selectedPiece.col
        )) {
          if (move[0] === square_row && move[1] === square_col) {
            can_move_to_square = true;
            break;
          }
        }

        if (!can_move_to_square) {
          this.resetSquareHighlights();
          this.release_selected_piece();
          break;
        }

        this.gameState = STATES.PLAYING_ANIMATION;
        await this.move(this.selectedPiece, square);

        this.selectedPiece = null;
        this.gameState = STATES.SELECTING_PIECE;

        break;
    }

    this.updateMouseCursor();
  }

  async onKeyDown(event) {
    switch (event.key) {
      case "c":
        if (this.cameraAnimating) {
          if (this.cameraAnimationCancel) {
            this.cameraAnimationCancel();
          }
        }

        this.camera_high = !this.camera_high;

        const startPos = this.camera.position.clone();
        const targetPos = this.camera_high
          ? this.cam_high_pos
          : this.cam_low_pos;

        const duration = 300;
        const startTime = performance.now();

        this.cameraAnimating = true;
        let cancelled = false;

        this.cameraAnimationCancel = () => {
          cancelled = true;
          this.cameraAnimating = false;
          this.cameraAnimationCancel = null;
        };

        return new Promise((resolve) => {
          const animate = (time) => {
            if (cancelled) {
              resolve();
              return;
            }

            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            const easing = TWEEN.Easing.Quadratic.InOut(t);

            this.camera.position.set(
              startPos.x + (targetPos.x - startPos.x) * easing,
              startPos.y + (targetPos.y - startPos.y) * easing,
              startPos.z + (targetPos.z - startPos.z) * easing
            );

            this.camera.lookAt(0, 0, 0);

            if (t < 1) {
              requestAnimationFrame(animate);
            } else {
              this.cameraAnimating = false;
              this.cameraAnimationCancel = null;
              resolve();
            }
          };

          requestAnimationFrame(animate);
        });
      case "s":
        if (this.gameState == STATES.PLAYING_ANIMATION) break;
        if (this.gameState == STATES.SELECTED_PIECE) {
          this.resetSquareHighlights();
          await this.release_selected_piece();
        }
        this.setUpGame();
    }
  }

  highlightSquares(squares_cords) {
    for (let square_cord of squares_cords) {
      const square = this.board.squares[square_cord[0]][square_cord[1]];
      const row = Number(square.name[square.name.length - 3]);
      const col = Number(square.name[square.name.length - 1]);
      square.material =
        (row + col) % 2 === 0
          ? this.highlight_dark_material
          : this.highlight_light_material;
    }
  }

  resetSquareHighlights() {
    for (let row of this.board.squares) {
      for (let square of row) {
        const row = Number(square.name[square.name.length - 3]);
        const col = Number(square.name[square.name.length - 1]);
        square.material =
          (row + col) % 2 === 0
            ? this.original_dark_material
            : this.original_light_material;
        square.material.needsUpdate = true;
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
    TWEEN.update();
    this.renderer.render(this, this.getCamera());
    requestAnimationFrame(() => this.update());
  }
}

$(function () {
  var scene = new MyScene("#WebGL-output");
  window.addEventListener("resize", () => scene.onWindowResize());
  window.addEventListener("click", () => scene.onClick());
  window.addEventListener("mousemove", (event) => scene.onMouseMove(event));
  window.addEventListener("keydown", (event) => scene.onKeyDown(event));
  scene.update();
});
