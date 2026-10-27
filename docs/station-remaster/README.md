# Etapa 7.1 — posto, revisão visual

Remasterização restrita ao posto. Raimundo Pinheiro, campanha, inventário, comandos, saves, objetivos, puzzles, floresta e criatura permanecem sem alterações. O caminhão abandonado da estrada também mantém o modelo anterior.

## Arquivos

- `src/world/GasStation.ts`: instancia a camada visual exclusiva e ajusta as cores de duas luzes existentes.
- `src/world/StationVisuals.ts`: geometria decorativa, UVs em escala métrica, agrupamento estático por material, descarte de recursos.
- `src/world/StationMaterials.ts`: sete texturas Canvas 2D originais, determinísticas, 128×128, NearestFilter, repetição e espaço sRGB.
- `src/world/GameWorld.ts`: somente chamada de descarte dos recursos visuais do posto.
- `tests/station-captures.mjs`: captura reproduzível em Chromium/SwiftShader.
- Esta pasta: relatório e capturas de comparação.

## Trabalho visual

Cobertura com nervuras, faixa pintada, calha, descida pluvial e bases/capitéis dos pilares. Bombas com ombros facetados, grelhas, molduras, mangueiras segmentadas, bicos e identificação de combustível. Fachada com vidros sujos, caixilhos e peitoris. Molduras e puxadores seguem os pivôs originais das portas.

Balcão com acabamento, prateleiras com montantes, preços e garrafas; geladeiras com puxadores, divisões e ventilação. Calendário de novembro de 2004 e cartazes fictícios em português. Depósito com travessas nas caixas, banheiro com assento e encanamento, oficina com ferramentas e pneus octogonais. Gerador com grelha, tampas, escape e conduíte. Veículos estacionados com cabines afuniladas, rodas octogonais, cubos de roda, para-choques, grade, espelhos, lanternas e placas fictícias.

Texturas: concreto com rachaduras/umidade, pintura lascada, metal oxidado, azulejo manchado, madeira desgastada, vidro com escorrimentos e borracha. Pintura também reveste as peças plásticas antigas. Repetição por dimensão de face evita esticar uma textura por toda a parede ou piso. Mapas compartilhados entre materiais do posto, sem modificar materiais da floresta.

Iluminação amarelada na cobertura e fria na conveniência, preservando posições, alcance, quantidade de luzes e a lógica existente de energia/tremulação. Manchas achatadas simulam contato/sujeira e brilho úmido. Sem sombras dinâmicas novas ou pós-processamento adicional.

## Comparação

Imagens 1280×720 renderizadas internamente a 640×360, filtro nearest. `before` e `after` usam a mesma câmera, neblina, luz ambiente, posições, cores e intensidades das luzes originais. `lighting` mostra a nova paleta de iluminação. Capturas isolam o módulo do posto: não representam a floresta, chuva, HUD ou estado narrativo da partida.

| Vista | Antes | Depois, iluminação idêntica | Nova iluminação |
|---|---|---|---|
| Exterior | [Antes](before-exterior.png) | [Depois](after-exterior.png) | [Luzes](lighting-exterior.png) |
| Conveniência | [Antes](before-interior.png) | [Depois](after-interior.png) | [Luzes](lighting-interior.png) |
| Gerador | [Antes](before-generator.png) | [Depois](after-generator.png) | [Luzes](lighting-generator.png) |
| Oficina | [Antes](before-workshop.png) | [Depois](after-workshop.png) | [Luzes](lighting-workshop.png) |

Reproduzir com `npm run dev` em 5173 e `node tests/station-captures.mjs after` ou `lighting`. As imagens `before` foram capturadas antes da edição; o comando não restaura automaticamente o código anterior.

## Validação

- `npm run build`: passou, TypeScript sem erros.
- `npm run test:chapter`: passou — capítulo completo por raycast, rotas com colisão, inventário, sequência errada/correta do gerador, dez objetivos, seis eventos, save/load e mobile.
- `npm run test:browser`: passou — loja, quatro cômodos, portas, portão, sólidos, rodovia/trilha, streaming, desktop, multitoque CDP e orientação vertical. Nenhum erro JavaScript.
- Um ensaio concorrente com capturas terminou em timeout de UI; a repetição isolada passou sem alterar controles ou testes de gameplay.
- Cena de teste mundial: 214 draw calls, 15.636 triângulos; mediana CPU/sincronização 0,6ms, p95 3,8ms no ambiente SwiftShader. Essas medições não certificam FPS em dispositivos reais.
- Posto isolado na câmera externa: 7.442 triângulos, 176 chamadas, contra 2.472 triângulos e 221 chamadas na captura original sem batching. O jogo anterior já agrupava cubos; portanto essa comparação isolada não implica melhoria de desempenho total do jogo. A remasterização aumenta o custo geométrico total.

## Limitações e aprovação

Janelas da fachada são recessos visuais opacos sobre paredes existentes, sem abertura ou nova passagem. As colisões conservadoras originais permanecem, inclusive nos veículos. Reflexos e sombras são aproximações estáticas; não há reflexos de objetos. Texturas são procedurais, não fotogrametria. Equipamentos são silhuetas simplificadas de época, não réplicas de marcas. Sem novos assets externos ou dependências.

Testes mobile realizados por emulação Chromium, não em Android/iOS físicos. Aprovação artística pendente do usuário. Esta entrega encerra exclusivamente a etapa 7.1; nenhuma etapa seguinte foi iniciada.
