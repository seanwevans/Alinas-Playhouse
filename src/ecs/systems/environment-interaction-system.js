import * as THREE from "https://esm.sh/three";

export class EnvironmentInteractionSystem {
  constructor(handles, params) {
    this.handles = handles;
    this.params = params;
  }

  update() {
    if (!this.handles.fridgeDoorGrp) return;

    this.handles.fridgeDoorGrp.rotation.y = THREE.MathUtils.lerp(
      this.handles.fridgeDoorGrp.rotation.y,
      this.handles.kitchenState.isFridgeOpen
        ? this.params.World.fridgeOpenAngle
        : 0,
      this.params.World.fridgeLerp
    );
  }
}
