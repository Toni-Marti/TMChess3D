import * as THREE from "three";

class Objeto extends THREE.Object3D {
  constructor() {
    super();

    this.material = new THREE.MeshNormalMaterial();

    this.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.material));
  }

  update() {}
}

export { Objeto };
