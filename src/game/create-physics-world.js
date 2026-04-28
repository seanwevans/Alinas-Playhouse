import * as CANNON from "https://esm.sh/cannon-es";

export function createPhysicsWorld(params) {
  const physicsWorld = new CANNON.World();
  physicsWorld.gravity.set(0, params.Physics.gravity, 0);
  physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);

  const material = new CANNON.Material("default");
  const contactMaterial = new CANNON.ContactMaterial(material, material, {
    friction: params.Physics.friction,
    restitution: params.Physics.restitution
  });

  physicsWorld.addContactMaterial(contactMaterial);
  physicsWorld.defaultContactMaterial = contactMaterial;

  return { physicsWorld, material, contactMaterial };
}
