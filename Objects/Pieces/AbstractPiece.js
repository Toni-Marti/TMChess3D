import * as THREE from "../../libs/three.module.js";
import * as TWEEN from "../../libs/tween.module.js";
import { Base } from "./base.js";

class AbstractPiece extends THREE.Object3D {
  constructor(material_set, row, col, radius = 0.4) {
    super();
    this.material_set = material_set;
    this.row = row;
    this.col = col;
    this.add(new Base(material_set, radius));
  }

  update() {}

  move(to, duration) {
    const starting_pos = this.position.clone();

    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      this.position.x =
        starting_pos.x +
        (to.x - starting_pos.x) * TWEEN.Easing.Quadratic.Out(t);
      this.position.z =
        starting_pos.z +
        (to.z - starting_pos.z) * TWEEN.Easing.Quadratic.Out(t);
      this.position.y =
        starting_pos.y + (to.y - starting_pos.y) * TWEEN.Easing.Quadratic.In(t);

      
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  capture(piece, all_other_pieces, captured_ending_pos, time, camera) {}
}

export { AbstractPiece };
