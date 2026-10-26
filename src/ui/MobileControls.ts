import type { InputManager, Action } from '../input/InputManager';
import { VirtualJoystick } from '../input/VirtualJoystick';
import { TouchInput } from '../input/TouchInput';
export class MobileControls {
  readonly element = document.createElement('div');
  constructor(parent: HTMLElement,input: InputManager) {
    this.element.className='mobile-controls';
    this.element.innerHTML='<div class="look-zone" aria-label="Arraste para olhar"></div><div class="joystick" aria-label="Joystick de movimento"><span></span></div><div class="touch-actions"><button data-action="interact" aria-label="Interagir">E</button><button data-action="flashlight" aria-label="Lanterna">☼</button><button class="run" aria-label="Segure para correr">CORRER</button></div><button class="touch-pause" data-action="pause" aria-label="Pausar">Ⅱ</button>';
    parent.append(this.element);
    new VirtualJoystick(this.element.querySelector('.joystick')!,input);new TouchInput(this.element.querySelector('.look-zone')!,input);
    this.element.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>button.addEventListener('pointerdown',e=>{e.preventDefault();if(input.enabled)input.onAction(button.dataset.action as Action);}));
    const run=this.element.querySelector<HTMLButtonElement>('.run')!;
    let runner: number | null=null;
    run.addEventListener('pointerdown',e=>{if(runner!==null)return;runner=e.pointerId;run.setPointerCapture(e.pointerId);input.running=true;});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])run.addEventListener(event,e=>{if((e as PointerEvent).pointerId===runner){runner=null;input.running=false;}});
  }
  show(visible: boolean): void { this.element.classList.toggle('active',visible); }
}
