export const chairRecipe = [
  { width: 0.8, height: 0.2, depth: 0.8, x: 0, y: 0.8, z: 0 },
  { width: 0.12, height: 0.8, depth: 0.12, x: -0.32, y: 0.4, z: -0.32 },
  { width: 0.12, height: 0.8, depth: 0.12, x: 0.32, y: 0.4, z: -0.32 },
  { width: 0.12, height: 0.8, depth: 0.12, x: -0.32, y: 0.4, z: 0.32 },
  { width: 0.12, height: 0.8, depth: 0.12, x: 0.32, y: 0.4, z: 0.32 },
  { width: 0.8, height: 0.9, depth: 0.15, x: 0, y: 1.35, z: -0.325 }
];

export const deskRecipe = [
  { width: 1.8, height: 0.1, depth: 1.5, x: 0, y: 1.2, z: 0, colorKey: "deskTop" },
  { width: 1.8, height: 0.4, depth: 1.3, x: 0, y: 1.0, z: 0, colorKey: "deskWood" },
  {
    width: 0.1,
    height: 1.2,
    depth: 0.1,
    x: -0.9,
    y: 0.6,
    z: -0.6,
    colorKey: "deskLeg"
  },
  {
    width: 0.1,
    height: 1.2,
    depth: 0.1,
    x: 0.9,
    y: 0.6,
    z: -0.6,
    colorKey: "deskLeg"
  },
  {
    width: 0.1,
    height: 1.2,
    depth: 0.1,
    x: -0.9,
    y: 0.6,
    z: 0.6,
    colorKey: "deskLeg"
  },
  {
    width: 0.1,
    height: 1.2,
    depth: 0.1,
    x: 0.9,
    y: 0.6,
    z: 0.6,
    colorKey: "deskLeg"
  }
];

export const stoolRecipe = [
  { width: 0.8, height: 0.1, depth: 0.8, x: 0, y: 1.0, z: 0, colorKey: "stoolSeat" },
  {
    width: 0.1,
    height: 1.0,
    depth: 0.1,
    x: -0.35,
    y: 0.5,
    z: -0.35,
    colorKey: "stoolLeg"
  },
  {
    width: 0.1,
    height: 1.0,
    depth: 0.1,
    x: 0.35,
    y: 0.5,
    z: -0.35,
    colorKey: "stoolLeg"
  },
  {
    width: 0.1,
    height: 1.0,
    depth: 0.1,
    x: -0.35,
    y: 0.5,
    z: 0.35,
    colorKey: "stoolLeg"
  },
  {
    width: 0.1,
    height: 1.0,
    depth: 0.1,
    x: 0.35,
    y: 0.5,
    z: 0.35,
    colorKey: "stoolLeg"
  }
];

export function stairsRecipe(stairsLayout) {
  return Array.from({ length: stairsLayout.count }, (_, i) => ({
    width: stairsLayout.depth,
    height: stairsLayout.height,
    depth: stairsLayout.width,
    x: stairsLayout.startX + i * stairsLayout.depth,
    y: stairsLayout.height / 2 + i * stairsLayout.height,
    z: stairsLayout.startZ,
    colorKey: "stairs"
  }));
}
