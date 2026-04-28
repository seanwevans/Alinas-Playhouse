export function copyCannonVec3ToThree(target, source) {
  target.set(source.x, source.y, source.z);
}

export function copyThreeVec3ToCannon(target, source) {
  target.set(source.x, source.y, source.z);
}

export function distanceCannonToThree(cannonVec, threeVec) {
  const dx = cannonVec.x - threeVec.x;
  const dy = cannonVec.y - threeVec.y;
  const dz = cannonVec.z - threeVec.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function normalize2D(x, z) {
  const length = Math.hypot(x, z);
  if (length === 0) {
    return { x: 0, z: 0 };
  }

  return { x: x / length, z: z / length };
}

export function shortestAngleDelta(from, to) {
  let diff = to - from;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return diff;
}
