// Ownership: classroom zone builder including seated NPC student spawning.
import { COLORS } from "../../config/game-config.js";
import { C_StudentAnimator } from "../../ecs/components.js";
import { createPlayerEntity } from "../../entities/player-factory.js";
import { buildChair, buildStaticBox } from "../build-primitives.js";

export function buildClassroomZone(ecs, scene, world, config) {
  const { gameRef } = config;

  buildStaticBox(scene, world, 12, 1.5, 0.1, 20, 2.0, -9.7, COLORS.classFloor);
  buildStaticBox(scene, world, 12, 0.05, 0.2, 20, 1.2, -9.6, COLORS.deskPlatform);
  buildStaticBox(scene, world, 4, 0.2, 2, 20, 1.5, -7, COLORS.deskBase);
  buildStaticBox(scene, world, 0.2, 1.5, 1.8, 18.2, 0.75, -7, COLORS.deskBase);
  buildStaticBox(scene, world, 0.2, 1.5, 1.8, 21.8, 0.75, -7, COLORS.deskBase);
  buildChair(scene, world, 20, -5.5, COLORS.chairBlue, 0);

  let studentIdx = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 14.5 + col * 5.5;
      const z = -2 + row * 5;

      buildStaticBox(scene, world, 1.8, 0.1, 1.5, x, 1.2, z, COLORS.deskTop);
      buildStaticBox(scene, world, 1.8, 0.4, 1.3, x, 1.0, z, COLORS.deskWood);

      [
        [-0.9, -0.6],
        [0.9, -0.6],
        [-0.9, 0.6],
        [0.9, 0.6]
      ].forEach((pos) => {
        buildStaticBox(scene, world, 0.1, 1.2, 0.1, x + pos[0], 0.6, z + pos[1], COLORS.deskLeg);
      });

      buildChair(scene, world, x, z + 2, COLORS.chairRed, Math.PI);

      const studentEnt = createPlayerEntity(
        ecs,
        scene,
        world,
        x,
        z + 1,
        COLORS.studentShirts[studentIdx],
        Math.PI,
        false,
        true,
        gameRef
      );

      studentEnt.player.isSitting = true;
      ecs.addComponent(studentEnt, "studentAnimator", new C_StudentAnimator(studentIdx));

      studentIdx++;
    }
  }
  return {};
}
