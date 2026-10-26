# BOITATÁ: A Última Luz da BR-319

**Etapa 4/6 — Boitatá e inteligência artificial.** Protagonista: **Raimundo Pinheiro**. Noite chuvosa de 2004 em um trecho **fictício** da BR-319 ao sul de Manaus. Não é uma reprodução geográfica. Capítulo 1 preservado, com encontros interativos da guardiã após seu final; sem campanha completa do Capítulo 2.

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

## Capítulo 1 — Chamado às 23h47

Amazonas, **21 de novembro de 2004, 23h47**. **Raimundo Pinheiro**, 24 anos, técnico de manutenção, chega ao posto para atender um chamado elétrico. Todas as referências ao protagonista usam esse nome.

As falas em português estão em `src/data/chapter1.ts`, separadas da lógica. Há legendas com nome, temporização, avanço por E/toque e digitação opcional nas configurações. Durante cenas e painéis, movimento e interações incompatíveis ficam bloqueados. A pausa interrompe a temporização.

### Fluxo jogável (contém solução do puzzle)

1. Avance a introdução pelo rádio. Entre pela porta de vidro usando **E**, olhando diretamente para ela a menos de 2,8 m.
2. No balcão, investigue o documento **CHAMADO** à direita do rádio. Isso revela a gaveta à esquerda.
3. Abra a gaveta e colete a chave sobre a madeira. O inventário abre com **I** ou pelo botão de toque.
4. Abra o depósito, segunda porta no fundo da loja: a chave é usada de verdade e o desbloqueio fica salvo.
5. Colete o fusível na caixa ao centro do depósito. Fotografias podem ser recolhidas na lateral.
6. Entre na sala elétrica, última porta à direita no fundo. Colete a anotação sobre a caixa próxima à entrada. O registro de manutenção está mais ao fundo; contorne a caixa pelo lado direito.
7. Saia da loja e contorne o lado direito do prédio. O gerador fica externamente, atrás do abrigo de ferramentas.
8. Interaja com o painel, instale o fusível e consulte a anotação. Acione **2 → 1 → 3**. Uma entrada errada reinicia a sequência, preservando o fusível. Os interruptores são operados no painel acessível por raycast.
9. A iluminação retorna gradualmente. Aguarde estabilizar para concluir a restauração da energia.
10. Volte ao terminal **CFTV**, à esquerda do caixa, e assista à gravação por pelo menos sete segundos. A sequência visual roteirizada mostra uma grande forma luminosa atravessando a mata. Encerre a gravação e acompanhe a transmissão final.

O posto apaga progressivamente. Surge **“Investigue a origem da interferência.”** O save prepara o Capítulo 2. A Etapa 4 libera aparições e encontros com o Boitatá na floresta após esse final, sem acrescentar a campanha completa do Capítulo 2.

Rádio, telefone, TV, documentos, gaveta, portas, gerador e itens têm comportamentos reais. A fita cassete oferece uma **transcrição textual**, não uma gravação de voz inexistente. Outros documentos e fotografias podem ser examinados pelo inventário. A lanterna também pode ser acionada nele.

### Eventos e save

Os seis eventos roteirizados têm flags persistentes: telefone ao entrar, silhueta após investigar o balcão, interferência da TV ao encontrar a chave, bomba ao coletar a anotação, gravação da câmera e apagão final. Eles não repetem continuamente. Efeitos transitórios interrompidos por recarga não são repetidos; cenas narrativas essenciais interrompidas podem ser retomadas para não bloquear o capítulo.

Save automático após ações importantes e ao pausar, em `localStorage`, chave `boitata-save-v1`, formato **versão 1**. Inclui capítulo, objetivos concluídos, itens/estados, desbloqueio do depósito, puzzle, eventos, flags narrativas e configurações. Valida identificadores, tipos, versão e dependências essenciais. Dados incompatíveis/corrompidos são ignorados com aviso; uma cópia é tentada em `boitata-save-v1.invalid`. Falhas de acesso ou quota exibem aviso e permitem continuar sem persistência.

Use **Continuar jogo** para retomar. A posição volta à chegada e portas físicas começam fechadas; os desbloqueios, itens coletados e progressão são restaurados. Entradas parciais do puzzle reiniciam. **Nova partida** pede confirmação no próprio menu antes de apagar o progresso.

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
| Interagir/portas/avançar fala | E, próximo e olhando para o objeto | Botão E / Avançar |
| Inventário | I | Botão INVENTÁRIO |
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

## Áudio: efeitos e assets pendentes

