import { ChessGame } from "../our_libs/chess/game_handler.js";

document.addEventListener("DOMContentLoaded", function () {
  initBoard();
});

const game_squares = [];
let game = new ChessGame();
let selected = null;

function initBoard() {
  const board = document.getElementById("board");

  for (let r = 0; r < 8; r++) {
    let row = [];
    for (let c = 0; c < 8; c++) {
      const button = document.createElement("button");

      button.addEventListener("click", function () {
        handleSquareClick(r, c);
      });

      row.push(button);
    }
    game_squares.push(row);
  }

  draw();

  for (let row = 7; row >= 0; row--) {
    for (let col = 0; col < 8; col++) {
      const button = game_squares[row][col];
      board.appendChild(button);
    }
  }
}

function letterToEmoji(l) {
  switch (l.toUpperCase()) {
    case "P":
      return "♟";
    case "R":
      return "♜";
    case "N":
      return "♞";
    case "B":
      return "♝";
    case "Q":
      return "♛";
    case "K":
      return "♚";
    default:
      return "";
  }
}

function draw() {
  document.getElementById("turn").textContent = "Turn: " + game.currentPlayer();
  document.getElementById("state").textContent = "State: " + game.gameState();

  for (let r = 7; r >= 0; r--) {
    for (let c = 0; c < 8; c++) {
      const button = game_squares[r][c];

      const isLight = (r + c) % 2 === 1;
      const squareColor = isLight ? "white" : "black";

      button.className = ` square ${squareColor}-square`;

      let piece = game.getSquare(r, c);
      let color = ChessGame.getPieceColor(piece);
      if (piece !== null) {
        button.textContent = letterToEmoji(piece);
        button.className += ` piece ${color}-piece`;

        if (color === game.currentPlayer()) {
          button.className += " active";
        }
      } else {
        button.textContent = "";
      }
    }
  }
}

function setSelected(new_selected) {
  if (selected !== null) {
    let moves = game.availableMoves(selected[0], selected[1]);
    for (let move of moves) {
      let r = move[0];
      let c = move[1];
      game_squares[r][c].classList.remove("highlight");
    }
  }

  if (new_selected !== null) {
    let moves = game.availableMoves(new_selected[0], new_selected[1]);
    for (let move of moves) {
      let r = move[0];
      let c = move[1];
      game_squares[r][c].classList.add("highlight");
    }
  }

  selected = new_selected;
}

function handleSquareClick(row, col) {
  let square = game_squares[row][col];
  if (square.classList.contains("active")) {
    setSelected([row, col]);
  } else {
    if (square.classList.contains("highlight")) {
      game.applyMove([selected[0], selected[1]], [row, col]);
      draw();
      setSelected(null);
    }

    setSelected(null);
  }
}
