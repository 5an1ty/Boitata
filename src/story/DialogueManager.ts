import {settings} from '../systems/SettingsStore';
import type {DialogueLine} from '../data/chapter1';
export class DialogueManager {
 private lines:DialogueLine[]=[];private index=0;private elapsed=0;private done:()=>void=()=>{};private voice?:HTMLAudioElement;
 get typewriter():boolean{return settings.value.typewriter;}
 set typewriter(value:boolean){settings.set('typewriter',value);}
 private readonly unsubscribe=settings.subscribe(()=>{if(this.voice)this.voice.volume=settings.value.master*settings.value.effects;});
 onLine:(line:DialogueLine)=>void=()=>{};
 get active():boolean{return this.lines.length>0;}
 get line():DialogueLine|undefined{return this.lines[this.index];}
 get visibleText():string {const line=this.line;return line?(this.typewriter?line.text.slice(0,Math.floor(this.elapsed*42)):line.text):'';}
 play(lines:DialogueLine[],done:()=>void=()=>{}):void {if(this.active)return;this.lines=lines;this.index=0;this.elapsed=0;this.done=done;this.playVoice();}
 private playVoice():void {this.voice?.pause();const line=this.line;if(line)this.onLine(line);if(line?.audio){this.voice=new Audio(line.audio);this.voice.volume=settings.value.master*settings.value.effects;void this.voice.play().catch(()=>console.warn('Diálogo sem áudio disponível; legendas preservadas.'));}}
 update(dt:number):void {if(!this.active)return;this.elapsed+=dt;if(this.elapsed>=(this.line?.duration??0))this.next();}
 advance():void {if(!this.active||this.line?.allowAdvance===false)return;if(this.typewriter&&this.visibleText!==this.line?.text){this.elapsed=Math.max(this.elapsed,(this.line?.text.length??0)/42);return;}this.next();}
 private next():void {this.voice?.pause();this.index++;this.elapsed=0;if(this.index>=this.lines.length){this.lines=[];const callback=this.done;this.done=()=>{};callback();}else this.playVoice();}
 dispose():void {this.unsubscribe();this.voice?.pause();this.voice?.removeAttribute('src');this.voice?.load();this.lines=[];}
 pause():void {this.voice?.pause();}
 resume():void {if(this.active&&this.voice)void this.voice.play().catch(()=>{});}
}
