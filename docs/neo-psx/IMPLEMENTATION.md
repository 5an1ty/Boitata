# Base gráfica Neo-PSX — etapa 2

Implementação sobre Three.js 0.180 / WebGL2, sem novas dependências. A direção é retrô estilizada, sem simular os defeitos de precisão do PS1. História, inventário, dados de campanha, IA, colisões e proxies de interação não foram editados.

## Pipeline

`src/rendering/NeoPSXPipeline.ts` integra os addons já incluídos no pacote Three.js:

1. `RenderPass`: cena HDR no render target do EffectComposer.
2. `UnrealBloomPass`: threshold 1,1, radius 0,3; brilho reservado a valores intensos. Pass desabilitado quando força = 0.
3. `OutputPass`: ACES Filmic, exposição 1,15 e conversão sRGB uma única vez.
4. `FXAAShader`: mistura independente entre imagem original e suavizada; desabilitado quando intensidade = 0.
5. `NeoPSXShader.ts`: acabamento em espaço de exibição, depois do FXAA. Não repete gamma/tone mapping.

O shader final usa granulação de baixa amplitude, padrão ordenado de dither, dessaturação/contraste graduais, separação radial de canais menor que poucos pixels, vinheta suave e distorção radial com overscan. Os efeitos não atingem textos, inventário, menus ou controles HTML. Removidas as camadas CSS de scanline/vinheta/dither que duplicavam o filtro sobre a imagem.

`Game.ts` usa o pipeline e preserva a ordem de atualização de gameplay. A resolução do composer segue o drawing buffer, incluindo adaptação automática. A contagem de draw calls agrega os passes em vez de exibir somente o último quad. No menu/pausa, a imagem atualiza no máximo aproximadamente 10 vezes por segundo; a simulação já ficava pausada e continua assim. Em partida, o render acompanha o loop normal.

O botão existente **Efeito PSX** agora ativa/desativa todo o acabamento Neo-PSX. Desativá-lo ignora composer/bloom/FXAA/film finish; mantém materiais, sombras e ACES como base de renderização. Não significa voltar à arte anterior.

## Parâmetros persistentes

Campos novos são opcionais nos saves de preferências versão 1; valores ausentes recebem defaults. Preferências já existentes são respeitadas. Nenhuma migração de progresso.

| Controle / chave | Default novo | Intervalo | Comportamento |
|---|---:|---:|---|
| Granulação / `grain` | 0,18 | 0–1 | Ruído limitado a amplitude 0,035, modulado pela luminância; atualização quantizada a 24 Hz |
| Dithering / `dither` | 0,12 | 0–1 | Amplitude do padrão dividida por 128, sem reduzir drasticamente a paleta |
| Color grading / `grading` | 0,35 | 0–1 | Mistura com saturação 90%, contraste 1,06 e pequeno viés frio nas sombras |
| Aberração / `chromatic` | 0,12 | 0–1 | Deslocamento radial dependente da resolução, sem borrar o centro |
| Vinheta / `vignette` | 0,20 | 0–1 | Escurecimento máximo limitado a 35% nas bordas |
| Distorção / `distortion` | 0 | 0–1 | Barril leve e overscan; opcional e desligado por padrão |
| Bloom / `bloom` | 0,12 | 0–0,5 | Força independente, threshold fixo HDR |
| Anti-aliasing / `antialias` | 0,65 | 0–1 | Intensidade de mistura FXAA |

Reduzir flashes congela o ruído e reduz sua amplitude a 35%, além de limitar bloom a 40% da força escolhida. Preferências anteriores de tremor, tremulação e sensibilidade continuam funcionando. Presets novos de resolução: Baixo 0,5; Médio 0,75; Alto 1,0; pixel ratio permanece 1 e adaptação continua ativa. Valores gravados anteriormente não são sobrescritos automaticamente.

## Materiais reutilizáveis

`src/rendering/SurfaceLibrary.ts` fornece `MeshStandardMaterial` por família e cor. `StationMaterials.ts` é um export de compatibilidade, evitando recriar a API do posto. `WorldAssets.surface()` oferece a mesma biblioteca para outros cenários.

