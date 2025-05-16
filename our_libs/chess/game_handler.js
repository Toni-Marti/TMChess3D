const GAME_STATE = {
  IN_PROGRESS: 0,
  WHITE_WON: 1,
  BLACK_WON: 2,
  DRAW: 3,
};

class ChessGame {
  #board = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  #current_player = "white";
  #game_state = GAME_STATE.IN_PROGRESS;

  #white_king_moved = false;
  #white_can_castle0 = true;
  #white_can_castle7 = true;

  #black_king_moved = false;
  #black_can_castle0 = true;
  #black_can_castle7 = true;

  #can_en_passant = [];

  static validRow(row) {
    return row >= 0 && row < 8;
  }

  static validCol(col) {
    return col >= 0 && col < 8;
  }

  static validSquare(row, col) {
    return ChessGame.validRow(row) && ChessGame.validCol(col);
  }

  static getOppositeColor(color) {
    if (color === "white") return "black";
    else if (color === "black") return "white";

    return null;
  }

  static pieceToColor(piece, color) {
    if (color === "white") return piece.toLowerCase();
    else if (color === "black") return piece.toUpperCase();

    return piece;
  }

  static getPieceColor(piece) {
    if (piece === null) return null;

    if (piece === piece.toLowerCase()) return "white";
    else return "black";
  }

  #targetingInDirections(row, col, directions, loop = true) {
    let targets = [];
    for (let dir of directions) {
      let i = 1;
      do {
        let r_mov = i * dir[0];
        let c_mov = i * dir[1];
        i++;

        if (!ChessGame.validSquare(row + r_mov, col + c_mov)) break;

        targets.push([row + r_mov, col + c_mov]);

        let dest_piece = this.getSquare(row + r_mov, col + c_mov);
        let dest_color = ChessGame.getPieceColor(dest_piece);
        if (dest_color !== null) break;
      } while (loop);
    }

