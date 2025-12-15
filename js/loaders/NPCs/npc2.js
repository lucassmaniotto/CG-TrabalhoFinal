import { CONFIG } from "../../config.js";
import { loadNPCWalking } from "../npc.js";

export async function loadNPC2Walking(scene, objects, onObjectLoadedCallback) {
  const playerPos = CONFIG.character.basePosition;

  return loadNPCWalking(
    scene,
    {
      objectKey: "npc2",
      displayName: "NPC2",
      modelPath: CONFIG.assets.npc2WalkingModel,
      // Inicia no final do caminho, vindo em direção ao player
      position: { x: -16, y: playerPos.y, z: CONFIG.path.endZ },
    },
    objects,
    onObjectLoadedCallback
  );
}
