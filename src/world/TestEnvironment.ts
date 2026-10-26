import { BoxGeometry, CanvasTexture, ConeGeometry, CylinderGeometry, Mesh, MeshLambertMaterial, NearestFilter, PointLight, RepeatWrapping, Scene, Vector3 } from 'three';
import type { CollisionSystem } from '../systems/CollisionSystem';
export class TestEnvironment {
  readonly signPosition = new Vector3(3.8, 1.5, 2);
  constructor(scene: Scene, collisions: CollisionSystem) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível criar as texturas.');
    let seed = 319;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let y=0;y<32;y++) for(let x=0;x<32;x++) { const c = Math.floor(24 + random()*20); ctx.fillStyle = `rgb(${c},${c+4},${c-4})`; ctx.fillRect(x,y,1,1); }
    const texture = new CanvasTexture(canvas); texture.magFilter = texture.minFilter = NearestFilter; texture.wrapS = texture.wrapT = RepeatWrapping; texture.repeat.set(24,24);
    const box = (x: number,y: number,z: number,w: number,h: number,d: number,color: number,solid=true) => {
      const mesh = new Mesh(new BoxGeometry(w,h,d), new MeshLambertMaterial({color,flatShading:true})); mesh.position.set(x,y,z); scene.add(mesh);
      if(solid) collisions.add(mesh.position,new Vector3(w,h,d)); return mesh;
    };
    const ground = box(0,-0.15,0,72,0.3,72,0x656c50,false); (ground.material as MeshLambertMaterial).map = texture;
    box(0,0.012,0,6,0.025,72,0x242a28,false);
    for(let z=-32;z<34;z+=6) box(0,0.035,z,0.12,0.015,2.5,0x8c8862,false);
    box(3.1,0.025,0,0.1,0.02,72,0x9b9c85,false); box(-3.1,0.025,0,0.1,0.02,72,0x9b9c85,false);
    // A small, accessible test shelter; separate walls leave a real doorway.
    box(9,1.6,-4,8,3.2,0.3,0x697268); box(5,1.6,0,0.3,3.2,8,0x535c50); box(13,1.6,0,0.3,3.2,8,0x535c50);
    box(6.5,1.6,4,3,3.2,0.3,0x697268); box(11.5,1.6,4,3,3.2,0.3,0x697268); box(9,2.95,4,2,0.5,0.3,0x697268);
    box(9,3.35,0,8.6,0.3,8.6,0x303e36); box(11,0.7,-2,1.5,1.4,1,0x62573c);
    box(3.8,0.7,2,0.12,1.4,0.12,0x6e6852); box(3.8,1.6,2,1.5,0.65,0.12,0x697856);
    const signCanvas = document.createElement('canvas'); signCanvas.width=256; signCanvas.height=96;
    const sc = signCanvas.getContext('2d')!; sc.fillStyle='#263b2a';sc.fillRect(0,0,256,96);sc.strokeStyle='#a0ac87';sc.strokeRect(4,4,248,88);sc.fillStyle='#d8d9aa';sc.font='bold 28px monospace';sc.textAlign='center';sc.fillText('BR-319',128,40);sc.font='16px monospace';sc.fillText('MANAUS  ·  147 km',128,72);
    const signTexture=new CanvasTexture(signCanvas); signTexture.magFilter=signTexture.minFilter=NearestFilter;
    const sign=box(3.8,1.6,2.075,1.45,0.6,0.01,0xffffff,false); (sign.material as MeshLambertMaterial).map=signTexture;
    for(let i=0;i<95;i++) {
      const x=(random()-0.5)*68,z=(random()-0.5)*68;
      if(Math.abs(x)<5 || (x>3 && x<15 && z>-6 && z<7)) continue;
      const h=3+random()*4;
      const trunk=new Mesh(new CylinderGeometry(0.16,0.3,h,5),new MeshLambertMaterial({color:0x38382a,flatShading:true}));trunk.position.set(x,h/2,z);scene.add(trunk);collisions.add(trunk.position,new Vector3(0.55,h,0.55));
      const crown=new Mesh(new ConeGeometry(1.8,h,5),new MeshLambertMaterial({color:0x20382b,flatShading:true}));crown.position.set(x,h,z);scene.add(crown);
    }
    box(5.5,2.6,4.25,0.5,0.18,0.3,0xd2b06a,false);
    const lamp=new PointLight(0xffbf6e,24,16,1.8);lamp.position.set(5.5,2.4,4.5);scene.add(lamp);
    const interior=new PointLight(0xb1c7a1,9,10,2);interior.position.set(9,2.7,0);scene.add(interior);
  }
}
