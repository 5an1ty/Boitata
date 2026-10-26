# BOITATÁ: A Última Luz da BR-319

Protótipo jogável da **Etapa 1/6**, com **Raimundo Pinheiro**. Amazonas, 2004. O abrigo é um cenário técnico temporário; a campanha e o posto completo ainda não estão implementados.

## Executar

Requer Node.js 20.19+ ou 22.12+ (validado com Node 24).

```sh
npm install
npm run dev
```

Em ambientes com diretório pessoal sem permissão de escrita:

```sh
npm install --cache /workspace/.npm-cache
```

Para instalações posteriores, use `npm ci --cache /workspace/.npm-cache`.

```sh
npm run build
npm run preview
```

O servidor de desenvolvimento aceita conexões da rede. Para abrir em um celular remoto, o endereço precisa estar acessível; HTTPS é recomendado para recursos do navegador. Não depende de APIs de orientação nem de recursos externos: a fonte VT323 e sua licença OFL estão em `public/fonts/`.

## Controles

| Ação | Computador | Celular |
| --- | --- | --- |
| Mover | WASD | Joystick esquerdo |
| Olhar | Mouse capturado após iniciar | Arrastar à direita |
| Correr | Segurar Shift | Segurar CORRER |
| Interagir | E, olhando para a placa a menos de 2,8 m | Botão E |
| Lanterna | F | Botão de luz |
| Pausa | Esc | Botão superior direito |

Aproxime-se da placa BR-319 à direita da estrada para ler. O abrigo permite entrar pela abertura frontal. Há limites no perímetro do cenário. A pausa congela a simulação e limpa entradas; perder foco ou sair da captura do mouse também pausa. O celular deve ficar na horizontal: a tela vertical exibe orientação e pausa o jogo.

## Implementação

- Three.js/WebGL, câmera em primeira pessoa, gravidade até o plano do chão e movimento por delta de tempo.
- Colisões AABB, raio de jogador e deslocamento em pequenos passos para impedir atravessamento; deslizamento por eixo.
- Joystick analógico e câmera com Pointer Events independentes, captura e cancelamento de ponteiros.
- Neblina, iluminação noturna, lanterna funcional, texturas nearest, geometria low-poly, scanlines e fonte pixelada local.
- Baixo/Médio/Alto usam 35%/50%/75% da resolução CSS; ajuste adaptativo entre 60% e 100% de cada nível conforme a taxa de quadros. Qualidade persistida quando localStorage está disponível.
- Menus funcionais de início, pausa, configurações e créditos; interação real com uma placa.
- Tratamento de falha de inicialização e perda de contexto WebGL; redimensionamento responsivo e safe areas.

## Arquivos

```text
index.html
package.json
package-lock.json
tsconfig.json
.gitignore
README.md
public/fonts/OFL.txt
public/fonts/vt323-latin-400-normal.woff2
src/main.ts
src/style.css
src/core/Game.ts
src/core/GameLoop.ts
src/core/SceneManager.ts
src/player/PlayerController.ts
src/player/CameraController.ts
src/input/InputManager.ts
src/input/TouchInput.ts
src/input/VirtualJoystick.ts
src/systems/CollisionSystem.ts
src/systems/GraphicsSettings.ts
src/ui/MainMenu.ts
src/ui/MobileControls.ts
src/world/TestEnvironment.ts
```

## Validação desta entrega

`npm install` (cache gravável) e `npm run build` concluídos. Chromium headless com WebGL por SwiftShader: menus, seleção gráfica, créditos, lanterna e pausa; verificações de colisão, limite vertical da câmera, caminhada/corrida e deslocamento equivalente a 30/120 FPS. Viewport mobile: controles, pausa e tela vertical; eventos sintéticos com dois pointerIds verificam movimento/olhar simultâneos e cancelamento. Sem erros de execução no navegador.

A emulação e os eventos sintéticos não substituem testes em aparelhos físicos: Safari/iOS e Chrome/Android ainda precisam de verificação real. Sem testes de campanha, áudio, inimigos ou posto completo, pois estão fora desta etapa.
