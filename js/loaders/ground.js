import * as THREE from "three";
import { CONFIG } from "../config.js";

const textureLoader = new THREE.TextureLoader();

export function loadGroundTexture() {
  const texture = textureLoader.load(
    CONFIG.assets.groundTexture,
    (tex) => {
      try {
        tex.encoding = THREE.sRGBEncoding;
      } catch (e) {}
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(500, 500);
    },
    undefined,
    (err) => {
      console.warn("Não foi possível carregar a textura do chão", err);
    }
  );

  return new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 1.0,
    metalness: 0.0,
  });
}

export function createStonePath(scene, config = {}) {
  const {
    startX = 0,
    startZ = -15,
    endX = 0,
    endZ = 620,
    width = 55,
    segments = 15,
    texturePath = "./assets/Floor/textura_pedra.jpg",
  } = config;

  const stoneTexture = textureLoader.load(
    texturePath,
    (tex) => {
      try { tex.encoding = THREE.sRGBEncoding; } catch (e) {}
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(5, 5);
    },
    undefined,
    (err) => { console.warn("Não foi possível carregar a textura do caminho de pedra", err); }
  );

  const stoneMaterial = new THREE.MeshStandardMaterial({ map: stoneTexture, roughness: 0.85, metalness: 0.0 });

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const nextT = (i + 1) / segments;

    const x1 = startX + (endX - startX) * t;
    const z1 = startZ + (endZ - startZ) * t;
    const x2 = startX + (endX - startX) * nextT;
    const z2 = startZ + (endZ - startZ) * nextT;

    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);

    const geometry = new THREE.BoxGeometry(width, 0.15, length);
    const mesh = new THREE.Mesh(geometry, stoneMaterial);

    mesh.position.set((x1 + x2) / 2, -4.83, (z1 + z2) / 2);
    if (length > 0) {
      mesh.rotation.y = Math.atan2(dx, dz);
    }

    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
  }

  console.log("Caminho de pedra criado!");
}