    return targets;
  }

  #pawnTargets(row, col, color) {
    let mov_dir = color === "white" ? 1 : -1;
    let targets = [];

    for (let direction of [-1, 1]) {
      if (!ChessGame.validCol(col + direction)) continue;
      targets.push([row + mov_dir, col + direction]);
    }
    return targets;
  }

  #knightTargets(row, col) {
    let targets = [];
    for (let r_mov of [-2, -1, 1, 2]) {
      let c_mod = Math.abs(r_mov) === 1 ? 2 : 1;

      for (let c_mul of [-1, 1]) {
        let c_mov = c_mod * c_mul;

        if (!ChessGame.validSquare(row + r_mov, col + c_mov)) continue;

        targets.push([row + r_mov, col + c_mov]);
      }
    }
    return targets;
  }

  static #bishop_directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  #bishopTargets(row, col) {
    return this.#targetingInDirections(row, col, ChessGame.#bishop_directions);
  }

  static #rook_directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  #rookTargets(row, col) {
    return this.#targetingInDirections(row, col, ChessGame.#rook_directions);
  }

  static #queen_directions = ChessGame.#rook_directions.concat(
    ChessGame.#bishop_directions
  );
  #queenTargets(row, col) {
    return this.#targetingInDirections(row, col, ChessGame.#queen_directions);
  }

  #kingTargets(row, col) {
    return this.#targetingInDirections(
      row,
      col,
      ChessGame.#queen_directions,
      false
    );
  }

  #cached_color_targets = {};
  #allTargets(color) {
    if (color in this.#cached_color_targets) {
      return this.#cached_color_targets[color];
    }

    let targets = [];
    for (let row = 0; row < this.#board.length; row++) {
      for (let col = 0; col < this.#board[row].length; col++) {
        let piece = this.getSquare(row, col);
        let piece_color = ChessGame.getPieceColor(piece);
        if (piece_color !== color) continue;

        let new_targets = null;
        switch (piece.toUpperCase()) {
          case "P":
            new_targets = this.#pawnTargets(row, col, color);
            break;
          case "N":
            new_targets = this.#knightTargets(row, col);
            break;
          case "B":
            new_targets = this.#bishopTargets(row, col);
            break;
          case "R":
            new_targets = this.#rookTargets(row, col);
            break;
          case "Q":
            new_targets = this.#queenTargets(row, col);
            break;
          case "K":
            new_targets = this.#kingTargets(row, col);
            break;
        }
        for (let new_target of new_targets) {
          let already_included = false;
          for (let included_target of targets) {
            if (
              new_target[0] === included_target[0] &&
              new_target[1] === included_target[1]
            ) {
              already_included = true;
              break;
            }
          }
          if (already_included) continue;
          targets.push(new_target);
        }
      }
    }

    this.#cached_color_targets[color] = targets;
    return this.#cached_color_targets[color];
  }

  clone() {
    let copy_cg = new ChessGame();
    copy_cg.#board = this.getBoardCopy();
    copy_cg.#current_player = this.#current_player;
    copy_cg.#game_state = this.#game_state;
    copy_cg.#white_king_moved = this.#white_king_moved;
    copy_cg.#white_can_castle0 = this.#white_can_castle0;
    copy_cg.#white_can_castle7 = this.#white_can_castle7;
    copy_cg.#black_king_moved = this.#black_king_moved;
    copy_cg.#black_can_castle0 = this.#black_can_castle0;
    copy_cg.#black_can_castle7 = this.#black_can_castle7;
    copy_cg.#can_en_passant = JSON.parse(JSON.stringify(this.#can_en_passant));
    copy_cg.#cached_available_moves = JSON.parse(
      JSON.stringify(this.#cached_available_moves)
    );
    copy_cg.#cached_color_targets = JSON.parse(
      JSON.stringify(this.#cached_color_targets)
    );
    return copy_cg;
  }

  getBoardCopy() {
    return JSON.parse(JSON.stringify(this.#board));
  }

  gameState() {
    return this.#game_state;
  }

  currentPlayer() {
    return this.#current_player;
  }

  getSquare(row, col) {
    if (!ChessGame.validSquare(row, col)) {
      throw new Error("Invalid square");
    }
    return this.#board[row][col];
  }

  getNumberOfPiecesInBoard(color = null) {
    if (color !== "white" && color !== "black") {
      return (
        this.getNumberOfPiecesInBoard("white") +
        this.getNumberOfPiecesInBoard("black")
      );
    }

    let count = 0;
    for (let row = 0; row < this.#board.length; row++) {
      for (let col = 0; col < this.#board[row].length; col++) {
        if (ChessGame.getPieceColor(this.getSquare(row, col)) === color) {
          count++;
        }
      }
    }
    return count;
  }

  getKingPosition(color) {
    let king = undefined;
    if (color === "white") {
      king = "k";
    }
    if (color === "black") {
      king = "K";
    }
    for (let row = 0; row < this.#board.length; row++) {
      for (let col = 0; col < this.#board[row].length; col++) {
        if (this.getSquare(row, col) === king) {
          return [row, col];
        }
      }
    }
    return [null, null];
  }

  isInCheck(color) {
    let king_pos = this.getKingPosition(color);
    for (let target of this.#allTargets(ChessGame.getOppositeColor(color))) {
      if (target[0] === king_pos[0] && target[1] === king_pos[1]) {
        return true;
      }
    }
    return false;
  }

  canMove() {
    for (let row = 0; row < this.#board.length; row++) {
      for (let col = 0; col < this.#board[row].length; col++) {
        if (this.availableMoves(row, col).length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  #cached_available_moves = {};
  availableMoves(row, col) {
    if (
      row in this.#cached_available_moves &&
      col in this.#cached_available_moves[row]
    ) {
      return this.#cached_available_moves[row][col];
    }

    let piece = this.getSquare(row, col);
    let color = ChessGame.getPieceColor(piece);
    if (color !== this.#current_player) {
      if (!(row in this.#cached_available_moves)) {
        this.#cached_available_moves[row] = {};
      }
      this.#cached_available_moves[row][col] = [];
      return this.#cached_available_moves[row][col];
    }

    let available_moves = [];
    let unchecked_targets = [];

    switch (piece.toUpperCase()) {
      case "P":
        // Normal move
        let mov_dir = color === "white" ? 1 : -1;
        if (this.getSquare(row + mov_dir, col) === null) {
          available_moves.push([row + mov_dir, col]);

          let has_not_moved =
            (color === "white" && row === 1) ||
            (color === "black" && row === 6);

          if (has_not_moved && this.getSquare(row + 2 * mov_dir, col) === null)
            available_moves.push([row + 2 * mov_dir, col]);
        }

        // Capture
        for (let target of this.#pawnTargets(row, col, color)) {
          let target_piece = this.getSquare(target[0], target[1]);
          let target_color = ChessGame.getPieceColor(target_piece);
          if (target_color === ChessGame.getOppositeColor(color)) {
            available_moves.push(target);
          }
        }

        // En passant
        for (let who_and_where of this.#can_en_passant) {
          let who = who_and_where[0];
          if (who[0] === row && who[1] === col)
            available_moves.push(who_and_where[1]);
        }
        break;
      case "N":
        unchecked_targets = this.#knightTargets(row, col);
        break;
      case "B":
        unchecked_targets = this.#bishopTargets(row, col);
        break;
      case "R":
        unchecked_targets = this.#rookTargets(row, col);
        break;
      case "Q":
        unchecked_targets = this.#queenTargets(row, col);
        break;
      case "K":
        unchecked_targets = this.#kingTargets(row, col);

        // Castling
        let king_has_moved;
        let can_castle0;
        let cal_castle7;
        if (color === "white") {
          king_has_moved = this.#white_king_moved;
          can_castle0 = this.#white_can_castle0;
          cal_castle7 = this.#white_can_castle7;
        } else {
          king_has_moved = this.#black_king_moved;
          can_castle0 = this.#black_can_castle0;
          cal_castle7 = this.#black_can_castle7;
        }
        if (king_has_moved) break;

        for (let bool_dir of [
          [can_castle0, -1],
          [cal_castle7, 1],
        ]) {
          let valid_castling = true;
          let can_castle = bool_dir[0];
          if (!can_castle) continue;
          let dir = bool_dir[1];

          for (let in_between_squares of [
            [row, col + dir],
            [row, col + 2 * dir],
          ]) {
            if (
              this.getSquare(in_between_squares[0], in_between_squares[1]) !==
              null
            ) {
              valid_castling = false;
              break;
            }
          }
          if (!valid_castling) continue;

          for (let enemy_target of this.#allTargets(
            ChessGame.getOppositeColor(color)
          )) {
            for (let king_squares of [
              [row, col],
              [row, col + dir],
              [row, col + 2 * dir],
            ]) {
              if (
                enemy_target[0] === king_squares[0] &&
                enemy_target[1] === king_squares[1]
              ) {
                valid_castling = false;
                break;
              }
              if (!valid_castling) break;
            }
          }

          if (!valid_castling) continue;
          available_moves.push([row, col + 2 * dir]);
        }
        break;
    }

    for (let target of unchecked_targets) {
      let target_piece = this.getSquare(target[0], target[1]);
      let target_color = ChessGame.getPieceColor(target_piece);
      if (target_color !== color) {
        available_moves.push(target);
      }
    }

    // Only allow moves that do not put the king in check
    available_moves = available_moves.filter((move) => {
      let game_copy = this.clone();
      game_copy.applyMove([row, col], move, "Q", false);
      return !game_copy.isInCheck(color);
    });

    if (!(row in this.#cached_available_moves)) {
      this.#cached_available_moves[row] = {};
    }
    this.#cached_available_moves[row][col] = available_moves;
    return this.#cached_available_moves[row][col];
  }

  allAvailableMoves() {
    for (let row = 0; row < this.#board.length; row++) {
      for (let col = 0; col < this.#board[row].length; col++) {
        this.availableMoves(row, col);
      }
    }

    this.#cached_available_moves;

    return JSON.parse(JSON.stringify(this.#cached_available_moves));
  }

  applyMove(from, to, promotion = "Q", update_state = true) {
    if (this.#game_state !== GAME_STATE.IN_PROGRESS) {
      throw new Error("Game already finished");
    }

    let piece = this.getSquare(from[0], from[1]);
    let color = ChessGame.getPieceColor(piece);
    if (color !== this.#current_player) {
      throw new Error("Invalid move");
    }

    this.#can_en_passant = [];
    this.#cached_available_moves = {};
    this.#cached_color_targets = {};
    let distance = Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]);

    if (piece.toUpperCase() == "K") {
      if (color === "white") {
        this.#white_king_moved = true;
        this.#white_can_castle0 = false;
        this.#white_can_castle7 = false;
      } else {
        this.#black_king_moved = true;
        this.#black_can_castle0 = false;
        this.#black_can_castle7 = false;
      }

      if (distance > 1 && from[0] === to[0]) {
        let rook_col = to[1] > from[1] ? 7 : 0;
        let rook_col_dest = rook_col === 0 ? 3 : 5;
        this.#board[from[0]][rook_col_dest] = this.getSquare(from[0], rook_col);
        this.#board[from[0]][rook_col] = null;
      }
    }

    if (piece.toUpperCase() === "P") {
      if ([0, 7].includes(to[0])) {
        if (!["Q", "R", "B", "N"].includes(promotion.toUpperCase())) {
          throw new Error("Invalid promotion piece");
        }
        // Will be moved later, as all other pieces
        this.#board[from[0]][from[1]] = ChessGame.pieceToColor(
          promotion,
          color
        );
      }

      if (distance === 2) {
        let mov_dir = to[0] > from[0] ? 1 : -1;
        if (from[1] === to[1]) {
          this.#can_en_passant = [
            [
              [to[0], to[1] - 1],
              [to[0] - mov_dir, to[1]],
            ],
            [
              [to[0], to[1] + 1],
              [to[0] - mov_dir, to[1]],
            ],
          ];
        } else if (this.getSquare(to[0], to[1]) === null) {
          this.#board[to[0] - mov_dir][to[1]] = null;
        }
      }
    }

    for (let invoved_move of [from, to]) {
      for (let rook_corner of [
        [0, 0],
        [0, 7],
        [7, 0],
        [7, 7],
      ]) {
        if (
          invoved_move[0] === rook_corner[0] &&
          invoved_move[1] === rook_corner[1]
        ) {
          let color = invoved_move[0] === 0 ? "white" : "black";
          if (color === "white") {
            if (invoved_move[1] === 0) {
              this.#white_can_castle0 = false;
            } else {
              this.#white_can_castle7 = false;
            }
          } else {
            if (invoved_move[1] === 0) {
              this.#black_can_castle0 = false;
            } else {
              this.#black_can_castle7 = false;
            }
          }
        }
      }
    }

    this.#board[to[0]][to[1]] = this.getSquare(from[0], from[1]);
    this.#board[from[0]][from[1]] = null;
    this.#current_player = ChessGame.getOppositeColor(this.#current_player);

    if (update_state) {
      if (!this.canMove()) {
        if (this.isInCheck(this.#current_player)) {
          this.#game_state =
            this.#current_player === "white"
              ? GAME_STATE.BLACK_WON
              : GAME_STATE.WHITE_WON;
        } else {
          this.#game_state = GAME_STATE.DRAW;
        }
      }
    }
  }
}

export { ChessGame, GAME_STATE };
