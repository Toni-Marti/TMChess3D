import * as THREE from "../../libs/three.module.js";
import * as CSG from "../../libs/three-bvh-csg.js";
import { AbstractPiece } from "./AbstractPiece.js";
import * as TWEEN from "../../libs/tween.module.js";
class Pawn extends AbstractPiece {
  static height_piece = 1.2;
  constructor(material_set, row, col, color) {
    super(material_set, row, col, color, 0.3);
    this.pivot = new THREE.Object3D(); // Punto de giro (bisectriz)
    this.upperGroup = new THREE.Object3D(); // Grupo que se doblará

    var brazo1Geom = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10);
    var brazo3Geom = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 10);
    var brazo1 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo1.rotation.x = -Math.PI / 4;
    brazo1.position.set(-0.1, 0.3, -0.1);

    var brazo2 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo2.rotation.x = -Math.PI / 4;
    brazo2.position.set(0.1, 0.3, -0.1);

    var brazo3 = new CSG.Brush(brazo3Geom, material_set.piece_body);
    brazo3.rotation.z = Math.PI / 2;
    brazo3.position.set(0, 0.55, -0.35);

    var brazo4 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo4.rotation.x = Math.PI / 4;
    brazo4.position.set(0.1, 0.8, -0.1);

    var brazo5 = new CSG.Brush(brazo1Geom, material_set.piece_body);
    brazo5.rotation.x = Math.PI / 4;
    brazo5.position.set(-0.1, 0.8, -0.1);

    var brazo6 = new CSG.Brush(brazo3Geom, material_set.piece_body);
    brazo6.rotation.z = Math.PI / 2;
    brazo6.position.set(0, 1.05, 0.17);

    var boxGeom = new THREE.CylinderGeometry(0.1, 0.2, 0.1, 4);
    boxGeom.rotateY(Math.PI / 4);
    boxGeom.translate(0, 1.15, 0.4);
    var cilExtBrush = new CSG.Brush(boxGeom, material_set.piece_body);

    //  Helmet (LatheGeometry deformed with stretch marks)
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-0.25, 0);
    shape.quadraticCurveTo(-0.3, 0.15, 0, 0.3);

    const v2 = shape.extractPoints(16).shape;
    var helmetGeometry = new THREE.LatheGeometry(v2, 32);
    var position = helmetGeometry.attributes.position;
    const vertex = new THREE.Vector3();
    const frequency = 10;
    const amplitude = 0.1;

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      let angle = Math.atan2(vertex.z, vertex.x);
      let offset = Math.sin(angle * frequency) * amplitude;
      vertex.x += vertex.x * offset;
      vertex.z += vertex.z * offset;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    helmetGeometry.computeVertexNormals();

    helmetGeometry.translate(0, 1.05, 0.2);

    const helmet = new CSG.Brush(helmetGeometry, material_set.piece_body);

    var evaluador = new CSG.Evaluator();
    var cascoConHueco = evaluador.evaluate(
      helmet,
      cilExtBrush,
      CSG.SUBTRACTION
    );

    this.upperGroup.add(brazo4, brazo5, brazo6, cascoConHueco);
    this.pivot.position.set(0, 0.04, 0);
    this.pivot.add(this.upperGroup);

    this.add(brazo1);
    this.add(brazo2);
    this.add(brazo3);
    this.add(this.pivot);
  }

  update() {}

  bendTop(angle = Math.PI / 8, duration = 500) {
    new TWEEN.Tween(this.pivot.rotation)
      .to({ x: angle }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  }

  unbendTop(duration = 500) {
    new TWEEN.Tween(this.pivot.rotation)
      .to({ x: 0 }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  }

  squashBouncesOverCaptured(
    piece,
    captured,
    bounceCount = 3,
    squashStep = 0.33,
    squashDuration = 600,
    onComplete = null
  ) {
    let currentBounce = 0;
    let bounceHeight = 0.1;
    const originalY = piece.position.y;

    if (!captured.userData.originalScale) {
      captured.userData.originalScale = captured.scale.clone();
      captured.userData.currentSquashY = captured.scale.y;
    }

    const doBounce = () => {
      if (currentBounce >= bounceCount) {
        new TWEEN.Tween(piece.position)
          .to({ y: 0 }, squashDuration)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();

        new TWEEN.Tween(captured.scale)
          .to({ y: 0 }, squashDuration)
          .easing(TWEEN.Easing.Cubic.InOut)
          .onComplete(() => {
            if (piece.unbendTop) piece.unbendTop();
            if (onComplete) onComplete();
          })
          .start();

        return;
      }

      const peakY =
        originalY - (originalY / bounceCount) * currentBounce + bounceHeight;
      const fallY = originalY - (originalY / bounceCount) * (currentBounce + 1);

      new TWEEN.Tween(piece.position)
        .to({ y: peakY }, squashDuration / 2)
        .easing(TWEEN.Easing.Cubic.Out)
        .onStart(() => {
          if (piece.unbendTop) piece.unbendTop();
        })
        .onComplete(() => {
          new TWEEN.Tween(piece.position)
            .to({ y: fallY }, squashDuration / 2)
            .easing(TWEEN.Easing.Cubic.In)
            .onStart(() => {
              if (piece.bendTop) piece.bendTop();
            })
            .onComplete(() => {
              captured.userData.currentSquashY *= squashStep;

              new TWEEN.Tween(captured.scale)
                .to({ y: captured.userData.currentSquashY }, squashDuration / 2)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

              currentBounce++;
              doBounce();
            })
            .start();
        })
        .start();
    };

    doBounce();
  }

  capture(captured_piece, all_other_pieces, ending_pos, duration, my_scene) {
    const desired_duration = this.getDesiredCaptureDuration(
      captured_piece,
      ending_pos,
      my_scene
    );

    const factor = desired_duration / duration;
    const captured_final_pos = my_scene.getNextLostPiecePosition(
      captured_piece.color
    );

    new TWEEN.Tween(this.position)
      .to({ x: captured_piece.position.x, z: captured_piece.position.z }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        this.squashBouncesOverCaptured(
          this,
          captured_piece,
          3,
          0.33,
          1000,
          () => {
            new TWEEN.Tween(this.position)
              .to({ x: ending_pos.x, z: ending_pos.z }, 500)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onComplete(() => {
                const captured_piece_duration =
                  (this.position.distanceTo(captured_final_pos) /
                    AbstractPiece.SPEED) *
                  factor;

                my_scene.positionPieceAsLost(
                  captured_piece,
                  captured_piece.color,
                  captured_piece_duration
                );
              })
              .start();
          }
        );
      })
      .start();
  }
}

export { Pawn };
