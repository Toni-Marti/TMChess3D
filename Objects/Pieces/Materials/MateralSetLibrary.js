import { MaterialSet } from "./MaterialSet";

classic_white = new MaterialSet(
  // Main piece body - ivory white
  new THREE.MeshStandardMaterial({
    color: 0xfffff0,
    roughness: 0.3,
    metalness: 0.1,
  }),

  new THREE.MeshStandardMaterial({
    color: 0xadd8e6,
    roughness: 0.8,
    metalness: 0.0,
  }),

  new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.2,
    metalness: 0.9,
  }),

  new THREE.MeshStandardMaterial({
    color: 0xf8f8ff,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.6,
  })
);

classic_black = new MaterialSet(
  new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.3,
    metalness: 0.1,
  }),

  new THREE.MeshStandardMaterial({
    color: 0xaa0000,
    roughness: 0.8,
    metalness: 0.0,
  }),

  new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.2,
    metalness: 0.9,
  }),

  new THREE.MeshStandardMaterial({
    color: 0x252525,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.7,
  })
);

export { classic_white, classic_black };
