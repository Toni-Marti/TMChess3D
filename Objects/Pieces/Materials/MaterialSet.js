class MaterialSet {
  constructor(piece_body, cloth, metal, crystal) {
    this.piece_body = piece_body;
    this.piece_body_flat = this.piece_body.clone();
    this.piece_body_flat.flatShading = true;
    this.piece_body_flat.needsUpdate = true;
    this.cloth = cloth;
    this.metal = metal;
    this.crystal = crystal;
  }

  clone() {
    return new MaterialSet(
      this.piece_body.clone(),
      this.cloth.clone(),
      this.metal.clone(),
      this.crystal.clone()
    );
  }
}

export { MaterialSet };
