import * as THREE from "../../libs/three.module.js";
import * as THREE_SHAPES from "../../our_libs/three_helpers/shapes.js";
import * as GEOMETRY_SHAPES from "../../our_libs/geometry/shapes.js";
import Point from "../../our_libs/geometry/point.js";
import { Base } from "./base.js";
import { mulberry32 } from "../../our_libs/utility/utils.js";

class Rook extends THREE.Object3D {
  static base = { height: 0.25, diameter: 0.7 };
  static body = {
    height: 1 - Rook.base.height,
    bottom_diameter: 0.6,
    top_diameter: 0.35,
    inner_radius: 0.1,
    levels_relative_height: [20, 19, 18, 17, 16, 15],
    average_arc_length_per_block: 0.2,
    arc_separation: 0.0125,
    roundness: 0.01,
    level_separation: 0.0,
    min_relative_width: 1,
    max_relative_width: 2,
  };
  static top = {
    height: 1.3 - Rook.base.height - Rook.body.height,
    bottom_diameter: 0.4,
    top_diameter: 0.6,
    three_levels_relative_height: [4, 4, 5],
    inner_radius: 0.18,
    window_width: 0.1,
  };

  constructor(material_set) {
    super();
    this.rng = mulberry32(0);
    this.base = new Base(
      material_set,
      Rook.base.diameter / 2,
      Rook.base.height
    );
    this.add(this.base);
    this.material_set = material_set;
    this.body_levels = this.createBodyLevels();
    this.body_levels.forEach((level) =>
      level.forEach((block) => this.add(block))
    );
    this.top = this.createTop();
    this.add(this.top);
  }

