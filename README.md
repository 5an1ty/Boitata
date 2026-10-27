# BOITATÁ: A Última Luz da BR-319

**Versão web 1.0.0 — Etapa 6/6.** Protagonista: **Raimundo Pinheiro**. Noite chuvosa de 2004 em um trecho **fictício** da BR-319 ao sul de Manaus. Não é uma reprodução geográfica. Capítulo 1 preservado, investigação da instalação, retorno ao posto e três desfechos jogáveis.

## Tecnologias e dependências

- Runtime: **Three.js**, TypeScript, WebGL2, HTML5, CSS3, Web Audio e LocalStorage. Sem React ou framework de jogos.
- Ferramentas: Vite, TypeScript e `@types/three`. `playwright-core` apenas para testes, usando Chromium instalado.
- Dependências exatas em `package-lock.json`. Fonte VT323 local, com licença SIL OFL em `public/fonts/OFL.txt`; favicon, modelos e texturas produzidos no projeto. Nenhum asset comercial foi acrescentado.

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

O posto apaga progressivamente. Surge **“Investigue a origem da interferência.”** A transmissão inicia o Capítulo 2. As aparições e encontros da guardiã acompanham o percurso até a instalação e o retorno ao posto.

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
| Pular | Espaço | — |
| Olhar | Mouse capturado após iniciar | Arrastar à direita |
| Correr | Segurar Shift | Segurar CORRER |
| Interagir/portas/avançar fala | E, próximo e olhando para o objeto | Botão E / Avançar |
| Inventário | I | Botão INVENTÁRIO |
| Lanterna | F | Botão de luz |
| Pausa | Esc | Botão superior direito |

Movimento e câmera funcionam simultaneamente por Pointer Events independentes. Perda de foco, saída do pointer lock ou orientação vertical no celular pausam o jogo. Safe areas e bloqueio de scroll/gestos preservados. O celular deve estar na horizontal; não é necessário bloqueio automático de orientação.

## Renderização e desempenho

- Three.js/WebGL, low-poly, texturas nearest, fonte VT323 local (licença em `public/fonts/OFL.txt`), resolução interna reduzida e scanlines.
- Qualidade Baixo/Médio/Alto: valores iniciais de 35%/50%/75% da resolução CSS, com ajuste manual de 25% a 100%; adaptação entre 60% e 100% do valor escolhido. A medição adaptativa usa o tempo real do frame, enquanto a física limita delta a 50 ms.
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
npm run test:campaign
npm run test:preferences
npm run test:release
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

O checkpoint da floresta e os eventos ficam em um save separado e validado; não migram nem substituem o save do Capítulo 1. Continuar após registrar o checkpoint restaura Raimundo na trilha. **Nova partida** limpa os saves do capítulo, criatura e campanha após a confirmação existente. A campanha tem precedência na posição de retorno quando possui um checkpoint mais recente.

### Áudio e teste de desenvolvimento

`audio/CreatureAudio.ts` sintetiza aproximação grave, ruído filtrado de movimento/estalos e um pulso harmônico de perseguição. Um `PannerNode` HRTF acompanha a criatura, com atenuação por distância e listener atualizado pela câmera; a captura usa um `WaveShaperNode`. Não são gravações fornecidas ou dublagem. O contexto é desbloqueado ao iniciar/continuar, suspenso na pausa/dormência e fechado no descarte.

Com `npm run dev`, acrescente **`?aiDebug`** ao endereço aberto no seu navegador. Expanda **IA · DESENVOLVIMENTO**, escolha **Laboratório · Ir à clareira** e avance as legendas iniciais se necessário. Os botões forçam os sete estados e mostram estado, suspeita, visão e distância. O laboratório ignora apenas o bloqueio narrativo da criatura; não conclui objetivos nem grava aparições/checkpoints. Ele não aparece no build de produção.

`npm run test:creature` valida os sete estados, campo/linha de visão, lanterna apagada, ruído, barreiras, perda de contato, busca/recuo, A*, deslocamentos sem teletransporte, captura, três aparições, persistência/restauração do checkpoint e renderização em resolução mobile. As regressões do capítulo e dos controles continuam nos outros dois comandos.

Amostra automatizada de 35 frames a 422×195 com criatura e cenário: aproximadamente 76 chamadas e 20 mil triângulos na visão selecionada. Tempos impressos pelo teste são do Chromium/SwiftShader deste ambiente. **30 FPS em Android/iOS reais ainda não estão certificados.**

