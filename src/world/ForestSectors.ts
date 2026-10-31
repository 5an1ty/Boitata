import { Box3, Color, IcosahedronGeometry, SphereGeometry, BufferGeometry, CylinderGeometry, Group, InstancedMesh, Object3D, Vector3, type Scene } from 'three';
import type { WorldAssets } from './WorldAssets';
interface Sector {group:Group;colliders:Box3[];meshes:InstancedMesh[];}
/** Deterministic sector streaming. Player neighbourhood always loads before movement. */
export class ForestSectors {
  readonly active=new Map<string,Sector>();
  private readonly trunkGeometry=new CylinderGeometry(.3,.5,1,10);
  private readonly crownGeometry=new IcosahedronGeometry(1,0);
  private readonly leafGeometry=new SphereGeometry(1,6,3);
  private readonly shrubGeometry=new IcosahedronGeometry(1,0);
  private readonly dummy=new Object3D();
  constructor(private readonly scene:Scene,private readonly assets:WorldAssets){
    const p=this.crownGeometry.getAttribute('position');for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.13*Math.sin(x*7+y*4+z*9);p.setXYZ(i,x*r,y*r,z*r);}this.crownGeometry.computeVertexNormals();
  }
  static clear(x:number,z:number):boolean {
    return (x>25&&x<50&&z>29&&z<54)||(x>17&&x<30&&z>36&&z<42)||(x>-9&&x<4&&z>16&&z<20)||Math.abs(x+12)<6 || (x>-8&&x<31&&z>-30&&z<17) || (Math.abs(x)<2.5&&z>=15&&z<38) || (Math.abs(z-39)<2.5&&x>=-2&&x<18) || Math.hypot(x-18,z-42)<9;
  }
  update(position:Vector3,distance:number):void {
    const desired=new Set<string>();
    for(let sx=-3;sx<3;sx++)for(let sz=-3;sz<3;sz++){
      const x=sx*20+10,z=sz*20+10,key=`${sx},${sz}`;
      if(Math.hypot(position.x-x,position.z-z)>distance+16)continue;
      desired.add(key);if(!this.active.has(key))this.active.set(key,this.load(sx,sz));
    }
    for(const [key,sector]of this.active)if(!desired.has(key)){this.unload(sector);this.active.delete(key);}
  }
  private load(sx:number,sz:number):Sector {
    let seed=((sx+4)*1987+(sz+4)*319)>>>0;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const sector:Sector={group:new Group(),colliders:[],meshes:[]};
    const trees:{x:number;z:number;h:number;r:number;rotation:number;palm:boolean}[]=[];
    for(let i=0;i<25;i++){const x=sx*20+random()*20,z=sz*20+random()*20;if(ForestSectors.clear(x,z))continue;trees.push({x,z,h:5+random()*8,r:.6+random()*.65,rotation:random()*6.28,palm:random()<.24});}
    const batch=(geometry:BufferGeometry,color:number,count:number)=>{const mesh=new InstancedMesh(geometry,this.assets.material(color),count);mesh.castShadow=true;mesh.receiveShadow=true;sector.group.add(mesh);sector.meshes.push(mesh);return mesh;};
    const trunks=batch(this.trunkGeometry,0x454432,trees.length),crowns=batch(this.crownGeometry,0x253e2e,trees.length),understory=batch(this.shrubGeometry,0x354a2d,trees.length*3),roots=batch(this.trunkGeometry,0x394030,trees.length*2),vines=batch(this.trunkGeometry,0x435438,trees.length);
    let shrubIndex=0;
    trees.forEach((t,i)=>{
      const d=this.dummy;d.position.set(t.x,t.h/2,t.z);d.rotation.set(0,t.rotation,0);d.scale.set(t.r,t.h,t.r);d.updateMatrix();trunks.setMatrixAt(i,d.matrix);
      d.position.y=t.h;d.scale.set(t.palm?3:2+t.r,t.palm?.4:2.6,t.palm?3:2+t.r);d.rotation.z=t.palm?.12:0;d.updateMatrix();crowns.setMatrixAt(i,d.matrix);crowns.setColorAt(i,new Color().setHSL(.27+random()*.07,.18+random()*.2,.65+random()*.3));
      sector.colliders.push(this.assets.collisions.add(new Vector3(t.x,t.h/2,t.z),new Vector3(t.r,t.h,t.r)));
      for(let j=0;j<3;j++){const x=t.x+(random()-.5)*4,z=t.z+(random()-.5)*4;d.position.set(x,.4,z);d.scale.set(.5+random(),.4+random(),.6+random());d.rotation.set(0,random()*6.28,0);d.updateMatrix();understory.setMatrixAt(shrubIndex++,d.matrix);}
      for(let j=0;j<2;j++){d.position.set(t.x,.1,t.z);d.scale.set(.35,2.2,.35);d.rotation.set(Math.PI/2,t.rotation+j*1.3,0);d.updateMatrix();roots.setMatrixAt(i*2+j,d.matrix);}
      d.position.set(t.x+.8,t.h*.65,t.z);d.scale.set(.08,t.h*.6,.08);d.rotation.set(.13,0,.16);d.updateMatrix();vines.setMatrixAt(i,d.matrix);
    });
    // Fan-shaped palm fronds share a single instanced geometry.
    const palms=trees.filter(t=>t.palm),fronds=batch(this.leafGeometry,0x3c5333,palms.length*5);
    palms.forEach((t,i)=>{for(let j=0;j<5;j++){const angle=t.rotation+j*Math.PI*2/5,d=this.dummy;d.position.set(t.x+Math.sin(angle),t.h+.3,t.z+Math.cos(angle));d.rotation.set(Math.cos(angle)*1.15,0,-Math.sin(angle)*1.15);d.scale.set(.65,3,.18);d.updateMatrix();fronds.setMatrixAt(i*5+j,d.matrix);}});
    for(const mesh of sector.meshes){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
    this.scene.add(sector.group);return sector;
  }
  private unload(sector:Sector):void {this.scene.remove(sector.group);sector.colliders.forEach(b=>this.assets.collisions.remove(b));sector.meshes.forEach(m=>m.dispose());sector.group.clear();}
  dispose():void {this.active.forEach(s=>this.unload(s));this.active.clear();this.trunkGeometry.dispose();this.crownGeometry.dispose();this.leafGeometry.dispose();this.shrubGeometry.dispose();}
}
