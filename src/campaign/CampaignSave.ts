import {CHAPTERS,CAMPAIGN_CHECKPOINTS,type CampaignChapter,type CampaignCheckpoint,type Ending} from '../data/campaign';
export const CAMPAIGN_FLAGS=['intro2','intro3','intro4','truckMessage','manual','linked','transmitter','coupler','returnScene','payload','roadRelay','forestRelay','finalEncounter','finalEvaded'] as const;
export interface CampaignData {version:1;chapter:CampaignChapter;completed:string[];flags:string[];checkpoint:CampaignCheckpoint|null;ending:Ending|null;seconds:number;}
export function validCampaign(value:unknown):value is CampaignData {
 if(!value||typeof value!=='object')return false;const d=value as Record<string,unknown>;
 if(d.version!==1||![2,3,4].includes(Number(d.chapter))||typeof d.chapter!=='number'||!Array.isArray(d.completed)||!Array.isArray(d.flags)||d.completed.length>20||new Set(d.completed).size!==d.completed.length||new Set(d.flags).size!==d.flags.length||!d.flags.every(f=>(CAMPAIGN_FLAGS as readonly unknown[]).includes(f)))return false;
 if(d.checkpoint!==null&&(typeof d.checkpoint!=='string'||!Object.hasOwn(CAMPAIGN_CHECKPOINTS,d.checkpoint)))return false;
 if(d.ending!==null&&!['dawn','road','witness'].includes(String(d.ending)))return false;
 if(typeof d.seconds!=='number'||!Number.isFinite(d.seconds)||d.seconds<0)return false;
 const all=([2,3,4] as const).flatMap(c=>CHAPTERS[c].objectives.map(([id])=>`${c}.${id}`));if(!d.completed.every(id=>all.includes(String(id))))return false;
 for(const c of [2,3,4] as const){let gap=false;for(const [id]of CHAPTERS[c].objectives){const has=d.completed.includes(`${c}.${id}`);if(has&&(c>Number(d.chapter)||gap))return false;if(!has)gap=true;}if(c<Number(d.chapter)&&gap)return false;}
 if(typeof d.checkpoint==='string'&&Object.hasOwn(CAMPAIGN_CHECKPOINTS,d.checkpoint)&&CAMPAIGN_CHECKPOINTS[d.checkpoint as CampaignCheckpoint].chapter>Number(d.chapter))return false;
 if(d.ending===null&&d.completed.includes('4.conclude'))return false;
 if(d.ending==='road'&&!d.completed.includes('4.return'))return false;
 if(d.ending!==null&&d.ending!=='road'&&!d.completed.includes('4.conclude'))return false;
 if(d.flags.includes('forestRelay')&&!d.flags.includes('roadRelay'))return false;
 if(d.completed.includes('3.puzzle')&&!d.flags.includes('transmitter')||d.completed.includes('4.evidence')&&!d.flags.includes('payload'))return false;
 return true;
}
export class CampaignSave {
 static readonly key='boitata-campaign-v1';warning='';
 load():CampaignData|null {try{const raw=localStorage.getItem(CampaignSave.key);if(!raw)return null;const value:unknown=JSON.parse(raw);if(validCampaign(value))return value;this.warning='Save da campanha inválido. A investigação do Capítulo 1 foi preservada.';return null;}catch{this.warning='Não foi possível carregar a campanha.';return null;}}
 save(data:CampaignData):boolean {try{localStorage.setItem(CampaignSave.key,JSON.stringify(data));return true;}catch{this.warning='Não foi possível salvar a campanha; o progresso continua nesta sessão.';return false;}}
 clear():boolean {try{localStorage.removeItem(CampaignSave.key);return true;}catch{return false;}}
}
