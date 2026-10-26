import {Vector3,type Mesh} from 'three';
import {ENDING,INTRO,ITEMS,PUZZLE,type ItemId} from '../data/chapter1';
import type {GameWorld} from '../world/GameWorld';
import type {WorldInteraction} from '../world/WorldInteraction';
import {WorldDoor} from '../world/WorldInteraction';
import {Inventory} from './Inventory';
import {ObjectiveManager} from './ObjectiveManager';
import {DialogueManager} from './DialogueManager';
import {HorrorEventManager} from './HorrorEventManager';
import {SaveManager,type ChapterSave} from './SaveManager';
import {InteractionSystem} from './InteractionSystem';
import {StoryEffects} from './StoryEffects';
import {StorySounds} from '../audio/StorySounds';
import {ChapterUI} from '../ui/ChapterUI';
import type {GraphicsSettings} from '../systems/GraphicsSettings';
interface ChapterObject extends WorldInteraction {enabled:boolean;}
export class ChapterOne {
 readonly inventory=new Inventory();readonly objectives=new ObjectiveManager();readonly dialogue=new DialogueManager();readonly horror=new HorrorEventManager();readonly saves=new SaveManager();
 readonly flags=new Set<string>();readonly unlocked=new Set<string>();readonly puzzles=new Set<string>();readonly interaction:InteractionSystem;readonly ui:ChapterUI;
 readonly sounds=new StorySounds();private readonly effects:StoryEffects;private readonly pickups=new Map<ItemId,{mesh:Mesh;object:ChapterObject}>();
 private readonly objects:ChapterObject[]=[];private progress:number[]=[];private cameraTime=0;private chapter:1|2=1;private started=false;
 private position=new Vector3();private direction=new Vector3(0,0,-1);private generatorPosition=new Vector3(25,1.4,-16.4);
 onClose:()=>void=()=>{};onFlashlight:()=>void=()=>{};
 constructor(private readonly world:GameWorld,root:HTMLElement,private readonly graphics:GraphicsSettings,private readonly notify:(message:string)=>void){
  this.ui=new ChapterUI(root);this.ui.visible(false);this.ui.onClose=()=>this.onClose();this.ui.onInventory=()=>{if(!this.dialogue.active&&this.ui.modal===null)this.openInventory();};this.ui.advance.onclick=()=>this.dialogue.advance();
  this.dialogue.onLine=line=>{if(/interferência|estática/i.test(line.text))this.sounds.tone('static');};
  this.interaction=new InteractionSystem(world.assets.collisions);this.effects=new StoryEffects(world);
  world.powerTarget=.2;world.powerLevel=.2;this.restore();
  for(const item of world.interactions){if(item.label==='LER DOCUMENTOS')continue;
   if(item instanceof WorldDoor){const use=item.use.bind(item);item.use=(p)=>{
    if(item.name==='DEPÓSITO'&&!this.unlocked.has('DEPÓSITO')){if(!this.inventory.has('key'))return 'Trancado. A chave deve estar na gaveta do balcão.';this.unlocked.add('DEPÓSITO');this.inventory.use('key');}
    const result=use(p);if(item.name==='DEPÓSITO'&&item.open)this.objectives.complete('store');this.persist();return result;
   };}
   this.interaction.register(item);
  }
  const object=(label:string,position:Vector3,use:()=>string):ChapterObject=>{const item={label,position,enabled:true,use};this.objects.push(item);this.interaction.register(item);return item;};
  const a=world.assets,g=world.station.group;
  object('INVESTIGAR BALCÃO',new Vector3(17.8,1.45,-11.3),()=>{this.objectives.complete('counter');this.horror.trigger('silhouette',()=>{this.effects.showSilhouette();this.notify('Uma silhueta se move do lado de fora da porta.');});this.persist();return 'O chamado está sobre o balcão: Raimundo Pinheiro, manutenção elétrica. A gaveta à esquerda está entreaberta. O gerador fica no lado externo direito.';});
  const drawer=a.box(g,15.8,1,-11.42,.7,.24,.1,0x655b40,false);
  const drawerObject=object('ABRIR GAVETA',new Vector3(15.8,1,-11.3),()=>{if(!this.objectives.facts.has('counter'))return 'Examine primeiro os documentos no balcão.';this.flags.add('drawer');drawerObject.enabled=false;drawer.position.z=-11.15;const pickup=this.pickups.get('key')!;pickup.object.enabled=!this.inventory.has('key');pickup.mesh.visible=pickup.object.enabled;this.persist();return 'A gaveta abriu. Há uma chave sobre a madeira.';});
  if(this.flags.has('drawer')){drawerObject.enabled=false;drawer.position.z=-11.15;}
  const pickup=(id:ItemId,x:number,y:number,z:number,color:number,allowed:()=>boolean=()=>true)=>{
   const mesh=a.box(g,x,y,z,.28,.12,.22,color,false);mesh.visible=!this.inventory.has(id)&&allowed();
   const item=object(`COLETAR ${ITEMS[id].name.toLocaleUpperCase('pt-BR')}`,new Vector3(x,y,z),()=>{
    if(!allowed())return 'Abra a gaveta primeiro.';if(!this.inventory.add(id))return 'Este item já está no inventário.';
    item.enabled=false;mesh.visible=false;
    if(id==='key'||id==='fuse'||id==='note')this.objectives.complete(id);
    this.persist();return `${ITEMS[id].name} adicionado ao inventário. ${id==='note'?PUZZLE.clue:ITEMS[id].description}`;
   });item.enabled=mesh.visible;this.pickups.set(id,{mesh,object:item});
  };
  pickup('key',15.8,1.45,-11.12,0xc4b16b,()=>this.flags.has('drawer'));
  pickup('fuse',7,1.05,-24,0xb5d0c1);a.box(g,7,.45,-24,.75,.9,.65,0x665e42);
  pickup('note',19,1.4,-22,0xcac49d);a.box(g,19,.6,-22,.8,1.2,.6,0x5b644d);
  pickup('tape',19.5,1.5,-11.3,0x292f25);pickup('maintenance',17.4,1.2,-24,0xbfb89a);pickup('photos',5.5,1.5,-22,0x8b9c85);
  object('USAR RÁDIO',new Vector3(17,1.6,-11.35),()=>this.radio());
  object('ATENDER TELEFONE',new Vector3(19,1.65,-11.3),()=>{this.sounds.tone('static');this.dialogue.play([{speaker:'TELEFONE',text:'[Linha muda. Um ruído parece acompanhar a chuva.]',duration:4}]);return 'Raimundo levanta o telefone.';});
  object('EXAMINAR TELEVISÃO',new Vector3(-1,2.15,-11.5),()=>{this.effects.interfere();this.sounds.tone('static');return 'A tela do tubo só mostra interferência. A câmera de segurança fica no terminal do balcão.';});
  a.label(g,'CHAMADO',17.8,1.47,-11.3,.55);
  const camera=a.box(g,14,1.65,-11.8,.7,.5,.4,0x324e43,false);a.label(g,'CFTV',14,1.65,-11.56,.6);
  object('USAR CÂMERA DE SEGURANÇA',new Vector3(14,1.65,-11.5),()=>{if(!this.objectives.facts.has('power'))return 'Câmera sem energia. Restaure o gerador primeiro.';if(this.objectives.facts.has('camera'))return 'Gravação observada. A interferência veio da retransmissora na floresta.';this.cameraTime=0;this.ui.camera(()=>this.finishCamera());this.horror.trigger('camera',()=>this.sounds.tone('static'));camera.visible=true;this.persist();return 'Câmera 01 — borda da floresta.';});
  object('ABRIR PAINEL DO GERADOR',this.generatorPosition,()=>{this.objectives.complete('generator');this.showGenerator();this.persist();return 'Painel de três circuitos. Consulte a anotação elétrica.';});
  // These are physical panel switches; the same sequence is also accessible in the touch panel.
  for(const n of [1,2,3]){a.box(g,24.45+n*.25,1.1,-16.43,.12,.22,.07,0xaca780,false);}
  if(this.puzzles.has('generator'))world.powerTarget=1;
  if(this.horror.executed.has('blackout')){world.powerTarget=0;world.blackoutTime=10;}
 }
 get blocking():boolean{return this.dialogue.active||this.ui.modal!==null;}
 get typewriter():boolean{return this.dialogue.typewriter;}
 start():void {
  this.sounds.unlock();this.dialogue.resume();this.ui.visible(true);if(this.started)return;this.started=true;
  if(this.saves.warning)this.notify(this.saves.warning);
  if(!this.flags.has('intro'))this.dialogue.play(INTRO,()=>{this.flags.add('intro');this.persist();});
  else if(this.objectives.facts.has('camera')&&!this.flags.has('ending'))this.ending();
 }
 pause():void {this.sounds.pause();this.dialogue.pause();this.ui.visible(false);this.persist();}
 update(dt:number,position:Vector3,direction:Vector3):void {
  this.position.copy(position);this.direction.copy(direction);this.dialogue.update(dt);this.effects.update(dt,position);this.ui.dialogue(this.dialogue);
  this.ui.objective.textContent=`${this.chapter===2?'CAPÍTULO 1 CONCLUÍDO · TRANSIÇÃO PARA O CAPÍTULO 2':'CAPÍTULO 1'} · ${this.objectives.current}`;this.ui.quick.disabled=this.dialogue.active;
  if(!this.dialogue.active&&position.x>-1.7&&position.x<21.7&&position.z< -10.5&&position.z> -26){
   // Entrance requires crossing the open doorway, rather than standing near the building.
   const door=this.world.station.doors[0];if(door.open||this.objectives.facts.has('enter')){
    if(!this.objectives.facts.has('enter')){this.objectives.complete('enter');this.persist();}
    this.horror.trigger('phone',()=>{this.sounds.tone('phone');this.notify('O telefone está tocando no balcão.');this.persist();});
   }
  }
  if(this.objectives.facts.has('key'))this.horror.trigger('television',()=>{this.effects.interfere();this.sounds.tone('static');this.persist();});
  if(this.objectives.facts.has('note'))this.horror.trigger('pump',()=>{this.effects.startPump();this.sounds.tone('pump');this.notify('Uma bomba de combustível acionou sozinha.');this.persist();});
  if(this.puzzles.has('generator')&&!this.objectives.facts.has('power')&&this.world.powerLevel>=.97){this.objectives.complete('power');this.notify('Energia restaurada. Confira o terminal CFTV à esquerda do caixa.');this.persist();}
  if(this.ui.modal==='camera'){this.cameraTime+=dt;if(this.cameraTime>=7)this.ui.cameraReady();}
 }
 interact():void {
  if(this.dialogue.active){this.dialogue.advance();return;}if(this.ui.modal!==null)return;
  const item=this.interaction.find(this.position,this.direction);this.notify(item?item.use(this.position):'Nada ao alcance. Olhe diretamente para o objeto.');
 }
 get prompt():string {if(this.blocking)return '';const item=this.interaction.find(this.position,this.direction);return item?`[E] INTERAGIR · ${item.label}`:'';}
 openInventory():void {if(this.dialogue.active)return;if(this.ui.modal==='inventory'){this.ui.close();return;}if(this.ui.modal)return;this.ui.inventory(this.inventory,id=>this.useItem(id));}
 private useItem(id:ItemId):string {
  if(id==='flashlight'){this.onFlashlight();return 'Estado da lanterna alternado.';}
  if(id==='radio'){this.ui.close();return this.radio();}
  if(id==='tape'){this.inventory.use(id);this.persist();return 'TRANSCRIÇÃO — Antônio: “Não deixem a luz da mata chegar ao posto. O gerador abre os olhos dela.”';}
  if(id==='key'){const door=this.world.station.doors[2];if(door.position.distanceTo(this.position)>2.8)return 'Aproxime-se da porta do depósito para usar.';const result=door.use(this.position);this.persist();return result;}
  if(id==='fuse'){if(this.position.distanceTo(this.generatorPosition)>2.8)return 'Leve o fusível ao painel externo do gerador.';return this.installFuse();}
  this.inventory.use(id);this.persist();return this.inventory.describe(id);
 }
 private radio():string {this.sounds.tone('static');this.dialogue.play([{speaker:'RAIMUNDO PINHEIRO · RÁDIO',text:this.chapter===2?'A origem da interferência fica na floresta. Preciso seguir até a antena.':'Seu Antônio? Estou verificando o gerador. Responda, por favor.',duration:5},{speaker:'RÁDIO',text:'[Apenas estática]',duration:2}]);return 'Rádio sintonizado no canal do posto.';}
 private showGenerator():void {this.ui.generator(this.flags.has('fuseInstalled'),this.progress,n=>this.pressSwitch(n),()=>{this.notify(this.installFuse());this.showGenerator();},()=>this.notify(this.inventory.has('note')?PUZZLE.clue:'Procure a anotação na sala elétrica, no fundo da conveniência.'));}
 installFuse():string {
  if(this.flags.has('fuseInstalled'))return 'O fusível já está instalado.';
  if(!this.inventory.has('fuse'))return 'Você precisa encontrar o fusível no depósito.';
  this.flags.add('fuseInstalled');this.inventory.use('fuse');this.persist();return 'Fusível encaixado. Rearme os três circuitos na sequência da anotação.';
 }
 pressSwitch(n:number):void {
  if(this.puzzles.has('generator')){this.notify('O gerador já está funcionando.');return;}
  if(!this.flags.has('fuseInstalled')){this.notify('Instale primeiro o fusível.');return;}
  if(!this.inventory.has('note')){this.notify('Localize a anotação elétrica antes de rearmar os circuitos.');return;}
  if(n!==PUZZLE.sequence[this.progress.length]){this.progress=[];this.sounds.tone('static');this.notify('Sequência incorreta. Circuitos reiniciados. Tente novamente.');this.showGenerator();return;}
  this.progress.push(n);
  if(this.progress.length===PUZZLE.sequence.length){this.puzzles.add('generator');this.objectives.complete('puzzle');this.world.powerTarget=1;this.sounds.tone('electricity');this.ui.close();this.notify('Gerador ligado. Aguarde a iluminação estabilizar.');this.persist();}else this.showGenerator();
 }
 private finishCamera():void {
  if(this.cameraTime<7)return;this.ui.close();this.objectives.complete('camera');this.persist();this.ending();
 }
 private ending():void {this.dialogue.play(ENDING,()=>{
  this.horror.trigger('blackout',()=>{this.world.powerTarget=0;this.world.blackoutTime=0;this.sounds.tone('electricity');});
  this.flags.add('ending');this.chapter=2;this.persist();this.notify('Capítulo 1 concluído. Investigue a origem da interferência. Capítulo 2 preparado; criatura não implementada.');
 });}
 persist():void {
  const data:ChapterSave={version:1,chapter:this.chapter,objectives:this.objectives.completed,items:Object.fromEntries(this.inventory.items),unlocked:[...this.unlocked],puzzles:[...this.puzzles],events:[...this.horror.executed],flags:[...this.flags],settings:{quality:this.graphics.quality,distance:this.graphics.renderDistance,adaptive:this.graphics.adaptive,typewriter:this.dialogue.typewriter}};
  if(!this.saves.save(data))this.notify(this.saves.warning);
 }
 private restore():void {
  const data=this.saves.load();if(!data)return;
  this.chapter=data.chapter;this.inventory.items.clear();for(const [id,state]of Object.entries(data.items))this.inventory.items.set(id as ItemId,state!);
  data.objectives.forEach(id=>this.objectives.complete(id));data.unlocked.forEach(id=>this.unlocked.add(id));data.puzzles.forEach(id=>this.puzzles.add(id));data.events.forEach(id=>this.horror.executed.add(id));data.flags.forEach(id=>this.flags.add(id));
  this.graphics.set(data.settings.quality);this.graphics.setDistance(data.settings.distance);this.graphics.adaptive=data.settings.adaptive;this.dialogue.typewriter=data.settings.typewriter;
 }
}
