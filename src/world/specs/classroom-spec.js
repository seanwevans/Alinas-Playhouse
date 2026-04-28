export const classroomFrontPlacements = [
  { dimensions: { width: 12, height: 1.5, depth: 0.1 }, position: { x: 20, y: 2.0, z: -9.7 }, colorKey: "classFloor" },
  { dimensions: { width: 12, height: 0.05, depth: 0.2 }, position: { x: 20, y: 1.2, z: -9.6 }, colorKey: "deskPlatform" },
  { dimensions: { width: 4, height: 0.2, depth: 2 }, position: { x: 20, y: 1.5, z: -7 }, colorKey: "deskBase" },
  { dimensions: { width: 0.2, height: 1.5, depth: 1.8 }, position: { x: 18.2, y: 0.75, z: -7 }, colorKey: "deskBase" },
  { dimensions: { width: 0.2, height: 1.5, depth: 1.8 }, position: { x: 21.8, y: 0.75, z: -7 }, colorKey: "deskBase" }
];

export const classroomChairPlacements = [{ position: { x: 20, z: -5.5 }, colorKey: "chairBlue", rotationY: 0 }];

export const classroomDeskGrid = {
  rows: 2,
  cols: 3,
  startX: 14.5,
  startZ: -2,
  spacingX: 5.5,
  spacingZ: 5
};
