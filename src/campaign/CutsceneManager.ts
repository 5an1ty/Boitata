import {PerspectiveCamera,Vector3} from 'three';
export interface CameraBeat {from:Vector3;to:Vector3;look:Vector3;duration:number;update?:(t:number)=>void;}
export class CutsceneManager {
 private beat:CameraBeat|null=null;private time=0;private done:()=>void=()=>{};
 readonly caption=document.createElement('div');readonly veil=document.createElement('div');
 constructor(root:HTMLElement){this.caption.className='cinematic-caption';this.caption.hidden=true;const skip=document.createElement('button');skip.textContent='Pular cena · E';skip.onclick=()=>this.skip();this.caption.append(skip);this.veil.className='cinematic-veil';this.veil.hidden=true;root.append(this.caption,this.veil);}
 get active():boolean{return this.beat!==null;}
 play(beat:CameraBeat,done:()=>void):void {this.beat=beat;this.time=0;this.done=done;this.caption.hidden=false;this.veil.hidden=false;}
 update(dt:number,camera:PerspectiveCamera):void {if(!this.beat)return;this.time+=dt;const t=Math.min(1,this.time/this.beat.duration),ease=t*t*(3-2*t);this.veil.style.opacity=String(Math.max(0,1-Math.sin(t*Math.PI)*5));camera.position.lerpVectors(this.beat.from,this.beat.to,ease);camera.lookAt(this.beat.look);this.beat.update?.(t);if(t===1)this.finish();}
 skip():void {if(!this.beat)return;this.beat.update?.(1);this.finish();}
 private finish():void {this.beat=null;this.caption.hidden=true;this.veil.hidden=true;const done=this.done;this.done=()=>{};done();}
 pause(paused:boolean):void {this.caption.style.visibility=paused?'hidden':'';this.veil.style.visibility=paused?'hidden':'';}
}
