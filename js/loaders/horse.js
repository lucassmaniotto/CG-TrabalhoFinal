import * as THREE from "three";

import { CONFIG } from "../config.js";
import { loadOBJWithMTL } from "../loaders.js";

function setSRGB(tex) {
  if (!tex) return;
  try {
    tex.colorSpace = THREE.SRGBColorSpace;
  } catch (e) {
    try {
      tex.encoding = THREE.sRGBEncoding;
    } catch (e2) {}
  }
}

function applyTextureColorSpaces(object) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const m of mats) {
      if (!m) continue;
      if (m.map) setSRGB(m.map);
      m.needsUpdate = true;
    }
  });
}

function computeCenter(bounds) {
  return {
    x: (bounds.xMin + bounds.xMax) / 2,
    z: (bounds.zMin + bounds.zMax) / 2,
  };
}

function placeOnGround(object, groundY) {
  const box = new THREE.Box3().setFromObject(object);
  if (!isFinite(box.min.y)) return;
  const delta = groundY - box.min.y;
  object.position.y += delta;
}

function asRadians(value) {
  if (typeof value !== "number") return 0;
  return Math.abs(value) > Math.PI * 2 ? THREE.MathUtils.degToRad(value) : value;
}

export async function loadHorses(scene, objects, onObjectLoadedCallback) {
  const cfg = CONFIG.horse;

  const template = await loadOBJWithMTL({
    objPath: cfg.objPath,
    mtlPath: cfg.mtlPath,
    resourcePath: cfg.texturesDir,
  });

  applyTextureColorSpaces(template);

  const bounds = cfg.lastCorralBounds;
  const center = computeCenter(bounds);

  const groundY =
    typeof cfg.groundY === "number" ? cfg.groundY : CONFIG.scene.groundPosition.y;

  const placements = cfg.placements || [];
  const count = typeof cfg.count === "number" && cfg.count > 0 ? cfg.count : 3;

  const defaultPlacements = [
    { dx: -30, dz: -40, rz: 0 },
    { dx: 0, dz: -15, rz: 0 },
    { dx: 25, dz: 20, rz: 0 },
  ];

  const horses = [];
  for (let i = 0; i < count; i++) {
    const inst = i === 0 ? template : template.clone(true);

    inst.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });

    const p = placements[i] || defaultPlacements[i] || { dx: 0, dz: 0, rz: 0 };
    const { dx, dz, rz, ry } = p;

    inst.position.set(center.x + dx, groundY, center.z + dz);

    const s = typeof cfg.scale === "number" ? cfg.scale : 0.05;
    inst.scale.set(s, s, s);

    const baseRot = cfg.modelRotation || { x: 0, y: 0, z: 0 };
    inst.rotation.set(baseRot.x || 0, baseRot.y || 0, baseRot.z || 0);

    // Mantém padrão do macaco: rotação por instância em Z (fallback em `ry`)
    inst.rotation.z += asRadians(typeof rz === "number" ? rz : ry);

    placeOnGround(inst, groundY);

    scene.add(inst);
    horses.push(inst);

    if (objects) objects[`horse${i + 1}`] = inst;
    if (onObjectLoadedCallback) onObjectLoadedCallback(`Horse${i + 1}`, inst);
  }

  return horses;
}
