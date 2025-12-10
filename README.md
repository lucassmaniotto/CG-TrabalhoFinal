# Trabalho Final de Computação Gráfica
-------------------------------------------------------------------------------
## Dados dos Alunos
- **Nomes:** Lucas Smaniotto Schuch | Valtemir Junior
- **Matrículas:** 2121101016 | 

## Controles de Iluminação
- Implementadas luzes direcionais, pontuais e spotlights, cada uma com seus respectivos controles na GUI.
- Adicionado Helper para facilitar a visualização dos pontos focais das luzes.

## Controles do Objeto
### Controles de movimento
- Cada tecla altera a posição X:

````
Seta para Frente: move para frente
Seta para Trás: move para trás
Seta para Esquerda: move para a esquerda
Seta para Direita: move para a direita
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
