import * as THREE from "three";
import { CONFIG } from "./config.js";
import { input } from "./input.js";
import { getActions, switchAction } from "./animation.js";

// Atualiza o movimento do personagem
export function updateCharacterMovement(character, delta) {
  if (!character) return;

  const actions = getActions();
  const movementConfig = CONFIG.movement;

  // Rotação em Y com setas esquerda/direita
  const turnDir = (input.left ? 1 : 0) + (input.right ? -1 : 0);
  if (turnDir !== 0) {
    character.rotation.y += turnDir * movementConfig.rotationSpeed * delta;
  }

  // Apenas translação conta como andar
  const anyMoving = input.forward || input.back;

  // Atualiza animação com base no estado (andar > idle)
  if (anyMoving && actions.walk) {
    switchAction(actions.walk, 0.2);
  } else if (actions.idle) {
    switchAction(actions.idle, 0.2);
  }

  // Movimento horizontal
  if (anyMoving) {
    const forward = new THREE.Vector3();
    character.getWorldDirection(forward);
    forward.y = 0; // manter no plano do chão
    if (forward.lengthSq() > 0) forward.normalize();

    const move = new THREE.Vector3();
    if (input.forward) move.add(forward);
    if (input.back) move.addScaledVector(forward, -1);
    if (move.lengthSq() > 0) {
      move.normalize();
      character.position.addScaledVector(move, movementConfig.moveSpeed * delta);
    }
  }
}
