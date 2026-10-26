import {Group,Mesh,MeshLambertMaterial,BoxGeometry,Vector3,type Box3} from 'three';
import type {GameWorld} from '../world/GameWorld';
import {BoitataAI,type AIState,type CreatureStimulus} from './BoitataAI';
import {BoitataModel} from './BoitataModel';
import {CheckpointManager,type Apparition} from './CheckpointManager';
import {CreatureAudio} from '../audio/CreatureAudio';
export class CreatureEncounter {
 readonly ai:BoitataAI;readonly model=new BoitataModel();readonly checkpoint=new CheckpointManager();readonly audio=new CreatureAudio();
 readonly overlay=document.createElement('div');readonly cue=document.createElement('div');
 private appearance:Apparition|null=null;private appearanceTime=0;private visibleTime=0;private appearancePlan=0;private appearancePath:Vector3[]=[];private time=0;private cooldown=0;private captureTime=-1;private checkpointWarning=false;
 private readonly coverColliders:Box3[]=[];
 private readonly covers=new Group();private readonly coverGeometry=new BoxGeometry(1,1,1);private readonly coverMaterial=new MeshLambertMaterial({color:0x434f35,flatShading:true});
 onRespawn:(position:Vector3)=>void=()=>{};onCheckpoint:()=>void=()=>{};
 private devPanel?:HTMLElement;private debugOverride=false;
 constructor(private readonly world:GameWorld,root:HTMLElement,private readonly notify:(message:string)=>void){
  this.ai=new BoitataAI(world.assets.collisions);world.station.group.add(this.model.group,this.covers);
  this.overlay.className='capture-overlay';this.overlay.setAttribute('aria-live','assertive');this.overlay.hidden=true;root.append(this.overlay);
  this.cue.className='creature-cue';this.cue.hidden=true;this.cue.setAttribute('role','status');root.append(this.cue);
  // Four large fallen-trunk/rock covers with two open bypasses through the clearing.
  for(const [x,z,w,d]of [[12,41,3,1.8],[24,41,2,3],[16,47,3,1.8],[7,36,2,2]]){
   const mesh=new Mesh(this.coverGeometry,this.coverMaterial);mesh.position.set(x,1.15,z);mesh.scale.set(w,2.3,d);this.covers.add(mesh);this.coverColliders.push(world.assets.collisions.add(mesh.position,new Vector3(w,2.3,d)));
  }
  this.ai.onTransition=(_before,state)=>{if(state==='CHASE')this.notify('Ela viu a lanterna. Corra para a trilha ou quebre a linha de visão atrás de uma rocha.');if(state==='DORMANT')this.cooldown=18;};
  this.ai.onCapture=()=>this.capture();
  if(import.meta.env.DEV&&new URLSearchParams(location.search).has('aiDebug'))this.createDebug(root);
 }
 get blocking():boolean{return this.captureTime>=0;}
 get shake():number{return this.blocking?.055:this.ai.state==='CHASE'?.008:0;}
 get threat():number{return this.ai.state==='CHASE'?1:this.ai.state==='STALK'?this.ai.suspicion:0;}
 get restoredCheckpoint():Vector3|null{return this.checkpoint.checkpoint==='trail'?this.checkpoint.position:null;}
 unlockAudio():void {this.audio.unlock();}
 pause():void {this.audio.pause();this.overlay.style.visibility='hidden';this.cue.hidden=true;}
 update(dt:number,input:CreatureStimulus):void {
  if(this.debugOverride)input={...input,narrativeReady:true};
  this.world.creatureThreat=0;
  this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.overlay.style.visibility='';
  if(!input.narrativeReady){this.model.hide();this.audio.pause();this.cue.hidden=true;return;}
  if(this.checkpoint.warning&&!this.checkpointWarning){this.checkpointWarning=true;this.notify(this.checkpoint.warning);}
  if(this.blocking){this.captureTime+=dt;this.overlay.hidden=false;this.overlay.style.setProperty('--capture-time',String(this.captureTime));this.overlay.style.background=this.captureTime<1.2?`rgba(255,119,20,${Math.min(.9,this.captureTime*1.5)})`:`rgba(0,0,0,${Math.min(1,(this.captureTime-1.2)/1.2)})`;
   if(this.captureTime>3.3){this.captureTime=-1;this.overlay.hidden=true;this.ai.transition('DORMANT');this.ai.suspicion=0;this.cooldown=20;this.model.hide();this.audio.reset();this.audio.pause();this.onRespawn(this.checkpoint.position);this.notify('Raimundo desperta no último checkpoint. A lanterna foi apagada.');}return;
  }
  if(!this.debugOverride&&!this.appearance&&this.ai.state==='DORMANT'&&this.cooldown<=0){
   if(!this.checkpoint.seen.has('embers')&&input.position.z>18&&input.position.z<31&&Math.abs(input.position.x)<5)this.startAppearance('embers',new Vector3(0,1.65,31));
   else if(!this.checkpoint.seen.has('road')&&input.position.x< -7&&input.position.z>16&&input.position.z<36)this.startAppearance('road',new Vector3(-5,1.65,26));
   else if(input.position.distanceTo(new Vector3(18,1.65,42))<10){
    if(!this.checkpoint.seen.has('clearing')){this.checkpoint.setTrail();this.checkpoint.mark('clearing');this.onCheckpoint();this.notify('Checkpoint: entrada da clareira. A guardiã da mata observa. Apague a lanterna e não corra para permanecer discreto.');}
    this.ai.activate(new Vector3(23,1.65,45));this.seedBody(new Vector3(10,1.65,39));this.visibleTime=0;this.ai.transition('STALK');
   }
  }
  if(this.appearance){
   this.appearanceTime+=dt;const goal=this.appearance==='road'?new Vector3(-21,1.65,26):new Vector3(0,1.65,39);
   this.appearancePlan-=dt;if(this.appearancePlan<=0){this.appearancePath=this.ai.navigation.path(this.ai.position,goal);this.appearancePlan=.8;}const next=this.appearancePath[0];if(next){const dir=next.clone().sub(this.ai.position).setY(0).normalize();this.ai.forward.lerp(dir,1-Math.exp(-dt*3)).normalize();this.ai.navigation.move(this.ai.position,next,dt*2.4);if(this.ai.position.distanceTo(next)<.12)this.appearancePath.shift();}
   const duration=this.appearance==='road'?10:7,fade=Math.min(1,this.appearanceTime,Math.max(0,duration-this.appearanceTime));
   this.model.update(dt,this.ai.position,this.ai.forward,.5,this.appearance==='embers',fade);
   this.audio.update(this.ai.position,input.position,input.look,.2,false,this.time);
   if(this.appearanceTime>duration){this.appearance=null;this.model.hide();this.audio.pause();this.cooldown=2;}return;
  }
  if(this.ai.state==='DORMANT'){this.model.hide();this.audio.pause();this.cue.hidden=true;return;}
  if(this.ai.position.distanceTo(input.position)>48){this.ai.transition('DORMANT');this.model.hide();this.audio.pause();return;}
  this.visibleTime+=dt;const sense=this.ai.update(dt,input),retreat=this.ai.state==='RETREAT';this.world.creatureThreat=this.threat;
  this.model.update(dt,this.ai.position,this.ai.forward,this.threat+.25,false,Math.min(1,this.visibleTime/2)*(retreat?Math.max(0,1-this.ai.stateTime/6):1));
  this.audio.update(this.ai.position,input.position,input.look,this.threat,this.ai.state==='CHASE',this.time);
  this.cue.hidden=this.blocking||(!sense.beam&&this.ai.state!=='CHASE');this.cue.textContent=this.ai.state==='CHASE'?'ELA VIU VOCÊ · CORRA / USE COBERTURA':'A LUZ ATRAI SEU OLHAR · F / ☼ PARA APAGAR';
  if(this.devPanel)this.devPanel.querySelector('output')!.textContent=`${this.ai.state} · risco ${this.ai.suspicion.toFixed(2)} · LOS ${sense.visible} · ${sense.distance.toFixed(1)} m`;
 }
 private startAppearance(id:'embers'|'road',position:Vector3):void {
  this.appearance=id;this.appearanceTime=0;this.appearancePlan=0;this.appearancePath=[];this.checkpoint.mark(id);this.ai.position.copy(this.ai.navigation.nearest(position));this.seedBody(id==='road'?new Vector3(-12,1.65,39):new Vector3(0,1.65,40));
  this.notify(id==='embers'?'Pequenas luzes revelam escamas entre as árvores. A mata tem uma guardiã.':'Uma serpente de fogo cruza a BR-319, à distância. Não siga a luz.');
 }
 private seedBody(tail:Vector3):void {this.model.reset(this.ai.position,this.ai.navigation.path(this.ai.position,tail));}
 private capture():void {if(this.blocking)return;this.captureTime=0;this.overlay.hidden=false;this.overlay.textContent='A LUZ TOMOU TUDO';this.audio.capture();this.cue.hidden=true;}
 private createDebug(root:HTMLElement):void {
  const panel=this.devPanel=document.createElement('details');panel.className='ai-debug';const summary=document.createElement('summary');summary.textContent='IA · DESENVOLVIMENTO';panel.append(summary,document.createElement('output'));
  const lab=document.createElement('button');lab.textContent='Laboratório · Ir à clareira';lab.onclick=()=>{this.debugOverride=true;this.appearance=null;this.cooldown=0;this.onRespawn(new Vector3(18,1.65,38));this.ai.activate(new Vector3(23,1.65,45));this.seedBody(new Vector3(10,1.65,39));this.visibleTime=2;this.notify('Laboratório de IA: aparições e checkpoint não serão salvos. Finalize/avance as legendas para testar.');};panel.append(lab);
  for(const state of ['DORMANT','PATROL','INVESTIGATE','STALK','CHASE','SEARCH','RETREAT'] as AIState[]){const b=document.createElement('button');b.textContent=state;b.onclick=()=>{this.debugOverride=true;if(this.ai.state==='DORMANT'){this.ai.activate(new Vector3(18,1.65,42));this.seedBody(new Vector3(10,1.65,39));this.visibleTime=2;}this.ai.lastKnown.copy(new Vector3(0,1.65,34));this.ai.transition(state);};panel.append(b);}
  root.append(panel);
 }
 dispose():void {this.coverColliders.forEach(box=>this.world.assets.collisions.remove(box));this.model.dispose();this.coverGeometry.dispose();this.coverMaterial.dispose();this.audio.dispose();this.covers.removeFromParent();this.overlay.remove();this.cue.remove();this.devPanel?.remove();}
}
