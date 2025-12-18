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
      // Diffuse/albedo em sRGB
      if (m.map) setSRGB(m.map);
      // normal/bump devem permanecer em Linear (não setar sRGB)
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
  // Heurística: se parece graus (|v| > 2π), converte para radianos
  return Math.abs(value) > Math.PI * 2 ? THREE.MathUtils.degToRad(value) : value;
}

export async function loadMonkeys(scene, objects, onObjectLoadedCallback) {
  const cfg = CONFIG.monkey;

  const template = await loadOBJWithMTL({
    objPath: cfg.objPath,
    mtlPath: cfg.mtlPath,
    resourcePath: cfg.texturesDir,
  });

  applyTextureColorSpaces(template);

  // Primeiro cercado = primeira "faixa" do cercado grande (derivada de js/loaders/fence.js)
  // x: [-172, -29.75], z: [1, 206.6]
  const bounds = cfg.firstCorralBounds;
  const center = computeCenter(bounds);

  const groundY =
    typeof cfg.groundY === "number" ? cfg.groundY : CONFIG.scene.groundPosition.y;

  const placements = cfg.placements || [];

  const count = typeof cfg.count === "number" && cfg.count > 0 ? cfg.count : 8;
  const defaultPlacements = [
    { dx: -35, dz: -45, rz: 0 },
    { dx: -10, dz: -35, rz: 0 },
    { dx: 15, dz: -45, rz: 0 },
    { dx: 40, dz: -35, rz: 0 },
    { dx: -30, dz: 20, rz: 0 },
    { dx: -5, dz: 10, rz: 0 },
    { dx: 20, dz: 25, rz: 0 },
    { dx: 45, dz: 15, rz: 0 },
  ];

  const monkeys = [];
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

    const s = cfg.scale;
    inst.scale.set(s, s, s);

    const baseRot = cfg.modelRotation || { x: 0, y: 0, z: 0 };
    inst.rotation.set(baseRot.x || 0, baseRot.y || 0, baseRot.z || 0);
    // Por pedido: rotação por instância deve atuar em Z (mantém fallback em `ry` caso exista)
    inst.rotation.z += asRadians(typeof rz === "number" ? rz : ry);

    // Ajusta Y para encostar no chão depois do scale
    placeOnGround(inst, groundY);

    scene.add(inst);
    monkeys.push(inst);

    if (objects) objects[`monkey${i + 1}`] = inst;
    if (onObjectLoadedCallback) onObjectLoadedCallback(`Monkey${i + 1}`, inst);
  }

  return monkeys;
}
