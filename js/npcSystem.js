import * as THREE from "three";
import { CONFIG } from "./config.js";

const npcEntries = [];

export function registerWalkingNPC(object, options = {}) {
  if (!object) return;

  const start = {
    x: CONFIG.path.startX,
    y: CONFIG.npcs.y,
    z: CONFIG.path.startZ,
  };
  const end = {
    x: CONFIG.path.endX,
    y: CONFIG.npcs.y,
    z: CONFIG.path.endZ,
  };

  const speed = CONFIG.npcs.speed

  // direction: +1 (start->end) ou -1 (end->start)
  const initialDir = options.direction === -1 ? -1 : 1;

  // Mixer próprio
  const mixer = new THREE.AnimationMixer(object);
  const clips = object.animations || [];
  const walkClip = object.userData?.clipMap?.walk || clips[0] || null;
  let action = null;
  if (walkClip) {
    action = mixer.clipAction(walkClip);
    action.play();
  } else {
    console.warn("NPC sem clip de walk:", object);
  }

  // Fixar Y no chão
  const yFixed = start.y;
  object.position.y = yFixed;

  // Mantém o X inicial do NPC (pré-setado no loader)
  const fixedX =
    typeof options.fixedX === "number" ? options.fixedX : object.position.x;
  object.position.x = fixedX;

  npcEntries.push({
    object,
    mixer,
    action,
    // start/end ainda guardam Y/Z, mas o X real do NPC fica travado em fixedX
    start: new THREE.Vector3(start.x, yFixed, start.z),
    end: new THREE.Vector3(end.x, yFixed, end.z),
    startZ: start.z,
    endZ: end.z,
    fixedX,
    speed,
    dir: initialDir,
    yFixed,
  });
}

export function updateNPCSystem(delta) {
  for (const entry of npcEntries) {
    if (!entry.object) continue;

    // Atualiza animação
    if (entry.mixer) entry.mixer.update(delta);

    // Movimento vai-e-volta no eixo do caminho (Z), travando X no valor inicial
    const startZ = entry.startZ;
    const endZ = entry.endZ;
    const zDelta = endZ - startZ;
    const zStepSign = Math.sign(zDelta) || 1;
    if (zDelta === 0) continue;

    entry.object.position.z += entry.speed * delta * entry.dir * zStepSign;
    entry.object.position.x = entry.fixedX;
    entry.object.position.y = entry.yFixed;

    // Clamp + inverter quando chegar nas pontas
    if (entry.dir > 0) {
      // Indo do start -> end
      if ((zStepSign > 0 && entry.object.position.z >= endZ) || (zStepSign < 0 && entry.object.position.z <= endZ)) {
        entry.object.position.z = endZ;
        entry.dir = -1;
      }
    } else {
      // Voltando do end -> start
      if ((zStepSign > 0 && entry.object.position.z <= startZ) || (zStepSign < 0 && entry.object.position.z >= startZ)) {
        entry.object.position.z = startZ;
        entry.dir = 1;
      }
    }

    // Rotaciona para olhar para onde está andando (somente no Z)
    const facingPositiveZ = zStepSign * entry.dir > 0;
    entry.object.rotation.y = facingPositiveZ ? 0 : Math.PI;
  }
}
