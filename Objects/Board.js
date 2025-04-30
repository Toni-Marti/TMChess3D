import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Board extends THREE.Object3D {
  constructor() {
    super();

    const size = 8;
    const squareSize = 1;
    const board = new THREE.Group();

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
        const material = new THREE.MeshStandardMaterial({
          color: (row + col) % 2 === 0 ? 0xFFFFFF : 0x000000,
        });
        const square = new THREE.Mesh(geometry, material);

        // Posición igual que antes
        square.position.set(
          col * squareSize - (size / 2) * squareSize,
          0,
          row * squareSize - (size / 2) * squareSize
        );

        const invertedcol = size - 1 - col;
        square.name = `square_${row}_${invertedcol}`;
        square.userData = { row, invertedcol };
        board.add(square);
      }
    }

    this.add(board);
  }
}

export { Board };
