// Ownership: top-level zone composition order + shared environment handle aggregation.
import { COLORS, LAYOUT, PARAMS } from "../config/game-config.js";
import { buildBedroomZone } from "./zones/bedroom-zone.js";
import { buildClassroomZone } from "./zones/classroom-zone.js";
import { buildKitchenZone } from "./zones/kitchen-zone.js";
import { buildStaircaseZone } from "./zones/staircase-zone.js";
import { buildUpstairsZone } from "./zones/upstairs-zone.js";

export function buildEnvironment(ecs, scene, world, config = {}) {
  const mergedConfig = {
    params: PARAMS,
    colors: COLORS,
    layout: LAYOUT,
    gameRef: null,
    ...config
  };

  const bedroomHandles = buildBedroomZone(ecs, scene, world, mergedConfig);
  const classroomHandles = buildClassroomZone(ecs, scene, world, mergedConfig);
  const kitchenHandles = buildKitchenZone(ecs, scene, world, mergedConfig);
  const staircaseHandles = buildStaircaseZone(ecs, scene, world, mergedConfig);
  const upstairsHandles = buildUpstairsZone(ecs, scene, world, mergedConfig);

  return {
    ...bedroomHandles,
    ...classroomHandles,
    ...kitchenHandles,
    ...staircaseHandles,
    ...upstairsHandles
  };
}