Mapas Canvas originais/determinísticos de 256², mipmaps e filtragem linear. Albedo em sRGB; mapas de dados em NoColorSpace. Roughness/bump derivam da mesma imagem procedural em interpretação linear: são uma aproximação estilizada, não mapas medidos de materiais reais. O bump altera normais, não geometria nem colisões. Materiais e mapas são compartilhados por dono/biblioteca e descartados explicitamente.

| Família | Rugosidade base | Metalness | Aplicação |
|---|---:|---:|---|
| concrete | 0,94 | 0 | Construção e grandes coberturas foscas |
| paint | 0,68 | 0 | Pintura envelhecida, carrocerias |
| metal | 0,48 | 0,45 | Chapas e mecânica, sem metal espelhado |
| tile | 0,48 | 0 | Piso e revestimento |
| wood | 0,78 | 0 | Balcão, caixas, madeira desgastada |
| glass | 0,24 | 0 | Vidro sujo; não adiciona refração física |
| rubber | 0,96 | 0 | Pneus e mangueiras |
| ceramic | 0,25 | 0 | Sanitários |
| packaging | 0,70 | 0 | Produtos e embalagens |
| plastic | 0,52 | 0 | Caixa registradora, telefone e TV |
| asphalt | 0,92 | 0 | Estrada, granulação irregular |
| soil | 1,00 | 0 | Solo, textura repetida em escala do terreno |
| mud | 0,48 | 0 | Trilhas, lama e acessos |

Bump 0,012 por padrão, 0,002 em vidro/cerâmica e 0,025 em asfalto. A rugosidade efetiva também é modulada pelo mapa. Folhagem e vários props narrativos continuam com materiais Lambert/Basic leves; o sistema permite conversão seletiva, sem impor custo PBR a todos os objetos.

## Geometria e iluminação

- Veículos do posto e caminhão abandonado: carroceria RoundedBox, cabine afunilada e para-brisa inclinado; rodas com 16 segmentos. Recursos compartilhados em WorldAssets, mantendo os envelopes de colisão e posições.
- Peças circulares decorativas passam de 8 para 16 segmentos; cubas de revolução usam 20 segmentos e assento toroidal 20×6.
- Floresta conserva seeds, posições, quantidades de instâncias, setores e exclusões de rotas. Copas e arbustos agora usam icosaedros deformados, sem ápice piramidal; folhas de palmeira são volumes achatados. Troncos passam a 10 segmentos. A copa foi redimensionada para o novo volume, mantendo alturas/centros de autoria.
- Boitatá mantém 28 segmentos e trajetória: corpo com 12 lados e cabeça elipsoidal de 12×8, mantendo olhos, crista, mandíbula e eventos. Nenhum avatar humano foi criado: Raimundo continua sendo o controlador em primeira pessoa.
- Luz ambiente mais neutra/fria. Lanterna projeta sombras PCF Soft de 512², bias −0,0004 e normalBias 0,025, alcance 24m. Cenário estático e vegetação recebem/projetam sombras.
- Pontos do posto não ganharam shadow maps de seis faces: suas contribuições ainda podem atravessar paredes. Contato estático existente foi preservado. Não há GI, reflexos de cena, SSR ou sombras assadas novas.
- Corrigida a base da intensidade da luz dos fundos antes de aplicar energia/blackout; impede decaimento cumulativo. Sequência e condições de energia permanecem as mesmas.

## Arquivos e integração

Novos: `rendering/NeoPSXPipeline.ts`, `NeoPSXShader.ts`, `SurfaceLibrary.ts`, `tests/neo-psx.mjs` e `tests/neo-production.mjs`.

Integração: `core/Game.ts`, `SceneManager.ts`, `systems/SettingsStore.ts`, `ui/SettingsPanel.ts`, `style.css`, `world/WorldAssets.ts`, `StationMaterials.ts`, `StationVisuals.ts`, `GasStation.ts`, `GameWorld.ts`, `ForestSectors.ts`, `creature/BoitataModel.ts`.

