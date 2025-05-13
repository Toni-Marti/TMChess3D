import * as THREE from "../libs/three.module.js";

class Board extends THREE.Object3D {
  constructor() {
    super();

    const size = 8;
    const squareSize = 0.5 / 8;
    const squareHeight = 0.02;
    const board = new THREE.Group();
    this.squares = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const geometry = new THREE.BoxGeometry(
          squareSize,
          squareHeight,
          squareSize
        );
        const material = new THREE.MeshStandardMaterial({
          color: (row + col) % 2 === 0 ? 0xffffff : 0x000000,
        });
        const square = new THREE.Mesh(geometry, material);

        // Posición igual que antes
        square.position.set(
          col * squareSize - (size / 2) * squareSize + squareSize / 2,
          -squareHeight / 2,
          row * squareSize - (size / 2) * squareSize + squareSize / 2
        );

        const invertedcol = size - 1 - col;
        square.name = `square_${row}_${invertedcol}`;
        square.userData = { row, invertedcol };
        board.add(square);
        this.squares[row][7-col] = square;
      }
    }

    this.add(board);
  }
}

export { Board };
