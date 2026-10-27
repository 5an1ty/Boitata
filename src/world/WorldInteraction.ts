import { Box3, Group, MeshLambertMaterial, Vector3 } from 'three';
import type { CollisionSystem } from '../systems/CollisionSystem';
import type { WorldAssets } from './WorldAssets';
export interface WorldInteraction { position:Vector3; label:string; use:(player:Vector3)=>string; }
export class WorldDoor implements WorldInteraction {
  readonly position:Vector3;
  readonly pivot=new Group();
  readonly blocker:Box3;
  open=false;
  private readonly openBlocker:Box3;
  private glassMaterial?:MeshLambertMaterial;
  constructor(parent:Group,assets:WorldAssets,private readonly collisions:CollisionSystem,x:number,z:number,readonly name:string,glass=false,readonly width=1.8,private readonly yaw=0){
    this.position=new Vector3(x,1.4,z);this.pivot.position.set(x-Math.cos(yaw)*width/2,0,z+Math.sin(yaw)*width/2);this.pivot.rotation.y=yaw;parent.add(this.pivot);
    const panel=assets.box(this.pivot,width/2,1.3,0,width,2.6,.12,glass?0x47685f:0x52604d,false);
    if(glass){this.glassMaterial=assets.material(0x47685f).clone();this.glassMaterial.transparent=true;this.glassMaterial.opacity=.38;panel.material=this.glassMaterial;}
    assets.box(this.pivot,width-.15,1.2,.12,.08,.15,.1,0xb3ac84,false);
    const c=Math.cos(yaw),s=Math.sin(yaw);
    this.openBlocker=new Box3().setFromCenterAndSize(new Vector3(x-(c+s)*width/2,1.3,z+(s-c)*width/2),new Vector3(Math.abs(c)*.18+Math.abs(s)*width,2.6,Math.abs(c)*width+Math.abs(s)*.18));
    this.blocker=collisions.add(new Vector3(x,1.3,z),new Vector3(Math.abs(c)*width+Math.abs(s)*.18,2.6,Math.abs(s)*width+Math.abs(c)*.18));
  }
  get label():string{return `${this.open?'FECHAR':'ABRIR'} ${this.name}`;}
  use(player:Vector3):string {
    // Prevent closing a panel onto the player. Open doors park against the doorway side.
    const destination=this.open?this.blocker:this.openBlocker;
    if(destination.clone().expandByScalar(.3).containsPoint(player))return 'Afaste-se da passagem para mover a porta.';
    this.open=!this.open;this.pivot.rotation.y=this.yaw+(this.open?Math.PI/2:0);
    this.collisions.remove(this.open?this.blocker:this.openBlocker);this.collisions.solids.push(this.open?this.openBlocker:this.blocker);
    return `${this.name}: ${this.open?'aberta':'fechada'}.`;
  }
  dispose():void {this.glassMaterial?.dispose();}
}
