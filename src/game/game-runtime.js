// Ownership: per-frame runtime step orchestration for physics, systems, render, and input.
import { PARAMS } from "../config/game-config.js";

export function runFrame(game) {
  game.input.beginFrame();
  const deltaTime = game.clock.getDelta();

  game.physicsWorld.step(PARAMS.Physics.timeStep, deltaTime, PARAMS.Physics.maxSubSteps);

  for (const sys of game.systems) {
    sys.update(deltaTime);
  }

  game.renderer.render(game.scene, game.camera);
  game.input.endFrame();
}
