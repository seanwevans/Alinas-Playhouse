import * as CANNON from "https://esm.sh/cannon-es";
import { PARAMS } from "../../config/game-config.js";

export function buildPlayerBody({ x, z, isDynamic = true }) {
  const shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.9, 0.3));
  const body = new CANNON.Body({
    mass: isDynamic ? PARAMS.Player.mass : 0,
    shape,
    fixedRotation: true
  });

  body.position.set(x, isDynamic ? 3 : 0.95, z);
  return body;
}
