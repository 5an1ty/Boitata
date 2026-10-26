export type Action = 'interact' | 'flashlight' | 'pause' | 'inventory';
export class InputManager {
  readonly keys = new Set<string>();
  moveX = 0; moveY = 0; lookX = 0; lookY = 0; running = false;
  enabled = false;
  onAction: (action: Action) => void = () => {};
  constructor(readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', e => {
      if (['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','KeyE','KeyF','KeyI','Escape'].includes(e.code)) {
        e.preventDefault();
        if (!e.repeat) {
          if (e.code === 'Escape') this.onAction('pause');
          if (this.enabled && e.code === 'KeyE') this.onAction('interact');
          if (this.enabled && e.code === 'KeyI') this.onAction('inventory');
          if (this.enabled && e.code === 'KeyF') this.onAction('flashlight');
        }
        this.keys.add(e.code);
      }
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.reset());
    document.addEventListener('mousemove', e => {
      if (this.enabled && document.pointerLockElement === canvas) { this.lookX += e.movementX; this.lookY += e.movementY; }
    });
  }
  reset(): void { this.keys.clear(); this.moveX = this.moveY = this.lookX = this.lookY = 0; this.running = false; }
}
