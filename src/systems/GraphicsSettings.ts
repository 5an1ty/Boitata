import type {WebGLRenderer} from 'three';
import {settings} from './SettingsStore';
export type Quality='Baixo'|'Médio'|'Alto';
export class GraphicsSettings {
 private scale=1;private elapsed=0;private frames=0;private readonly unsubscribe:()=>void;
 get quality():Quality{return settings.value.quality;}
 set quality(value:Quality){this.set(value);}
 get adaptive():boolean{return settings.value.adaptive;}
 set adaptive(value:boolean){settings.set('adaptive',value);}
 get renderDistance():number{return settings.value.distance;}
 constructor(private readonly renderer:WebGLRenderer){
  try{const saved=localStorage.getItem('boitata-quality');if(saved==='Baixo'||saved==='Médio'||saved==='Alto')settings.migrate({quality:saved,resolution:{Baixo:.35,Médio:.5,Alto:.75}[saved]});}catch{/* Session defaults remain usable. */}
  this.unsubscribe=settings.subscribe(()=>{this.scale=1;this.resize();});
 }
 set(quality:Quality):void {settings.quality(quality);try{localStorage.setItem('boitata-quality',quality);}catch{/* Optional legacy binding. */}}
 setDistance(distance:number):void {settings.set('distance',distance<38?28:distance<60?48:72);}
 resize():void {this.renderer.setPixelRatio(1);this.renderer.setSize(Math.max(1,Math.floor(innerWidth*settings.value.resolution*this.scale)),Math.max(1,Math.floor(innerHeight*settings.value.resolution*this.scale)),false);}
 sample(dt:number):void {
  if(!this.adaptive||dt<=0)return;this.elapsed+=dt;this.frames++;if(this.elapsed<3)return;
  const fps=this.frames/this.elapsed,before=this.scale;if(fps<35)this.scale=Math.max(.6,this.scale-.1);else if(fps>55)this.scale=Math.min(1,this.scale+.05);this.elapsed=this.frames=0;if(before!==this.scale)this.resize();
 }
 dispose():void {this.unsubscribe();}
}
