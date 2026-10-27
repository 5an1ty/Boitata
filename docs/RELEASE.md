# BOITATÁ — Relatório da versão web 1.0.0

Pacote estático preparado. **Não houve deploy público.** A campanha é jogável nos fluxos automatizados; áudio gravado, homologação em dispositivos e duração ainda têm pendências descritas abaixo.

## Funcionalidades verificadas

- Quatro capítulos, dez objetivos do Capítulo 1 e vinte dos Capítulos 2–4, com ordem e condições reais.
- Interação por raycast com oclusão, documentos e itens persistentes, inventário, portas, gerador, transmissor, relés e três finais.
- Boitatá com 28 segmentos, percepção, sete estados, navegação com obstáculos, perseguição, captura e checkpoints.
- Teclado/mouse e touch simultâneo, safe areas, pausa e orientação vertical.
- Menu Novo jogo / Continuar / Configurações / Créditos; Continuar desabilitado sem save válido.
- Preferências gráficas, áudio, sensibilidades, inversão, tamanho touch, tremor, redução de flashes e digitação, persistidas separadamente.
- Baixo/Médio/Alto, resolução manual/adaptativa, pixel ratio 1, visão ajustável, instâncias e recursos compartilhados.
- FPS e laboratório da IA apenas no desenvolvimento.

## Correções desta revisão

1. Mudar a digitação das legendas criava progresso antes de iniciar: removida a gravação de gameplay dessa ação.
2. Preferências antigas no save podiam sobrescrever opções recentes: o arquivo independente tem precedência; dados legados só inicializam os valores quando necessário.
3. Reiniciar recarregava a página e não possuía teardown completo: agora encerra loop, listeners, assinaturas, áudio e recursos GPU antes de recriar a cena.
4. Objetos já instanciados poderiam ser agrupados novamente: o agrupamento estático ignora `InstancedMesh` existentes.
5. Caminhos absolutos de assets eram frágeis em subpastas: base relativa e verificação do pacote em `/Boitata/`.
6. A seta decorativa alterava o nome acessível dos botões: substituída por decoração sem texto.
7. Menus longos e controles ampliados precisavam de limites: painéis com scroll interno, tamanho máximo limitado, safe areas e testes de sobreposição.
8. Flashes e tremor tinham intensidade fixa: preferências aplicadas à câmera, luzes, captura e interferência.

## Ferramentas e build

Ambiente validado: Node **24.19.0**, npm **11.9.0**, Chromium headless com WebGL via SwiftShader.

| Dependência direta | Versão instalada | Uso |
| --- | --- | --- |
| three | 0.180.0 | Runtime 3D |
| vite | 7.3.7 | Build e servidores locais |
| typescript | 5.9.3 | Verificação estática |
| @types/three | 0.180.0 | Tipos |
| playwright-core | 1.64.1 | Testes, sem navegador baixado automaticamente |

`npm install --cache /workspace/.npm-cache` concluiu. `npm run build` concluiu sem erros TypeScript e sem o aviso anterior de chunk único acima de 500 kB. Tamanhos aproximados sem gzip: aplicação **117 kB**, Three.js **488 kB**, CSS **16 kB**. Valores exatos podem mudar após nova compilação.

`npm run preview` foi executado e respondeu com o HTML de produção. A porta local mudou quando a preferida já estava em uso. Isso não constitui publicação.

## Testes executados e resultados

| Comando | Resultado e limite |
| --- | --- |
| `npm run build` | Passou: TypeScript e artefatos estáticos |
| `npm run test:chapter` | Passou: percurso completo do Capítulo 1, gerador errado/correto, dez objetivos, seis eventos, inventário, corrupção/quota e retomada |
| `npm run test:campaign` | Passou: Capítulos 2–4 por caminhos com colisão e raycast, ordem, três provas, puzzle, relés, três finais, checkpoint, menu, reload e toque |
| `npm run test:creature` | Passou: sete estados, FOV/LOS, lanterna, ruído, paredes, A*, captura, checkpoint, três aparições e amostra de renderização |
| `npm run test:browser` | Passou: cenário, colisões, streaming, ações, multitoque e rotação vertical |
| `npm run test:preferences` | Passou: inversão, sensibilidade mouse/toque, validação, volumes dos buses e número de assinaturas estável em três reinícios (6 → 6) |
| `npm run test:release` | Passou no próprio `dist/`: assets em subpasta sem 404, sem erros JS, menu/save, preferências, liberação de três contextos antigos, proporções mobile e finais |
| `git diff --check` | Passou |

