// Ownership: shared translation of declarative floor box specs into faded elevated geometry.
import { COLORS } from "../config/game-config.js";
import { buildUpstairsBox } from "./build-primitives.js";

export function resolveYToken(token, floorY, wallY) {
  if (typeof token === "number") return token;
  if (token === "wy") return wallY;
  if (token.startsWith("fy+")) return floorY + Number(token.slice(3));
  return floorY;
}

export function buildFloorFromSpecs(ecs, scene, world, specs, floorY, wallY, level) {
  specs.forEach(([w, h, d, x, yToken, z, colorKey]) => {
    const y = resolveYToken(yToken, floorY, wallY);
    buildUpstairsBox(ecs, scene, world, w, h, d, x, y, z, COLORS[colorKey], level);
  });
}
