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
    ambientLightIntensity: 0.3,
    groundPosition: { x: 0, y: -5, z: 0 },
    groundSize: 5000,
  },

  // Assets
  assets: {
    // Texturas
    groundTexture: "./assets/Floor/grass.jpg",

    // Player
    characterIdleModel: "Idle.fbx",
    characterWalkModel: "Walking.fbx",
    characterTexture: "./assets/models/Player/textures/",
    treeModel: "./assets/models/Tree/Tree1.3ds",

    // NPCs
    npc1WalkingModel: "./assets/models/NPCs/NPC1Walking.fbx",
    npc2WalkingModel: "./assets/models/NPCs/NPC2Walking.fbx",
  },

  // Configuração de NPCs
  npcs: {
    scale: 0.105,
    y: -4.8,
    speed: 30,
  },

  // Área do cercado (derivada das posições usadas em js/loaders/fence.js)
  // Usada para posicionar o Dragão no centro do cercado.
  corral: {
    xMin: -172,
    xMax: -29.75,
    zMin: 1,
    zMax: 617,
    // Use `null` para usar CONFIG.character.basePosition.y
    groundY: null,
  },

  // Configuração do Dragão
  dragon: {
    modelPath: "./assets/models/Dragon/Dragon.fbx",
    texturesDir: "./assets/models/Dragon/textures/",
    scale: 0.01,
    // Índice de animações
    idleIndex: 2,
    yOffset: 0,
    rotationY: 0,
  },

  // Configuração do Macaco (OBJ + MTL)
  monkey: {
    objPath: "./assets/models/Monkey/Monkey_obj.obj",
    mtlPath: "./assets/models/Monkey/Monkey_mtl.mtl",
    texturesDir: "./assets/models/Monkey/textures/",

    count: 8,
    scale: 0.1,
    groundY: null,

    // Rotação base do modelo (OBJ exportado do 3ds/Max costuma precisar de ajuste)
    modelRotation: { x: -Math.PI / 2, y: 0, z: 0 },

    // Primeiro cercado (primeira seção do retângulo formado pelas cercas)
    firstCorralBounds: {
      xMin: -172,
      xMax: -29.75,
      zMin: 1,
      zMax: 206.6,
    },

    // Offsets relativos ao centro do primeiro cercado
    placements: [
      { dx: -43, dz: -45, rz: -27 },
      { dx: -12, dz: -35, rz: 12 },
      { dx: 17, dz: -45, rz: -15 },
      { dx: 48, dz: -35, rz: 8 },
      { dx: -33, dz: 20, rz: 7 },
      { dx: -4, dz: 10, rz: 32 },
      { dx: 23, dz: 25, rz: -22 },
      { dx: 38, dz: 15, rz: 14 },
    ],
  },

  // Configuração do Cavalo (OBJ + MTL)
  horse: {
    objPath: "./assets/models/Horse/Horse_obj.obj",
    mtlPath: "./assets/models/Horse/Horse_mtl.mtl",
    texturesDir: "./assets/models/Horse/textures/",

    count: 3,
    scale: 0.015,
    groundY: null,

    // Normalmente OBJ do 3dsMax precisa desse ajuste
    modelRotation: { x: -Math.PI / 2, y: 0, z: 0 },

    // Último cercado: faixa final do retângulo (derivada de js/loaders/fence.js)
    // z entre createFence3 (413.23) e createFence4 (620), com laterais indo até 617
    lastCorralBounds: {
      xMin: -172,
      xMax: -29.75,
      zMin: 413.23,
      zMax: 617,
    },

    // Offsets relativos ao centro do último cercado
    placements: [
      { dx: -35, dz: -55, rz: 10 },
      { dx: 5, dz: -10, rz: -15 },
      { dx: 35, dz: 35, rz: 20 },
    ],
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
      x: 500,
      y: 0,
      z: 0,
      intensity: 2,
      color: 0xffffff,
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