Não foram instaladas bibliotecas nem alterados roteiro, IDs, critérios dos puzzles, eventos, arquivos de save de progresso, input, navegação ou controle do jogador.

## Validação e capturas

`tests/neo-psx.mjs` cria uma cena isolada com o renderer/pipeline reais. Compara pixels ao variar cada controle, usa uma fonte emissiva HDR para testar bloom, verifica redimensionamento/descarte e captura console para erros de shader. Capturas em resolução interna 960×540, câmera 16:9, luzes do cenário e lanterna, sem HUD/campanha/blackout. São amostras de apresentação da base, não prova de todas as condições de iluminação.

- [Exterior](exterior.png)
- [Conveniência](interior.png)
- [Mesma conveniência sem pós-processamento](interior-base.png) — mesma câmera, materiais e iluminação; não é uma captura da versão anterior.
- [Floresta](forest.png)

Rodar com Vite na porta 5173: `node tests/neo-psx.mjs`. Desligar efeitos não muda os materiais, para permitir comparação do acabamento sobre a mesma arte. Em produção, `npm run build` e `npm run preview` usam o mesmo pipeline.

`node tests/neo-production.mjs` serve o conteúdo de `dist` sob `/Boitata/` e verifica início, configurações, caminhos de assets e compilação dos shaders em desktop e três proporções mobile. Requer build prévio e Chromium. Não testa uma publicação remota.

## Limites

PBR e pós-processamento aumentam custo de GPU e memória; bloom usa vários buffers/passes. Resolução adaptativa e bypass permitem reduzir custo, mas 30 FPS mobile/60 FPS desktop não são garantidos sem medição física. Sombras de uma fonte não equivalem a iluminação global. A navegação permanece plana, com colisões conservadoras. A biblioteca de props continua procedural e não equivale a um remake manual de cada modelo. Distorção/efeitos máximos são opções de ajuste, não a configuração artística recomendada.

O caminho HDR usa render targets HalfFloat do Three.js e depende do suporte correspondente do dispositivo WebGL2. A validação foi feita em Chromium/SwiftShader; não certifica Safari, Android/iOS físicos ou GPUs sem suporte ao framebuffer HDR. O controle Efeito PSX permite usar renderização direta, mas não há detecção automática para trocar de pipeline em dispositivos incompatíveis nesta etapa.

## Registro de regressão desta etapa

- `npm run build`: TypeScript e Vite aprovados, 71 módulos, sem dependências adicionadas.
- `npm run test:chapter`: capítulo 1 completo, interações por raycast, inventário, puzzle, objetivos, eventos e save/load aprovados.
- `npm run test:campaign`: capítulos 2–4, três finais, checkpoints e retorno ao menu aprovados.
- `npm run test:creature`: estados, detecção/oclusão, perseguição, captura e checkpoints aprovados. Cena isolada: 30.390 triângulos, abaixo do limite existente de 35 mil.
- `npm run test:browser`: rotas, portas, colisões, setores e dois toques simultâneos aprovados. O teste fecha a página desktop antes de abrir a mobile para liberar seu renderer; a primeira execução com ambos ativos excedeu o tempo de clique no Chromium com GPU de software.
- `node tests/jump.mjs`: salto, gravidade, teto, pouso e pausa aprovados a 30/60/120 passos por segundo.
- `npm run test:preferences`: sensibilidade, inversão, toque, validação e volume aprovados; seis assinaturas antes e depois de três reinícios, sem acumulação.
- `node tests/neo-psx.mjs`: efeitos independentes, bloom HDR, tipos/espaços de cor dos materiais, preferências normalizadas, shadow map, resize e descarte aprovados.
- `node tests/neo-production.mjs`: build estático em `/Boitata/` aprovado em 1280×720, 960×540, 844×390 e 800×360. Preferências anteriores, oito controles, bypass, redução de flashes e início de partida passaram sem erros de JavaScript, shader ou assets.

As métricas dos testes isolados não representam o FPS da campanha com todos os passes ativos. Não foram realizados testes em dispositivos físicos nem uma nova publicação de site.
