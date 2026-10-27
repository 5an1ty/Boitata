import type {GraphicsSettings} from '../systems/GraphicsSettings';
import {settingsPanel} from './SettingsPanel';
export class MainMenu {
 readonly element=document.createElement('section');
 private page:'main'|'settings'|'credits'='main';private paused=false;
 hasSave=false;onNewGame:()=>void=()=>{};onTypewriter:(enabled:boolean)=>void=()=>{};typewriter=true;
 constructor(parent:HTMLElement,private readonly graphics:GraphicsSettings,private readonly play:()=>void){this.element.className='menu';parent.append(this.element);this.render();}
 refresh():void{this.render();}
 show(paused:boolean):void{this.paused=paused;this.page='main';this.element.hidden=false;this.render();}
 hide():void{this.element.hidden=true;}
 private render():void{
  this.element.classList.toggle('settings-open',this.page==='settings');
  this.element.innerHTML=`<div class="menu-content"><div class="eyebrow">UM JOGO DE TERROR BRASILEIRO</div><h1>BOITATÁ<span>A ÚLTIMA LUZ DA BR-319</span></h1><div class="edition">${this.paused?'PAUSADO · TRANSMISSÃO INTERROMPIDA':'AMAZONAS · 21 DE NOVEMBRO DE 2004'}</div><div class="menu-panel"></div><div class="menu-foot">RAIMUNDO PINHEIRO<span>VERSÃO WEB · 1.0</span></div></div><div class="coordinates">BR-319 · TRECHO FICTÍCIO<br>AO SUL DE MANAUS</div>`;
  const panel=this.element.querySelector<HTMLElement>('.menu-panel')!;
  const button=(text:string,action:()=>void)=>{const b=document.createElement('button');b.textContent=text;b.onclick=action;panel.append(b);return b;};
  if(this.page==='main'){
   if(this.paused)button('Retomar jogo',this.play).className='primary';
   button('Novo jogo',()=>{if(!this.hasSave){this.onNewGame();return;}panel.replaceChildren();const warning=document.createElement('p');warning.textContent='Apagar o progresso dos quatro capítulos? Suas configurações serão mantidas.';panel.append(warning);button('Confirmar: apagar progresso',this.onNewGame);button('Cancelar',()=>this.render());}).classList.toggle('primary',!this.hasSave&&!this.paused);
   if(!this.paused){const resume=button('Continuar',this.play);resume.disabled=!this.hasSave;resume.title=this.hasSave?'Retomar último checkpoint':'Nenhum save válido';if(this.hasSave)resume.className='primary';}
   button('Configurações',()=>{this.page='settings';this.render();});button('Créditos',()=>{this.page='credits';this.render();});
   const help=document.createElement('p');help.className='help';help.textContent='WASD mover · Mouse olhar · Shift correr · Espaço pular\nE interagir/avançar · F lanterna · I inventário · Esc pausar\nTouch: joystick e câmera por arrasto. Use na horizontal.';panel.append(help);
  }else if(this.page==='settings'){
   settingsPanel(panel,this.graphics,enabled=>{this.typewriter=enabled;this.onTypewriter(enabled);});button('← Voltar',()=>{this.page='main';this.render();});
  }else{
   const text=document.createElement('p');text.className='credits';text.textContent='BOITATÁ: A Última Luz da BR-319\nRaimundo Pinheiro · quatro capítulos, três finais\nThree.js · TypeScript · Vite\nCenário fictício inspirado na Amazônia brasileira.\nModelos e texturas procedurais. Efeitos sonoros sintetizados.\nFonte VT323: licença SIL Open Font License.\nLegendas em português. Ambiência gravada e dublagem pendentes.';panel.append(text);button('← Voltar',()=>{this.page='main';this.render();});
  }
 }
}
