import {EVENT_IDS,ITEMS,OBJECTIVES,type ItemId,type HorrorEventId,type ObjectiveId} from '../data/chapter1';
import type {ItemState} from './Inventory';
export interface ChapterSave {
 version:1;chapter:1|2;objectives:ObjectiveId[];items:Partial<Record<ItemId,ItemState>>;
 unlocked:string[];puzzles:string[];events:HorrorEventId[];flags:string[];
 settings:{quality:'Baixo'|'Médio'|'Alto';distance:number;adaptive:boolean;typewriter:boolean};
}
const FLAGS=['intro','drawer','fuseInstalled','ending'];
const strings=(v:unknown,allowed:readonly string[]):v is string[]=>Array.isArray(v)&&v.length<=allowed.length&&new Set(v).size===v.length&&v.every(x=>typeof x==='string'&&allowed.includes(x));
export function validateSave(value:unknown):value is ChapterSave {
 if(!value||typeof value!=='object')return false;
 const v=value as Record<string,unknown>,s=v.settings as Record<string,unknown>|undefined;
 if(v.version!==1||(v.chapter!==1&&v.chapter!==2)||!strings(v.objectives,OBJECTIVES.map(([id])=>id))||!strings(v.events,EVENT_IDS)||!strings(v.unlocked,['DEPÓSITO'])||!strings(v.puzzles,['generator'])||!strings(v.flags,FLAGS))return false;
 if(!v.items||typeof v.items!=='object'||Array.isArray(v.items))return false;
 const items=v.items as Record<string,unknown>;if(Object.entries(items).some(([id,state])=>!Object.hasOwn(ITEMS,id)||(state!=='available'&&state!=='used'))||!items.flashlight||!items.radio)return false;
 if(!s||!['Baixo','Médio','Alto'].includes(String(s.quality))||!([28,48,72] as unknown[]).includes(s.distance)||typeof s.adaptive!=='boolean'||typeof s.typewriter!=='boolean')return false;
 const facts=v.objectives as string[],puzzles=v.puzzles as string[],flags=v.flags as string[],events=v.events as string[];
 if(facts.includes('key')&&!items.key||facts.includes('fuse')&&!items.fuse||facts.includes('note')&&!items.note)return false;
 if(facts.includes('store')&&!(v.unlocked as string[]).includes('DEPÓSITO'))return false;
 if(facts.includes('puzzle')&&!puzzles.includes('generator')||puzzles.includes('generator')&&(!flags.includes('fuseInstalled')||!facts.includes('puzzle')))return false;
 if(facts.includes('power')&&!puzzles.includes('generator')||facts.includes('camera')&&!facts.includes('power')||events.includes('blackout')&&!facts.includes('camera'))return false;
 if(flags.includes('fuseInstalled')&&items.fuse!=='used')return false;
 if((v.unlocked as string[]).includes('DEPÓSITO')&&items.key!=='used')return false;
 if(items.key&&!flags.includes('drawer'))return false;
 if(flags.includes('ending')&&!facts.includes('camera'))return false;
 if(v.chapter===2&&(!flags.includes('ending')||!facts.includes('camera')||!events.includes('blackout')))return false;
 return true;
}
export class SaveManager {
 static readonly key='boitata-save-v1';
 warning='';
 private quarantine(raw:string):void {try{if(localStorage.getItem(SaveManager.key+'.invalid')===null)localStorage.setItem(SaveManager.key+'.invalid',raw);}catch{/* The original entry is left intact until the player saves again. */}}
 load():ChapterSave|null {
  try{const raw=localStorage.getItem(SaveManager.key);if(!raw)return null;let value:unknown;try{value=JSON.parse(raw);}catch{this.quarantine(raw);this.warning='Save corrompido ignorado. Uma nova partida será iniciada.';return null;}if(!validateSave(value)){this.quarantine(raw);this.warning='Save incompatível ou inválido. Uma partida nova será iniciada.';return null;}return value;}
  catch {this.warning='Não foi possível ler o save. O jogo continua sem carregar o progresso.';return null;}
 }
 save(value:ChapterSave):boolean {try{localStorage.setItem(SaveManager.key,JSON.stringify(value));return true;}catch{this.warning='Não foi possível salvar: armazenamento indisponível ou cheio.';return false;}}
 clear():boolean {try{localStorage.removeItem(SaveManager.key);return true;}catch{return false;}}
}
