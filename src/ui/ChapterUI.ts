import {ITEMS,type ItemId} from '../data/chapter1';
import type {Inventory} from '../story/Inventory';
import type {DialogueManager} from '../story/DialogueManager';
export type Modal='inventory'|'generator'|'camera'|'campaign'|null;
export class ChapterUI {
 readonly overlay=document.createElement('section');
 readonly subtitles=document.createElement('section');
 readonly objective=document.createElement('div');
 readonly quick=document.createElement('button');
 modal:Modal=null;
 onClose:()=>void=()=>{};
 onInventory:()=>void=()=>{};
 constructor(root:HTMLElement){
  this.overlay.className='chapter-overlay';this.overlay.hidden=true;this.overlay.setAttribute('role','dialog');this.overlay.setAttribute('aria-modal','true');this.overlay.setAttribute('aria-label','Painel de investigação');
  this.subtitles.className='subtitles';this.subtitles.hidden=true;this.subtitles.setAttribute('aria-live','polite');this.subtitles.innerHTML='<strong></strong><p></p><button>Avançar · E</button>';
  this.objective.className='objective';this.quick.className='inventory-toggle';this.quick.textContent='I · INVENTÁRIO';this.quick.onclick=()=>this.onInventory();root.append(this.objective,this.overlay,this.subtitles,this.quick);
 }
 get advance():HTMLButtonElement{return this.subtitles.querySelector('button')!;}
 private panel(title:string):HTMLElement {
  this.overlay.replaceChildren();const panel=document.createElement('div');panel.className='chapter-panel';const h=document.createElement('h2');h.textContent=title;panel.append(h);this.overlay.append(panel);this.overlay.hidden=false;return panel;
 }
 private button(panel:HTMLElement,text:string,action:()=>void):HTMLButtonElement {const b=document.createElement('button');b.textContent=text;b.onclick=action;panel.append(b);return b;}
 campaign(title:string,render:(panel:HTMLElement)=>void):void {this.modal='campaign';render(this.panel(title));}
 close():void {this.overlay.hidden=true;this.modal=null;this.onClose();}
 inventory(inventory:Inventory,use:(id:ItemId)=>string):void {
  this.modal='inventory';const panel=this.panel('INVENTÁRIO · RAIMUNDO PINHEIRO');const description=document.createElement('p');description.className='item-description';description.textContent='Selecione um item para examinar ou usar.';
  const list=document.createElement('div');list.className='inventory-list';panel.append(list,description);
  for(const [id,state]of inventory.items){const def=ITEMS[id];this.button(list,`${def.icon} ${def.name} · ${state==='used'?'usado':'disponível'}`,()=>{description.textContent=`${def.description}\n\n${use(id)}`;});}
  this.button(panel,'Fechar inventário',()=>this.close());
 }
 generator(installed:boolean,progress:number[],press:(n:number)=>void,install:()=>void,readNote:()=>void):void {
  this.modal='generator';const panel=this.panel('GERADOR · REARME DOS CIRCUITOS');const status=document.createElement('p');status.textContent=installed?`Fusível instalado. Entrada: ${progress.join(' → ')||'aguardando'}`:'Compartimento do fusível vazio. Procure no depósito.';panel.append(status);
  if(!installed)this.button(panel,'Instalar fusível',install);
  else for(const n of [1,2,3])this.button(panel,`Interruptor ${n}`,()=>press(n));
  this.button(panel,'Consultar anotação',readNote);this.button(panel,'Fechar painel',()=>this.close());
 }
 camera(done:()=>void):void {
  this.modal='camera';const panel=this.panel('CFTV · CÂMERA 01 / FLORESTA');
  const screen=document.createElement('div');screen.className='cctv';screen.innerHTML='<span class="cctv-time">21/11/2004 · 23:47:59 · REC ●</span><div class="cctv-trees"></div><div class="luminous-shape"></div><span class="cctv-caption">Uma grande forma luminosa atravessa a floresta.</span>';panel.append(screen);
  const b=this.button(panel,'Observando gravação…',done);b.disabled=true;
 }
 cameraReady():void {const b=this.overlay.querySelector('button');if(b){b.disabled=false;b.textContent='Encerrar gravação';}}
 dialogue(manager:DialogueManager):void {
  this.subtitles.hidden=!manager.active;if(!manager.active)return;
  this.subtitles.querySelector('strong')!.textContent=manager.line!.speaker;this.subtitles.querySelector('p')!.textContent=manager.visibleText;
  this.advance.disabled=manager.line?.allowAdvance===false;
 }
 visible(visible:boolean):void {this.overlay.classList.toggle('suspended',!visible);this.objective.hidden=!visible;this.quick.hidden=!visible;this.subtitles.style.visibility=visible?'':'hidden';this.overlay.style.visibility=visible?'':'hidden';}
}
