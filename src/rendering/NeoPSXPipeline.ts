import {ACESFilmicToneMapping,Vector2, type Camera, type Scene, type WebGLRenderer} from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {settings} from '../systems/SettingsStore';
import {NeoPSXShader} from './NeoPSXShader';
/** HDR scene -> bounded bloom -> sRGB output -> FXAA -> display-referred film finish. */
export class NeoPSXPipeline {
 private readonly composer:EffectComposer;
 private readonly bloom=new UnrealBloomPass(new Vector2(1,1),.12,.3,1.1);
 private readonly output=new OutputPass();
 private readonly aa=new ShaderPass({...FXAAShader,uniforms:{...FXAAShader.uniforms,amount:{value:.65}},fragmentShader:FXAAShader.fragmentShader.replace('void main() {','uniform float amount;\nvoid main() {').replace('gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );','gl_FragColor = mix(texture2D(tDiffuse,vUv), ApplyFXAA(tDiffuse,resolution.xy,vUv),amount);')});
 private readonly finish=new ShaderPass(NeoPSXShader);
 private readonly size=new Vector2();private width=0;private height=0;private time=0;
 constructor(private readonly renderer:WebGLRenderer,private readonly scene:Scene,private readonly camera:Camera){
  renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.info.autoReset=false;this.composer=new EffectComposer(renderer);this.composer.addPass(new RenderPass(scene,camera));this.composer.addPass(this.bloom);this.composer.addPass(this.output);this.composer.addPass(this.aa);this.composer.addPass(this.finish);
 }
 render(dt:number):void {
  const s=settings.value;this.renderer.info.reset();
  if(!s.psx){this.renderer.render(this.scene,this.camera);return;}
  this.renderer.getDrawingBufferSize(this.size);
  if(this.size.x!==this.width||this.size.y!==this.height){this.width=this.size.x;this.height=this.size.y;this.composer.setSize(this.width,this.height);this.aa.uniforms.resolution.value.set(1/this.width,1/this.height);this.finish.uniforms.resolution.value.copy(this.size);}
  this.time+=Math.min(dt,.05);this.bloom.enabled=s.bloom>0;this.bloom.strength=s.bloom*(s.reduceFlashes?.4:1);
  this.aa.enabled=s.antialias>0;this.aa.uniforms.amount.value=s.antialias;
  const u=this.finish.uniforms;for(const key of ['grain','dither','grading','chromatic','vignette','distortion']as const)u[key].value=s[key];
  u.time.value=s.reduceFlashes?0:Math.floor(this.time*24);u.grain.value*=s.reduceFlashes?.35:1;
  this.composer.render(dt);
 }
 dispose():void {this.composer.passes.forEach(pass=>pass.dispose());this.composer.dispose();}
}