Novos arquivos: `creature/BoitataModel.ts`, `BoitataAI.ts`, `Navigation.ts`, `CreatureEncounter.ts`, `CheckpointManager.ts`, `audio/CreatureAudio.ts`, `vite-env.d.ts` e `tests/creature.mjs`.

## Etapa 5 — Campanha e finais

**Duração pretendida: 30–45 minutos numa primeira investigação, ainda não certificada por playtests humanos.** Não há espera artificial para estender a duração: deslocamentos, busca, leitura, puzzle, decisões e encontros compõem o tempo. Cutscenes curtas podem ser puladas. O teste automatizado conhece os locais, avança falas e não mede a experiência de uma primeira partida; não é evidência dessa duração.

### Capítulo 2 — O som das árvores

Após o apagão, o rádio indica a antena depois da curva. Saia, siga o acostamento à esquerda e examine o caminhão abandonado ao norte (próximo de x=-17, z=32). Seu rádio fica à direita da cabine, perto do para-brisa. Ele revela a função dos comboios e aponta a trilha atrás do posto. Volte pelo acostamento e pelo pátio, entre na trilha, apague a lanterna e passe pelas escamas luminosas. Siga até a instalação. A progressão exige examinar caminhão e rádio; estar apenas perto deles não completa esses objetivos.

### Capítulo 3 — O guardião

A instalação agora inclui três arquivos exploráveis a leste da antena, ligados por um corredor exterior. Examine a placa de entrada e recolha o manual. As provas seguem uma ordem documentada:

1. Fotografia da queimada, sala oeste.
2. Gravação, sala central (transcrição disponível no inventário).
3. Registro de transporte, sala leste.

Cada prova é um item real do inventário e persiste no save existente. Compare as três no terminal exterior: combustível e material de ignição saíam do posto para apoiar queimadas. O Boitatá protege a floresta; ele não é um caçador genérico.

Na base da antena, configure o transmissor conforme o manual: **153.40 MHz, 12 V, chave REDE**. O indicador mostra os três circuitos corretos; verificar uma combinação errada preserva os componentes e permite tentar de novo. Após o rearme, apague a lanterna e use o lado protegido da cobertura do painel. O objetivo só completa quando a percepção da criatura não consegue ver Raimundo. Volte à antena e feche o acoplador. Uma transmissão identifica o bloqueador principal no posto.

### Capítulo 4 — A última luz

Retorne pela trilha. O relógio está em **00h13**. Uma travessia na rodovia e as falas de Raimundo reinterpretam os acontecimentos. O equipamento auxiliar fica na lateral externa direita do prédio, perto de x=23, z=-13.

- Reative o equipamento e interaja novamente para carregar as três provas.
- O checkpoint anterior à sequência final é salvo.
- Desligue o relé da rodovia (x=-6, z=18), contorne o gabinete e desligue o da trilha (x=0,6, z=28).
- A guardiã observa os caminhos. Apague a lanterna, use cobertura ou corra para quebrar contato. Volte para a área do posto e conclua no equipamento auxiliar.
- Alternativamente, entre pelo lado direito do carro e confirme a fuga. A escolha é explícita; o jogo não transmite provas automaticamente.

O sistema mantém objetivos em ordem. Na fuga, as tarefas de transmissão abandonadas **não** são marcadas falsamente como concluídas. Os capítulos 2–4 acrescentam vinte objetivos aos dez do Capítulo 1.

### Três finais

| Final | Condição real |
| --- | --- |
| O Amanhecer | Carregar fotografia, gravação e transporte; operar ambos os relés; escapar e confirmar a transmissão. A iluminação amanhece e a criatura recua. |
| Estrada sem Fim | Escolher fugir no carro após retornar ao posto, sem concluir a transmissão. Câmera de direção, retorno sobrenatural ao posto e relógio em 23h47. |
| A Testemunha | Completar a mesma transmissão com **todos os seis registros opcionais** no inventário. Dois pontos luminosos observam a partida. |

Registros opcionais: fita cassete, registro de manutenção e fotografias do Capítulo 1; diário das cinzas atrás dos arquivos; livro de abastecimento na lateral do gerador; bilhete da testemunha no banheiro. Nenhum é destruído pela captura. É possível voltar para buscar os que faltam antes de transmitir.

Os finais têm cutscenes procedurais leves: movimento de câmera, legendas, alterações de luz, animação de instrumentos/painel e transições em CSS. Não há arquivos de vídeo ou dublagem inventada. O painel final permite voltar ao menu ou repetir o trecho a partir do checkpoint, inclusive para tentar outro desfecho.

