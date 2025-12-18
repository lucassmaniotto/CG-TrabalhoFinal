import * as THREE from "three";
import { CONFIG } from "../config.js";

const textureLoader = new THREE.TextureLoader();

// Carrega a textura do chão e devolve um material pronto para aplicar no Plane
export function loadGroundTexture() {
  const texture = textureLoader.load(
    CONFIG.assets.groundTexture,
    (tex) => {
      // Textura de cor deve ser sRGB para ficar com iluminação correta
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

// Cria um caminho de pedra segmentado com caixas (BoxGeometry) ao longo de uma linha.
// A configuração vem do CONFIG.path, mas pode ser sobrescrita pelo parâmetro `config`.
export function createStonePath(scene, config = {}) {
  const defaults = Object.assign({}, CONFIG.path || {});
  const {
    startX = defaults.startX,
    startZ = defaults.startZ,
    endX = defaults.endX,
    endZ = defaults.endZ,
    width = defaults.width,
    segments = defaults.segments,
    texturePath = defaults.modelPath,
    repeatU = defaults.repeatU,
    repeatV = defaults.repeatV,
    groundYOffset = defaults.groundYOffset || 0,
  } = config;

  // Carrega textura do caminho (repetição define “tiling” ao longo das caixas)
  const stoneTexture = textureLoader.load(
    texturePath,
    (tex) => {
      try { tex.encoding = THREE.sRGBEncoding; } catch (e) {}
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatU || 5, repeatV || 5);
    },
    undefined,
    (err) => { console.warn("Não foi possível carregar a textura do caminho de pedra", err); }
  );

  const stoneMaterial = new THREE.MeshStandardMaterial({ map: stoneTexture, roughness: 0.85, metalness: 0.0 });

  // Divide o caminho em N segmentos; cada segmento vira uma “placa” de pedra
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

    // Cada trecho é uma caixa com comprimento igual ao tamanho do segmento
    const geometry = new THREE.BoxGeometry(width, 0.15, length);
    const mesh = new THREE.Mesh(geometry, stoneMaterial);

    // Posiciona o trecho no ponto médio do segmento e na altura do chão
    const groundY = CONFIG.scene && CONFIG.scene.groundPosition ? CONFIG.scene.groundPosition.y : 0;
    mesh.position.set((x1 + x2) / 2, groundY + groundYOffset, (z1 + z2) / 2);
    if (length > 0) {
      // Rotaciona para alinhar o eixo Z da caixa com a direção do segmento
      mesh.rotation.y = Math.atan2(dx, dz);
    }

    mesh.receiveShadow = true;
    mesh.castShadow = false;
    scene.add(mesh);
  }

  console.log("Caminho de pedra criado!");
}
