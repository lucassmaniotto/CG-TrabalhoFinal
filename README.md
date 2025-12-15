# Trabalho Final de Computação Gráfica
Criação de um cenário 3D interativo utilizando Three.js, com controle de personagem, iluminação dinâmica e NPCs representando um Zoológico.

-------------------------------------------------------------------------------

## Dados dos Alunos
- **Nomes:** Lucas Smaniotto Schuch | Valtemir Gomes da Silva Junior
- **Matrículas:** 2121101016 | 

## Requisitos
O trabalho final deverá ser entregue, assim como os demais, por meio de um link compartilhado no Google Drive. A pasta ou repositório obrigatoriamente deverá ter o nome “FINAL”. Considerando que este trabalho terá um prazo maior de desenvolvimento (duas semanas), não serão aceitos trabalhos que consistam apenas em adaptações triviais de exemplos apresentados em aula — como, por exemplo, alterar a animação do T6 e entregá-la como trabalho final.

O trabalho deverá ser apresentado em sala de aula, permitindo que todos os colegas visualizem e compreendam o que foi desenvolvido.

O desenvolvimento pode ser feito em dupla (preferencialmente de forma individual). Caso seja em dupla, é importante lembrar que ambos os integrantes devem participar ativamente do desenvolvimento e ambos serão questionados durante a apresentação.

O trabalho consiste na criação de uma cena completa. Essa cena deve envolver algum tipo de animação, que pode ser:

- Interativa (utilizando teclado, mouse ou interface gráfica — GUI).
- Não interativa, baseada em um conjunto de ações pré-determinadas.

Como exemplo, pode-se desenvolver uma fazenda com diversos animais, permitindo que o usuário se movimente pelo mapa e observe diferentes elementos. Nessa cena, o tempo pode passar dinamicamente, escurecendo e clareando o ambiente. Outro exemplo válido é a importação e renderização de uma cena complexa criada no Blender.

### Requisitos mínimos do trabalho:

- A cena deve conter objetos complexos, podendo incluir múltiplos objetos e objetos com animações.
- A cena deve possuir elementos texturizados, aplicados aos objetos carregados, como paredes, piso, entre outros.
- Deve existir alguma forma de animação, seja automática ou com interação do usuário (GUI, teclado, mouse, etc.).
- A cena deve conter elementos de iluminação. É obrigatório o uso de uma luz ambiente e pelo menos mais uma fonte de luz adicional.

### Critérios de avaliação:

- Complexidade da cena
- Criatividade na criação do conteúdo

-------------------------------------------------------------------------------

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
  - Troca gradual da cor do background e intensidade da luz quando atualiza seu Y ao longo do tempo.
- PointLight para simular luz ambiente nos objetos de Poste de Luz.

## Sistema de NPCs
- NPCs caminham entre dois pontos definidos no cenário.