export const bedroomBoxPlacements = [
  { dimensions: { width: 3, height: 0.5, depth: 4 }, position: { x: -6, y: 0.5, z: -6 }, colorKey: "bedBase" },
  { dimensions: { width: 3, height: 0.2, depth: 4.2 }, position: { x: -6, y: 0.1, z: -6 }, colorKey: "bedWood" },
  { dimensions: { width: 2, height: 0.15, depth: 1 }, position: { x: -6, y: 0.825, z: -7.2 }, colorKey: "bedSheet" },
  { dimensions: { width: 2, height: 0.2, depth: 2 }, position: { x: 4, y: 1.5, z: 0 }, colorKey: "bedTrim" },
  { dimensions: { width: 0.2, height: 1.5, depth: 0.2 }, position: { x: 3.2, y: 0.75, z: 0.8 }, colorKey: "bedTrim" },
  { dimensions: { width: 0.2, height: 1.5, depth: 0.2 }, position: { x: 4.8, y: 0.75, z: 0.8 }, colorKey: "bedTrim" },
  { dimensions: { width: 0.2, height: 1.5, depth: 0.2 }, position: { x: 3.2, y: 0.75, z: -0.8 }, colorKey: "bedTrim" },
  { dimensions: { width: 0.2, height: 1.5, depth: 0.2 }, position: { x: 4.8, y: 0.75, z: -0.8 }, colorKey: "bedTrim" },
  { dimensions: { width: 3.5, height: 0.2, depth: 1.8 }, position: { x: 6, y: 1.5, z: -8 }, colorKey: "pcDesk" },
  { dimensions: { width: 0.2, height: 1.5, depth: 1.6 }, position: { x: 4.5, y: 0.75, z: -8 }, colorKey: "pcDesk" },
  { dimensions: { width: 0.2, height: 1.5, depth: 1.6 }, position: { x: 7.5, y: 0.75, z: -8 }, colorKey: "pcDesk" }
];

export const bedroomChairPlacements = [
  { position: { x: 4, z: 1.5 }, colorKey: "chairBlue", rotationY: Math.PI },
  { position: { x: 4, z: -1.5 }, colorKey: "chairBlue", rotationY: 0 },
  { position: { x: 6, z: -6.5 }, colorKey: "chairBlue", rotationY: Math.PI }
];

export const bedroomInteractables = [
  { position: { x: -8, y: 0, z: -8 }, interactionKey: "toggleLamp" },
  { position: { x: 6, y: 0, z: -8 }, interactionKey: "togglePc" }
];
