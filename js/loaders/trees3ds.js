import { CONFIG } from "../config.js";
import { loadTDS } from "../loaders.js";

export async function createTreesFrom3DS(scene, options = {}, objects, onObjectLoadedCallback) {
  const {
    modelPath = "./assets/models/Tree/Tree1.3ds",
    count = 10,
    areaWidth = 120,
    areaDepth = 120,
    groundY = CONFIG.scene.groundPosition.y,
    avoidArea = null,
    scaleMin = 0.8,
    scaleMax = 1.2,
    modelRotation = { x: 0, y: 0, z: 0 },
  } = options;

  try {
    const object = await loadTDS(modelPath);

    object.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = false;
      }
    });

    const instances = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * areaWidth;
      const z = (Math.random() - 0.5) * areaDepth;

      if (avoidArea) {
        const dx = x - (avoidArea.x || 0);
        const dz = z - (avoidArea.z || 0);
        if (Math.sqrt(dx * dx + dz * dz) < (avoidArea.radius || 0)) {
          i--; continue;
        }
      }

      const clone = object.clone(true);
      const s = scaleMin + Math.random() * (scaleMax - scaleMin);
      clone.scale.set(s, s, s);
      if (modelRotation) {
        clone.rotation.x += modelRotation.x || 0;
        clone.rotation.y += modelRotation.y || 0;
        clone.rotation.z += modelRotation.z || 0;
      }
      clone.position.set(x, groundY, z);
      clone.rotation.y += Math.random() * Math.PI * 2;
      scene.add(clone);
      instances.push(clone);

      if (onObjectLoadedCallback) {
        onObjectLoadedCallback("Tree", clone);
      }
    }

    if (objects) objects["trees"] = objects["trees"] ? objects["trees"].concat(instances) : instances;
    console.log(`Instanciadas ${count} árvores (.3ds) a partir de ${modelPath}`);
  } catch (err) {
    console.error("Erro carregando .3ds:", err);
  }
}

export async function createTreeRowFrom3DS(scene, options = {}, objects, onObjectLoadedCallback) {
  const defaults = CONFIG.treeRow || {};
  const opts = Object.assign({}, defaults, options);

  if (typeof opts.groundY !== "number") {
    opts.groundY = CONFIG.scene && CONFIG.scene.groundPosition ? CONFIG.scene.groundPosition.y : 0;
  }

  const side = opts.side || "left";

  try {
    const object = await loadTDS(opts.modelPath);
    object.traverse((c) => {
      if (c.isMesh) { c.castShadow = true; c.receiveShadow = false; }
    });

    const dx = opts.endX - opts.startX;
    const dz = opts.endZ - opts.startZ;
    let perpX = -dz;
    let perpZ = dx;
    if (side === "right") { perpX = -perpX; perpZ = -perpZ; }
    const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
    const nx = perpX / perpLen;
    const nz = perpZ / perpLen;

    const instances = [];
    for (let i = 0; i < opts.count; i++) {
      const t = opts.count > 1 ? i / (opts.count - 1) : 0.5;
      const xOnPath = opts.startX + dx * t;
      const zOnPath = opts.startZ + dz * t;

      const x = xOnPath + nx * opts.offset;
      const z = zOnPath + nz * opts.offset;

      const clone = object.clone(true);
      const s = opts.scaleMin + Math.random() * (opts.scaleMax - opts.scaleMin);
      clone.scale.set(s, s, s);

      if (opts.modelRotation) {
        clone.rotation.x = opts.modelRotation.x || 0;
        clone.rotation.y = opts.modelRotation.y || 0;
        clone.rotation.z = opts.modelRotation.z || 0;
      }

      clone.position.set(x, opts.groundY + opts.yOffset, z);

      const pathYaw = Math.atan2(dx, dz);
      const variation = (Math.random() - 0.5) * opts.randomYaw;
      clone.rotation.y += pathYaw + Math.PI / 2 + variation;

      scene.add(clone);
      instances.push(clone);

      if (onObjectLoadedCallback) {
        onObjectLoadedCallback("TreeRow", clone);
      }
    }

    if (objects) objects["treeRows"] = objects["treeRows"] ? objects["treeRows"].concat(instances) : instances;
    console.log(`Fileira de ${opts.count} árvores criada (${opts.modelPath}) lado=${side}`);
  } catch (err) {
    console.error("Erro carregando .3ds para fileira:", err);
  }
}
