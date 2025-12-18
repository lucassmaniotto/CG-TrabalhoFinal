import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

export function loadOBJWithMTL(objPath, mtlPath) {
  const mtlLoader = new MTLLoader();
  const basePath = mtlPath.substring(0, mtlPath.lastIndexOf("/") + 1);
  mtlLoader.setResourcePath(basePath);

  return new Promise((resolve, reject) => {
    mtlLoader.load(
      mtlPath,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
          objPath,
          (object) => resolve(object),
          undefined,
          (error) => reject(error)
        );
      },
      undefined,
      (error) => reject(error)
    );
  });
}

export function createFence(scene, options = {}) {
  const quantity = 5; // Quantidade de cercas, padrão 5
  const spacing = -28; // Espaçamento entre cercas, padrão 5 unidades
  const objPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.obj';
  const mtlPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.mtl';

  return loadOBJWithMTL(objPath, mtlPath).then((fenceTemplate) => {
    let escalaCerca = 0.1;
    const fences = [];

    for (let i = 0; i < quantity; i++) {
      const fence = i === 0 ? fenceTemplate : fenceTemplate.clone();

      // Posição: desloca no eixo X baseado no índice
      const xPos = -45 + (i * spacing);
      fence.position.set(xPos, 16.5, -10);
      fence.scale.set(escalaCerca, escalaCerca, escalaCerca);
      fence.rotation.set(Math.PI / 2, 0, 0);

      // Adiciona à cena
      scene.add(fence);

      fences.push(fence);
    }

    return fences;
  });
}

export function createFence2(scene, options = {}) {
  const quantity = 5; // Quantidade de cercas, padrão 5
  const spacing = -28; // Espaçamento entre cercas, padrão 5 unidades
  const objPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.obj';
  const mtlPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.mtl';

  return loadOBJWithMTL(objPath, mtlPath).then((fenceTemplate) => {
    let escalaCerca = 0.1;
    const fences = [];

    for (let i = 0; i < quantity; i++) {
      const fence = i === 0 ? fenceTemplate : fenceTemplate.clone();

      // Posição: desloca no eixo X baseado no índice
      const xPos = -45 + (i * spacing);
      fence.position.set(xPos, 16.5, 206.6);
      fence.scale.set(escalaCerca, escalaCerca, escalaCerca);
      fence.rotation.set(Math.PI / 2, 0, 0);

      // Adiciona à cena
      scene.add(fence);

      fences.push(fence);
    }

    return fences;
  });
}

export function createFence3(scene, options = {}) {
  const quantity = 5; // Quantidade de cercas, padrão 5
  const spacing = -28; // Espaçamento entre cercas, padrão 5 unidades
  const objPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.obj';
  const mtlPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.mtl';

  return loadOBJWithMTL(objPath, mtlPath).then((fenceTemplate) => {
    let escalaCerca = 0.1;
    const fences = [];

    for (let i = 0; i < quantity; i++) {
      const fence = i === 0 ? fenceTemplate : fenceTemplate.clone();

      // Posição: desloca no eixo X baseado no índice
      const xPos = -45 + (i * spacing);
      fence.position.set(xPos, 16.5, 413.23);
      fence.scale.set(escalaCerca, escalaCerca, escalaCerca);
      fence.rotation.set(Math.PI / 2, 0, 0);

      // Adiciona à cena
      scene.add(fence);

      fences.push(fence);
    }

    return fences;
  });
}

export function createFence4(scene, options = {}) {
  const quantity = 5; // Quantidade de cercas, padrão 5
  const spacing = -28; // Espaçamento entre cercas, padrão 5 unidades
  const objPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.obj';
  const mtlPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.mtl';

  return loadOBJWithMTL(objPath, mtlPath).then((fenceTemplate) => {
    let escalaCerca = 0.1;
    const fences = [];

    for (let i = 0; i < quantity; i++) {
      const fence = i === 0 ? fenceTemplate : fenceTemplate.clone();

      // Posição: desloca no eixo X baseado no índice
      const xPos = -45 + (i * spacing);
      fence.position.set(xPos, 16.5, 620);
      fence.scale.set(escalaCerca, escalaCerca, escalaCerca);
      fence.rotation.set(Math.PI / 2, 0, 0);

      // Adiciona à cena
      scene.add(fence);

      fences.push(fence);
    }

    return fences;
  });
}

export function createFence5(scene, options = {}) {
  const quantity = 23; // Quantidade de cercas, padrão 5
  const spacing = -28; // Espaçamento entre cercas, padrão 5 unidades
  const objPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.obj';
  const mtlPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.mtl';

  return loadOBJWithMTL(objPath, mtlPath).then((fenceTemplate) => {
    let escalaCerca = 0.1;
    const fences = [];

    for (let i = 0; i < quantity; i++) {
      const fence = i === 0 ? fenceTemplate : fenceTemplate.clone();

      // Posição: desloca no eixo Z baseado no índice
      const zPos = 617 + (i * spacing);
      fence.position.set(-29.75, 16.5, zPos);
      fence.scale.set(escalaCerca, escalaCerca, escalaCerca);
      fence.rotation.set(Math.PI / 2, 0, Math.PI/2);

      // Adiciona à cena
      scene.add(fence);

      fences.push(fence);
    }

    return fences;
  });
}

export function createFence6(scene, options = {}) {
  const quantity = 23; // Quantidade de cercas, padrão 5
  const spacing = -28; // Espaçamento entre cercas, padrão 5 unidades
  const objPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.obj';
  const mtlPath = 'assets/models/Fence/13080_Wrought_Iron_fence_with_brick_v1_L2.mtl';

  return loadOBJWithMTL(objPath, mtlPath).then((fenceTemplate) => {
    let escalaCerca = 0.1;
    const fences = [];

    for (let i = 0; i < quantity; i++) {
      const fence = i === 0 ? fenceTemplate : fenceTemplate.clone();

      // Posição: desloca no eixo Z baseado no índice
      const zPos = 617 + (i * spacing);
      fence.position.set(-172, 16.5, zPos);
      fence.scale.set(escalaCerca, escalaCerca, escalaCerca);
      fence.rotation.set(Math.PI / 2, 0, Math.PI/2);

      // Adiciona à cena
      scene.add(fence);

      fences.push(fence);
    }

    return fences;
  });
}