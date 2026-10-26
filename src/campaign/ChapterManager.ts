import {OBJECTIVES} from '../data/chapter1';
import {CHAPTERS,CHAPTER_METADATA,type CampaignChapter,type Ending} from '../data/campaign';
export type ChapterState='locked'|'active'|'completed';
/** A strict, ordered state reducer shared by runtime and campaign tests. */
export class ChapterManager {
 current:CampaignChapter=2;
 readonly completed=new Set<string>();
 ready=false;result:Ending|null=null;
 describe(chapter:1|CampaignChapter){return {...CHAPTER_METADATA[chapter],state:this.state(chapter),objectives:chapter===1?OBJECTIVES:CHAPTERS[chapter].objectives};}
 get key():string|undefined {return CHAPTERS[this.current].objectives.find(([id])=>!this.completed.has(`${this.current}.${id}`))?.[0];}
 get objective():string{return CHAPTERS[this.current].objectives.find(([id])=>!this.completed.has(`${this.current}.${id}`))?.[1]??'Campanha concluída';}
 state(chapter:1|CampaignChapter):ChapterState {if(chapter===4&&this.result)return 'completed';if(chapter===1)return this.ready?'completed':'active';if(!this.ready||chapter>this.current)return 'locked';return chapter<this.current?'completed':'active';}
 has(id:string):boolean{return this.completed.has(id);}
 complete(id:string,condition:boolean):boolean {if(!this.ready||!condition||this.key!==id)return false;this.completed.add(`${this.current}.${id}`);return true;}
 finish(ending:Ending):boolean {if(this.current!==4||!this.ready)return false;if(ending==='road'){if(!this.has('4.return'))return false;}else if(!this.complete('conclude',this.has('4.evade')))return false;this.result=ending;return true;}
 advance():boolean {if(this.key!==undefined||this.current===4)return false;this.current=(this.current+1) as CampaignChapter;return true;}
}
