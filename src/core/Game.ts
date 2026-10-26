import { Vector3, WebGLRenderer } from 'three';
import { GameLoop } from './GameLoop';
import { SceneManager } from './SceneManager';
import { InputManager } from '../input/InputManager';
import { CameraController } from '../player/CameraController';
import { PlayerController } from '../player/PlayerController';
import { GraphicsSettings } from '../systems/GraphicsSettings';
import { MainMenu } from '../ui/MainMenu';
import { MobileControls } from '../ui/MobileControls';
export class Game {
  private readonly renderer = new WebGLRenderer({antialias:false,powerPreference:'high-performance'});
  private readonly world = new SceneManager();
  private readonly input: InputManager;
  private readonly player: PlayerController;
  private readonly graphics: GraphicsSettings;
  private readonly menu: MainMenu;
  private readonly mobile: MobileControls;
  private readonly loop: GameLoop;
  private readonly hud=document.createElement('div');
  private readonly toast=document.createElement('div');
  private readonly prompt=document.createElement('div');
  private started=false;
  private paused=true;
  private messageTimer=0;
  private readonly direction=new Vector3();
  constructor(private readonly root: HTMLElement) {
    this.renderer.domElement.className='game-canvas';root.append(this.renderer.domElement);
    this.graphics=new GraphicsSettings(this.renderer);this.graphics.resize();
    this.input=new InputManager(this.renderer.domElement);
    this.player=new PlayerController(new CameraController(this.world.camera),this.world.collisions);
    this.hud.className='hud';this.hud.innerHTML='<div class="hud-top"><span>BR-319 <small>AMAZONAS · 2004</small></span><span class="live">● RAIMUNDO PINHEIRO</span></div><span class="crosshair">+</span><div class="hud-bottom"><span>01 <small>EXPLORAÇÃO</small></span><span class="lamp-status"></span></div>';
    root.append(this.hud);this.toast.className='toast';this.toast.setAttribute('role','status');root.append(this.toast);this.prompt.className='interaction-prompt';root.append(this.prompt);
    this.mobile=new MobileControls(root,this.input);
    this.menu=new MainMenu(root,this.graphics,()=>this.resume());
    const rotate=document.createElement('div');rotate.className='rotate-screen';rotate.innerHTML='<span>↻</span><h2>Gire o aparelho</h2><p>A floresta espera.<br>Jogue com o celular na horizontal.</p>';root.append(rotate);
    this.input.onAction=action=>{
      if(action==='pause'){if(this.started){if(this.paused)this.resume();else this.pause();}return;}
      if(this.paused)return;
      if(action==='flashlight'){this.world.flashlight.visible=!this.world.flashlight.visible;this.updateLamp();}
      if(action==='interact')this.message(this.canInteract()?'BR-319. Manaus, 147 km. A próxima luz parece muito distante.':'Nada ao alcance. Aproxime-se da placa da estrada.');
    };
    document.addEventListener('pointerlockchange',()=>{if(this.started&&!this.paused&&!document.pointerLockElement&&!this.isTouch())this.pause();});
    this.renderer.domElement.addEventListener('click',()=>{if(!this.paused&&!this.isTouch())this.lockPointer();});
    window.addEventListener('blur',()=>this.pause());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();});
    window.addEventListener('resize',()=>{this.resize();if(this.isTouch()&&innerHeight>innerWidth)this.pause();});
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.pause();this.loop.stop();this.message('A conexão gráfica foi interrompida. Recarregue a página.');});
    this.loop=new GameLoop(dt=>{
      if(!this.paused){this.player.update(this.input,dt);this.graphics.sample(dt);this.prompt.textContent=this.canInteract()?'E · LER PLACA':'';}
      this.renderer.render(this.world.scene,this.world.camera);
    });
    this.updateLamp();this.loop.start();
  }
  private isTouch(): boolean {return matchMedia('(pointer: coarse)').matches;}
  private lockPointer(): void {
    try {const result=this.renderer.domElement.requestPointerLock();if(result)void result.catch(()=>this.message('Clique no cenário para ativar a câmera com o mouse.'));}
    catch {this.message('O navegador não permitiu capturar o mouse. Clique no cenário para tentar novamente.');}
  }
  private resume(): void {
    if(this.isTouch()&&innerHeight>innerWidth)return;
    this.started=true;this.paused=false;this.input.reset();this.input.enabled=true;this.menu.hide();this.mobile.show(true);this.hud.hidden=false;this.root.classList.add('playing');
    if(!this.isTouch())this.lockPointer();
  }
  private pause(): void {
    if(!this.started||this.paused)return;
    this.paused=true;this.input.enabled=false;this.input.reset();this.mobile.show(false);this.hud.hidden=true;this.prompt.textContent='';this.menu.show(true);this.root.classList.remove('playing');
    if(document.pointerLockElement)document.exitPointerLock();
  }
  private canInteract(): boolean {
    const offset=this.world.environment.signPosition.clone().sub(this.player.position);
    this.world.camera.getWorldDirection(this.direction);
    return offset.length()<2.8&&this.direction.dot(offset.normalize())>0.7;
  }
  private updateLamp(): void {this.hud.querySelector('.lamp-status')!.textContent=`F · LANTERNA ${this.world.flashlight.visible?'LIGADA':'DESLIGADA'}`;}
  private message(text: string): void {clearTimeout(this.messageTimer);this.toast.textContent=text;this.toast.classList.add('visible');this.messageTimer=window.setTimeout(()=>this.toast.classList.remove('visible'),4500);}
  private resize(): void {this.world.camera.aspect=innerWidth/innerHeight;this.world.camera.updateProjectionMatrix();this.graphics.resize();}
}
