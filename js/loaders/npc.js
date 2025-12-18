import * as THREE from "three";
import { CONFIG } from "../config.js";
import { loadFBX } from "../loaders.js";

// Loader genérico de NPC andando.
// Recebe um objeto de opções com paths/transformações e registra o NPC em `objects`.
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
    // Carrega o FBX do NPC
    const npc = await loadFBX(modelPath);

    try {
      // Aplica transformações base (escala/posição/rotação)
      npc.scale.set(scale, scale, scale);

      const y = position.y
      npc.position.set(position.x, y, position.z);
      npc.rotation.set(rotation.x, rotation.y, rotation.z);

      // Ativa sombras nas malhas
      npc.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = false;
        }
      });
    } catch (e) {
      console.warn("Erro aplicando transformações ao NPC FBX:", e);
    }

    // Mapeia o(s) clip(s) disponíveis para o sistema de animação (aqui: walk = primeiro clip)
    const clips = npc.animations;
    npc.userData.clipMap = {
      walk: clips[0],
    };

    // Adiciona na cena e registra no dicionário global
    scene.add(npc);

    if (objects && objectKey) objects[objectKey] = npc;

    // Callback opcional para o restante do sistema (ex: registrar no NPCSystem)
    if (onObjectLoadedCallback) {
      onObjectLoadedCallback(displayName || objectKey || "NPC", npc);
    }

    return npc;
  } catch (error) {
    console.error("Erro ao carregar NPC:", { modelPath, error });
    return null;
  }
}
