import * as THREE from "three";

import { CONFIG } from "../config.js";
import { loadOBJWithMTL } from "../loaders.js";

export function createFence(scene, options = {}) {
  // Mantém a ideia do cercado como implementado hoje, mas:
  // - evita sobreposição calculando o espaçamento pelo tamanho real do modelo
  // - distribui as fileiras simetricamente dentro de um retângulo (bounds)
  const defaults = Object.assign({}, CONFIG.fence || {});
  const merged = Object.assign({}, defaults, options);
  const {
    objPath,
    mtlPath,
    texturesDir,
    scale,
    y,
    bounds = CONFIG.corral,
    // Ajuste de encaixe entre módulos:
    // 1.0 = encosta (bounding box), < 1 aproxima (fecha vãos), > 1 abre gap
    stepMultiplier,
    // Remove N peças por fileira (para evitar sobra/duplicação em vértices)
    trimPerRow,
    // Quantas fileiras horizontais (ao longo do X) terá o cercado
    horizontalRows,
    horizontalEndInsetFactor,
  } = merged;

  return loadOBJWithMTL({ objPath, mtlPath, resourcePath: texturesDir }).then(
    (fenceTemplate) => {
      fenceTemplate.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      const group = new THREE.Group();
      group.name = "Fence";

      const rotX = [Math.PI / 2, 0, 0];
      const rotZ = [Math.PI / 2, 0, Math.PI / 2];

      function measureStep(rotation) {
        const probe = fenceTemplate.clone(true);
        probe.position.set(0, 0, 0);
        probe.rotation.set(rotation[0], rotation[1], rotation[2]);
        probe.scale.set(scale, scale, scale);
        probe.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(probe);
        const size = new THREE.Vector3();
        box.getSize(size);
        return size;
      }

      const sizeX = measureStep(rotX);
      const sizeZ = measureStep(rotZ);

      // Quanto andar entre segmentos (para não sobrepor)
      const stepX = Math.max(1e-6, sizeX.x) * stepMultiplier;
      const stepZ = Math.max(1e-6, sizeZ.z) * stepMultiplier;

      const spanX = bounds.xMax - bounds.xMin;
      const spanZ = bounds.zMax - bounds.zMin;

      const insetZ = Math.min(sizeX.z * horizontalEndInsetFactor, spanZ / 2);

      // Quantidade base: garante que os segmentos caibam dentro do span
      const baseCountX = Math.floor(spanX / stepX) + 1;
      const baseCountZ = Math.floor(spanZ / stepZ) + 1;

      // Remove N por fileira (não mascara valores ausentes)
      const countX = baseCountX - trimPerRow;
      const countZ = baseCountZ - trimPerRow;

      // Centraliza a distribuição para ficar simétrico dentro do retângulo
      const coveredX = (countX - 1) * stepX;
      const coveredZ = (countZ - 1) * stepZ;
      const marginX = spanX - coveredX;
      const marginZ = spanZ - coveredZ;
      const startX = bounds.xMax - marginX / 2;
      const startZ = bounds.zMax - marginZ / 2;

      // Z das fileiras horizontais (inclusive nos extremos) de forma simétrica
      const rows = horizontalRows;
      const zRows = [];
      for (let i = 0; i < rows; i++) {
        const t = rows === 1 ? 0 : i / (rows - 1);
        // Mantém as do meio na interpolação normal, e só ajusta início/fim
        if (i === 0) {
          zRows.push(bounds.zMin + insetZ);
          continue;
        }
        if (i === rows - 1) {
          zRows.push(bounds.zMax - insetZ);
          continue;
        }
        zRows.push(bounds.zMin + (bounds.zMax - bounds.zMin) * t);
      }

      // Barras horizontais (ao longo do X)
      for (const z of zRows) {
        for (let i = 0; i < countX; i++) {
          const inst = fenceTemplate.clone(true);
          const xPos = startX - i * stepX;
          inst.position.set(xPos, y, z);
          inst.scale.set(scale, scale, scale);
          inst.rotation.set(rotX[0], rotX[1], rotX[2]);
          group.add(inst);
        }
      }

      // Laterais verticais (ao longo do Z), nas duas bordas X
      const xSides = [bounds.xMax, bounds.xMin];
      for (const x of xSides) {
        for (let i = 0; i < countZ; i++) {
          const inst = fenceTemplate.clone(true);
          const zPos = startZ - i * stepZ;
          inst.position.set(x, y, zPos);
          inst.scale.set(scale, scale, scale);
          inst.rotation.set(rotZ[0], rotZ[1], rotZ[2]);
          group.add(inst);
        }
      }

      scene.add(group);
      return group;
    }
  );
}
