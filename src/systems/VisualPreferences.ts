import {settings} from './SettingsStore';
export class VisualPreferences {
 private readonly unsubscribe:()=>void;
 private readonly dither=document.createElement('div');
 constructor(private readonly root:HTMLElement){
  this.dither.className='psx-dither';this.dither.setAttribute('aria-hidden','true');root.append(this.dither);
  const apply=()=>{const s=settings.value;root.classList.toggle('psx-off',!s.psx);root.classList.toggle('reduce-flashes',s.reduceFlashes);root.style.setProperty('--dither',String(s.psx?s.dither:0));root.style.setProperty('--flicker',String(s.reduceFlashes?0:s.flicker));root.style.setProperty('--controls-size',String(s.controlsSize));};apply();this.unsubscribe=settings.subscribe(apply);
 }
 dispose():void {this.unsubscribe();this.dither.remove();}
}
