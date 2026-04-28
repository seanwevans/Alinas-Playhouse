import { PARAMS } from "../../config/params.js";

export class StudentAnimationSystem {
  constructor(ecs) {
    this.query = ecs.with("renderable", "physicsBody", "studentAnimator");
  }

  update() {
    const time = Date.now() * PARAMS.Player.breathSpeed;
    for (const entity of this.query) {
      const baseY = entity.physicsBody.body.position.y;
      entity.renderable.mesh.position.y = baseY + Math.sin(time + entity.studentAnimator.offsetIndex) * PARAMS.Player.breathAmp;
    }
  }
}
