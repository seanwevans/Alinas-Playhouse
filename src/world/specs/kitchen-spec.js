export const kitchenBoxPlacements = [
  { dimensions: { width: 2.2, height: 3.5, depth: 2.0 }, position: { x: 32.5, y: 1.75, z: -8.6 }, colorKey: "kitchenFloor" },
  { dimensions: { width: 8, height: 1.5, depth: 2 }, position: { x: 39, y: 0.75, z: -8.5 }, colorKey: "counterBase" },
  { dimensions: { width: 8.2, height: 0.2, depth: 2.2 }, position: { x: 39, y: 1.6, z: -8.5 }, colorKey: "counterTop" },
  { dimensions: { width: 1.5, height: 0.25, depth: 1 }, position: { x: 38, y: 1.65, z: -8.2 }, colorKey: "sink" },
  { dimensions: { width: 0.1, height: 0.4, depth: 0.1 }, position: { x: 38, y: 1.9, z: -8.6 }, colorKey: "faucet" },
  { dimensions: { width: 0.1, height: 0.1, depth: 0.3 }, position: { x: 38, y: 2.05, z: -8.4 }, colorKey: "faucet" },
  { dimensions: { width: 2, height: 1.5, depth: 2 }, position: { x: 45, y: 0.75, z: -8.5 }, colorKey: "stoveWhite" },
  { dimensions: { width: 2, height: 0.2, depth: 2 }, position: { x: 45, y: 1.6, z: -8.5 }, colorKey: "stoveBlack" },
  { dimensions: { width: 4, height: 1.4, depth: 2 }, position: { x: 41, y: 0.7, z: 0 }, colorKey: "counterBase" },
  { dimensions: { width: 4.4, height: 0.2, depth: 2.4 }, position: { x: 41, y: 1.5, z: 0 }, colorKey: "counterTop" }
];

export const kitchenStoolPlacements = [39.5, 42.5].flatMap((x) => [
  { dimensions: { width: 0.8, height: 0.1, depth: 0.8 }, position: { x, y: 1.0, z: 1.8 }, colorKey: "stoolSeat" },
  { dimensions: { width: 0.1, height: 1.0, depth: 0.1 }, position: { x: x - 0.35, y: 0.5, z: 1.45 }, colorKey: "stoolLeg" },
  { dimensions: { width: 0.1, height: 1.0, depth: 0.1 }, position: { x: x + 0.35, y: 0.5, z: 1.45 }, colorKey: "stoolLeg" },
  { dimensions: { width: 0.1, height: 1.0, depth: 0.1 }, position: { x: x - 0.35, y: 0.5, z: 2.15 }, colorKey: "stoolLeg" },
  { dimensions: { width: 0.1, height: 1.0, depth: 0.1 }, position: { x: x + 0.35, y: 0.5, z: 2.15 }, colorKey: "stoolLeg" }
]);

export const kitchenInteractables = [
  { position: { x: 32.5, y: 0, z: -8.5 }, interactionKey: "toggleFridge" },
  { position: { x: 38, y: 0, z: -8.5 }, interactionKey: "toggleSink" },
  { position: { x: 45, y: 0, z: -8.5 }, interactionKey: "toggleStove" }
];
