import {volumeBus} from './VolumeBus';
import type {Vector3} from 'three';
/** Procedural spatial soundscape; no missing samples or implied voice recordings. */
export class CreatureAudio {
 private effectsBus?:ReturnType<typeof volumeBus>;private musicBus?:ReturnType<typeof volumeBus>;
 private context?:AudioContext;private panner?:PannerNode;private gain?:GainNode;private music?:GainNode;private distortion?:WaveShaperNode;private active=false;
 unlock():void {
  try{
   if(!this.context){const ctx=this.context=new AudioContext(),panner=this.panner=ctx.createPanner(),gain=this.gain=ctx.createGain();panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=3;panner.maxDistance=45;panner.rolloffFactor=1.8;
    const shaper=this.distortion=ctx.createWaveShaper();gain.gain.value=0;panner.connect(gain);this.effectsBus=volumeBus(ctx,'effects',shaper);gain.connect(this.effectsBus.node);shaper.connect(ctx.destination);
    const hum=ctx.createOscillator();hum.type='sine';hum.frequency.value=43;hum.connect(panner);hum.start();
    const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.14;
    const rustle=ctx.createBufferSource();rustle.buffer=buffer;rustle.loop=true;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=430;filter.Q.value=.6;rustle.connect(filter);filter.connect(panner);rustle.start();
    const music=this.music=ctx.createGain();music.gain.value=0;this.musicBus=volumeBus(ctx,'music',shaper);music.connect(this.musicBus.node);
    for(const frequency of [55,65.4,82.4]){const osc=ctx.createOscillator();osc.type='triangle';osc.frequency.value=frequency;osc.connect(music);osc.start();}
   }
   this.active=true;void this.context.resume().catch(()=>{});
  }catch{/* Visual danger signals still teach the mechanic without audio. */}
 }
 update(source:Vector3,listener:Vector3,look:Vector3,risk:number,chase:boolean,time:number):void {
  const ctx=this.context,p=this.panner;if(!ctx||!p)return;
  if(!this.active){this.active=true;void ctx.resume().catch(()=>{});}
  p.positionX.value=source.x;p.positionY.value=source.y;p.positionZ.value=source.z;
  const l=ctx.listener;l.positionX.value=listener.x;l.positionY.value=listener.y;l.positionZ.value=listener.z;l.forwardX.value=look.x;l.forwardY.value=look.y;l.forwardZ.value=look.z;l.upX.value=0;l.upY.value=1;l.upZ.value=0;
  this.gain!.gain.setTargetAtTime(.015+risk*.04+(Math.sin(time*17)>.96?.012:0),ctx.currentTime,.15);
  this.music!.gain.setTargetAtTime(chase?.012*(.6+.4*Math.sin(time*8)**2):0,ctx.currentTime,.2);
 }
 capture():void {if(!this.context||!this.distortion)return;const curve=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;curve[i]=Math.tanh(x*8)*.7;}this.distortion.curve=curve;}
 reset():void {if(this.distortion)this.distortion.curve=null;}
 pause():void {if(!this.active)return;this.active=false;void this.context?.suspend().catch(()=>{});}
 dispose():void {this.effectsBus?.dispose();this.musicBus?.dispose();void this.context?.close().catch(()=>{});this.context=undefined;}
}
