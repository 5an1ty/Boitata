import {BoxGeometry,Mesh,MeshBasicMaterial,Raycaster,Vector3} from 'three';
import type {WorldInteraction} from '../world/WorldInteraction';
import type {CollisionSystem} from '../systems/CollisionSystem';
/** Invisible hit proxies don't add render calls. Solid AABBs occlude objects behind walls. */
export class InteractionSystem {
 private readonly ray=new Raycaster();
 private readonly geometry=new BoxGeometry(.65,.65,.35);
 private readonly material=new MeshBasicMaterial({visible:false});
 private readonly targets=new Map<Mesh,WorldInteraction>();
 constructor(private readonly collisions:CollisionSystem){}
 register(item:WorldInteraction):void {const mesh=new Mesh(this.geometry,this.material);mesh.position.copy(item.position);mesh.updateMatrixWorld();this.targets.set(mesh,item);}
 find(position:Vector3,direction:Vector3):WorldInteraction|undefined {
  this.ray.set(position,direction);this.ray.far=2.8;
  const hits=this.ray.intersectObjects([...this.targets.keys()],false);
  for(const hit of hits){const item=this.targets.get(hit.object as Mesh)!;
   if('enabled'in item&&item.enabled===false)continue;
   const wall=this.collisions.solids.some(box=>{
     if(box.clone().expandByScalar(.06).containsPoint(item.position))return false;
     const point=this.ray.ray.intersectBox(box,new Vector3());return point!==null&&position.distanceTo(point)<hit.distance-.04;
   });
   if(!wall)return item;
  }
  return undefined;
 }
 dispose():void {this.targets.clear();this.geometry.dispose();this.material.dispose();}
}