Em produção, Amanhecer e Testemunha foram acionados por teclado, câmera e raycast a partir do checkpoint final. Estrada sem Fim foi alcançado pela interação com o carro no teste da campanha e restaurado pelo save de produção. Não se afirma que o teste de produção percorre cada minuto dos quatro capítulos: essa cobertura vem das suítes de gameplay complementares.

Viewports touch testados: **960×540 (16:9)**, **844×390 (19.5:9)** e **800×360 (20:9)**, incluindo controles no tamanho máximo, dois ponteiros, cancelamento, inventário, scroll interno, ausência de rolagem da página e orientação vertical.

Amostra da criatura no ambiente de teste: cerca de 76 chamadas / 15,8 mil triângulos. O primeiro frame pode incluir compilação de shaders acima de 100 ms. Tempos de SwiftShader **não** demonstram 30 FPS em um smartphone ou 60 FPS em um desktop real.

## Execução e publicação

```sh
npm install
npm run dev
npm run build
npm run preview
```

Para regressão, mantenha Vite ativo em outro terminal e execute `npm test`. Para verificar apenas o pacote, execute `npm run build && npm run test:release`; o teste cria seu próprio servidor estático temporário. Use `CHROMIUM_PATH` se o executável não estiver em `/usr/bin/chromium`.

Configurações fornecidas: `vercel.json`, `netlify.toml` e workflow **manual** `.github/workflows/pages.yml`. O diretório de publicação é `dist/`. O README explica configuração e execução de cada opção. Enviar commits ao GitHub não publica automaticamente o site, e o workflow Pages não dispara por push.

## Arquivos principais da revisão

- `src/systems/SettingsStore.ts`: esquema, limites, persistência e migração.
- `GraphicsSettings.ts`, `VisualPreferences.ts`, `PerformanceMonitor.ts`: resolução, efeitos e diagnóstico.
- `src/ui/MainMenu.ts`, `SettingsPanel.ts`, `src/style.css`: menu acessível e layout responsivo.
- `src/audio/VolumeBus.ts` e sistemas de áudio existentes: volumes e limpeza.
- `src/core/Game.ts`, `src/main.ts`, `src/input/InputManager.ts`: reinício, controle de ciclo de vida e listeners.
- `vite.config.ts`, configurações de hospedagem, favicon, `tests/release.mjs` e `tests/preferences.mjs`.

## Pendências e problemas conhecidos

- **Ainda sem gravações licenciadas** de chuva, vento, insetos, passos e rádio ambiente; sem dublagem. Sons da história/criatura e música de perseguição existentes são sintetizados. As legendas e transcrições fornecem a narrativa real.
- **Android/iOS físicos e Safari real não foram testados.** A emulação Chromium não demonstra compatibilidade com cada aparelho.
- Duração pretendida de **30–45 min** e metas de **30 FPS mobile / 60 FPS desktop** requerem playtests e medição em hardware. Não são resultados garantidos.
- O armazenamento pode ser bloqueado/apagado pelo navegador. Preferências e progresso ficam na origem local; não existe sincronização em nuvem.
- WebGL2/aceleração gráfica são necessários. Há tratamento de falha, mas não um renderer alternativo para navegadores sem WebGL2.
- Publicação pública, domínio e validação do endereço publicado **não foram realizados**.

Nenhum bloqueio foi encontrado nos percursos automatizados até os três finais. Isso é evidência dos fluxos testados, não garantia de ausência de defeitos ou de homologação comercial completa.
