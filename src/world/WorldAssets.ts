import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CylinderGeometry} from 'three';
import {SurfaceLibrary,type Surface} from '../rendering/SurfaceLibrary';
import { BoxGeometry, CanvasTexture, InstancedMesh, Mesh, MeshLambertMaterial, NearestFilter, PlaneGeometry, RepeatWrapping, type Group, type Scene, Vector3 } from 'three';
import type { CollisionSystem } from '../systems/CollisionSystem';
/** Shared resources owned by the world, never disposed by an individual sector. */
export class WorldAssets {
  readonly surfaces=new SurfaceLibrary();
  surface(kind:Surface,color:number){return this.surfaces.get(kind,color);}
  readonly vehicleHull=new RoundedBoxGeometry(1,1,1,2,.08);
  readonly vehicleCab=new RoundedBoxGeometry(1,1,1,2,.06);
  readonly wheel=new CylinderGeometry(1,1,1,16);
  readonly cube = new BoxGeometry(1,1,1);
  private readonly materials = new Map<number,MeshLambertMaterial>();
  private readonly textures: CanvasTexture[]=[];
  private readonly labels: Mesh[]=[];
  constructor(readonly collisions: CollisionSystem) {
    const p=this.vehicleCab.getAttribute('position');for(let i=0;i<p.count;i++){const t=p.getY(i)+.5;p.setX(i,p.getX(i)*(1-.18*t));p.setZ(i,p.getZ(i)*(1-.38*t));}this.vehicleCab.computeVertexNormals();
  }
  material(color:number): MeshLambertMaterial {
    let m=this.materials.get(color);if(!m){m=new MeshLambertMaterial({color,flatShading:true});this.materials.set(color,m);}return m;
  }
  box(parent:Group|Scene,x:number,y:number,z:number,w:number,h:number,d:number,color:number,solid=true):Mesh {
    const mesh=new Mesh(this.cube,this.material(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);
    if(solid)this.collisions.add(mesh.position,new Vector3(w,h,d));return mesh;
  }
  label(parent:Group|Scene,text:string,x:number,y:number,z:number,width=2,color='#ced5ad'):Mesh {
    const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;
    ctx.fillStyle='#17271f';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#8e9d77';ctx.strokeRect(5,5,502,118);ctx.fillStyle=color;ctx.font='bold 30px monospace';ctx.textAlign='center';
    text.split('\n').forEach((line,i,lines)=>ctx.fillText(line,256,64+(i-(lines.length-1)/2)*38));
    const texture=new CanvasTexture(c);texture.magFilter=texture.minFilter=NearestFilter;this.textures.push(texture);
    const mesh=new Mesh(new PlaneGeometry(width,width/4),new MeshLambertMaterial({map:texture}));mesh.position.set(x,y,z);parent.add(mesh);this.labels.push(mesh);return mesh;
  }
  batch(parent:Group):void {
    const batches=new Map<MeshLambertMaterial,Mesh[]>();
    for(const child of [...parent.children])if(child instanceof Mesh&&!(child instanceof InstancedMesh)&&child.geometry===this.cube&&child.material instanceof MeshLambertMaterial&&!child.material.transparent){
      const list=batches.get(child.material)??[];list.push(child);batches.set(child.material,list);
    }
    for(const [material,meshes]of batches){if(meshes.length<2)continue;const batch=new InstancedMesh(this.cube,material,meshes.length);
      meshes.forEach((mesh,i)=>{mesh.updateMatrix();batch.setMatrixAt(i,mesh.matrix);parent.remove(mesh);});batch.computeBoundingSphere();parent.add(batch);
    }
  }
  groundTexture():CanvasTexture {
    const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d')!;
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){const v=30+((x*17+y*29)%23);ctx.fillStyle=`rgb(${v},${v+5},${v-7})`;ctx.fillRect(x,y,1,1);}
    const t=new CanvasTexture(c);t.magFilter=t.minFilter=NearestFilter;t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(45,45);this.textures.push(t);return t;
  }
  dispose():void {this.surfaces.dispose();this.vehicleHull.dispose();this.vehicleCab.dispose();this.wheel.dispose();this.cube.dispose();this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());for(const l of this.labels){l.geometry.dispose();(l.material as MeshLambertMaterial).dispose();}}
}
