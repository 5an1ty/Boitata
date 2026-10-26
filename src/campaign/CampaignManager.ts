import {AmbientLight,Color,PerspectiveCamera,Scene,Vector3} from 'three';
import {CAMPAIGN_CHECKPOINTS,CHAPTERS,CHAPTER_INTROS,ENDINGS,OPTIONAL_RECORDS,REQUIRED_EVIDENCE,RETURN_DIALOGUE,TRANSMITTER,type CampaignCheckpoint,type Ending} from '../data/campaign';
import {ITEMS,type ItemId} from '../data/chapter1';
import type {ChapterOne} from '../story/ChapterOne';
import type {GameWorld} from '../world/GameWorld';
import type {CreatureEncounter} from '../creature/CreatureEncounter';
import {ChapterManager} from './ChapterManager';
import {CampaignSave} from './CampaignSave';
import {CampaignWorld} from './CampaignWorld';
import {CutsceneManager} from './CutsceneManager';
export class CampaignManager {
 readonly chapters=new ChapterManager();readonly saves=new CampaignSave();readonly flags=new Set<string>();readonly cutscene:CutsceneManager;readonly props:CampaignWorld;
 checkpoint:CampaignCheckpoint|null=null;seconds=0;onMenu:()=>void=()=>{};onRespawn:(p:Vector3)=>void=()=>{};
 private player=new Vector3();private look=new Vector3(0,0,-1);private flashlight=true;private endingPresented=false;private started=false;
 constructor(private readonly chapter:ChapterOne,private readonly world:GameWorld,private readonly creature:CreatureEncounter,private readonly scene:Scene,private readonly camera:PerspectiveCamera,root:HTMLElement,private readonly notify:(text:string)=>void){
  this.cutscene=new CutsceneManager(root);this.chapters.ready=chapter.flags.has('ending');this.restore();
  const register=(label:string,position:Vector3,use:(p:Vector3)=>string)=>{const object={label,position,use};chapter.interaction.register(object);return object;};
  this.props=new CampaignWorld(world,chapter,register,id=>this.collect(id),(id,p)=>this.action(id,p));camera.add(this.props.dashboard);if(this.chapters.has('4.equipment')){world.powerTarget=.6;world.blackoutTime=-1;}
  if(this.chapters.result){this.creature.setPeaceful(true);const road=this.chapters.result==='road';this.props.clock2347.visible=road;this.props.clock013.visible=!road;this.props.eyes.visible=this.chapters.result==='witness';this.world.powerTarget=road?.2:1;if(!road){this.scene.background=new Color(0x8d9c79);this.scene.fog?.color.set(0x8d9c79);this.scene.children.forEach(o=>{if(o instanceof AmbientLight)o.intensity=1.35;});}}
  const transmitter=world.interactions.find(i=>i.position.x===20&&i.position.z===44);if(transmitter)transmitter.use=p=>this.transmitter(p);
 }
 get blocking():boolean{return this.cutscene.active||this.chapters.result!==null;}
 get restoredPosition():Vector3|null {if(!this.chapters.ready||!this.checkpoint)return null;const p=CAMPAIGN_CHECKPOINTS[this.checkpoint];return new Vector3(p.x,1.65,p.z);}
 resume():void {this.cutscene.pause(false);if(!this.started&&this.saves.warning)this.notify(this.saves.warning);this.started=true;}
 pause():void {this.cutscene.pause(true);if(this.chapters.ready)this.persist();}
 private done(id:string,condition=true):boolean {if(!this.chapters.complete(id,condition))return false;this.persist();return true;}
 private checkpointAt(id:CampaignCheckpoint):void {const order=['forest','installation','evidence','final'];if(this.checkpoint&&order.indexOf(this.checkpoint)>order.indexOf(id))return;this.checkpoint=id;this.chapter.persist();this.persist();this.notify(`Checkpoint registrado: ${id==='forest'?'entrada da floresta':id==='installation'?'instalação':id==='evidence'?'evidências recuperadas':'sequência final'}.`);}
 update(dt:number,player:Vector3,look:Vector3,flashlight:boolean):void {
  this.player.copy(player);this.look.copy(look);this.flashlight=flashlight;this.props.sync(this.chapter,this.chapters.current);
  this.chapters.ready=this.chapter.flags.has('ending');if(!this.chapters.ready)return;
  this.seconds+=dt;const stage=this.chapters.current;
  if(this.chapters.result){if(!this.endingPresented&&!this.cutscene.active&&!this.chapter.dialogue.active)this.presentEnding();return;}
  if(!this.flags.has(`intro${stage}`)&&!this.chapter.dialogue.active&&!this.cutscene.active){this.chapter.dialogue.play(CHAPTER_INTROS[stage],()=>{this.flags.add(`intro${stage}`);this.persist();});}
  this.chapter.ui.objective.textContent=`CAPÍTULO ${stage} · ${CHAPTERS[stage].title} · ${this.chapters.objective}`;
  if(this.chapter.dialogue.active||this.chapter.ui.modal!==null||this.cutscene.active||this.creature.blocking)return;
  if(stage===2){
   this.done('exit',!(player.x>-2&&player.x<22&&player.z< -10&&player.z> -26));
   this.done('road',player.x< -8&&player.z>12&&player.z<38);
   if(this.done('trail',Math.abs(player.x)<2.5&&player.z>20&&player.z<34))this.checkpointAt('forest');
   this.done('evade',this.creature.checkpoint.seen.has('embers')&&!this.creature.apparitionActive&&!flashlight&&player.z>32&&this.creature.ai.state!=='CHASE');
   if(this.done('installation',player.distanceTo(new Vector3(20,1.65,42))<6)){this.chapters.advance();this.checkpointAt('installation');}
  }
  if(stage===3){for(const [goal,item]of [['photo','burnPhoto'],['recording','recording'],['transport','transport']] as const)if(this.done(goal,this.chapter.inventory.has(item))&&goal==='transport')this.checkpointAt('evidence');}
  if(stage===4){
   if(this.done('return',player.z<16&&player.x> -7&&player.x<30))this.persist();
   if(this.chapters.has('4.return')&&!this.flags.has('returnScene'))this.returnScene();
   if(this.flags.has('payload')&&!this.flags.has('finalEncounter')&&player.z>17){this.creature.beginEncounter(new Vector3(0,1.65,32));this.flags.add('finalEncounter');this.persist();}
   if(this.done('evade',this.flags.has('roadRelay')&&this.flags.has('forestRelay')&&this.flags.has('finalEncounter')&&player.z<17&&!this.creature.blocking)){this.flags.add('finalEvaded');this.creature.retreat();this.persist();}
  }
  this.props.needle.rotation.z=this.flags.has('payload')?Math.sin(this.seconds*9)*.5:0;
 }
 private collect(id:ItemId):string {
  if(!this.chapters.ready)return 'Primeiro conclua a investigação elétrica do posto.';
  const order:Partial<Record<ItemId,string>>={burnPhoto:'photo',recording:'recording',transport:'transport'};
  if(order[id]&&(this.chapters.current!==3||this.chapters.key!==order[id]))return 'Examine os arquivos e siga as indicações dos documentos: fotografia, gravação e transporte.';
  if(!this.chapter.inventory.add(id))return ITEMS[id].description;
  if(order[id])this.done(order[id]!);
  if(id==='transmitterManual')this.flags.add('manual');
  this.chapter.persist();this.persist();
  if(id==='transport'&&this.chapters.current===3&&REQUIRED_EVIDENCE.every(item=>this.chapter.inventory.has(item)))this.checkpointAt('evidence');
  this.props.sync(this.chapter,this.chapters.current);return `${ITEMS[id].name}\n${ITEMS[id].description}`;
 }
 action(id:string,_position:Vector3):string {
  if(!this.chapters.ready)return 'O chamado elétrico precisa ser resolvido antes de seguir adiante.';
  if(this.chapters.result)return 'A história já chegou a um final.';
  const stage=this.chapters.current;
  if(id==='truck'&&stage===2){return this.done('truck')?'Caminhão abandonado. A cabine está vazia; o rádio fica no lado direito, junto ao para-brisa.':'Siga primeiro a estrada e examine o caminhão quando esse for o objetivo.';}
  if(id==='truckRadio'&&stage===2){if(!this.done('truckRadio'))return 'Examine primeiro o caminhão.';this.flags.add('truckMessage');this.chapter.dialogue.play([{speaker:'RÁDIO DO CAMINHÃO',text:'O caminhão não voltou da queimada. A trilha fica atrás do posto. Arquivos na antena: foto, gravação, transporte. Não corra quando as árvores acenderem.',duration:8}]);this.persist();return 'Gravação recuperada. Retorne à placa da trilha atrás do posto.';}
  if(id==='explore'&&stage===3)return this.done('explore')?'Três arquivos: fotografia na sala oeste, gravação no centro, transporte na sala leste. Leia também o manual à entrada.':'Arquivos examinados. Siga o objetivo atual.';
  if(id==='link'&&stage===3){if(!this.done('link',REQUIRED_EVIDENCE.every(i=>this.chapter.inventory.has(i))))return 'Compare depois de reunir as três evidências.';this.flags.add('linked');this.persist();this.chapter.dialogue.play([{speaker:'RAIMUNDO PINHEIRO',text:'Os tambores saíam do posto. A gravação confirma as queimadas. O Boitatá acordou para defender esta floresta. Preciso enviar essas provas.',duration:8}]);return 'Fotografia, gravação e guia compartilham a mesma carga P-319.';}
  if(id==='cover'&&stage===3){const hidden=!this.creature.ai.perceive({position:this.player,look:this.look,flashlight:this.flashlight,moving:false,running:false,narrativeReady:true,protected:false}).visible;if(!this.done('evade',!this.flashlight&&hidden&&!this.creature.blocking))return 'Apague a lanterna e fique no lado protegido do painel. Primeiro resolva a comunicação.';this.creature.retreat();return 'Você quebrou a linha de visão. Volte à base da antena e feche o acoplador.';}
  if(id==='equipment'&&stage===4){
   if(this.done('equipment')){this.world.powerTarget=.6;this.world.blackoutTime=-1;return 'Equipamento auxiliar reativado. Interaja novamente para carregar as evidências.';}
   if(this.chapters.key==='evidence'){if(!REQUIRED_EVIDENCE.every(i=>this.chapter.inventory.has(i)))return 'Faltam provas da instalação.';REQUIRED_EVIDENCE.forEach(i=>this.chapter.inventory.use(i));this.flags.add('payload');this.done('evidence');this.chapter.persist();this.checkpointAt('final');return 'Evidências carregadas. Desligue o relé da rodovia e depois o da trilha. Apague a lanterna, escape da guardiã e volte para transmitir. Você também pode abandonar as provas e fugir no carro.';}
   if(this.chapters.key==='conclude'){this.finish(OPTIONAL_RECORDS.every(i=>this.chapter.inventory.has(i))?'witness':'dawn');return 'Enviando as provas e registros disponíveis.';}
   return 'Dois bloqueadores ainda interferem: rodovia e trilha. Conclua as ações externas e retorne.';
  }
  if((id==='roadRelay'||id==='forestRelay')&&stage===4){if(!this.flags.has('payload'))return 'Prepare primeiro as provas no transmissor do posto.';if(id==='forestRelay'&&!this.flags.has('roadRelay'))return 'Desligue primeiro o relé da rodovia.';this.flags.add(id);this.persist();return id==='roadRelay'?'Relé da rodovia desligado. Falta o da trilha.':'Relé da trilha desligado. Escape e retorne ao equipamento externo do posto.';}
  if(id==='car'&&stage===4&&this.chapters.has('4.return')){this.chapter.ui.campaign('ABANDONAR A TRANSMISSÃO?',panel=>{const p=document.createElement('p');p.textContent='Fugir encerra a história sem enviar as provas. Você pode ficar e tentar a transmissão.';panel.append(p);this.button(panel,'Fugir pela estrada',()=>{this.chapter.ui.close();this.finish('road');});this.button(panel,'Ficar e investigar',()=>this.chapter.ui.close());});return 'A chave está na ignição.';}
  return 'Siga o objetivo indicado antes de operar este equipamento.';
 }
 private transmitter(_p:Vector3):string {
  if(this.chapters.current!==3)return this.chapters.current<3?'A instalação ainda precisa ser alcançada pela trilha.':'Sinal local restaurado. O bloqueio principal está no posto.';
  if(this.chapters.key==='restore'){this.flags.add('coupler');this.done('restore');this.chapters.advance();this.chapter.dialogue.play([{speaker:'RÁDIO · OPERADOR',text:'O sinal local chegou, mas há um bloqueador perto do posto. Volte com as provas. O transmissor auxiliar fica na lateral direita.',duration:7}]);this.persist();return 'Acoplador fechado. Alimentação parcial restaurada.';}
  if(this.chapters.key!=='puzzle')return 'Leia e compare os três arquivos antes de rearmar a comunicação; depois use a cobertura do painel.';
  this.showTransmitter();return 'Painel de frequência, alimentação e chave de transmissão.';
 }
 private showTransmitter():void {
  this.chapter.ui.campaign('TRANSMISSOR · REDE REGIONAL',panel=>{
   const frequency=this.select(panel,'Frequência (MHz)',['119.70','153.40','162.50']),power=this.select(panel,'Alimentação (V)',['0','12','24']),key=this.select(panel,'Chave',['MANUTENÇÃO','REDE','DESLIGADA']);
   const signal=document.createElement('p');signal.setAttribute('role','status');panel.append(signal);
   const update=()=>{signal.textContent=`Sinal local: ${Math.round(([frequency.value===TRANSMITTER.frequency,power.value===TRANSMITTER.power,key.value===TRANSMITTER.key].filter(Boolean).length/3)*100)}%`;};[frequency,power,key].forEach(s=>s.onchange=update);update();
   this.button(panel,'Consultar manual',()=>this.notify(this.chapter.inventory.has('transmitterManual')?ITEMS.transmitterManual.description:'Manual à entrada dos arquivos, perto da placa.'));
   this.button(panel,'Verificar e rearmar',()=>{if(!this.chapter.inventory.has('transmitterManual')){signal.textContent='Leia o manual primeiro: frequência, tensão e chave estão documentadas.';return;}if(frequency.value!==TRANSMITTER.frequency||power.value!==TRANSMITTER.power||key.value!==TRANSMITTER.key){signal.textContent='Configuração incorreta. Nenhum componente foi perdido; tente novamente.';return;}this.flags.add('transmitter');this.done('puzzle');this.chapter.ui.close();this.chapter.sounds.tone('electricity');this.notify('Sinal local estabilizado. Apague a lanterna e use a cobertura do painel antes de fechar o acoplador.');});
   this.button(panel,'Fechar transmissor',()=>this.chapter.ui.close());
  });
 }
 private returnScene():void {
  if(this.chapter.dialogue.active||this.cutscene.active)return;
  this.creature.crossRoad();this.cutscene.play({from:this.camera.position.clone(),to:this.camera.position.clone().add(new Vector3(-1,0,1)),look:new Vector3(-12,1.5,26),duration:5},()=>{});
  this.chapter.dialogue.play(RETURN_DIALOGUE,()=>{this.flags.add('returnScene');this.persist();});
 }
 private finish(ending:Ending):void {
  if(!this.chapters.finish(ending))return;this.chapter.persist();this.persist();this.creature.setPeaceful(true);this.chapter.ui.close();
  this.props.dashboard.visible=ending==='road';const from=ending==='road'?new Vector3(-12,1.8,10):this.camera.position.clone(),to=ending==='road'?new Vector3(-12,1.8,-35):new Vector3(-5,1.8,16),look=ending==='road'?new Vector3(-12,1.8,-55):new Vector3(1,2,28);
  const sky=new Color(0x070e0b),dawn=new Color(0x8d9c79);
  this.cutscene.play({from,to,look,duration:6,update:t=>{if(ending!=='road'){(this.scene.background as Color).lerpColors(sky,dawn,t);if(this.scene.fog)this.scene.fog.color.copy(this.scene.background as Color);this.scene.children.forEach(o=>{if(o instanceof AmbientLight)o.intensity=.55+t*.8;});}this.props.needle.rotation.z=t*Math.PI;}},()=>{
   this.props.dashboard.visible=false;this.props.clock2347.visible=ending==='road';this.props.clock013.visible=ending!=='road';this.props.eyes.visible=ending==='witness';this.world.powerTarget=ending==='road'?.2:1;
   const dialogue=()=>this.chapter.dialogue.play(ENDINGS[ending].line,()=>this.presentEnding());if(ending==='road')this.cutscene.play({from:new Vector3(7,1.8,-16),to:new Vector3(8.5,1.8,-18),look:new Vector3(10,2.6,-19.7),duration:3},dialogue);else dialogue();
  });
 }
 private presentEnding():void {const ending=this.chapters.result;if(!ending)return;this.endingPresented=true;this.chapter.ui.campaign(ENDINGS[ending].title,panel=>{const p=document.createElement('p');p.textContent=ENDINGS[ending].text;panel.append(p);const stats=document.createElement('p');stats.textContent=`Registros opcionais: ${OPTIONAL_RECORDS.filter(i=>this.chapter.inventory.has(i)).length}/${OPTIONAL_RECORDS.length}. Tempo ativo dos capítulos 2–4: ${Math.floor(this.seconds/60)} min.`;panel.append(stats);this.button(panel,'Voltar ao menu',()=>this.onMenu());this.button(panel,'Repetir a partir do checkpoint',()=>this.retry());});}
 private retry():void {this.chapters.result=null;this.chapters.completed.delete('4.conclude');this.chapters.completed.delete('4.evade');for(const f of ['roadRelay','forestRelay','finalEncounter','finalEvaded'])this.flags.delete(f);this.endingPresented=false;this.props.eyes.visible=false;this.props.clock2347.visible=false;this.scene.background=new Color(0x070e0b);if(this.scene.fog)this.scene.fog.color.set(0x070e0b);this.scene.children.forEach(o=>{if(o instanceof AmbientLight)o.intensity=.55;});this.creature.setPeaceful(false);this.creature.resetEncounter();this.chapter.ui.close();this.onRespawn(this.restoredPosition??new Vector3(23,1.65,-8));this.persist();}
 onCapture(fallback:Vector3):Vector3 {if(!this.chapters.ready)return fallback;if(this.chapters.current===4&&this.flags.has('payload')){for(const f of ['roadRelay','forestRelay','finalEncounter','finalEvaded'])this.flags.delete(f);this.chapters.completed.delete('4.evade');this.persist();}return this.restoredPosition??fallback;}
 private select(panel:HTMLElement,name:string,values:string[]):HTMLSelectElement {const label=document.createElement('label');label.textContent=name;const select=document.createElement('select');select.setAttribute('aria-label',name);values.forEach(v=>select.add(new Option(v,v)));label.append(select);panel.append(label);return select;}
 private button(panel:HTMLElement,name:string,action:()=>void):void {const b=document.createElement('button');b.textContent=name;b.onclick=action;panel.append(b);}
 persist():void {if(!this.saves.save({version:1,chapter:this.chapters.current,completed:[...this.chapters.completed],flags:[...this.flags],checkpoint:this.checkpoint,ending:this.chapters.result,seconds:this.seconds}))this.notify(this.saves.warning);}
 private restore():void {if(!this.chapters.ready)return;const data=this.saves.load();if(!data)return;this.chapters.current=data.chapter;data.completed.forEach(id=>this.chapters.completed.add(id));data.flags.forEach(f=>this.flags.add(f));this.checkpoint=data.checkpoint;this.chapters.result=data.ending;this.seconds=data.seconds;
  while(this.chapters.key===undefined&&this.chapters.current<4){const previous=this.chapters.current;this.chapters.advance();if(previous===2)this.checkpoint='installation';}
  if(this.chapters.result==='witness'&&!OPTIONAL_RECORDS.every(i=>this.chapter.inventory.has(i))){this.chapters.result=null;this.chapters.completed.delete('4.conclude');this.checkpoint='final';this.saves.warning='Registros opcionais ausentes: transmissão disponível novamente.';}
  if(this.chapters.has('4.evidence'))REQUIRED_EVIDENCE.forEach(i=>this.chapter.inventory.use(i));
  const required=[['photo','burnPhoto'],['recording','recording'],['transport','transport']] as const;
  const missing=required.find(([goal,item])=>this.chapters.has(`3.${goal}`)&&!this.chapter.inventory.has(item));
  if(missing){let remove=false;for(const [goal]of CHAPTERS[3].objectives){if(goal===missing[0])remove=true;if(remove)this.chapters.completed.delete(`3.${goal}`);}for(const [goal]of CHAPTERS[4].objectives)this.chapters.completed.delete(`4.${goal}`);this.chapters.current=3;this.chapters.result=null;this.checkpoint='installation';for(const flag of ['linked','transmitter','coupler','intro4','returnScene','payload','roadRelay','forestRelay','finalEncounter','finalEvaded'])this.flags.delete(flag);this.saves.warning='Checkpoint recuperado: volte aos arquivos para recolher a prova ausente.';}
}
}
