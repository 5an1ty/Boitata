import type {WebGLRenderer} from 'three';
export class PerformanceMonitor {
 private readonly element?:HTMLOutputElement;private elapsed=0;private frames=0;private maximum=0;
 constructor(root:HTMLElement){if(import.meta.env.DEV&&new URLSearchParams(location.search).has('fps')){this.element=document.createElement('output');this.element.className='fps-monitor';root.append(this.element);}}
 sample(dt:number,renderer:WebGLRenderer):void {if(!this.element||dt<=0)return;this.elapsed+=dt;this.frames++;this.maximum=Math.max(this.maximum,dt);if(this.elapsed<1)return;this.element.textContent=`${Math.round(this.frames/this.elapsed)} FPS · pico ${Math.round(this.maximum*1000)} ms · ${renderer.info.render.calls} chamadas · ${renderer.info.render.triangles} triângulos`;this.elapsed=this.frames=this.maximum=0;}
 dispose():void {this.element?.remove();}
}
