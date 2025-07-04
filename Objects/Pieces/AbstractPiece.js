import * as THREE from "../../libs/three.module.js";
import * as TWEEN from "../../libs/tween.module.js";
import { Base } from "./base.js";

class AbstractPiece extends THREE.Object3D {
  static SPEED = 1 / 900;
  constructor(material_set, row, col, color, height, radius = 0.4) {
    super();
    this.material_set = material_set;
    this.row = row;
    this.col = col;
    this.color = color;
    this.base = new Base(material_set, radius);
    this.height = height;
    this.add(this.base);
  }

  update() {}

  async descend_to(to, duration) {
    /**
     * Named like this because it was thought to be used for moving a piece
     * downwards, doesn't force it.
     */
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

    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  async arc_to(to, duration, height) {
    const starting_pos = this.position.clone();

    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      this.position.x = starting_pos.x + (to.x - starting_pos.x) * t;
      this.position.z = starting_pos.z + (to.z - starting_pos.z) * t;

      this.position.y =
        starting_pos.y +
        (to.y - starting_pos.y) * t +
        height * Math.sin(Math.PI * t);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  async move(to, duration) {
    await this.descend_to(to, duration);
  }

  getDesiredCaptureDuration(captured_piece, ending_pos, my_scene) {
    const captured_color = captured_piece.color;
    const captured_final_pos =
      my_scene.getNextLostPiecePosition(captured_color);
    const captured_piece_duration =
      captured_piece.position.distanceTo(captured_final_pos) /
      AbstractPiece.SPEED;

    const my_piece_duration =
      this.position.distanceTo(ending_pos) / AbstractPiece.SPEED;

    return Math.max(captured_piece_duration, my_piece_duration);
  }

  async capture(
    capturing_piece,
    all_other_pieces,
    ending_pos,
    duration,
    my_scene
  ) {
    const desired_duration = this.getDesiredCaptureDuration(
      capturing_piece,
      ending_pos,
      my_scene
    );
    const factor = duration / desired_duration;
    const this_duration =
      (this.position.distanceTo(ending_pos) / AbstractPiece.SPEED) * factor;
    const captured_final_pos = my_scene.getNextLostPiecePosition(
      capturing_piece.color
    );
    const captured_piece_duration =
      (capturing_piece.position.distanceTo(captured_final_pos) /
        AbstractPiece.SPEED) *
      factor;

    my_scene.positionPieceAsLost(
      capturing_piece,
      capturing_piece.color,
      captured_piece_duration
    );
    this.descend_to(ending_pos, this_duration);

    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(this_duration, captured_piece_duration))
    );
  }
}

export { AbstractPiece };
