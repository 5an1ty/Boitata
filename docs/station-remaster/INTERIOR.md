# Conveniência — revisão de layout e objetos

A circulação agora forma um U: banheiro na ala esquerda (entrada lateral em x=4, z=-19), sala elétrica na ala direita (entrada lateral em x=16, z=-18), depósito e oficina ao fundo. Banheiro e sala elétrica têm plantas maiores e comprimentos diferentes. O corredor central conecta os quatro acessos. As geladeiras ficam na área de vendas, à frente da sala elétrica; uma estante foi retirada para dar lugar à ala do banheiro.

As portas mantêm seus identificadores e a ordem usada pelo save. Os pontos de coleta permanecem nos cômodos correspondentes. Portas laterais possuem pivôs e colisões calculados para sua orientação, incluindo o espaço ocupado quando abertas.

## Acabamento

- Prateleiras abertas, com fundo fino e montantes; as etiquetas agora são tiras na borda, sem encobrir produtos.
- Garrafas com corpo, ombro, gargalo, tampa e rótulo; latas com tampa metálica; caixas com fechamento e faixa de identificação.
- Vaso com pedestal, cuba oca facetada, assento oval, caixa e acionamento. Pia com coluna e bacia côncava. Cerâmica própria, sem textura de azulejo sobre o vaso.
- Texturas procedurais com variação tonal mais suave, menos manchas repetidas, rejunte fino e rachaduras discretas. Embalagens e cerâmica recebem mapas próprios de baixa resolução.
- Livros da campanha com páginas e capas, apoiados em mesas/prateleiras. Apoios adicionados também sob registro de manutenção e fotografias; altura do suporte do fusível e da anotação corrigida. Identificadores, conteúdos e condições de coleta preservados.

## Capturas

`node tests/interior-captures.mjs` captura o posto e os objetos da campanha em uma cena isolada. Uma luz de inspeção acompanha a câmera apenas nesse script para mostrar detalhes; não é adicionada à partida.

- [Circulação interna](interior-v2-layout.png)
- [Produtos e etiquetas](interior-v2-shelves.png)
- [Vaso e banheiro](interior-v2-bathroom.png)
- [Livro de abastecimento apoiado](interior-v2-ledger.png)

A remodelagem preserva o estilo PSX e as colisões conservadoras dos móveis grandes. Não inclui modelos comerciais ou novas dependências. Testes mobile são emulados em Chromium, sem validação em aparelhos físicos.

## Validação executada

- `npm run build`: passou, sem erros de TypeScript.
- `npm run test:browser`: passou — rotas da planta em U, portas laterais, quatro salas, colisões, multitoque e orientação mobile.
- `npm run test:chapter`: passou — coleta dos oito itens, puzzle do gerador, dez objetivos, seis eventos, save/load e mobile.
- `npm run test:campaign`: passou — capítulos 2–4, pistas, coleta de registros opcionais, puzzle do transmissor, checkpoints e três finais.
- `node tests/interior-captures.mjs`: quatro capturas conferidas visualmente.

Os testes de percurso foram atualizados para os novos acessos, mantendo os testes de raycast e colisão. Durante a validação foram corrigidas duas interferências dos novos suportes nas rotas, sem remover suas colisões.

## Exploração livre e balcão

A gaveta abre sem exigir a leitura do balcão. Anotação elétrica e manual do transmissor são dicas, não permissões para testar soluções. Evidências e registros podem ser recolhidos fora da ordem sugerida e antes do capítulo correspondente. O rádio do caminhão pode ser usado diretamente, e os relés finais podem ser desligados em qualquer ordem. A progressão reconhece os itens já recolhidos. Permanecem os requisitos físicos de chave, fusível, energia e as condições narrativas dos capítulos/finais.

O save aceita a conclusão do primeiro capítulo sem ler o chamado ou coletar a anotação; não inventa objetivos concluídos. Saves anteriores continuam aceitos. `tests/free-exploration.mjs` verifica essas alternativas e seu carregamento, além da solução do transmissor sem manual e do save com o relé da trilha desligado primeiro. Os testes completos de capítulo e campanha também passaram.

Os documentos decorativos estavam sob o acabamento do tampo. Agora ficam acima dele, separados da [ordem de serviço legível](counter-document.png), cujo alvo de interação coincide com a folha. A captura usa iluminação de inspeção.
