import {Vector3} from 'three';
import type {CollisionSystem} from '../systems/CollisionSystem';
/** Small bounded A*, with swept clearance and no diagonal corner cutting. */
export class Navigation {
 constructor(private readonly collisions:CollisionSystem,readonly radius=1.1){}
 free(x:number,z:number):boolean{return Math.abs(x)<56&&Math.abs(z)<56&&!this.collisions.blocked(new Vector3(x,1.65,z),this.radius);}
 clear(from:Vector3,to:Vector3):boolean {
  const steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.25));
  for(let i=0;i<=steps;i++){const t=i/steps;if(!this.free(from.x+(to.x-from.x)*t,from.z+(to.z-from.z)*t))return false;}return true;
 }
 nearest(point:Vector3):Vector3 {
  if(this.free(point.x,point.z))return point.clone().setY(1.65);
  for(let r=1;r<=8;r++)for(let i=0;i<16;i++){const a=i*Math.PI/8,x=point.x+Math.sin(a)*r,z=point.z+Math.cos(a)*r;if(this.free(x,z))return new Vector3(x,1.65,z);}
  return point.clone().setY(1.65);
 }
 path(from:Vector3,target:Vector3):Vector3[] {
  const goal=this.nearest(target);if(this.clear(from,goal))return [goal];
  const start=this.nearest(from),sx=Math.round(start.x),sz=Math.round(start.z),gx=Math.round(goal.x),gz=Math.round(goal.z);
  const minX=Math.max(-55,Math.min(sx,gx)-9),maxX=Math.min(55,Math.max(sx,gx)+9),minZ=Math.max(-55,Math.min(sz,gz)-9),maxZ=Math.min(55,Math.max(sz,gz)+9);
  const key=(x:number,z:number)=>`${x},${z}`;
  const open=[{x:sx,z:sz,g:0,f:0}],costs=new Map<string,number>([[key(sx,sz),0]]),parents=new Map<string,string>(),closed=new Set<string>(),cache=new Map<string,boolean>();
  const free=(x:number,z:number)=>{const k=key(x,z);if(!cache.has(k))cache.set(k,this.free(x,z));return cache.get(k)!;};
  let final:string|undefined;
  for(let attempts=0;open.length&&attempts<2200;attempts++){
   open.sort((a,b)=>b.f-a.f);const n=open.pop()!,nk=key(n.x,n.z);if(closed.has(nk))continue;closed.add(nk);
   if(n.x===gx&&n.z===gz){final=nk;break;}
   for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
    const x=n.x+dx,z=n.z+dz,k=key(x,z);if(x<minX||x>maxX||z<minZ||z>maxZ||closed.has(k)||!free(x,z))continue;
    if(dx&&dz&&(!free(n.x+dx,n.z)||!free(n.x,n.z+dz)))continue;
    const g=n.g+Math.hypot(dx,dz);if(g>=(costs.get(k)??Infinity))continue;costs.set(k,g);parents.set(k,nk);open.push({x,z,g,f:g+Math.hypot(gx-x,gz-z)});
   }
  }
  if(!final)return [];
  const points:Vector3[]=[goal];while(final!==key(sx,sz)){const [x,z]=final.split(',').map(Number);points.unshift(new Vector3(x,1.65,z));final=parents.get(final);if(!final)return [];}
  // Connect the actor to the grid safely, then simplify only swept-clear sections.
  points.unshift(new Vector3(sx,1.65,sz));const simplified:Vector3[]=[];let cursor=from;
  while(points.length){let index=points.length-1;while(index>0&&!this.clear(cursor,points[index]))index--;const next=points[index];if(!this.clear(cursor,next))return [];simplified.push(next);cursor=next;points.splice(0,index+1);}return simplified;
 }
 move(position:Vector3,target:Vector3,distance:number):number {
  const delta=target.clone().sub(position);delta.y=0;const length=delta.length();if(length<.001)return 0;delta.multiplyScalar(Math.min(distance,length)/length);
  const steps=Math.max(1,Math.ceil(delta.length()/.15));let moved=0;
  for(let i=0;i<steps;i++){const x=position.x+delta.x/steps,z=position.z+delta.z/steps;if(!this.free(x,z))break;position.x=x;position.z=z;moved+=delta.length()/steps;}return moved;
 }
}
