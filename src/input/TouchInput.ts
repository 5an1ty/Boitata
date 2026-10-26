import type { InputManager } from './InputManager';
export class TouchInput {
  constructor(element: HTMLElement, input: InputManager) {
    let pointer: number | null = null, x = 0, y = 0;
    element.addEventListener('pointerdown', e => {
      if (pointer !== null || !input.enabled) return;
      e.preventDefault(); pointer = e.pointerId; x = e.clientX; y = e.clientY; element.setPointerCapture(pointer);
    });
    element.addEventListener('pointermove', e => {
      if (e.pointerId !== pointer || !input.enabled) return;
      input.lookX += (e.clientX - x) * 1.5; input.lookY += (e.clientY - y) * 1.5; x = e.clientX; y = e.clientY;
    });
    for (const event of ['pointerup','pointercancel','lostpointercapture']) element.addEventListener(event, e => { if ((e as PointerEvent).pointerId === pointer) pointer = null; });
  }
}
