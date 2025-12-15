import * as THREE from "three";
import { CONFIG } from "../config.js";
import { loadFBX } from "../loaders.js";

export async function loadNPCWalking(scene, options, objects, onObjectLoadedCallback) {
  const {
    objectKey,
    displayName,
    modelPath,
    scale = CONFIG.npcs?.scale ?? CONFIG.character?.baseScale ?? 1,
    position,
    rotation = { x: 0, y: 0, z: 0 },
  } = options;

  if (!modelPath) {
    console.warn("NPC loader: modelPath ausente", options);
    return null;
  }

  try {
    const npc = await loadFBX(modelPath);

    try {
      npc.scale.set(scale, scale, scale);

      const y = position.y
      npc.position.set(position.x, y, position.z);
      npc.rotation.set(rotation.x, rotation.y, rotation.z);

      npc.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = false;
        }
      });
    } catch (e) {
      console.warn("Erro aplicando transformações ao NPC FBX:", e);
    }

    const clips = npc.animations;
    npc.userData.clipMap = {
      walk: clips[0],
    };

    scene.add(npc);

    if (objects && objectKey) objects[objectKey] = npc;

    if (onObjectLoadedCallback) {
      onObjectLoadedCallback(displayName || objectKey || "NPC", npc);
    }

    return npc;
  } catch (error) {
    console.error("Erro ao carregar NPC:", { modelPath, error });
    return null;
  }
}
