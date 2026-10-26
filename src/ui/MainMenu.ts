import type { GraphicsSettings, Quality } from '../systems/GraphicsSettings';
export class MainMenu {
  readonly element=document.createElement('section');
  private page: 'main'|'settings'|'credits'='main';
  private paused=false;
  hasSave=false;
  onNewGame:()=>void=()=>{};
  onTypewriter:(enabled:boolean)=>void=()=>{};
  typewriter=true;
  refresh():void{this.render();}
  constructor(parent: HTMLElement,private readonly graphics: GraphicsSettings,private readonly play:()=>void) {this.element.className='menu';parent.append(this.element);this.render();}
  show(paused: boolean): void {this.paused=paused;this.page='main';this.element.hidden=false;this.render();}
  hide(): void {this.element.hidden=true;}
  private render(): void {
    this.element.innerHTML=`<div class="menu-content"><div class="eyebrow">UM JOGO DE TERROR BRASILEIRO</div><h1>BOITATÁ<span>A ÚLTIMA LUZ DA BR-319</span></h1><div class="edition">${this.paused?'TRANSMISSÃO INTERROMPIDA · PAUSADO':'AMAZONAS, BRASIL · 2004'}</div><div class="menu-panel"></div><div class="menu-foot">RAIMUNDO PINHEIRO<span>ETAPA 04 / A GUARDIÃ</span></div></div><div class="coordinates">03° S &nbsp; 60° W<br>ALGUM LUGAR AO SUL DE MANAUS</div>`;
    const panel=this.element.querySelector<HTMLElement>('.menu-panel')!;
    const button=(text:string,callback:()=>void)=>{const b=document.createElement('button');b.textContent=text;b.addEventListener('click',callback);panel.append(b);return b;};
    if(this.page==='main') {
      button(this.paused?'Retomar jogo':this.hasSave?'Continuar jogo':'Iniciar jogo',this.play).className='primary';
      if(this.hasSave)button('Nova partida',()=>{panel.replaceChildren();button('Confirmar: apagar progresso',this.onNewGame);button('Cancelar',()=>this.render());});
      button('Configurações',()=>{this.page='settings';this.render();});button('Créditos',()=>{this.page='credits';this.render();});
      const help=document.createElement('p');help.className='help';help.textContent='WASD mover · Mouse olhar · Shift correr\nE interagir/avançar · F lanterna · I inventário · Esc pausar\nNo celular: joystick e arrasto à direita.';panel.append(help);
    } else if(this.page==='settings') {
      const label=document.createElement('label');label.textContent='QUALIDADE GRÁFICA';const select=document.createElement('select');
      for(const quality of ['Baixo','Médio','Alto'] as Quality[]){const option=new Option(quality,quality);option.selected=this.graphics.quality===quality;select.add(option);}
      select.onchange=()=>this.graphics.set(select.value as Quality);label.append(select);panel.append(label);
      const distanceLabel=document.createElement('label');distanceLabel.textContent='VISIBILIDADE';const distance=document.createElement('select');distance.setAttribute('aria-label','Distância de renderização');
      for(const value of [28,48,72]){const option=new Option(`${value} m`,String(value));option.selected=this.graphics.renderDistance===value;distance.add(option);}distance.onchange=()=>this.graphics.setDistance(Number(distance.value));distanceLabel.append(distance);panel.append(distanceLabel);
      const adaptive=document.createElement('label');adaptive.className='checkbox';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=this.graphics.adaptive;checkbox.onchange=()=>{this.graphics.adaptive=checkbox.checked;};adaptive.append(checkbox,' Resolução adaptativa');panel.append(adaptive);
      const typing=document.createElement('label');typing.className='checkbox';const check=document.createElement('input');check.type='checkbox';check.checked=this.typewriter;check.onchange=()=>{this.typewriter=check.checked;this.onTypewriter(check.checked);};typing.append(check,' Efeito de digitação');panel.append(typing);
      button('← Voltar',()=>{this.page='main';this.render();});
    } else {
      const text=document.createElement('p');text.className='credits';text.textContent='BOITATÁ: A Última Luz da BR-319\nProtagonista: Raimundo Pinheiro\nCapítulo 1 e encontros com a guardiã · Etapa 4\nDesenvolvido com Three.js, TypeScript e Vite.\nCenário fictício inspirado na Amazônia brasileira.\nGeometria e texturas geradas no próprio jogo.';panel.append(text);button('← Voltar',()=>{this.page='main';this.render();});
    }
  }
}