  static createBlock(
    bottom_radius,
    top_radius,
    inner_radius,
    height,
    roundness,
    arc_angle,
    material
  ) {
    let profile_vertices = [
      new Point(0, 0),
      new Point(0, height),
      new Point(top_radius - inner_radius, height),
      new Point(bottom_radius - inner_radius, 0),
    ];
    profile_vertices.forEach(
      (e, i) =>
        (profile_vertices[i] = new Point(
          e.x - (bottom_radius - inner_radius),
          e.y
        ).rotate(Math.PI / 2))
    );

    let steps = Math.max(2, Math.ceil(arc_angle / (2 * Math.PI * (1 / 50))));

    let shape = THREE_SHAPES.createRoundedPolygon(profile_vertices, roundness);
    let arc = GEOMETRY_SHAPES.arc(
      -arc_angle / 2,
      arc_angle / 2,
      bottom_radius,
      steps
    );

    let pts = [];
    arc.forEach((e) => pts.push(new THREE.Vector3(e.x, 0, e.y)));

    let path = new THREE.CatmullRomCurve3(pts);
    let options = { steps: steps + 1, curveSegments: 5, extrudePath: path };

    return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, options), material);
  }

  createConeBlockLevels(
    staring_height,
    ending_height,
    bottom_diameter,
    top_diameter,
    inner_radius,
    levels_relative_height,
    average_arc_length_per_block,
    level_separation,
    arc_separation,
    roundness,
    min_relative_width = 1,
    max_relative_width = 2
  ) {
    let height = ending_height - staring_height;
    let sum_relative_height = levels_relative_height.reduce((a, b) => a + b);
    let separation_perc =
      (level_separation * (levels_relative_height.length - 1)) / height;
    sum_relative_height +=
      (separation_perc * sum_relative_height) / (1 - separation_perc);

    let normalized_heights = [];
    levels_relative_height.forEach((e) => {
      normalized_heights.push(e / sum_relative_height);
    });

    let levels = [];
    let cumulated_height = 0;
    for (let level_i = 0; level_i < normalized_heights.length; level_i++) {
      levels.push([]);
      let bottom_radius =
        top_diameter +
        (bottom_diameter - top_diameter) * (1 - cumulated_height);
      bottom_radius /= 2;
      let total_block_arc = average_arc_length_per_block + arc_separation;
      let current_level_circumference = 2 * Math.PI * bottom_radius;
      let blocks = Math.max(
        1,
        Math.round(current_level_circumference / total_block_arc)
      );
      let relative_arcs = [];
      for (let block_i = 0; block_i < blocks; block_i++) {
        relative_arcs.push(
          min_relative_width +
            (max_relative_width - min_relative_width) * this.rng()
        );
      }
      let normalized_arcs = [];
      let total_relative_arcs = relative_arcs.reduce((a, b) => a + b);
      relative_arcs.forEach((e) => {
        normalized_arcs.push(e / total_relative_arcs);
      });

      let top_radius =
        top_diameter +
        (bottom_diameter - top_diameter) *
          (1 - (cumulated_height + normalized_heights[level_i]));
      top_radius /= 2;
      let gap_angle =
        (arc_separation / current_level_circumference) * 2 * Math.PI;
      let last_angle = this.rng() * Math.PI * 2;
      for (let block_i = 0; block_i < normalized_arcs.length; block_i++) {
        let block = Rook.createBlock(
          bottom_radius,
          top_radius,
          inner_radius,
          normalized_heights[level_i] * height,
          roundness,
          2 * Math.PI * normalized_arcs[block_i] - gap_angle,
          this.material_set.piece_body
        );
        let block_rotation = 2 * Math.PI * normalized_arcs[block_i];
        block.rotation.y = last_angle + block_rotation / 2;
        last_angle += block_rotation;
        block.position.y += staring_height + height * cumulated_height;
        levels[level_i].push(block);
      }
      cumulated_height +=
        normalized_heights[level_i] + level_separation / height;
    }

    return levels;
  }

  createBase() {
    let base_geometry = new THREE.CylinderGeometry(
      Rook.base.diameter / 2,
      Rook.base.diameter / 2,
      Rook.base.height,
      32
    );
    let base = new THREE.Mesh(base_geometry, this.material_set.piece_body);
    base.position.y += Rook.base.height / 2;
    return base;
  }

  createBodyLevels() {
    return this.createConeBlockLevels(
      Rook.base.height,
      Rook.base.height + Rook.body.height,
      Rook.body.bottom_diameter,
      Rook.body.top_diameter,
      Rook.body.inner_radius,
      Rook.body.levels_relative_height,
      Rook.body.average_arc_length_per_block,
      Rook.body.level_separation,
      Rook.body.arc_separation,
      Rook.body.roundness
    );
  }

  createTop() {
    let top = new THREE.Object3D();
    let sum_levels_relative_height =
      Rook.top.three_levels_relative_height.reduce((a, b) => a + b);
    let levels_height = [];
    Rook.top.three_levels_relative_height.forEach((rel_height) => {
      levels_height.push(
        (Rook.top.height * rel_height) / sum_levels_relative_height
      );
    });

    let level1_starting_height = Rook.base.height + Rook.body.height;
    let level1_ending_height = level1_starting_height + levels_height[0];
    let levels1 = this.createConeBlockLevels(
      level1_starting_height,
      level1_ending_height,
      Rook.top.bottom_diameter,
      Rook.top.top_diameter,
      0,
      [1],
      Rook.body.average_arc_length_per_block,
      0,
      0.0035,
      Rook.body.roundness
    );
    levels1.forEach((level) =>
      level.forEach((block) => {
        top.add(block);
      })
    );

    let level2_starting_height = level1_ending_height;
    let level2_ending_height = level2_starting_height + levels_height[1];
    let levels2 = this.createConeBlockLevels(
      level2_starting_height,
      level2_ending_height,
      Rook.top.top_diameter,
      Rook.top.top_diameter,
      0,
      [1],
      Rook.body.average_arc_length_per_block,
      0,
      Rook.body.arc_separation,
      Rook.body.roundness
    );
    levels2.forEach((level) =>
      level.forEach((block) => {
        top.add(block);
      })
    );

    let level3_starting_height = level2_ending_height;
    let level3_ending_height = level3_starting_height + levels_height[2];
    let block_arc_length =
      (Rook.top.top_diameter * Math.PI) / 4 - Rook.top.window_width;
    let levels3 = this.createConeBlockLevels(
      level3_starting_height,
      level3_ending_height,
      Rook.top.top_diameter,
      Rook.top.top_diameter,
      Rook.top.inner_radius,
      [1],
      block_arc_length,
      0,
      Rook.top.window_width,
      Rook.body.roundness,
      1,
      1
    );
    levels3.forEach((level) =>
      level.forEach((block) => {
        top.add(block);
      })
    );

    return top;
  }

  update() {}
}

export { Rook };
