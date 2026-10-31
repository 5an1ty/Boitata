import {Vector2} from 'three';
/** Finish operates on sRGB after OutputPass: no second gamma/tone-map transform. */
export const NeoPSXShader={
 uniforms:{tDiffuse:{value:null},resolution:{value:new Vector2(1,1)},time:{value:0},grain:{value:.18},dither:{value:.12},grading:{value:.35},chromatic:{value:.12},vignette:{value:.2},distortion:{value:0}},
 vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
 fragmentShader:`
 uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float time,grain,dither,grading,chromatic,vignette,distortion;
 varying vec2 vUv;
 float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time*13.17)*43758.5453);}
 void main(){
  vec2 p=vUv*2.0-1.0;float r2=dot(p,p);
  // Overscan keeps optional barrel distortion within the source texture.
  vec2 uv=.5+.5*p*(1.0+distortion*.025*r2)/(1.0+distortion*.05);
  vec2 shift=p*r2*chromatic*.7/resolution;
  vec3 c=vec3(texture2D(tDiffuse,clamp(uv+shift,0.001,0.999)).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,clamp(uv-shift,0.001,0.999)).b);
  float l=dot(c,vec3(.2126,.7152,.0722));
  vec3 grade=mix(vec3(l),c,.9);grade=(grade-.5)*1.06+.5;
  grade+=vec3(-.003,.001,.006)*(1.0-l);c=mix(c,grade,grading);
  c*=1.0-vignette*.35*smoothstep(.25,1.7,r2);
  float pattern=mod(floor(gl_FragCoord.x)+mod(floor(gl_FragCoord.y),2.0)*2.0,4.0)/4.0-.375;
  c+=pattern*dither/128.0;
  c+=(noise(gl_FragCoord.xy)-.5)*grain*.035*(.35+.65*(1.0-l));
  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
 }`
};
