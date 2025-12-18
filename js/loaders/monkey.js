import * as THREE from "three";

import { CONFIG } from "../config.js";
import { loadOBJWithMTL } from "../loaders.js";

// Marca textura de cor (albedo/diffuse) como sRGB para evitar cores erradas
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

// Ajusta apenas as texturas de cor para sRGB (normal/bump permanecem em Linear)
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

// Centro de um retângulo (para distribuir instâncias ao redor)
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
  // Heurística: se parece graus (|v| > 2π), converte para radianos
  return Math.abs(value) > Math.PI * 2
    ? THREE.MathUtils.degToRad(value)
    : value;
}

// Carrega o template OBJ+MTL e instancia vários macacos no primeiro cercado
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

  const groundY = cfg.groundY;
  const placements = cfg.placements;
  const count = cfg.count;

  const monkeys = [];
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
    // Por pedido: rotação por instância deve atuar em Z
    inst.rotation.z += asRadians(rz);

    // Ajusta Y para encostar no chão depois do scale
    placeOnGround(inst, groundY);

    scene.add(inst);
    monkeys.push(inst);

    if (objects) objects[`monkey${i + 1}`] = inst;
    if (onObjectLoadedCallback) onObjectLoadedCallback(`Monkey${i + 1}`, inst);
  }

  return monkeys;
}
