export const CONFIG = {
  // Configuração da câmera
  camera: {
    fov: 75,
    near: 0.1,
    far: 5000,
    defaultPosition: { x: 0, y: 0, z: 0 },
  },

  // Configuração do Player
  character: {
    baseScale: 0.05,
    basePosition: { x: 0, y: -4.8, z: 0 },
    baseRotation: { x: 0, y: 0, z: 0 },
  },

  // Movimento do personagem
  movement: {
    moveSpeed: 50, // unidades/segundo
    rotationSpeed: Math.PI / 2, // radianos/segundo (90°/s)
  },

  // Câmera em terceira pessoa
  thirdPersonCamera: {
    followDistance: 30, // distância atrás do objeto
    followHeight: 20, // altura acima do objeto
    smoothness: 0.4, // lerp smoothness
  },

  // Câmera em primeira pessoa
  firstPersonCamera: {
    distance: 5, // distância da frente do objeto
    height: 20, // altura da cabeça
  },

  // Cena
  scene: {
    backgroundColor: 0x87ceeb,
    ambientLightIntensity: 0.3,
    groundPosition: { x: 0, y: -5, z: 0 },
    groundSize: 5000,
  },

  // Assets
  assets: {
    groundTexture: "./assets/Floor/grass.jpg",
    characterIdleModel: "Idle.fbx",
    characterWalkModel: "Walking.fbx",
    characterTexture: "./assets/models/Player/textures/",
    treeModel: "./assets/models/Tree/Tree1.3ds",
  },

  // Configurações padrão para a função createTreeRowFrom3DS
  treeRow: {
    modelPath: "./assets/models/Tree/Tree1.3ds", // caminho do modelo
    startX: 0,
    startZ: -15,
    endX: 0,
    endZ: 600,
    offset: -30, // deslocamento lateral (negativo para o outro lado do caminho)
    count: 20, // número de árvores na fileira
    // Use `null` para sinalizar ao loader que ele deve usar CONFIG.scene.groundPosition.y
    groundY: null,
    scaleMin: 3,
    scaleMax: 4,
    yOffset: 0.0, // ajuste vertical adicional (se necessário)
    randomYaw: 0.3, // variação aleatória na rotação Y (radianos)
    modelRotation: { x: Math.PI / 2, y: -10.9, z: 0 },
  },

  // Configurações do caminho de pedras
  path: {
    modelPath: "./assets/Floor/stonePath.jpg",
    startX: 0,
    startZ: -15,
    endX: 0,
    endZ: 620,
    width: 55,
    segments: 15,
    repeatU: 5,
    repeatV: 5,
    groundYOffset: 0.35,
  },

  // Configurações para bancos ao longo do caminho
  benches: {
    modelPath: "./assets/models/Bench/Bench.fbx",
    texturesDir: "./assets/models/Bench/textures/",
    count: 10,
    startX: -5,
    startZ: 0,
    endX: 0,
    endZ: 600,
    offset: 24,
    side: "left",
    scale: 0.1,
    yOffset: 5,
    modelRotation: { x: 0, y: 0, z: 0 },
  },

  // Configurações para postes de luz ao longo do caminho (lado direito)
  streetLamps: {
    modelPath: "./assets/models/StreetLamp/street_lamp.fbx",
    texturesDir: "./assets/models/StreetLamp/textures/",
    count: 5,
    startX: 0,
    startZ: 0,
    endX: 0,
    endZ: 600,
    offset: 24,
    side: "right",
    scale: 1,
    yOffset: 0,
    modelRotation: { x: 0, y: 0, z: 0 },

    // Luz do poste
    light: {
      color: 0xffffff,
      intensity: 1000,
      distance: 250,
      decay: 2,
      shadow: {
        mapSize: 1024,
        near: 0.5,
        bias: -0.0002,
        normalBias: 0.02,
      },
      helper: true,
    },
  },

  // Configurações gerais para árvores (createTreesFrom3DS)
  trees: {
    modelPath: "./assets/models/Tree/Tree1.3ds",
    texturesDir: "./assets/models/Tree/textures/",
    count: 20,
    areaWidth: 120,
    areaDepth: 120,
    groundY: { useConfigGround: true },
    scaleMin: 0.8,
    scaleMax: 1.2,
    modelRotation: { x: 0, y: 0, z: 0 },
  },

  // Iluminação (ciclo dia/noite)
  lighting: {
    directional: {
      helper: true,
      x: 200,
      y: 0,
      z: 0,
      intensity: 0.5,
      color: 0xffffff,
    },
    ambient: {
      dayNightDurationSeconds: 120,
    },
  },

  // Animações (índices no array de animações do FBX)
  animations: {
    idle: 0,
    walk: 1,
  },

  // Sombras
  shadows: {
    enabled: true,
    type: "PCFSoftShadowMap",
    mapSize: 2048,
    shadowCameraSize: 700,
  },
};
