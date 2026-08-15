// Ownership: upstairs (second floor) structure builder, driven by zone spec data.
import { UPSTAIRS_BOX_SPECS } from "../zone-specs.js";
import { buildFloorFromSpecs } from "../build-floor-specs.js";

export const UPSTAIRS_FADE_LEVEL = 1;

export function buildUpstairsZone(ecs, scene, world, config) {
  const { layout } = config;
  const fy = layout.upstairs.floorY;
  const wy = fy + layout.upstairs.wallYOffset;

  buildFloorFromSpecs(
    ecs,
    scene,
    world,
    UPSTAIRS_BOX_SPECS,
    fy,
    wy,
    UPSTAIRS_FADE_LEVEL
  );

  return {};
}
