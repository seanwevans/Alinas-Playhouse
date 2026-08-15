// Ownership: attic (third floor) structure builder, driven by zone spec data.
import { ATTIC_BOX_SPECS } from "../zone-specs.js";
import { buildFloorFromSpecs } from "../build-floor-specs.js";

export const ATTIC_FADE_LEVEL = 2;

export function buildAtticZone(ecs, scene, world, config) {
  const { layout } = config;
  const fy = layout.attic.floorY;
  const wy = fy + layout.attic.wallYOffset;

  buildFloorFromSpecs(ecs, scene, world, ATTIC_BOX_SPECS, fy, wy, ATTIC_FADE_LEVEL);

  return {};
}
