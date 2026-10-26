import type { InputManager } from './InputManager';
export class VirtualJoystick {
  private pointer: number | null = null;
  constructor(element: HTMLElement, input: InputManager) {
    const thumb = element.querySelector<HTMLElement>('span')!;
    const reset = (e: PointerEvent) => {
      if (e.pointerId !== this.pointer) return;
      this.pointer = null; input.moveX = input.moveY = 0; thumb.style.transform = '';
    };
    element.addEventListener('pointerdown', e => {
      if (this.pointer !== null) return;
      e.preventDefault(); this.pointer = e.pointerId; element.setPointerCapture(e.pointerId); update(e);
    });
    const update = (e: PointerEvent) => {
      if (e.pointerId !== this.pointer) return;
      const rect = element.getBoundingClientRect(), radius = rect.width * 0.34;
      let x = (e.clientX - rect.left - rect.width / 2) / radius;
      let y = (e.clientY - rect.top - rect.height / 2) / radius;
      const length = Math.max(1, Math.hypot(x, y)); x /= length; y /= length;
      input.moveX = Math.abs(x) < 0.08 ? 0 : x; input.moveY = Math.abs(y) < 0.08 ? 0 : -y;
      thumb.style.transform = `translate(${x * radius}px, ${y * radius}px)`;
    };
    element.addEventListener('pointermove', update);
    for (const event of ['pointerup','pointercancel','lostpointercapture']) element.addEventListener(event, e => reset(e as PointerEvent));
  }
}
