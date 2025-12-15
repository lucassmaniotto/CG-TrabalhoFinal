import { CONFIG } from "../../config.js";
import { loadNPCWalking } from "../npc.js";

export async function loadNPC1Walking(scene, objects, onObjectLoadedCallback) {
  const playerPos = CONFIG.character.basePosition;
  const pathStartZ = CONFIG.path.startZ;
  const pathEndZ = CONFIG.path.endZ;

  // Posição inicial “próxima do player”, mas dentro do range do caminho
  const desiredZ = playerPos.z + 20;
  const clampedZ = Math.min(Math.max(desiredZ, Math.min(pathStartZ, pathEndZ)), Math.max(pathStartZ, pathEndZ));

  return loadNPCWalking(
    scene,
    {
      objectKey: "npc1",
      displayName: "NPC1",
      modelPath: CONFIG.assets.npc1WalkingModel,
      position: { x: 8, y: playerPos.y, z: clampedZ },
    },
    objects,
    onObjectLoadedCallback
  );
}
