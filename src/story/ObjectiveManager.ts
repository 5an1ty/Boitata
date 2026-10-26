import {OBJECTIVES,type ObjectiveId} from '../data/chapter1';
/** Conditions are domain facts, never arbitrary distance-based completion. */
export class ObjectiveManager {
  readonly facts=new Set<ObjectiveId>();
  complete(id:ObjectiveId):void {this.facts.add(id);}
  get completed():ObjectiveId[]{return OBJECTIVES.filter(([id])=>this.facts.has(id)).map(([id])=>id);}
  get current():string{return OBJECTIVES.find(([id])=>!this.facts.has(id))?.[1]??'Investigue a origem da interferência.';}
  get finished():boolean{return OBJECTIVES.every(([id])=>this.facts.has(id));}
}
