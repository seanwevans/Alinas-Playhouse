// Ownership: declarative zone placement specs consumed by zone builders/controllers.

export const UPSTAIRS_BOX_SPECS = [
  [45, 0.2, 20, 12.5, 0, 0, "upstairsFloor"],
  [5, 0.2, 20, 47.5, 0, 0, "upstairsFloor"],
  [10, 0.2, 12.5, 40, 0, -3.75, "upstairsFloor"],
  [10, 0.2, 4.5, 40, 0, 7.75, "upstairsFloor"],
  [0.5, 5, 20, -10, "wy", 0, "upstairsWall"],
  [0.5, 5, 20, 50, "wy", 0, "upstairsWall"],
  [60, 5, 0.5, 20, "wy", -10, "upstairsWall"],
  [10.4, 1, 0.2, 40, "fy+0.6", 2.4, "upstairsTrimLight"],
  [10.4, 1, 0.2, 40, "fy+0.6", 5.6, "upstairsTrimLight"],
  [0.2, 1, 3.4, 34.9, "fy+0.6", 4, "upstairsTrimLight"],
  [4, 0.5, 1.5, 5, "fy+0.25", -8, "upstairsAccentRed"],
  [4, 1, 0.5, 5, "fy+0.5", -9, "upstairsAccentRed"],
  [2.5, 0.2, 1, 5, "fy+0.1", -3, "upstairsTrimDark"],
  [3, 1.8, 0.1, 5, "fy+1.0", -3, "upstairsTrimBlack"],
  [1.5, 0.4, 1.5, 5, "fy+0.2", -6, "upstairsAccentWood"]
];
