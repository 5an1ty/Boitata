# Guia de direção visual — BOITATÁ Neo-PSX

Versão inicial de planejamento, 30/10/2026. Relacionado à [auditoria técnica](NEO_PSX_REWORK.md).
**Nenhuma das mudanças visuais propostas aqui foi implementada nesta etapa.** As diretrizes orientam as próximas fatias, sujeitas à avaliação visual do usuário. Valores de orçamento são hipóteses para protótipo, não resultados certificados.

## 1. Identidade e intenção

BR-319 fictícia ao sul de Manaus, Amazonas, noite chuvosa de novembro de 2004. Raimundo Pinheiro é técnico de manutenção. O posto deve parecer um estabelecimento cotidiano e reconhecível antes de parecer um cenário de terror. O Boitatá é uma presença guardiã da floresta, não um monstro genérico nem um espetáculo constante de fogo.

Referência de Fears to Fathom: escala doméstica crível, objetos comuns, silêncio, iluminação motivada e tensão pela composição. Referência PSX: silhuetas econômicas, textura de resolução contida, geometria deliberada e imagem levemente instável. Não copiar marcas, mapas, modelos, sons ou identidade visual de outros jogos. Neo-PSX significa combinar autoria contemporânea com restrições escolhidas; não aumentar ruído, deformação e pixelização indiscriminadamente.

Pilares: plausibilidade brasileira; ameaça sugerida; legibilidade da exploração; detalhe concentrado; acessibilidade preservada.

## 2. Paleta e hierarquia de valores

As amostras são referências de direção em sRGB, não novos valores de materiais a aplicar globalmente.

| Papel | Referência | Uso |
|---|---|---|
| Noite / distância | `#10191D` | Azulado dessaturado; separar horizonte de silhuetas sem levantar todo o preto |
| Vegetação | `#293B31`, `#465344` | Verdes variados por camada e espécie, sem filtro verde uniforme sobre todo o mundo |
| Reboco / cerâmica | `#A8A28C`, `#C0BBA7` | Neutros envelhecidos; sujeira localizada, não ladrilhos desenhados sobre sanitários |
| Madeira / terra | `#675444`, `#4B4438` | Variação de veio, umidade e contato |
| Aço / ferrugem | `#6B706C`, `#794A35` | Pintura e metal distinguíveis; ferrugem em juntas e escorrimentos |
| Iluminação do pátio | `#D7B47C` | Amarelo envelhecido localizado |
| Fluorescente interno | `#B8CECA` | Frio moderado, preservando cor dos papéis e produtos |
| Boitatá | `#C54C27`, `#ECA64F`, `#F6D58C` | Gradiente de brasa a núcleo quente; reservar altas luminâncias para olhos/presença |

Distribuir áreas de descanso visual. Objetos interativos devem se distinguir por posição, contraste e silhueta, com o indicador existente como apoio. Não usar emissão branca artificial em todo item coletável. A lanterna deve revelar detalhes sem apagar o texto em uma mancha branca.

## 3. Forma, escala e composição

- Adotar aproximadamente 1 unidade = 1 metro, compatível com câmera a 1,65 e raio de colisão 0,28. Registrar dimensões reais de referência antes de modelar.
- Priorizar forma externa, proporção, apoio e encaixe. Chanfrar onde altera a leitura; não subdividir superfícies que permanecem planas.
- Contornos de pneus, sanitários, garrafas e mangueiras devem ser reconhecíveis. Planos grandes podem ser simples, desde que tenham construção plausível, bordas e textura adequada.
- Usar normais suaves seletivamente em peças curvas e arestas duras em juntas. Flat shading global não é obrigação artística.
- Itens devem apoiar-se em uma superfície física; medidas e pivôs devem permitir conferir o contato. Papel usa espessura mínima e afastamento controlado para evitar z-fighting, sem flutuar.
- Manter acessos laterais do banheiro e sala elétrica, depósito/oficina ao fundo e corredor central. Não voltar a quatro portas indiferenciadas na mesma parede.
- Disposição assimétrica e funcional: estoque junto ao depósito, ferramentas na oficina, produtos legíveis nas gôndolas e papelada junto ao caixa. Não preencher circulação com entulho só para acrescentar detalhe.
- Placas com suporte, parafusos ou fixação plausível. Etiquetas são tiras na borda das prateleiras, não outdoors. O documento do balcão fica acima do tampo acabado e corresponde ao alvo de interação.

