import * as THREE from "three";

import { CONFIG } from "../config.js";
import { loadOBJWithMTL } from "../loaders.js";

// Marca textura de cor (albedo/diffuse) como sRGB para evitar cores lavadas/escuras
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

// Aplica sRGB apenas nos mapas de cor dos materiais do OBJ/MTL
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

// Centro de um retângulo (usado para centralizar os cavalos dentro do cercado)
function computeCenter(bounds) {
  return {
    x: (bounds.xMin + bounds.xMax) / 2,
    z: (bounds.zMin + bounds.zMax) / 2,
  };
}

// Ajusta Y do objeto para que a base (bbox.min.y) encoste no chão
function placeOnGround(object, groundY) {
  const box = new THREE.Box3().setFromObject(object);
  if (!isFinite(box.min.y)) return;
  const delta = groundY - box.min.y;
  object.position.y += delta;
}

// Aceita graus ou radianos; converte para radianos quando necessário
function asRadians(value) {
  if (typeof value !== "number") {
    throw new TypeError("Expected a number (degrees or radians)");
  }
  return Math.abs(value) > Math.PI * 2
    ? THREE.MathUtils.degToRad(value)
    : value;
}

// Carrega o template OBJ+MTL e instancia vários cavalos em posições predefinidas
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

  const groundY = cfg.groundY;
  const placements = cfg.placements;
  const count = cfg.count;

  const horses = [];
  for (let i = 0; i < count; i++) {
    // Reusa o primeiro como template; os demais são clones profundos
    const inst = i === 0 ? template : template.clone(true);

    inst.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });

    const p = placements[i];
    const { dx, dz, rz } = p;

    // Posiciona relativo ao centro do cercado (dx/dz vêm do config)
    inst.position.set(center.x + dx, groundY, center.z + dz);

    inst.scale.set(cfg.scale, cfg.scale, cfg.scale);

    const baseRot = cfg.modelRotation;
    inst.rotation.set(baseRot.x, baseRot.y, baseRot.z);

    // Rotação por instância em Z
    inst.rotation.z += asRadians(rz);

    // Corrige a altura final depois do scale/rotação
    placeOnGround(inst, groundY);

    scene.add(inst);
    horses.push(inst);

    if (objects) objects[`horse${i + 1}`] = inst;
    if (onObjectLoadedCallback) onObjectLoadedCallback(`Horse${i + 1}`, inst);
  }

  return horses;
}
