import {BoxGeometry, BufferGeometry, CircleGeometry, LatheGeometry, TorusGeometry, Vector2, CylinderGeometry, Group, InstancedMesh, Mesh, MeshLambertMaterial, Quaternion, Vector3} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {WorldAssets} from './WorldAssets';
import type {WorldDoor} from './WorldInteraction';
import {StationMaterials, type Surface} from './StationMaterials';
/** Decorative shell only: no collision registrations, interaction moves or world-wide materials. */
export class StationVisuals {
  private readonly materials=new StationMaterials();
  private readonly geometries=new Set<BufferGeometry>();
  private readonly decals:MeshLambertMaterial[]=[];
  private readonly boxGeometries=new Map<string,BufferGeometry>();
  private readonly cube=new BoxGeometry(1,1,1);
  private readonly cylinder=new CylinderGeometry(1,1,1,8);
  private readonly bevel=new CylinderGeometry(.9,1,1,4,1,false,Math.PI/4);
  constructor(private readonly group:Group,a:WorldAssets,doors:WorldDoor[]){
    this.geometries.add(this.cube);this.geometries.add(this.cylinder);this.geometries.add(this.bevel);
    // Existing collision envelopes stay exactly as authored. Retexture only station-owned boxes.
    group.traverse(o=>{
      if(!(o instanceof Mesh)||o.geometry!==a.cube||!(o.material instanceof MeshLambertMaterial)||o.material.map)return;
      const color=o.material.color.getHex();const s=o.scale;
      let kind:Surface='paint';
      if(s.x>7||s.y>3)kind='concrete';
      if([0x706746,0x736744,0x615b40,0x62674c,0x6a6247].includes(color))kind='wood';
      if([0x35584b,0x263e39,0x47685f,0x617b71].includes(color))kind='glass';
      if([0xb4b9a2,0xa4ad95].includes(color))kind='ceramic';
      if([0x19241e,0x1f2923,0x161f1b].includes(color))kind='rubber';
      if([0x586449,0x3f5148,0xa9b4a2,0x414c44,0x2b3d32].includes(color))kind='metal';
      const material=this.materials.get(kind,color);
      if(o.material.transparent){const clone=material.clone();clone.transparent=true;clone.opacity=.55;o.material.dispose();o.material=clone;}else o.material=material;
      // Face-specific metric UVs: a 24m wall does not stretch a single tile.
      const geometry=a.cube.clone(),uv=geometry.getAttribute('uv');
      const repeats=[[s.z,s.y],[s.z,s.y],[s.x,s.z],[s.x,s.z],[s.x,s.y],[s.x,s.y]];
      for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;uv.setXY(i,uv.getX(i)*Math.max(.35,repeats[f][0]/2),uv.getY(i)*Math.max(.35,repeats[f][1]/2));}
      o.geometry=geometry;this.geometries.add(geometry);
      // Sloped windshield and tapered cab replace the box-like parked vehicle roof.
      if(o.position.y===1.5&&(o.position.x===17||o.position.x===-5)&&s.z===1.9){
        const positions=geometry.getAttribute('position');for(let i=0;i<positions.count;i++)if(positions.getY(i)>0){positions.setX(i,positions.getX(i)*.82);positions.setZ(i,positions.getZ(i)*.62);}geometry.computeVertexNormals();
      }
      if(color===0xb4b9a2&&o.position.y===.35){
        const bowl=new LatheGeometry([[.22,0],[.25,.07],[.16,.22],[.2,.35],[.35,.48],[.39,.61],[.36,.66],[.28,.62],[.18,.43],[0,.4]].map(([x,y])=>new Vector2(x,y)),12);
        this.geometries.add(bowl);o.geometry=bowl;o.position.y=.06;o.scale.set(1,1,1.2);
      }else if(color===0xb4b9a2){o.position.y=1.02;o.scale.set(.67,.6,.25);}
      if(color===0xa4ad95){o.position.y=.47;o.scale.set(.27,.85,.27);}
      // The collision envelope stays conservative, but the rack is open shelving.
      if(color===0x535d44&&o.position.y===.9){o.scale.z=.06;o.position.z-=.32;}
      // Wheel and workshop tire silhouettes, with identical collision footprints.
      if(color===0x19241e){o.geometry=this.cylinder;o.scale.set(.425,.35,.425);o.rotation.z=Math.PI/2;}
      if(color===0x1f2923){o.geometry=this.cylinder;o.scale.set(.5,.3,.5);}
    });
    const box=(x:number,y:number,z:number,w:number,h:number,d:number,kind:Surface='metal',color=0x6b7064,parent=group)=>this.mesh(this.cube,x,y,z,w,h,d,kind,color,parent);
    const pipe=(from:number[],to:number[],radius=.035,color=0x53564b,parent=group)=>{
      const start=new Vector3(...from),end=new Vector3(...to),delta=end.clone().sub(start);const m=this.mesh(this.cylinder,...start.clone().add(end).multiplyScalar(.5).toArray(),radius,delta.length(),radius,'metal',color,parent);m.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),delta.normalize()));return m;
    };
    // Canopy fascia, rain gutter, ribs, column shoes and steel capitals.
    for(const z of [-4,8]){box(5,4.46,z,17,.48,.15,'paint',0x683d30);box(5,4.12,z,17,.08,.22);}
    for(let x=-3;x<14;x+=.65)box(x,4.19,2,.06,.12,11.8);
    for(const x of [-2,12])for(const z of [-2,6]){
      box(x,.16,z,.42,.32,.42,'concrete',0x747769);box(x,4,z,.6,.16,.6);
      pipe([x+.12,.4,z],[x+.12,3.9,z],.024);
    }
    pipe([13.35,4.4,-3.8],[13.35,.25,-3.8],.07);
    for(const x of [0,10]){box(x,4.02,2,2.15,.14,.35);box(x,3.93,2,1.9,.05,.17,'paint',0xe4c68b);}
    // Pump shoulders, counting display borders, louvers, hose loops and nozzles.
    for(const x of [2,8]){
      this.mesh(this.bevel,x,2.04,2,.61,.15,.46,'paint',0x934a32);
      box(x,.41,2,.95,.14,.73);box(x,1.64,2.385,.77,.62,.06,'metal',0x323c36);
      a.label(group,'LITROS  0000\nR$  2,19',x,1.65,2.425,.68,'#c5bf91');
      for(let i=0;i<6;i++)box(x,.7+i*.07,2.335,.55,.025,.02,'rubber',0x242c28);
      const points=[[x+.45,1.85,2],[x+.7,1.5,2],[x+.75,.6,2],[x+.59,.48,2],[x+.46,.8,2],[x+.49,1.4,2]];
      for(let i=1;i<points.length;i++)pipe(points[i-1],points[i],.045,0x272c26);
      const nozzle=box(x+.5,1.45,2.07,.09,.27,.13);nozzle.rotation.z=-.35;
      a.label(group,x===2?'GASOLINA':'DIESEL',x,1.16,2.34,.7,'#d6bf82');
    }
    // Windows are shallow dirty glass recesses on the existing solid facade.
    for(const x of [1,12,18]){
      box(x,1.7,-9.84,3.8,1.5,.06,'glass',0x456058);
      for(const dx of [-1.95,0,1.95])box(x+dx,1.7,-9.77,.07,1.65,.1);
      for(const y of [.88,2.52])box(x,y,-9.77,4,.09,.1);
      box(x,.78,-9.76,4.1,.15,.25,'concrete',0x777e6e);
    }
    for(const door of doors){const width=door.width;
      for(const x of [.035,width-.035])box(x,1.3,.08,.07,2.6,.05,'metal',0x697368,door.pivot);
      for(const y of [.07,2.53])box(width/2,y,.08,width,.1,.05,'metal',0x697368,door.pivot);
      pipe([width-.18,1.05,.14],[width-.18,1.4,.14],.025,0xb4ac8c,door.pivot);
    }
    // Interior: skirting, old tile floor, signage and shop fittings.
    box(10,.041,-18,23.7,.012,15.7,'tile',0x858675);
    for(const z of [-25.85])box(10,.18,z,23.8,.3,.045,'tile',0x737c68);
    box(17,1.42,-12,6.2,.035,1.22,'metal',0x8b8b76);
    for(const x of [1,11])for(const z of (x===1?[-14]:[-14,-17])){
      for(const dx of [-.98,.98])box(x+dx,.9,z+.37,.06,1.8,.06);
      for(const y of [.6,1.2,1.7]){
        const price=a.label(group,'CAFÉ 1,50 · ÁGUA 1,00',x,y,z+.425,1.75,'#c7bb8a');price.scale.y=.16;
        for(let i=0;i<5;i++){
          const px=x-.78+i*.39,base=y+.04,pz=z+.12;
          if(i%3===0){
            this.mesh(this.cylinder,px,base+.13,pz,.075,.26,.075,'glass',0x52745d);
            this.mesh(this.bevel,px,base+.27,pz,.065,.06,.065,'glass',0x52745d);
            this.mesh(this.cylinder,px,base+.32,pz,.03,.07,.03,'packaging',0xb7a26d);
            this.mesh(this.cylinder,px,base+.13,pz,.077,.1,.077,'packaging',0xb6a47c);
          }else if(i%3===1){
            this.mesh(this.cylinder,px,base+.12,pz,.09,.24,.09,'packaging',0x9e6547);
            this.mesh(this.cylinder,px,base+.245,pz,.085,.01,.085,'metal',0xa0a396);
            box(px,base+.13,pz+.091,.13,.09,.007,'packaging',0xd2be93);
          }else{
            box(px,base+.16,pz,.21,.32,.18,'packaging',0xb9a56f);
            this.mesh(this.bevel,px,base+.335,pz,.14,.03,.12,'packaging',0x9a874f);
            box(px,base+.17,pz+.094,.15,.13,.006,'packaging',0x687a51);
          }
        }
      }
    }
    for(const x of [18,20]){
      box(x,2.49,-15.3,1.74,.12,1.04);pipe([x+.57,.9,-14.69],[x+.57,1.8,-14.69],.035);
      for(let i=0;i<6;i++)box(x,.18+i*.065,-14.77,1.4,.025,.025,'rubber',0x29392e);
      for(const y of [.7,1.25,1.8])box(x,y,-14.72,1.35,.03,.02);
    }
    a.label(group,'NOVEMBRO 2004\n21 · DOMINGO',5,2.1,-19.85,1.5,'#c7b694');
    a.label(group,'CAFÉ PASSADO\nPÃO NA CHAPA',3,2,-10.17,1.4,'#d3b77b').rotation.y=Math.PI;
    a.label(group,'FIADO SÓ AMANHÃ',17,1,-11.43,1.8);
    // Sanitary fixtures, exposed drain, stock crate battens and workshop pegboard.
    const seat=new TorusGeometry(.31,.048,4,12);this.geometries.add(seat);
    const seatMesh=this.mesh(seat,0,.74,-24,1,1.25,1,'ceramic',0xc5c4af);seatMesh.rotation.x=-Math.PI/2;
    box(.23,1.15,-24.25,.09,.035,.06,'metal',0xa5aaa1);
    const basin=new LatheGeometry([[.1,0],[.3,.04],[.43,.15],[.44,.24],[.36,.24],[.27,.1],[0,.07]].map(([x,y])=>new Vector2(x,y)),12);this.geometries.add(basin);
    this.mesh(basin,2.5,.85,-24.8,1,1,.7,'ceramic',0xb9c0af);
    pipe([2.5,.9,-24.8],[2.5,.2,-24.8],.055);pipe([2.5,1.15,-25],[2.5,1.3,-25],.035);
    box(2.5,1.3,-24.9,.22,.04,.04);
    for(const z of [-22,-24.8])for(const x of [4.8,9])for(const dx of [-.43,.43])box(x+dx,.7,z+.61,.09,1.3,.04,'wood',0x97845a);
    box(13,2.25,-25.76,3.8,.9,.04,'wood',0x756d4c);
    for(let i=0;i<7;i++){pipe([11.5+i*.45,1.95,-25.7],[11.5+i*.45,2.45,-25.7],.023);box(11.5+i*.45,2.4,-25.67,.17,.1,.05);}
    // Generator grille, engine covers and exhaust fit within its solid body.
    for(let i=0;i<10;i++)box(26.015,.35+i*.085,-18,.025,.03,2.4,'rubber',0x202c25);
    for(const z of [-18.8,-17.3])this.mesh(this.bevel,25,1.34,z,.6,.12,.6,'metal',0x7c7d60);
    pipe([25,1.7,-18],[25,2,-18],.08);pipe([25,2,-18],[25,2,-18.35],.08);
    pipe([21.85,2.7,-23],[21.85,2.7,-18],.035);pipe([21.85,2.7,-18],[24.8,1.4,-18],.035);
    // Parked vehicles only; the abandoned road truck is created later and remains untouched.
    for(const [x,z,length]of [[17,4,4],[-5,-3,7]]){
      for(const dz of [-length/2,length/2])box(x,.52,z+dz,2.35,.16,.13);
      for(const side of [-1,1]){
        box(x+side*1.12,1.65,z+length*.27,.025,.65,1.45,'glass',0x314a43);
        box(x+side*1.16,1.16,z+length*.27,.025,.055,.22);
        box(x+side*1.19,1.55,z+length*.27+.5,.12,.13,.22);
        for(const dz of [-length*.32,length*.32]){const hub=this.mesh(this.cylinder,x+side*1.385,.45,z+dz,.2,.025,.2,'metal',0x747a6c);hub.rotation.z=Math.PI/2;}
      }
      a.label(group,'AM · MANAUS\nJXA 2004',x,.7,z+length/2+.09,.55);
      for(const dx of [-.82,.82])box(x+dx,.8,z-length/2-.025,.4,.18,.035,'paint',0x8b3428);
      for(let i=0;i<5;i++)box(x,.81+i*.055,z+length/2+.06,1.1,.025,.02,'rubber',0x25352e);
    }
    // Cheap contact shading and wet patches: no shadow maps or extra lights.
    const disc=new CircleGeometry(1,12);this.geometries.add(disc);
    for(const [color,opacity,patches]of [
      [0x080d0a,.34,[[2,2,1.1,1.4],[8,2,1.1,1.4],[17,4,1.5,2.2],[-5,-3,1.6,3.5],[25,-18,1.3,1.9]]],
      [0x677b76,.18,[[9,7,1.8,.6],[1,-5,1.2,.45],[22,-15,1.1,.55]]]
    ] as const){const material=new MeshLambertMaterial({color,transparent:true,opacity,depthWrite:false});this.decals.push(material);
      for(const [x,z,w,d]of patches){const patch=new Mesh(disc,material);patch.position.set(x,.055,z);patch.rotation.x=-Math.PI/2;patch.scale.set(w,d,1);group.add(patch);}
    }
    this.batch();
  }
  private mesh(geometry:BufferGeometry,x:number,y:number,z:number,w:number,h:number,d:number,kind:Surface,color:number,parent=this.group):Mesh{
    if(geometry===this.cube){
      const key=`${w}:${h}:${d}`;let metric=this.boxGeometries.get(key);
      if(!metric){metric=this.cube.clone();const uv=metric.getAttribute('uv'),dimensions=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
        for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;uv.setXY(i,uv.getX(i)*Math.max(.25,dimensions[f][0]/2),uv.getY(i)*Math.max(.25,dimensions[f][1]/2));}
        this.boxGeometries.set(key,metric);this.geometries.add(metric);
      }geometry=metric;
    }
    const mesh=new Mesh(geometry,this.materials.get(kind,color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
  }
  private batch():void{
    // Merge remaining unique-sized static boxes by material, retaining metric UVs.
    const remaining=new Map<MeshLambertMaterial,Mesh[]>();
    for(const o of [...this.group.children])if(o instanceof Mesh&&!(o instanceof InstancedMesh)&&o.material instanceof MeshLambertMaterial&&!o.material.transparent){const list=remaining.get(o.material)??[];list.push(o);remaining.set(o.material,list);}
    for(const [material,list]of remaining)if(list.length>1){
      const transformed=list.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);});
      const geometry=mergeGeometries(transformed);transformed.forEach(g=>g.dispose());
      if(geometry){this.geometries.add(geometry);list.forEach(o=>this.group.remove(o));this.group.add(new Mesh(geometry,material));}
    }
  }
  dispose():void{this.geometries.forEach(g=>g.dispose());this.materials.dispose();this.decals.forEach(m=>m.dispose());}
}
