import type {DialogueLine} from './chapter1';
export const CAMPAIGN_ITEMS={
 burnPhoto:{icon:'▧',name:'Fotografia da queimada',description:'21/11/2004 — O caminhão P-319 descarrega tambores na clareira. Ao fundo, árvores recém-queimadas. A placa do posto aparece na lateral de uma caixa.'},
 recording:{icon:'▣',name:'Gravação da instalação',description:'TRANSCRIÇÃO — Operador: “O posto abastece os comboios. Depois das queimadas, a luz começou a vigiar a trilha. Não é um animal caçando. Está protegendo o que sobrou.”'},
 transport:{icon:'▤',name:'Registro de transporte',description:'GUIA 013 — Remetente: Última Parada. Destino: clareira da retransmissora. Carga: combustível e equipamentos de ignição. Responsável: consórcio madeireiro. Cruza os horários da fotografia e da gravação.'},
 transmitterManual:{icon:'▤',name:'Manual do transmissor',description:'REDE REGIONAL — frequência 153.40 MHz. Alimentação auxiliar: 12 V. Chave: REDE. Três indicadores corretos produzem sinal local; depois de rearmar, saia do alcance da guardiã e feche o acoplador na base da antena. O bloqueador principal fica junto ao posto.'},
 logAsh:{icon:'▤',name:'Diário das cinzas',description:'Relato de uma brigadista: “Vi a serpente cercar o fogo, não as pessoas. Quem manteve a lanterna baixa conseguiu sair. As árvores apagaram primeiro. Depois vieram os caminhões.”'},
 logFuel:{icon:'▤',name:'Livro de abastecimento',description:'O livro do gerador registra saídas de combustível sem nota. As datas coincidem com focos de incêndio próximos à instalação. Uma assinatura foi raspada.'},
 logWitness:{icon:'▤',name:'Bilhete da testemunha',description:'Bilhete escondido no banheiro: “Não deixem que contem que foi acidente. As provas estão na antena. Juntem meu bilhete aos registros e mandem tudo pela rede.”'}
} as const;
export const OPTIONAL_RECORDS=['tape','maintenance','photos','logAsh','logFuel','logWitness'] as const;
export const REQUIRED_EVIDENCE=['burnPhoto','recording','transport'] as const;
export const TRANSMITTER={frequency:'153.40',power:'12',key:'REDE'} as const;
export const CHAPTERS={
 2:{title:'O SOM DAS ÁRVORES',objectives:[['exit','Sair do posto'],['road','Seguir a estrada'],['truck','Encontrar e examinar o caminhão abandonado'],['truckRadio','Investigar o rádio do caminhão'],['trail','Encontrar a trilha na floresta'],['evade','Passar pela aparição com a lanterna apagada'],['installation','Chegar à instalação de comunicação']]},
 3:{title:'O GUARDIÃO',objectives:[['explore','Explorar os arquivos da instalação'],['photo','Encontrar a fotografia da queimada'],['recording','Recuperar a gravação'],['transport','Encontrar o registro de transporte'],['link','Relacionar o posto com a clareira'],['puzzle','Resolver o painel de comunicação'],['evade','Apagar a lanterna e usar a cobertura do painel'],['restore','Fechar o acoplador e restaurar o transmissor']]},
 4:{title:'A ÚLTIMA LUZ',objectives:[['return','Retornar ao posto'],['equipment','Reativar o equipamento de transmissão'],['evidence','Carregar as três evidências no equipamento'],['evade','Operar os dois relés externos e escapar da guardiã'],['conclude','Concluir a transmissão ou fugir no carro']]}
} as const;
export type CampaignChapter=keyof typeof CHAPTERS;
export type Ending='dawn'|'road'|'witness';
export const CHAPTER_INTROS:Record<CampaignChapter,DialogueLine[]>={
 2:[{speaker:'RÁDIO · VOZ DISTANTE',text:'Tem uma antena depois da curva. Se conseguir chegar lá, talvez consiga falar com alguém.',duration:6},{speaker:'RAIMUNDO PINHEIRO',text:'Vou seguir o acostamento até o caminhão abandonado. O rádio dele pode ter registrado o último chamado.',duration:6}],
 3:[{speaker:'RAIMUNDO PINHEIRO',text:'Cheiro de cinza. Estes arquivos não são só de manutenção. Preciso examinar as três salas e comparar o que encontrar.',duration:6}],
 4:[{speaker:'RÁDIO · OPERADOR',text:'Recebo o sinal local. O bloqueio principal vem do posto. Desligue os dois relés e use o transmissor externo para enviar as provas.',duration:7}]
};
export const RETURN_DIALOGUE:DialogueLine[]=[{speaker:'RAIMUNDO PINHEIRO',text:'Você não tava atrás de mim...',duration:4},{speaker:'RAIMUNDO PINHEIRO',text:'Você tava tentando me mostrar o que fizeram aqui.',duration:5}];
export const ENDINGS:Record<Ending,{title:string;text:string;line:DialogueLine[]}>= {
 dawn:{title:'O AMANHECER',text:'As três provas chegam à rede. A serpente retorna à floresta. Raimundo observa o primeiro sol atravessar a névoa.',line:[{speaker:'OPERADOR',text:'Recebido. Fotografia, gravação e transporte confirmados. Vamos mandar ajuda.',duration:5}]},
 road:{title:'ESTRADA SEM FIM',text:'Raimundo foge sem concluir a transmissão. Depois da curva, o mesmo posto reaparece. O relógio marca 23h47. A estrada não o deixou ir.',line:[{speaker:'RAIMUNDO PINHEIRO',text:'Não... Eu já passei por aqui. Esse relógio... 23h47 outra vez.',duration:6}]},
 witness:{title:'A TESTEMUNHA',text:'Todas as provas e os seis registros chegam à rede. Raimundo revela o ocorrido e deixa a região. Entre as árvores, dois pontos luminosos acompanham sua partida.',line:[{speaker:'OPERADOR',text:'Todos os registros foram recebidos, Raimundo. Agora temos testemunhas. Saia daí; nós vamos tornar isso público.',duration:6}]}
};
export const CAMPAIGN_CHECKPOINTS={forest:{chapter:2,x:0,z:20},installation:{chapter:3,x:20,z:36},evidence:{chapter:3,x:28,z:36},final:{chapter:4,x:23,z:-8}} as const;
export type CampaignCheckpoint=keyof typeof CAMPAIGN_CHECKPOINTS;

export const CHAPTER_METADATA={
 1:{id:1,entry:'nova partida',completion:'dez objetivos e transmissão final',events:['phone','silhouette','television','pump','camera','blackout'],checkpoints:['generator']},
 2:{id:2,entry:'Capítulo 1 concluído',completion:'sete objetivos em ordem',events:['truckMessage','embers','road'],checkpoints:['forest']},
 3:{id:3,entry:'chegada à instalação após evitar a aparição',completion:'oito objetivos e acoplador restaurado',events:['clearing','linked','transmitter'],checkpoints:['installation','evidence']},
 4:{id:4,entry:'transmissor parcial restaurado',completion:'transmissão concluída ou fuga confirmada',events:['returnScene','finalEncounter','ending'],checkpoints:['final']}
} as const;
