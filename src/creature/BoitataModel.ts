import {BoxGeometry,CatmullRomCurve3,Color,ConeGeometry,CylinderGeometry,Group,InstancedMesh,Mesh,MeshLambertMaterial,Object3D,PointLight,SphereGeometry,Vector3} from 'three';
/** Connected low-poly links sample a centripetal spline through actual head history. */
export class BoitataModel {
 readonly group=new Group();readonly head=new Group();
 readonly light=new PointLight(0xff8a24,0,15,2);
 readonly segmentCount=28;
 private readonly geometry=new CylinderGeometry(.55,.6,1,12,1);
 private readonly scaleGeometry=new ConeGeometry(.2,.34,3);
 private readonly material=new MeshLambertMaterial({color:0x8b3218,emissive:0xd65316,emissiveIntensity:.6,flatShading:true});
 private readonly scalesMaterial=new MeshLambertMaterial({color:0xffc95e,emissive:0xff8a30,emissiveIntensity:.8,flatShading:true});
 private readonly body=new InstancedMesh(this.geometry,this.material,this.segmentCount);
 private readonly scales=new InstancedMesh(this.scaleGeometry,this.scalesMaterial,this.segmentCount);
 private readonly dummy=new Object3D();private readonly up=new Vector3(0,1,0);
 private history:Vector3[]=[];private clock=0;
 private readonly headGeometry=new SphereGeometry(.76,12,8);
 private readonly eyeGeometry=new BoxGeometry(.23,.17,.23);
 private readonly jawGeometry=new BoxGeometry(1.15,.23,1.15);
 private readonly headMaterial=new MeshLambertMaterial({color:0x6d2211,emissive:0xb63a0f,emissiveIntensity:.5,flatShading:true});
 private readonly eyeMaterial=new MeshLambertMaterial({color:0xffeab6,emissive:0xffd77b,emissiveIntensity:3});
 constructor(){
  const skull=new Mesh(this.headGeometry,this.headMaterial);skull.position.z=.3;skull.scale.set(.85,.65,1.35);this.head.add(skull);const jaw=new Mesh(this.jawGeometry,this.headMaterial);jaw.position.set(0,-.22,.16);this.head.add(jaw);
  for(const x of [-.43,.43]){const eye=new Mesh(this.eyeGeometry,this.eyeMaterial);eye.position.set(x,.22,.5);this.head.add(eye);}
  // A forked flame crest makes the silhouette distinct from a generic snake.
  for(const x of [-.26,.26]){const crest=new Mesh(this.scaleGeometry,this.scalesMaterial);crest.position.set(x,.5,-.15);crest.scale.set(1,2,1);this.head.add(crest);}
  for(let i=0;i<this.segmentCount;i++)this.body.setColorAt(i,new Color().setHSL(.02+i*.0018,.85,.45+(i%3)*.08));
  this.body.frustumCulled=this.scales.frustumCulled=false;this.group.add(this.body,this.scales,this.head,this.light);this.group.visible=false;
 }
 reset(position:Vector3,path:Vector3[]=[]):void {
  this.history=[position.clone()];let from=position.clone();
  for(const target of path){const count=Math.max(1,Math.ceil(from.distanceTo(target)/.18));for(let i=1;i<=count&&this.history.length<150;i++)this.history.push(from.clone().lerp(target,i/count));from=target.clone();}
 }
 update(dt:number,position:Vector3,forward:Vector3,emission:number,partial=false,opacity=1):void {
  this.clock+=dt;this.group.visible=opacity>.01;
  if(!this.history.length)this.reset(position);
  if(position.distanceTo(this.history[0])>.12){this.history.unshift(position.clone());if(this.history.length>150)this.history.pop();}
  const points=[position.clone(),...this.history.filter(p=>p.distanceTo(position)>.04)];
  if(points.length<2)points.push(position.clone().addScaledVector(forward,-.03));
  const curve=new CatmullRomCurve3(points,false,'centripetal'),totalLength=curve.getLength(),length=Math.min(18,totalLength);
  const visible=partial?12:this.segmentCount;
  for(let i=0;i<this.segmentCount;i++){
   const a=curve.getPointAt(Math.min(1,i*.62/Math.max(.01,totalLength))),b=curve.getPointAt(Math.min(1,(i+1)*.62/Math.max(.01,totalLength)));
   const tangent=b.clone().sub(a),center=a.clone().add(b).multiplyScalar(.5);center.y=1.05+Math.sin(this.clock*2.1-i*.5)*.12;
   const offset=Math.sin(this.clock*2.8-i*.48)*.16;center.x+=offset;center.z+=offset*.5;
   const taper=Math.max(.1,1-i/this.segmentCount*.9),d=this.dummy;d.position.copy(center);
   if(tangent.lengthSq()>.00001)d.quaternion.setFromUnitVectors(this.up,tangent.normalize());
   d.scale.set(taper,Math.max(.01,a.distanceTo(b)+.1),taper);
   if(i>=visible||i*.62>length+.1)d.scale.setScalar(0);
   d.updateMatrix();this.body.setMatrixAt(i,d.matrix);
   d.position.y+=.5*taper;d.rotation.set(0,this.clock*.02+i,0);d.scale.setScalar(i<visible&&i*.62<length?taper:0);d.updateMatrix();this.scales.setMatrixAt(i,d.matrix);
  }
  this.body.instanceMatrix.needsUpdate=this.scales.instanceMatrix.needsUpdate=true;
  this.head.visible=!partial;this.head.position.copy(position).setY(1.15+Math.sin(this.clock*2.1)*.12);this.head.lookAt(this.head.position.clone().add(forward));
  for(const material of [this.material,this.scalesMaterial,this.eyeMaterial,this.headMaterial]){material.transparent=true;material.opacity=opacity;}
  this.material.emissiveIntensity=(.3+emission*.45)*opacity;this.scalesMaterial.emissiveIntensity=(.4+emission*.5)*opacity;this.light.position.copy(this.head.position);this.light.intensity=partial?0:Math.min(16,emission*12)*opacity;
 }
 hide():void{this.group.visible=false;this.light.intensity=0;}
 dispose():void {this.body.dispose();this.scales.dispose();this.geometry.dispose();this.scaleGeometry.dispose();this.headGeometry.dispose();this.eyeGeometry.dispose();this.jawGeometry.dispose();this.headMaterial.dispose();this.material.dispose();this.scalesMaterial.dispose();this.eyeMaterial.dispose();this.light.dispose();this.group.removeFromParent();}
}
