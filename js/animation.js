// ============================================
// Animation - Gerenciamento de animações
// ============================================

import * as THREE from "three";

let mixer = null;
let activeAction = null;
const actions = { idle: null, walk: null };

/**
 * Inicializa o mixer de animações para um objeto
 * Tenta identificar automaticamente os clips de idle e walk pelos nomes.
 */
export function initAnimationMixer(object) {
  mixer = new THREE.AnimationMixer(object);

  const clips = object.animations || [];
  const clipMap = object.userData?.clipMap || {};

  // Log detalhado para depuração
  console.log("Clips do personagem:", clips.map((c) => c.name));

  if (!clips.length) {
    console.warn("Nenhum AnimationClip encontrado no personagem.");
    return;
  }

  // Prioriza os clips explicitamente mapeados pelo loader; senão, tenta por nome; senão, fallback por índice.
  const idleClip =
    clipMap.idle ||
    clips.find((c) => /idle/i.test(c.name)) ||
    clips[0] ||
    null;
  const walkClip =
    clipMap.walk ||
    clips.find((c) => /walk|run/i.test(c.name)) ||
    clips[clips.length - 1] ||
    null;

  if (!idleClip || !walkClip) {
    console.warn("Não foi possível identificar claramente idle/walk. Usando fallback.", {
      idleClipName: idleClip?.name,
      walkClipName: walkClip?.name,
      all: clips.map((c) => c.name),
    });
  }

  actions.idle = idleClip ? mixer.clipAction(idleClip) : null;
  actions.walk = walkClip ? mixer.clipAction(walkClip) : null;

  // Começa em idle, se existir
  activeAction = null;
  if (actions.idle) {
    activeAction = actions.idle;
    activeAction.play();
  }
}

/**
 * Alterna entre animações com crossfade
 */
export function switchAction(nextAction, duration = 0.2) {
  if (!nextAction) return;
  if (activeAction === nextAction) return;

  nextAction.reset().play();
  if (activeAction) {
    activeAction.crossFadeTo(nextAction, duration, false);
  }
  activeAction = nextAction;
}

/**
 * Atualiza o mixer de animações
 */
export function updateAnimations(delta) {
  if (mixer) {
    mixer.update(delta);
  }
}

/**
 * Retorna as ações disponíveis
 */
export function getActions() {
  return actions;
}

/**
 * Retorna o mixer
 */
export function getMixer() {
  return mixer;
}
