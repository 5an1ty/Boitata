import {settings} from '../systems/SettingsStore';
export type Action = 'interact' | 'flashlight' | 'pause' | 'inventory';
export class InputManager {
  private readonly abort=new AbortController();
  readonly keys = new Set<string>();
  moveX = 0; moveY = 0; lookX = 0; lookY = 0; running = false;
  enabled = false;
  private jumpRequested = false;
  onAction: (action: Action) => void = () => {};
  constructor(readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', e => {
      if (['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','KeyE','KeyF','KeyI','Escape','Space'].includes(e.code)) {
        if(e.code === 'Space' && !this.enabled)return;
        e.preventDefault();
        if (!e.repeat) {
          if(this.enabled && e.code === 'Space')this.jumpRequested=true;
          if (e.code === 'Escape') this.onAction('pause');
          if (this.enabled && e.code === 'KeyE') this.onAction('interact');
          if (this.enabled && e.code === 'KeyI') this.onAction('inventory');
          if (this.enabled && e.code === 'KeyF') this.onAction('flashlight');
        }
        this.keys.add(e.code);
      }
    },{signal:this.abort.signal});
    window.addEventListener('keyup', e => this.keys.delete(e.code),{signal:this.abort.signal});
    window.addEventListener('blur', () => this.reset(),{signal:this.abort.signal});
    document.addEventListener('mousemove', e => {
      if (this.enabled && document.pointerLockElement === canvas) { this.lookX += e.movementX*settings.value.mouseSensitivity; this.lookY += e.movementY*settings.value.mouseSensitivity; }
    },{signal:this.abort.signal});
  }
  dispose():void {this.abort.abort();this.reset();}
  consumeJump():boolean {const requested=this.jumpRequested;this.jumpRequested=false;return requested;}
  reset(): void { this.jumpRequested=false; this.keys.clear(); this.moveX = this.moveY = this.lookX = this.lookY = 0; this.running = false; }
}