Orçamentos iniciais para uma fatia: props pequenos 50–500 triângulos, objetos de destaque 500–3.000, veículos 2.000–6.000, vegetação com 2–3 níveis de detalhe. Exceções dependem de silhueta e medição. Não tratar esses números como autorização para aumentar tudo ao máximo.

## 4. Materiais, texturas e autoria

128–256px para props menores; 256–512px para objetos de destaque e superfícies modulares. Atlas 512–1024px só quando reduzir chamadas/gestão sem desperdiçar memória; somar custo por material, mipmaps e resolução decodificada. Evitar uma textura exclusiva por lata ou página quando variações por atlas forem suficientes.

Densidade inicial de teste: 64–128 texels por metro em arquitetura; mais resolução seletiva para documentos e sinais próximos. Inspecionar UVs nos três eixos de caixas e curvas; não esticar um único tile sobre toda a fachada. Manter orientação de veio, escorrimentos verticais e ladrilhos proporcionais.

Sujeira deve contar causa: respingo junto ao chão, gordura perto de equipamento, mãos em puxadores, água em junções e musgo em sombra úmida. Evitar ruído uniforme, ferrugem em cerâmica, rachaduras igualmente espaçadas e repetição óbvia. Materiais precisam continuar distintos sob iluminação neutra.

Testar nearest em elementos próximos; mipmaps/filtragem seletiva à distância para reduzir cintilação. Preservar resolução baixa dos assets sem necessariamente forçar a interface a ter baixa resolução. Mapas de cor/emissão devem declarar color space correto; mapas de dados não recebem tratamento sRGB.

Lambert continua sendo o baseline. PBR seletivo, AO assado, lightmaps ou shader estilizado são experimentos futuros, não migração obrigatória. Não aplicar duas vezes sombras/AO já pintados no albedo. Não substituir a aparência por brilho plástico ou metal espelhado.

Cada asset futuro deve registrar: autor, licença e origem; ID estável; unidade/escala; orientação/pivô; bounds; materiais e tamanhos dos mapas; UVs; LOD; colisão separada; âncoras de interação; orçamento e dono do descarte. Exportação GLB pode ser avaliada dentro do Three.js; nenhum loader novo foi adicionado nesta etapa.

## 5. Luz e atmosfera

Iluminar a partir de luminárias, faróis, lanterna, equipamentos e criatura. Alternar pátio quente, loja fria e floresta com orientação mínima. Manter áreas escuras, mas permitir perceber passagens e a silhueta de obstáculos próximos.

Primeiro prototipar contribuição assada/contato em arquitetura; depois avaliar uma sombra dinâmica seletiva, se necessária. Não colocar uma luz por lâmpada decorativa, produto ou segmento do Boitatá. Começar com o orçamento atual de luzes e comparar piores vistas antes de expandi-lo.

Neblina deve separar planos, não esconder falhas de composição a poucos metros do jogador. Chuva deve respeitar todas as coberturas; intensidade e quantidade não devem prejudicar leitura do HUD. Superfícies molhadas podem usar manchas e brilho localizado. Reflexos reais ou bloom são opcionais, posteriores à validação de custo.

Cenas obrigatórias de revisão: chegada ao posto; interior com baixa energia; iluminação restaurada; blackout; floresta com lanterna ligada/desligada; aparição e perseguição; amanhecer. Toda luz/emissão nova deve participar da lógica de energia onde fizer sentido. Conferir tudo também com redução de flashes ativa.

## 6. Câmera, efeitos e legibilidade

Preservar FOV, sensibilidade, inversão, salto, pausa e controle touch inicialmente. Não acrescentar head bob intenso, balanço de arma ou distorção como condição da estética. Tremor deve respeitar o controle existente.

