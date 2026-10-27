export interface Preferences {
 quality:'Baixo'|'Médio'|'Alto';resolution:number;adaptive:boolean;distance:28|48|72;
 psx:boolean;dither:number;flicker:number;master:number;music:number;effects:number;
 mouseSensitivity:number;touchSensitivity:number;invertY:boolean;controlsSize:number;shake:number;reduceFlashes:boolean;typewriter:boolean;
}
const DEFAULTS:Preferences={quality:'Médio',resolution:.5,adaptive:true,distance:48,psx:true,dither:.35,flicker:.3,master:.8,music:.65,effects:.8,mouseSensitivity:1,touchSensitivity:1,invertY:false,controlsSize:1,shake:.6,reduceFlashes:false,typewriter:true};
const RANGES:Partial<Record<keyof Preferences,[number,number]>>={resolution:[.25,1],dither:[0,1],flicker:[0,1],master:[0,1],music:[0,1],effects:[0,1],mouseSensitivity:[.2,3],touchSensitivity:[.2,3],controlsSize:[.8,1.3],shake:[0,1]};
export class SettingsStore {
 static readonly key='boitata-settings-v1';
 readonly value:Preferences={...DEFAULTS};hasSaved=false;warning='';
 private readonly listeners=new Set<()=>void>();
 constructor(){
  if(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches)Object.assign(this.value,{reduceFlashes:true,shake:0,flicker:0});
  try{const raw=localStorage.getItem(SettingsStore.key);if(raw){const data:unknown=JSON.parse(raw);if(data&&typeof data==='object'&&'version'in data&&data.version===1&&'values'in data&&data.values&&typeof data.values==='object'){this.apply(data.values as Record<string,unknown>);this.hasSaved=true;}else this.warning='Preferências incompatíveis: usando valores seguros.';}}
  catch{this.warning='Preferências indisponíveis: alterações funcionarão nesta sessão.';}
 }
 private apply(data:Record<string,unknown>):void {
  for(const key of Object.keys(DEFAULTS) as (keyof Preferences)[]){const v=data[key];if(v===undefined)continue;
   if(key==='quality'){if(v==='Baixo'||v==='Médio'||v==='Alto')this.value.quality=v;}
   else if(key==='distance'){if(v===28||v===48||v===72)this.value.distance=v;}
   else if(typeof DEFAULTS[key]==='boolean'){if(typeof v==='boolean')Object.assign(this.value,{[key]:v});}
   else {const range=RANGES[key];if(range&&typeof v==='number'&&Number.isFinite(v))Object.assign(this.value,{[key]:Math.max(range[0],Math.min(range[1],v))});}
  }
 }
 set<K extends keyof Preferences>(key:K,value:Preferences[K]):void {this.apply({[key]:value});this.persist();this.listeners.forEach(l=>l());}
 quality(value:Preferences['quality']):void {this.value.quality=value;this.value.resolution={Baixo:.35,Médio:.5,Alto:.75}[value];this.persist();this.listeners.forEach(l=>l());}
 migrate(values:Partial<Preferences>):void {if(this.hasSaved)return;this.apply(values as Record<string,unknown>);this.listeners.forEach(l=>l());}
 private persist():void {try{localStorage.setItem(SettingsStore.key,JSON.stringify({version:1,values:this.value}));this.hasSaved=true;this.warning='';}catch{this.warning='Não foi possível persistir as preferências.';}}
 subscribe(listener:()=>void):()=>void {this.listeners.add(listener);return()=>this.listeners.delete(listener);}
}
export const settings=new SettingsStore();
