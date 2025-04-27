import * as THREE from '../../libs/three.module.js'
import * as CSG from '../../libs/three-bvh-csg.js'
import { Base } from './base.js'

class Abstract_piece extends THREE.Object3D {
  constructor(material_set, radius) {
    super();

    this.material_set = material_set;
    this.add(new Base(material_set, radius));
}


  update() {}
}

export { Abstract_piece };
