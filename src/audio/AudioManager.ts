import {settings} from '../systems/SettingsStore';
export type AmbientSound='rain'|'insects'|'wind'|'electricity'|'radio'|'footsteps';
export interface AudioAsset {url:string;loop:boolean;volume:number;position?:{x:number;z:number};range?:number;}
/** No sounds are synthesized or claimed: populate the manifest with licensed assets. */
export const AUDIO_ASSETS:Partial<Record<AmbientSound,AudioAsset>>={};
export class AudioManager {
  private readonly sounds=new Map<AmbientSound,HTMLAudioElement>();
  private active=false;
  constructor(private readonly assets= AUDIO_ASSETS){for(const [key,asset]of Object.entries(assets)){const audio=new Audio(asset.url);audio.loop=asset.loop;audio.volume=asset.volume;audio.preload='none';audio.addEventListener('error',()=>console.warn(`Áudio indisponível: ${key}`));this.sounds.set(key as AmbientSound,audio);}}
  resume():void {this.active=true;for(const [key,audio]of this.sounds)if(key!=='footsteps')void audio.play().catch(()=>console.warn(`Áudio bloqueado: ${key}`));}
  pause():void {this.active=false;this.sounds.forEach(s=>s.pause());}
  update(x:number,z:number,moving:boolean):void {if(!this.active)return;for(const [key,audio]of this.sounds){const asset=this.assets[key]!;audio.volume=settings.value.master*settings.value.effects*asset.volume*(asset.position?Math.max(0,1-Math.hypot(x-asset.position.x,z-asset.position.z)/(asset.range??12)):1);if(key==='footsteps'){if(moving&&audio.paused)void audio.play().catch(()=>{});else if(!moving)audio.pause();}}}
  dispose():void {this.pause();this.sounds.forEach(s=>{s.removeAttribute('src');s.load();});this.sounds.clear();}
}
