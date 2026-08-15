// Ownership: declarative zone placement specs consumed by zone builders/controllers.

export const UPSTAIRS_BOX_SPECS = [
  [45, 0.2, 20, 12.5, "fy", 0, "upstairsFloor"],
  [5, 0.2, 20, 47.5, "fy", 0, "upstairsFloor"],
  [10, 0.2, 12.5, 40, "fy", -3.75, "upstairsFloor"],
  [10, 0.2, 4.5, 40, "fy", 7.75, "upstairsFloor"],
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
// Third floor (attic playroom): slab spans x -10..40 / z -10..10 with a stairwell
// opening at x 15..25 / z -8..-5 for the second staircase.
export const ATTIC_BOX_SPECS = [
  [25, 0.2, 20, 2.5, "fy", 0, "atticFloor"],
  [15, 0.2, 20, 32.5, "fy", 0, "atticFloor"],
  [10, 0.2, 2, 20, "fy", -9, "atticFloor"],
  [10, 0.2, 15, 20, "fy", 2.5, "atticFloor"],
  [0.5, 5, 20, -10, "wy", 0, "atticWall"],
  [0.5, 5, 20, 40, "wy", 0, "atticWall"],
  [50.5, 5, 0.5, 15, "wy", -10, "atticWall"],
  [50, 0.4, 0.4, 15, "fy+4.6", -5, "atticBeam"],
  [50, 0.4, 0.4, 15, "fy+4.6", 5, "atticBeam"],
  [50, 0.6, 0.2, 15, "fy+0.4", -9.7, "atticTrimLight"],
  [6, 3, 0.2, 0, "fy+2.5", -9.7, "atticWindow"],
  [6, 3, 0.2, 30, "fy+2.5", -9.7, "atticWindow"],
  [6.4, 0.3, 0.25, 0, "fy+0.85", -9.7, "atticTrimLight"],
  [6.4, 0.3, 0.25, 30, "fy+0.85", -9.7, "atticTrimLight"],
  [8, 0.1, 6, 2, "fy+0.15", 0, "atticRug"],
  [3, 1.2, 1.6, -6, "fy+0.7", -7, "atticAccentWood"],
  [3.2, 0.25, 1.8, -6, "fy+1.425", -7, "atticAccentTeal"],
  [3, 0.2, 3, 8, "fy+1.0", -6, "atticAccentWood"],
  [0.25, 0.8, 0.25, 6.9, "fy+0.5", -7.1, "atticAccentWood"],
  [0.25, 0.8, 0.25, 9.1, "fy+0.5", -7.1, "atticAccentWood"],
  [0.25, 0.8, 0.25, 6.9, "fy+0.5", -4.9, "atticAccentWood"],
  [0.25, 0.8, 0.25, 9.1, "fy+0.5", -4.9, "atticAccentWood"],
  [0.5, 3, 4, -9.5, "fy+1.6", 3, "atticAccentWood"],
  [0.6, 0.1, 3.6, -9.45, "fy+1.2", 3, "atticTrimLight"],
  [0.6, 0.1, 3.6, -9.45, "fy+2.2", 3, "atticTrimLight"],
  [1.2, 1.2, 1.2, 30, "fy+0.7", -6, "atticAccentTeal"],
  [0.8, 0.8, 0.8, 30, "fy+1.7", -6, "atticRug"],
  [1, 1, 1, 32, "fy+0.6", -4, "atticAccentWood"]
];
