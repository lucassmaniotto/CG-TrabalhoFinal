export const CONFIG = {
  // Configuração da câmera
  camera: {
    fov: 75,
    near: 0.1,
    far: 5000,
    defaultPosition: { x: 0, y: 0, z: 0 },
  },

  // Configuração do homem
  character: {
    baseScale: 0.05,
    basePosition: { x: 0, y: -5, z: 0 },
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
    groundSize: 20000,
  },

  // Assets
  assets: {
    groundTexture: "./assets/Floor/grass.jpg",
    characterIdleModel: "Idle.fbx",
    characterWalkModel: "Walking.fbx",
    characterTexture: "./assets/models/Man/textures/",
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
    shadowCameraSize: 400,
  },
};
