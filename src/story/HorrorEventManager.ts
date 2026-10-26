import type {HorrorEventId} from '../data/chapter1';
export class HorrorEventManager {
 readonly executed=new Set<HorrorEventId>();
 trigger(id:HorrorEventId,effect:()=>void):boolean {if(this.executed.has(id))return false;this.executed.add(id);effect();return true;}
}
