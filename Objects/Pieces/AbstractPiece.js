import * as THREE from "../../libs/three.module.js";
import * as CSG from "../../libs/three-bvh-csg.js";
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

  move(to, time) {}

  capture(piece, all_other_pieces, captured_ending_pos, time, camera) {}
}

export { AbstractPiece };
