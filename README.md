# BOITATÁ: A Última Luz da BR-319

**Etapa 2/6 — Ambientação e cenários.** Protagonista: **Raimundo Pinheiro**. Noite chuvosa de 2004 em um trecho **fictício** da BR-319 ao sul de Manaus. Não é uma reprodução geográfica. Sem campanha completa ou IA do Boitatá.

## Executar

Node.js 20.19+ ou 22.12+ (validado com Node 24).

```sh
npm install
npm run dev
```

Se o diretório pessoal não permitir escrita, use `npm ci --cache /workspace/.npm-cache` (ou `npm install --cache /workspace/.npm-cache` para atualizar dependências).

```sh
npm run build
npm run preview
```

## Exploração

- O jogador começa diante do **POSTO ÚLTIMA PARADA**, com cobertura, pilares, duas bombas, luzes fluorescentes, poças, caminhão antigo e carro do protagonista.
- Passe entre as bombas, aproxime-se da porta de vidro da conveniência, olhe para ela e pressione **E** para abrir. A loja tem balcão, caixa, produtos, prateleiras, geladeiras, TV de tubo, rádio, telefone, relógio e documentos legíveis.
- No fundo da loja há quatro portas identificadas: banheiro, depósito, oficina e sala elétrica. Todos têm objetos próprios e espaço para circular. Portas abrem para dentro para manter o corredor livre.
- Gerador e abrigo de ferramentas ficam no lado direito externo. O portão do pátio pode ser aberto e fechado.
- A rodovia fica à esquerda, com acessos ao posto, acostamento, faixas gastas, lama, vegetação avançando e um caminhão abandonado ao norte.
- Para a floresta, siga a placa da trilha atrás do ponto inicial. O caminho segue para o sul e vira à esquerda do caminhante (leste), até a clareira com retransmissora e luzes discretas. Não há missão ou transmissão funcional nesta etapa.

## Controles preservados

| Ação | Computador | Celular |
| --- | --- | --- |
| Mover | WASD | Joystick esquerdo |
| Olhar | Mouse capturado após iniciar | Arrastar à direita |
| Correr | Segurar Shift | Segurar CORRER |
| Interagir/portas | E, próximo e olhando para o objeto | Botão E |
| Lanterna | F | Botão de luz |
| Pausa | Esc | Botão superior direito |

Movimento e câmera funcionam simultaneamente por Pointer Events independentes. Perda de foco, saída do pointer lock ou orientação vertical no celular pausam o jogo. Safe areas e bloqueio de scroll/gestos preservados. O celular deve estar na horizontal; não é necessário bloqueio automático de orientação.

## Renderização e desempenho

- Three.js/WebGL, low-poly, texturas nearest, fonte VT323 local (licença em `public/fonts/OFL.txt`), resolução interna reduzida e scanlines.
- Qualidade Baixo/Médio/Alto: 35%/50%/75% da resolução CSS; adaptação entre 60% e 100% do nível. A medição adaptativa usa o tempo real do frame, enquanto a física limita delta a 50 ms.
- Visibilidade configurável: 28, 48 ou 72 metros nas configurações.
- Vegetação procedural determinística em setores de 20 m: árvores, palmeiras, raízes, cipós e arbustos em `InstancedMesh`, com escala, rotação e cores variáveis. Os corredores e clareira são reservados antes da geração.
- Setores próximos são criados antes do deslocamento; os distantes removem colisores e buffers de instância. Geometrias e materiais compartilhados são preservados até o descarte do mundo.
- Objetos estáticos do posto e estrada também são agrupados por material em instâncias. Portas continuam independentes.
- Até quatro luzes pontuais e uma lanterna, sem sombras dinâmicas. Chuva em uma única chamada de desenho, suprimida sob coberturas. Poças usam manchas translúcidas com variação de brilho; não há reflexão de cena ou ray tracing.
- Colisão AABB por eixos com subpassos, inclusive em paredes, árvores, bombas, veículos, móveis e portas/portão. Painéis abertos também colidem. A porta não fecha sobre o jogador. Chão plano e limites externos de 58 m.

**Meta de 30 FPS em celulares intermediários ainda não certificada.** O teste automatizado mede chamadas, triângulos e tempos no Chromium/SwiftShader deste ambiente, sem equivalência a uma GPU de celular. Android/iOS físicos ainda precisam de validação.

## Áudio: assets pendentes

Não há arquivos de áudio fornecidos, portanto **nenhum desses sons foi implementado como conteúdo audível**. `src/audio/AudioManager.ts` oferece carregamento, volume, loops, pausa/retomada, atenuação por distância e passos condicionados ao movimento. `AUDIO_ASSETS` permanece vazio. Para ativar, adicione arquivos licenciados a `public/audio/` e registre seus caminhos, volumes e loops no manifesto.

Pendências: chuva, insetos, vento, eletricidade/gerador, rádio e passos. Sons posicionais podem usar `position` e `range`; não há processamento HRTF ou oclusão.

## Testes

Com o servidor Vite em execução em outro terminal:

```sh
npm run test:browser
```

Requer Chromium instalado. Caminho padrão `/usr/bin/chromium`; defina `CHROMIUM_PATH` para outro executável e `GAME_URL` para outro servidor. O teste usa `playwright-core`, sem baixar navegadores automaticamente.

O teste valida trajetos reais pelo sistema de movimento/colisão até a loja, os quatro cômodos, estrada e clareira; portas fechadas e abertas; portão; colisões de objetos e árvore; descarregamento de setores; menus; lanterna; pausa e orientação mobile. Injeta dois toques simultâneos pelo protocolo do Chromium. Também renderiza uma amostra de 35 frames em 422×195 e informa mediana/p95, chamadas e triângulos. Isso não substitui jogar em aparelhos físicos.

## Organização

Módulos da Etapa 1 preservados em `core/`, `player/`, `input/`, `systems/` e `ui/`. O antigo `world/TestEnvironment.ts` permanece disponível para diagnóstico, mas não é mais o cenário ativo.

Novos módulos da Etapa 2:

- `world/GameWorld.ts`: composição, estrada, trilha, clareira e interações.
- `world/GasStation.ts`: posto, interiores, veículos e objetos.
- `world/WorldAssets.ts`: geometrias, materiais, texturas e agrupamento estático.
- `world/WorldInteraction.ts`: interações e estados das portas.
- `world/ForestSectors.ts`: vegetação instanciada e streaming.
- `world/Atmosphere.ts`: chuva e poças.
- `audio/AudioManager.ts`: infraestrutura sem assets sonoros.
- `tests/world.mjs`: verificação automatizada e medição de renderização.
