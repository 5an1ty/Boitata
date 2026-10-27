import {settings} from '../systems/SettingsStore';
import {VisualPreferences} from '../systems/VisualPreferences';
import {PerformanceMonitor} from '../systems/PerformanceMonitor';
import { BufferGeometry, Material, Texture, Vector3, WebGLRenderer } from 'three';
import { GameLoop } from './GameLoop';
import { SceneManager } from './SceneManager';
import { InputManager } from '../input/InputManager';
import { CameraController } from '../player/CameraController';
import { PlayerController } from '../player/PlayerController';
import { GraphicsSettings } from '../systems/GraphicsSettings';
import { MainMenu } from '../ui/MainMenu';
import { MobileControls } from '../ui/MobileControls';
import { CampaignManager } from '../campaign/CampaignManager';
import { CreatureEncounter } from '../creature/CreatureEncounter';
import { ChapterOne } from '../story/ChapterOne';
import { AudioManager } from '../audio/AudioManager';
export class Game {
  private readonly abort=new AbortController();private disposed=false;
  onReset:()=>void=()=>location.reload();
  private readonly visuals:VisualPreferences;private readonly performance:PerformanceMonitor;
  private readonly audio=new AudioManager();
  private readonly lastPosition=new Vector3();
  private readonly renderer = new WebGLRenderer({antialias:false,powerPreference:'high-performance'});
  private readonly world = new SceneManager();
  private readonly input: InputManager;
  private readonly player: PlayerController;
  private readonly graphics: GraphicsSettings;
  private readonly menu: MainMenu;
  private readonly chapter:ChapterOne;
  private readonly creature:CreatureEncounter;
  private readonly campaign:CampaignManager;
  private shakeX=0;private shakeZ=0;private effectTime=0;
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
    this.renderer.domElement.className='game-canvas';root.append(this.renderer.domElement);this.visuals=new VisualPreferences(root);this.performance=new PerformanceMonitor(root);root.classList.add('overlay-open');
    this.graphics=new GraphicsSettings(this.renderer);this.graphics.resize();
    this.input=new InputManager(this.renderer.domElement);
    this.player=new PlayerController(new CameraController(this.world.camera),this.world.collisions);
    this.hud.className='hud';this.hud.innerHTML='<div class="hud-top"><span>BR-319 <small>AMAZONAS · 2004</small></span><span class="live">● RAIMUNDO PINHEIRO</span></div><span class="crosshair">+</span><div class="hud-bottom"><span>06 <small>EXPLORAÇÃO</small></span><span class="lamp-status"></span></div>';
    root.append(this.hud);this.toast.className='toast';this.toast.setAttribute('role','status');root.append(this.toast);this.prompt.className='interaction-prompt';root.append(this.prompt);
    this.mobile=new MobileControls(root,this.input);
    this.chapter=new ChapterOne(this.world.environment,root,this.graphics,text=>this.message(text));
    this.creature=new CreatureEncounter(this.world.environment,root,text=>this.message(text));
    this.creature.onCheckpoint=()=>this.chapter.persist();
    this.creature.onRespawn=position=>{this.player.resetAt(this.campaign?.onCapture(position)??position);this.input.reset();this.world.flashlight.visible=false;this.updateLamp();};
    if(this.chapter.flags.has('ending')&&this.creature.restoredCheckpoint)this.player.resetAt(this.creature.restoredCheckpoint);
    this.campaign=new CampaignManager(this.chapter,this.world.environment,this.creature,this.world.scene,this.world.camera,root,text=>this.message(text));
    this.campaign.onMenu=()=>this.pause();this.campaign.onRespawn=p=>{this.player.resetAt(p);this.input.reset();};
    if(this.campaign.restoredPosition)this.player.resetAt(this.campaign.restoredPosition);
    else if(!this.chapter.flags.has('ending')&&this.chapter.puzzles.has('generator'))this.player.resetAt(new Vector3(25,1.65,-14.5));
    this.chapter.onFlashlight=()=>{this.world.flashlight.visible=!this.world.flashlight.visible;this.updateLamp();};
    this.chapter.onClose=()=>{this.input.reset();if(!this.paused&&!this.isTouch()&&!this.chapter.dialogue.active)this.lockPointer();};
    this.menu=new MainMenu(root,this.graphics,()=>this.resume());
    this.menu.hasSave=this.chapter.saves.load()!==null;this.menu.typewriter=this.chapter.typewriter;
    this.menu.onTypewriter=enabled=>{this.chapter.dialogue.typewriter=enabled;};
    this.menu.onNewGame=()=>{if(this.chapter.saves.clear()&&this.creature.checkpoint.clear()&&this.campaign.saves.clear())this.onReset();else this.message('Não foi possível remover o save.');};this.menu.refresh();
    const rotate=document.createElement('div');rotate.className='rotate-screen';rotate.innerHTML='<span>↻</span><h2>Gire o aparelho</h2><p>A floresta espera.<br>Jogue com o celular na horizontal.</p>';root.append(rotate);
    this.input.onAction=action=>{
      if(action==='pause'){if(this.chapter.ui.modal!==null&&!this.paused){this.chapter.ui.close();return;}if(this.started){if(this.paused)this.resume();else this.pause();}return;}
      if(this.paused)return;
      if(action==='inventory'){this.chapter.openInventory();return;}
      if(action==='flashlight'&&!this.chapter.blocking)this.chapter.onFlashlight();
      if(action==='interact'){if(this.campaign.cutscene.active)this.campaign.cutscene.skip();else this.chapter.interact();}
    };
    document.addEventListener('pointerlockchange',()=>{if(this.started&&!this.paused&&!this.chapter.blocking&&!document.pointerLockElement&&!this.isTouch())this.pause();},{signal:this.abort.signal});
    this.renderer.domElement.addEventListener('click',()=>{if(!this.paused&&!this.isTouch())this.lockPointer();},{signal:this.abort.signal});
    window.addEventListener('blur',()=>this.pause(),{signal:this.abort.signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();},{signal:this.abort.signal});
    window.addEventListener('resize',()=>{this.resize();if(this.isTouch()&&innerHeight>innerWidth)this.pause();},{signal:this.abort.signal});
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.pause();this.loop.stop();this.message('A conexão gráfica foi interrompida. Recarregue a página.');},{signal:this.abort.signal});
    this.loop=new GameLoop((dt,rawDt)=>{
      if(!this.paused){
        this.world.camera.rotation.x-=this.shakeX;this.world.camera.rotation.z-=this.shakeZ;this.shakeX=this.shakeZ=0;
        this.chapter.externalBlock=this.creature.blocking||this.campaign.blocking;
        this.world.environment.update(dt,this.player.position,this.graphics.renderDistance);
        this.lastPosition.copy(this.player.position);
        if(!this.chapter.blocking)this.player.update(this.input,dt);else this.input.reset();
        this.world.camera.getWorldDirection(this.direction);this.chapter.update(dt,this.player.position,this.direction);
        if(this.chapter.ui.modal!==null&&document.pointerLockElement)document.exitPointerLock();
        if(!this.chapter.dialogue.active&&this.chapter.ui.modal===null){
          const moving=this.lastPosition.distanceToSquared(this.player.position)>.000001;
          this.creature.update(dt,{position:this.player.position,look:this.direction,flashlight:this.world.flashlight.visible,moving,running:moving&&(this.input.running||this.input.keys.has('ShiftLeft')||this.input.keys.has('ShiftRight')),narrativeReady:this.chapter.flags.has('ending'),protected:this.player.position.z<17});
        }
        this.campaign.update(dt,this.player.position,this.direction,this.world.flashlight.visible);
        this.chapter.externalBlock=this.creature.blocking||this.campaign.blocking;
        this.effectTime+=dt;this.shakeX=Math.sin(this.effectTime*28)*this.creature.shake*settings.value.shake;this.shakeZ=Math.sin(this.effectTime*33)*this.creature.shake*.6*settings.value.shake;
        this.world.camera.rotation.x+=this.shakeX;this.world.camera.rotation.z+=this.shakeZ;
        this.mobile.show(!this.chapter.blocking);
        this.audio.update(this.player.position.x,this.player.position.z,this.lastPosition.distanceToSquared(this.player.position)>.000001);
        this.graphics.sample(rawDt);this.world.camera.getWorldDirection(this.direction);
        this.prompt.textContent=this.chapter.prompt;
      }
      root.classList.toggle('overlay-open',this.paused||this.chapter.ui.modal!==null);
      if(this.world.camera.far!==this.graphics.renderDistance){this.world.camera.far=this.graphics.renderDistance;this.world.camera.updateProjectionMatrix();}
      if(!this.paused)this.campaign.cutscene.update(Math.min(rawDt,.05),this.world.camera);
      this.renderer.render(this.world.scene,this.world.camera);this.performance.sample(rawDt,this.renderer);
    });
    this.updateLamp();this.loop.start();
    window.addEventListener('pagehide',event=>{if(event.persisted)this.pause();else this.dispose();},{signal:this.abort.signal});
    window.addEventListener('pageshow',()=>{if(!this.paused)this.audio.resume();},{signal:this.abort.signal});
  }
  start():void {this.resume();}
  dispose():void {
    if(this.disposed)return;if(this.started)this.pause();this.disposed=true;this.abort.abort();this.loop.stop();clearTimeout(this.messageTimer);this.input.dispose();this.graphics.dispose();this.visuals.dispose();this.performance.dispose();
    const geometries=new Set<BufferGeometry>(),materials=new Set<Material>(),textures=new Set<Texture>();
    this.world.scene.traverse(object=>{if('geometry'in object&&object.geometry instanceof BufferGeometry)geometries.add(object.geometry);if('material'in object){const list=Array.isArray(object.material)?object.material:[object.material];for(const material of list)if(material instanceof Material){materials.add(material);for(const value of Object.values(material))if(value instanceof Texture)textures.add(value);}}});
    this.creature.dispose();this.chapter.dispose();this.audio.dispose();this.world.environment.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());this.world.flashlight.dispose();this.renderer.dispose();this.renderer.forceContextLoss();this.world.scene.clear();
  }
  private isTouch(): boolean {return matchMedia('(pointer: coarse)').matches;}
  private lockPointer(): void {
    try {const result=this.renderer.domElement.requestPointerLock();if(result)void result.catch(()=>this.message('Clique no cenário para ativar a câmera com o mouse.'));}
    catch {this.message('O navegador não permitiu capturar o mouse. Clique no cenário para tentar novamente.');}
  }
  private resume(): void {
    if(this.isTouch()&&innerHeight>innerWidth)return;
    this.audio.resume();this.creature.unlockAudio();this.campaign.resume();this.chapter.start();this.started=true;this.paused=false;this.input.reset();this.input.enabled=true;this.menu.hide();this.mobile.show(true);this.hud.hidden=false;this.root.classList.add('playing');
    if(!this.isTouch())this.lockPointer();
  }
  private pause(): void {
    if(!this.started||this.paused)return;
    this.campaign.pause();this.creature.pause();this.chapter.pause();this.audio.pause();this.paused=true;this.input.enabled=false;this.input.reset();this.mobile.show(false);this.hud.hidden=true;this.prompt.textContent='';this.menu.hasSave=this.chapter.saves.load()!==null;this.menu.show(true);this.root.classList.remove('playing');
    if(document.pointerLockElement)document.exitPointerLock();
  }
  private updateLamp(): void {this.hud.querySelector('.lamp-status')!.textContent=`F · LANTERNA ${this.world.flashlight.visible?'LIGADA':'DESLIGADA'}`;}
  private message(text: string): void {clearTimeout(this.messageTimer);this.toast.textContent=text;this.toast.classList.add('visible');this.messageTimer=window.setTimeout(()=>this.toast.classList.remove('visible'),4500);}
  private resize(): void {this.world.camera.aspect=innerWidth/innerHeight;this.world.camera.updateProjectionMatrix();this.graphics.resize();}
}