Usar granulação, dither, vinheta e leve instabilidade como acabamento dos planos, não como camada que destrói letras. Se um pass Neo-PSX for prototipado: intensidade ajustável, desligável e comparação sem efeito. Vertex snapping/UV afim/VHS não são requisitos; não distorcer placas e documentos essenciais. Evitar aberração cromática e flashes fortes por padrão.

Menus, inventário, puzzles e legendas permanecem em resolução legível. Preservar teclado, foco, contraste, alvos touch de aproximadamente 44px e safe areas. Rever landscape 16:9, 19.5:9 e 20:9 e tela de orientação vertical. Aumentar resolução gráfica não substitui ajuste de tipografia.

## 7. Personagens, floresta e áudio

Raimundo Pinheiro mantém identidade e profissão. Atualmente não existe modelo humano completo: mãos/corpo exigiriam escopo e testes próprios. A silhueta humana é uma aparição, não um NPC com navegação a ser reconstruído implicitamente.

Boitatá: preservar serpente extensa e movimento ondulatório; definir cabeça reconhecível, ritmo de escamas e cauda progressiva. Preferir emissão desigual, brasa e calor sugeridos a uma faixa laranja uniforme. Não mudar raio de captura, visão, estados ou velocidade para acomodar um modelo sem uma decisão explícita de gameplay.

Floresta: diferenciar troncos, copas, palmeiras, raízes e sub-bosque por silhueta e altura. Garantir variedade com biblioteca pequena e rotações/escalas controladas. Densidade visual não deve ocupar trilhas, esconder todas as coberturas ou alterar colisões silenciosamente.

Áudio futuro: chuva sob cobertura versus exterior, insetos distantes, vento, eletricidade, rádio e passos por superfície. Criatura grave e espacial, com silêncio significativo. Gravações originais/licenciadas, sem sons extraídos das referências. Manter legendas e sinais visuais para quem joga sem áudio; não confundir volume baixo com tensão bem construída.

## 8. Protocolo de aprovação artística

Para cada fatia, registrar câmera/pose, qualidade, resolução interna, distância, energia, lanterna, configurações de efeitos e seed/tempo dos efeitos. Comparar antes/depois em condições equivalentes, mais uma vista com luz neutra de inspeção identificada. Não usar só screenshots mais iluminadas que a partida para aprovar materiais.

Checklist de revisão:

- O local parece um posto brasileiro em 2004, sem depender apenas de texto?
- Silhuetas e materiais continuam legíveis com os efeitos desligados?
- Portas, itens e placas estão apoiados, sem clipping, z-fighting ou alvos invisíveis?
- A planta e as rotas funcionam sem objetivos artificiais bloqueando ações?
- Preto, luz e neblina orientam o jogador sem iluminar uniformemente a floresta?
- Mobile conserva textos e controles utilizáveis, com redução de flashes/tremor?
- Draw calls, triângulos, textura/memória, frame time p50/p95 e reinícios foram comparados na mesma cena?
- Campanha, saves antigos, coleta fora de ordem e três finais continuam funcionando?

Aprovação visual do usuário precede a expansão da fatia. Esta etapa apenas estabelece o guia; não aprova automaticamente novos modelos, shaders ou migração tecnológica.

## 9. Registro de decisões

| ID | Decisão de planejamento | Status |
|---|---|---|
| N01 | Manter Vite/TypeScript/Three.js/WebGL2 | Base preservada; sem migração proposta |
| N02 | Realismo de proporções com geometria/texturas econômicas | Diretriz inicial, validar na fatia do posto |
| N03 | Diferenciar luz quente/fria e materiais, reduzindo filtro verde global | Proposta, ainda não aplicada |
| N04 | Efeitos sutis, opcionais e subordinados à leitura | Diretriz; escolhas de shader ainda em aberto |
| N05 | Preservar planta em U, gameplay e liberdade de investigação | Contrato de regressão |
| N06 | Modelos e áudio próprios/licenciados, metadados de autoria | Requisito para novos assets |
| N07 | Metas 30/60 FPS com validação em hardware real | Objetivos, sem certificação atual |
