import {Vector3} from 'three';
export type Apparition='embers'|'road'|'clearing';
export const CHECKPOINTS={station:new Vector3(5,1.65,15),trail:new Vector3(0,1.65,34)};
export class CheckpointManager {
 static readonly key='boitata-creature-v1';
 readonly seen=new Set<Apparition>();checkpoint:keyof typeof CHECKPOINTS='station';warning='';
 constructor(){try{const raw=localStorage.getItem(CheckpointManager.key);if(!raw)return;const v:unknown=JSON.parse(raw);if(!v||typeof v!=='object')return;const data=v as Record<string,unknown>;if(data.version!==1||(data.checkpoint!=='station'&&data.checkpoint!=='trail')||!Array.isArray(data.seen)||data.seen.length>3||new Set(data.seen).size!==data.seen.length||!data.seen.every(x=>['embers','road','clearing'].includes(x)))return;this.checkpoint=data.checkpoint;data.seen.forEach(x=>this.seen.add(x));}catch{this.warning='Não foi possível carregar o checkpoint da floresta.';}}
 mark(id:Apparition):void {this.seen.add(id);this.save();}
 setTrail():void {this.checkpoint='trail';this.save();}
 get position():Vector3{return CHECKPOINTS[this.checkpoint].clone();}
 save():void {try{localStorage.setItem(CheckpointManager.key,JSON.stringify({version:1,checkpoint:this.checkpoint,seen:[...this.seen]}));}catch{this.warning='Checkpoint disponível nesta sessão; armazenamento indisponível.';}}
 clear():boolean {try{localStorage.removeItem(CheckpointManager.key);return true;}catch{return false;}}
}
