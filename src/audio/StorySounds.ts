/** Small procedural effects, not voice recordings or missing ambient assets. */
export class StorySounds {
 private context?:AudioContext;
 unlock():void {try{this.context??=new AudioContext();void this.context.resume().catch(()=>{});}catch{/* Subtitles and visual cues remain available. */}}
 tone(kind:'phone'|'electricity'|'static'|'pump'):void {
  const ctx=this.context;if(!ctx||ctx.state!=='running')return;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  oscillator.type=kind==='static'?'sawtooth':kind==='electricity'?'triangle':'square';
  oscillator.frequency.setValueAtTime({phone:620,electricity:60,static:130,pump:45}[kind],now);
  if(kind==='electricity')oscillator.frequency.exponentialRampToValueAtTime(120,now+.7);
  gain.gain.setValueAtTime(.035,now);gain.gain.exponentialRampToValueAtTime(.001,now+.8);
  oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(now+.85);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }
 pause():void {void this.context?.suspend().catch(()=>{});}
}
