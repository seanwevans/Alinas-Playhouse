// Ownership: upstairs structure builder, driven by zone spec data.
import { COLORS } from "../../config/game-config.js";
import { UPSTAIRS_BOX_SPECS } from "../zone-specs.js";
import { buildUpstairsBox } from "../build-primitives.js";

function resolveYToken(token, fy, wy) {
  if (typeof token === "number") return token;
  if (token === "wy") return wy;
  if (token.startsWith("fy+")) return fy + Number(token.slice(3));
  return fy;
}

export function buildUpstairsZone(ecs, scene, world, config) {
  const { layout } = config;
  const fy = layout.upstairs.floorY;
  const wy = fy + layout.upstairs.wallYOffset;

  UPSTAIRS_BOX_SPECS.forEach(([w, h, d, x, yToken, z, colorKey]) => {
    const y = resolveYToken(yToken, fy, wy);
    buildUpstairsBox(ecs, scene, world, w, h, d, x, y, z, COLORS[colorKey]);
  });

  return {};
}