### Saves, checkpoints e recuperação

O save do Capítulo 1 permanece em `boitata-save-v1`, com o inventário ampliado de forma compatível. A criatura conserva `boitata-creature-v1`. A campanha usa `boitata-campaign-v1`, **versão 1**, com capítulo, objetivos ordenados, flags, resultado, checkpoint e tempo ativo.

Checkpoints efetivos: gerador resolvido; entrada da floresta; chegada à instalação; três evidências recuperadas; equipamento preparado antes dos relés. O checkpoint do gerador é inferido do puzzle salvo e retorna ao exterior seguro do gerador. Os demais possuem posições fixas verificadas por colisão. Ao capturar durante a sequência final, os relés reiniciam; provas e investigação permanecem. Coletar opcionais não faz o checkpoint regredir.

Carregar restaura inventário, progresso, disponibilidade das provas, objetivo, posição, equipamentos e estado visual dos finais. Saves malformados, capítulos fora de ordem e resultados inconsistentes são rejeitados; a investigação do Capítulo 1 é preservada. Se uma gravação parcial entre os dois saves perder uma prova obrigatória, a campanha retorna ao arquivo correspondente para permitir recolhê-la. Itens históricos já coletados podem recompor seus objetivos, sem exigir coletá-los duas vezes.

### Verificações

`npm run test:campaign` cobre Capítulos 2–4 por trajetos com colisões e raycasts, usando caminhada de 2,7 m/s na simulação; ordem dos objetivos, erros e acerto do transmissor, três provas persistentes, relés, três finais, recuperação do checkpoint, retorno ao menu e reload. Também carrega um final no viewport mobile e testa toque, menu, repetição, inventário e retorno ao joystick. `test:chapter` cobre o percurso completo do Capítulo 1; `test:creature` cobre perseguição/captura e estados; `test:browser` conserva as regressões de cenário e controles.

Módulos novos: `campaign/ChapterManager.ts`, `CampaignManager.ts`, `CampaignSave.ts`, `CampaignWorld.ts`, `CutsceneManager.ts`, `data/campaign.ts` e `tests/campaign.mjs`. Todos os sistemas anteriores são reutilizados. A Etapa 6 acrescenta preferências, acessibilidade, revisão de recursos e empacotamento estático. Duração e desempenho em celulares físicos continuam pendentes de playtest.

## Etapa 6 — Configuração, acessibilidade e publicação

### Menu e preferências

O menu inicial oferece **Novo jogo, Continuar, Configurações e Créditos**. Continuar fica desabilitado se o save do capítulo não for válido. Nova partida confirma o apagamento de progresso existente, preserva as preferências e recria a cena após liberar os recursos anteriores. Em pausa, Retomar substitui Continuar.

Preferências versionadas em **`boitata-settings-v1`**, independentes da campanha e com validação de tipos/limites:

| Grupo | Controles reais |
| --- | --- |
| Gráficos | Baixo/Médio/Alto, resolução interna, adaptação, distância de visão, efeito PSX, dithering e tremulação |
| Áudio | Volume geral, música e efeitos, aplicados aos buses de Web Audio e às fontes HTMLAudio |
| Jogabilidade | Sensibilidade de mouse/toque, inversão vertical, tamanho dos controles e intensidade do tremor |
| Acessibilidade | Legendas sempre ativas, digitação opcional, redução de tremor e de flashes, indicadores visuais e volume |

A redução de flashes suaviza captura alaranjada, oscilação das luzes, interferência da TV e efeitos CSS. A preferência de redução de movimento do sistema ativa valores conservadores na primeira visita. Ajustar configurações não cria uma partida salva. Saves antigos fornecem valores iniciais apenas quando não há preferências independentes.

Os controles mobile foram verificados em viewports **16:9, 19.5:9 e 20:9**, incluindo tamanho máximo, joystick, câmera com segundo dedo, cancelamento, inventário, legendas, orientação vertical e menus. Apenas os painéis rolam por toque; a página e a área de jogo não rolam. Isso não substitui aparelhos físicos.

### Desempenho e limpeza

Pixel ratio limitado a 1, resolução adaptativa, chuva limitada a 700 segmentos, vegetação e objetos estáticos instanciados, materiais/geometrias compartilhados e streaming por setores foram mantidos. Uma luz representa toda a criatura; não existem sombras dinâmicas por segmento. O build separa Three.js do código da aplicação para cache e evita o aviso de chunk único acima de 500 kB.

