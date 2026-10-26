export interface DialogueLine {speaker:string;text:string;duration:number;audio?:string;allowAdvance?:boolean;}
export const INTRO:DialogueLine[]=[
 {speaker:'21 DE NOVEMBRO DE 2004 · 23H47',text:'Amazonas, BR-319. Raimundo Pinheiro, 24 anos, técnico de manutenção. Um chamado para consertar o sistema elétrico do Posto Última Parada.',duration:7},
 {speaker:'RAIMUNDO PINHEIRO · RÁDIO',text:'Seu Antônio? Cheguei. Tem alguém aí?',duration:4},
 {speaker:'RÁDIO · INTERFERÊNCIA',text:'[Estática]',duration:2},
 {speaker:'VOZ DESCONHECIDA',text:'Não segue aquela luz.',duration:4},
 {speaker:'VOZ DESCONHECIDA',text:'Se ela olhar pra você... apaga a lanterna.',duration:5},
 {speaker:'RAIMUNDO PINHEIRO',text:'A transmissão caiu. Preciso entrar e encontrar o responsável pelo posto.',duration:4}
];
export const ENDING:DialogueLine[]=[
 {speaker:'RÁDIO PORTÁTIL',text:'[Interferência — o sinal vem da floresta]',duration:3},
 {speaker:'VOZ DESCONHECIDA',text:'Não era pra vocês terem acendido aquilo.',duration:5},
 {speaker:'RAIMUNDO PINHEIRO',text:'A energia caiu outra vez. O sinal está vindo da retransmissora... preciso descobrir quem está falando.',duration:6}
];
export const PUZZLE={id:'generator',sequence:[2,1,3] as readonly number[],clue:'ANOTAÇÃO ELÉTRICA — Antônio: encaixe o fusível no painel externo do gerador. Rearme os circuitos nesta ordem: 2 → 1 → 3. Se errar, solte tudo e comece novamente. A câmera só volta quando os três circuitos estabilizam.'};
export const ITEMS={
 flashlight:{icon:'☼',name:'Lanterna',description:'Lanterna de manutenção. Use para alternar a luz. Se ela olhar para você, apague.'},
 radio:{icon:'▣',name:'Rádio portátil',description:'Rádio de Raimundo. Sintonizado no canal do posto.'},
 key:{icon:'⚿',name:'Chave do depósito',description:'Chave encontrada na gaveta do balcão. Use olhando para a porta do depósito.'},
 fuse:{icon:'▥',name:'Fusível',description:'Fusível intacto. Encaixa no painel externo do gerador.'},
 note:{icon:'▤',name:'Anotação do funcionário',description:PUZZLE.clue},
 tape:{icon:'▣',name:'Fita cassete',description:'Etiqueta: TURNO DA NOITE, 20/11/2004. Use para ler a transcrição no rádio.'},
 maintenance:{icon:'▤',name:'Registro de manutenção',description:'20/11/2004 — Queda de energia às 23h47. Depois do gerador, conferir a câmera no balcão. Não enviar ninguém sozinho à antena.'},
 photos:{icon:'▧',name:'Fotografias',description:'Árvores marcadas e uma trilha até a retransmissora. Uma faixa clara atravessa o fundo de todas as fotografias.'}
} as const;
export type ItemId=keyof typeof ITEMS;
export const OBJECTIVES=[
 ['enter','Entrar no posto'],['counter','Investigar o balcão'],['key','Encontrar a chave do depósito'],['store','Abrir o depósito'],['fuse','Encontrar o fusível'],['note','Localizar a anotação elétrica'],['generator','Acessar o gerador'],['puzzle','Resolver o puzzle'],['power','Restaurar a energia'],['camera','Investigar a câmera de segurança']
] as const;
export type ObjectiveId=typeof OBJECTIVES[number][0];
export const EVENT_IDS=['phone','silhouette','television','pump','camera','blackout'] as const;
export type HorrorEventId=typeof EVENT_IDS[number];
