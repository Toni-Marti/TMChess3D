import * as THREE from '../../libs/three.module.js'


class Base extends THREE.Object3D {
    constructor(material_set, baseRadius = 0.4, baseHeight = 0.25) {
        super();
        // ----- BASE -----
        this.baseRadius = baseRadius;
        this.baseHeight = baseHeight;

        var material = new THREE.MeshNormalMaterial({ flatShading: false });
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(this.baseRadius, this.baseRadius, this.baseHeight, 64),
            material_set.piece_body
        );
        mesh.position.y = this.baseHeight / 2;

        this.add(mesh);
    }
}

export { Base };