`?fps` no servidor de desenvolvimento mostra FPS, maior tempo de frame, chamadas e triângulos. `?aiDebug` mantém o laboratório da IA. Ambos ficam ausentes no build de produção. Metas: **30 FPS mobile / 60 FPS desktop**, sem garantia universal.

Reiniciar interrompe o loop, aborta listeners, remove assinaturas das preferências, fecha contextos de áudio, descarta geometria/texturas/materiais/buffers e libera o contexto WebGL. O teste de preferências verifica assinaturas estáveis após três reinícios; o de produção verifica a perda controlada do contexto antigo e a presença de apenas um canvas novo.

### Build e preview

```sh
npm install
npm run build
npm run preview
```

O artefato está em **`dist/`**. O preview é uma verificação local, não uma publicação. Se a porta estiver ocupada, use `npm run preview -- --port 4173 --strictPort` e encerre o servidor anterior que você iniciou.

`vite.config.ts` usa `base: './'`: assets funcionam na raiz ou numa subpasta como `/Boitata/`. `test:release` serve o próprio `dist/` nessa subpasta e verifica chunks, fonte, favicon, preferências, três finais a partir do checkpoint e responsividade. Não serve arquivos TypeScript de desenvolvimento.

### Deploy estático — escolher uma opção

**Nenhum deploy público foi executado nesta entrega.** O repositório possui configuração para estas opções:

- **Vercel:** importe o repositório, use Vite, comando `npm run build` e saída `dist`. `vercel.json` registra esses valores. Use Node 22.12+ ou 24.
- **Netlify:** conecte o repositório; `netlify.toml` define build e publicação de `dist`, com Node 22.
- **GitHub Pages:** em Settings → Pages, selecione GitHub Actions. Em Actions, execute manualmente **Publicar GitHub Pages manualmente** (`.github/workflows/pages.yml`). O workflow instala via `npm ci`, compila e publica o artefato Pages. Ele **não** é disparado por push. A URL só existe depois de a publicação efetivamente concluir.
- **Outro servidor:** envie o conteúdo de `dist/` mantendo a estrutura de pastas, sirva `index.html` e os MIME types de JS/CSS/fontes corretamente, preferencialmente com HTTPS.

Não há backend, variáveis secretas ou rotas de SPA para reescrever. Saves são locais ao navegador e à origem: o progresso de desenvolvimento não migra automaticamente para um domínio de produção. Use cache curto para `index.html` e cache longo para assets com hash; não configure cache imutável do HTML.

### Estrutura principal

```text
src/core/          loop, renderer e integração
src/input/         teclado, mouse, joystick e Pointer Events
src/player/        câmera, movimento, gravidade e colisão
src/world/         posto, estrada, floresta, chuva e recursos
src/story/         Capítulo 1, diálogos, inventário, interação e save
src/campaign/      capítulos 2–4, puzzles, checkpoints e finais
src/creature/      modelo procedural, navegação, percepção e IA
src/systems/       colisões, preferências, gráficos, efeitos e FPS
src/audio/         Web Audio espacial, buses e infraestrutura de assets
src/ui/            menu, configurações, HUD, touch e painéis
src/data/          narrativa e condições dos puzzles
public/            fonte licenciada e favicon
tests/            regressão funcional, campanha e produção
```

### Limites da entrega

- Chuva visual está implementada; **gravações de chuva, vento, insetos, passos e rádio ambiente ainda precisam ser produzidas/licenciadas**. Não há dublagem. `AudioManager.ts` e `AUDIO_ASSETS` documentam a integração; arquivos futuros devem usar `import.meta.env.BASE_URL` ao montar URLs públicas para manter compatibilidade com subpastas. Os efeitos existentes e o pulso musical são sintetizados.
- Duração de 30–45 min e metas de FPS exigem playtest humano e dispositivos reais; não foram certificados.
- Chromium automatizado não é Safari/iOS real. Navegadores precisam de WebGL2 e suporte atual a Pointer Events/Web Audio; falha de WebGL recebe mensagem de erro e opção de tentar novamente.
- O pacote está preparado para hospedagem estática; **publicação, DNS e validação do site publicado não foram realizados**.

Resultados e comandos de validação ficam em [docs/RELEASE.md](docs/RELEASE.md). A campanha e os três finais são funcionais nos testes; a produção de áudio restante e a homologação em hardware real continuam abertas.
