import * as THREE from "../libs/three.module.js";

class Board extends THREE.Object3D {
  static n_rows = 8;
  static n_cols = 8;
  static squareSize = 0.5 / 8;
  static squareHeight = this.squareSize / 3;
  static boardHeight = this.squareHeight;
  constructor() {
    super();
    this.squares = Array.from({ length: Board.n_rows }, () =>
      Array(Board.n_cols).fill(null)
    );

    for (let row = 0; row < Board.n_rows; row++) {
      for (let col = 0; col < Board.n_cols; col++) {
        const geometry = new THREE.BoxGeometry(
          Board.squareSize,
          Board.squareHeight,
          Board.squareSize
        );
        geometry.translate(0, -Board.squareHeight / 2, 0);
        const material = new THREE.MeshStandardMaterial({
          color: (row + col) % 2 === 0 ? 0xffffff : 0x000000,
        });
        const square = new THREE.Mesh(geometry, material);

        // Posición igual que antes
        square.position.set(
          col * Board.squareSize -
            (Board.n_rows / 2) * Board.squareSize +
            Board.squareSize / 2,
          0,
          row * Board.squareSize -
            (Board.n_cols / 2) * Board.squareSize +
            Board.squareSize / 2
        );

        const invertedcol = Board.n_cols - 1 - col;
        square.name = `square_${row}_${invertedcol}`;
        square.userData = { row, invertedcol };
        this.add(square);
        this.squares[row][invertedcol] = square;
      }
    }
  }
}

export { Board };
