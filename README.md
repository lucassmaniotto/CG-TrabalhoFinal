# Trabalho Final de Computação Gráfica
-------------------------------------------------------------------------------
## Dados dos Alunos
- **Nomes:** Lucas Smaniotto Schuch | Valtemir Junior
- **Matrículas:** 2121101016 | 

## Controles do Player
### Controles de movimento
- Cada tecla altera a posição X:

````
W: move para frente
S: move para trás
A: move para a esquerda
D: move para a direita
````

### Controles especiais
````
V: alterna entre visão em primeira e terceira pessoa
````

### Controles de câmera com mouse
- Segure o botão do mouse (esquerdo ou direito) e mova para orbitar a câmera em terceira pessoa.
- Em primeira pessoa, ao mover o mouse o personagem gira junto, alinhando a frente do modelo à direção da câmera.

### Animações do personagem
- Modelo usa dois FBX separados (Idle.fbx e Walking.fbx).
- Parado: toca animação Idle. Em movimento: toca animação Walking.

## Iluminação e Ciclo Dia/Noite
- Iluminação direcional simulando o sol utilizando DirectionalLight do Three.js para ciclo dia/noite.
- PointLight para simular luz ambiente nos objetos de Poste de Luz.