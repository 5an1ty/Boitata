import {settings} from '../systems/SettingsStore';
import {CanvasTexture,Group,Mesh,MeshBasicMaterial,NearestFilter,PlaneGeometry,Vector3} from 'three';
import type {GameWorld} from '../world/GameWorld';
export class StoryEffects {
 readonly group=new Group();
 private readonly silhouette:Mesh;
 private readonly pump:Mesh;
 private readonly television:Mesh;
 private readonly canvas=document.createElement('canvas');
 private readonly texture:CanvasTexture;
 private silhouetteTime=0;private tvTime=0;private pumpTime=0;private noiseClock=0;
 constructor(world:GameWorld){
  const figure=document.createElement('canvas');figure.width=32;figure.height=64;const ctx=figure.getContext('2d')!;ctx.fillStyle='#020605';ctx.fillRect(12,6,9,10);ctx.fillRect(8,17,17,29);ctx.fillRect(9,43,5,20);ctx.fillRect(20,43,5,20);
  const ft=new CanvasTexture(figure);ft.magFilter=ft.minFilter=NearestFilter;
  this.silhouette=new Mesh(new PlaneGeometry(.95,2.3),new MeshBasicMaterial({map:ft,transparent:true,side:2}));this.silhouette.position.set(7,1.15,-6);this.silhouette.visible=false;
  this.canvas.width=64;this.canvas.height=48;this.texture=new CanvasTexture(this.canvas);this.texture.magFilter=this.texture.minFilter=NearestFilter;
  this.television=new Mesh(new PlaneGeometry(.64,.44),new MeshBasicMaterial({map:this.texture}));this.television.position.set(-1,2.15,-11.59);this.television.visible=false;
  this.pump=new Mesh(new PlaneGeometry(.65,.4),new MeshBasicMaterial({color:0x8da579}));this.pump.position.set(8,1.65,2.4);this.pump.visible=false;
  this.group.add(this.silhouette,this.television,this.pump);world.station.group.add(this.group);
 }
 showSilhouette():void {this.silhouetteTime=5;this.silhouette.visible=true;}
 interfere():void {this.tvTime=8;this.television.visible=true;}
 startPump():void {this.pumpTime=8;this.pump.visible=true;}
 update(dt:number,player:Vector3):void {
  this.silhouetteTime=Math.max(0,this.silhouetteTime-dt);this.tvTime=Math.max(0,this.tvTime-dt);this.pumpTime=Math.max(0,this.pumpTime-dt);
  this.silhouette.visible=this.silhouetteTime>0;this.silhouette.lookAt(player.x,1.15,player.z);this.television.visible=this.tvTime>0;this.pump.visible=this.pumpTime>0;
  this.noiseClock+=dt;if(this.tvTime>0&&this.noiseClock>.12){this.noiseClock=0;const ctx=this.canvas.getContext('2d')!;for(let y=0;y<48;y+=3)for(let x=0;x<64;x+=3){const n=Math.floor(Math.random()*(settings.value.reduceFlashes?50:170));ctx.fillStyle=`rgb(${n},${n+10},${n})`;ctx.fillRect(x,y,3,3);}this.texture.needsUpdate=true;}
 }
 dispose():void {for(const mesh of [this.silhouette,this.television,this.pump]){mesh.geometry.dispose();const m=mesh.material as MeshBasicMaterial;m.map?.dispose();m.dispose();}this.group.removeFromParent();}
}