Não há arquivos de áudio ambiente ou dublagem fornecidos. **Chuva, insetos, vento, rádio ambiente e passos continuam sem gravações audíveis**. A Etapa 3 acrescenta efeitos simples sintetizados por Web Audio para telefone, interferência, bomba e eletricidade (`StorySounds.ts`); eles são desbloqueados pelo gesto de iniciar/continuar. Não são gravações ou dublagem. As falas permanecem legendadas; `DialogueLine.audio` aceita um arquivo licenciado futuro. `src/audio/AudioManager.ts` oferece carregamento, volume, loops, pausa/retomada, atenuação por distância e passos condicionados ao movimento. `AUDIO_ASSETS` permanece vazio. Para ativar, adicione arquivos licenciados a `public/audio/` e registre seus caminhos, volumes e loops no manifesto.

Pendências: chuva, insetos, vento, eletricidade/gerador, rádio e passos. Sons posicionais podem usar `position` e `range`; não há processamento HRTF ou oclusão.

## Testes

Com o servidor Vite em execução em outro terminal:

```sh
npm run test:browser
npm run test:chapter
npm run test:creature
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

### Módulos da Etapa 3

- `data/chapter1.ts`: falas, itens, objetivos e sequência do puzzle.
- `story/ChapterOne.ts`: coordenação do capítulo, objetos, progressão e restauração.
- `story/DialogueManager.ts`, `Inventory.ts`, `ObjectiveManager.ts`: sistemas independentes.
- `story/InteractionSystem.ts`: raycast de proxies e oclusão por sólidos.
- `story/HorrorEventManager.ts`, `StoryEffects.ts`: flags e efeitos visuais transitórios.
- `story/SaveManager.ts`: esquema versionado, validação, persistência e erros.
- `audio/StorySounds.ts`: efeitos elétricos/telefone/interferência/bomba sintetizados.
- `ui/ChapterUI.ts`: inventário, legendas, painel do gerador e sequência CFTV.
- `tests/chapter.mjs`: capítulo do início ao fim por raycasts e trajetos com colisões; coleta dos oito itens, erro/acerto do puzzle, dez objetivos, seis eventos, tempo mínimo da câmera, final, save/load, corrupção e inventário por toque.

Os testes de navegador exigem Vite ativo. Os resultados de emulação Chromium não certificam Safari/iOS, Android físico nem 30 FPS em celulares intermediários.

## Etapa 4 — A guardiã luminosa

### Aparições e encontro

Todas as aparições exigem a transmissão final e o apagão do Capítulo 1 (`flags.ending`). O Capítulo 1 mantém objetivos, itens e puzzle, sem perseguições durante a investigação.

- **Luzes entre árvores:** entre na trilha, aproximadamente x=0, z=18–31. Pequenas escamas emissivas revelam parte da serpente por sete segundos, sem ataque.
- **Travessia da BR-319:** após o capítulo, observe a rodovia no trecho x < -7, z=16–36. A serpente atravessa à distância por uma rota navegável, sem perseguição nessa aparição. É possível vê-la antes ou depois da trilha.
- **Clareira:** aproxime-se da instalação de comunicação, em torno de x=18, z=42. Um checkpoint é registrado na entrada da trilha e começa um encontro de observação. Apague a lanterna, evite correr e use as rochas/troncos caídos como cobertura.

Os três eventos são únicos por partida, persistidos em `boitata-creature-v1` (versão 1). Aparições usam emergência/desvanecimento sobrenatural intencional. A locomoção visível usa deltaTime, caminhos com colisões e histórico real da cabeça, sem teletransporte para perseguir. Encontros posteriores podem ocorrer na clareira após o recuo e o intervalo de segurança; não repetem os avisos das três aparições.

### Modelo, percepção e navegação

Serpente low-poly com **28 segmentos**, cabeça com mandíbula e crista de fogo, olhos luminosos, escamas dorsais, cauda afilada e oscilação procedural. Segmentos amostram uma curva Catmull–Rom centrípeta pelo histórico da cabeça. Geometrias/materiais são compartilhados; corpo e escamas usam instâncias. **Uma única luz** representa a criatura, sem sombras dinâmicas. A pose inicial é preparada com uma trilha navegável e surge gradualmente.

A percepção considera distância, FOV de 110°, linha de visão contra os sólidos existentes, lanterna, movimento/corrida e estado narrativo. Mesmo o estímulo de ruído exige linha de visão, evitando detecção através de paredes neste modelo simplificado. Corrida alcança até 15 m; passos normais, 5 m. A luz aumenta o alcance visual para 20 m, ou 28 m quando apontada diretamente. Apontar requer alinhamento superior a 0,94 com a direção da criatura.

A navegação usa A* local limitado, oito vizinhos, sem cortar cantos em diagonal, simplificação apenas de trechos livres e deslocamento com varredura em subpassos. Replaneja a cada 0,7 s (0,8 s nas aparições); valida cada deslocamento diante de obstáculos atualizados. A margem da cabeça é de 1,1 m. Não há navegação pelo interior do posto: o jogador pode recuar para a área anterior à floresta, z < 17.

| Estado | Condições e saída |
| --- | --- |
| DORMANT | Oculto e sem atualizar o modelo; ativa nos encontros permitidos pela narrativa. |
| PATROL | Percorre waypoints da clareira; visão leva a STALK, ruído a INVESTIGATE. |
| INVESTIGATE | Vai à última posição ouvida; visão leva a STALK, sete segundos sem resolução levam a SEARCH. |
| STALK | Observa e se orienta para o jogador. Lanterna direta aumenta suspeita a 0,8/s; luz ligada a 0,2/s. Desligada, a suspeita reduz, salvo proximidade extrema. Há no mínimo três segundos antes de CHASE. Perda de visão por três segundos leva a SEARCH; discrição prolongada provoca RETREAT. |
| CHASE | Acelera de 2,2 até 3,9 m/s, abaixo dos 5,2 m/s de corrida do jogador. Só atualiza a última posição conhecida com visão válida. Perda de contato por 1,2 s leva a SEARCH; perseguição limitada a 18 s. |
| SEARCH | Vai à última posição conhecida e varre o olhar ao chegar; reencontro leva a STALK, sete segundos sem contato levam a RETREAT. |
| RETREAT | Recua por caminhos, desvanece e volta a DORMANT em seis segundos, com intervalo de segurança. |

A lanterna direta provoca brilho crescente, aviso visual e intensificação do som grave. Durante a perseguição há um pulso musical sintetizado, oscilação luminosa e tremor sutil da câmera. As novas coberturas possuem colisão e permitem contornar pelos lados. O abrigo do posto e a trilha de retorno oferecem fuga; o jogador não precisa vencer uma corrida contra uma criatura mais rápida que ele.

### Captura e checkpoint

Captura exige distância inferior a 1,15 m **e visão válida**. A tela recebe luz alaranjada, o som sintetizado é distorcido, a câmera treme e a imagem escurece. Após 3,3 segundos, Raimundo volta ao checkpoint da trilha (ou à chegada no laboratório), com lanterna apagada e 20 segundos de segurança. Inventário, itens e os dez objetivos do Capítulo 1 ficam intactos. Pausar congela captura, movimento e áudio.

O checkpoint da floresta e os eventos ficam em um save separado e validado; não migram nem substituem o save do Capítulo 1. Continuar após registrar o checkpoint restaura Raimundo na trilha. **Nova partida** limpa ambos os saves após a confirmação existente.

### Áudio e teste de desenvolvimento

`audio/CreatureAudio.ts` sintetiza aproximação grave, ruído filtrado de movimento/estalos e um pulso harmônico de perseguição. Um `PannerNode` HRTF acompanha a criatura, com atenuação por distância e listener atualizado pela câmera; a captura usa um `WaveShaperNode`. Não são gravações fornecidas ou dublagem. O contexto é desbloqueado ao iniciar/continuar, suspenso na pausa/dormência e fechado no descarte.

Com `npm run dev`, acrescente **`?aiDebug`** ao endereço aberto no seu navegador. Expanda **IA · DESENVOLVIMENTO**, escolha **Laboratório · Ir à clareira** e avance as legendas iniciais se necessário. Os botões forçam os sete estados e mostram estado, suspeita, visão e distância. O laboratório ignora apenas o bloqueio narrativo da criatura; não conclui objetivos nem grava aparições/checkpoints. Ele não aparece no build de produção.

`npm run test:creature` valida os sete estados, campo/linha de visão, lanterna apagada, ruído, barreiras, perda de contato, busca/recuo, A*, deslocamentos sem teletransporte, captura, três aparições, persistência/restauração do checkpoint e renderização em resolução mobile. As regressões do capítulo e dos controles continuam nos outros dois comandos.

Amostra automatizada de 35 frames a 422×195 com criatura e cenário: aproximadamente 76 chamadas e 20 mil triângulos na visão selecionada. Tempos impressos pelo teste são do Chromium/SwiftShader deste ambiente. **30 FPS em Android/iOS reais ainda não estão certificados.**

Novos arquivos: `creature/BoitataModel.ts`, `BoitataAI.ts`, `Navigation.ts`, `CreatureEncounter.ts`, `CheckpointManager.ts`, `audio/CreatureAudio.ts`, `vite-env.d.ts` e `tests/creature.mjs`.
