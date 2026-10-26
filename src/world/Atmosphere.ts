import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, PlaneGeometry, type Scene, Vector3 } from 'three';
export class Atmosphere {
  private readonly geometry=new BufferGeometry();
  private readonly drops=new Float32Array(700*6);
  private readonly rain:LineSegments;
  private readonly puddles:Mesh[]=[];
  constructor(private readonly scene:Scene){
    for(let i=0;i<700;i++){const j=i*6;this.drops[j]=(Math.random()-.5)*36;this.drops[j+1]=Math.random()*14;this.drops[j+2]=(Math.random()-.5)*36;this.drops[j+3]=this.drops[j]-.04;this.drops[j+4]=this.drops[j+1]-.45;this.drops[j+5]=this.drops[j+2];}
    this.geometry.setAttribute('position',new BufferAttribute(this.drops,3));this.rain=new LineSegments(this.geometry,new LineBasicMaterial({color:0x8eacaa,transparent:true,opacity:.25,depthWrite:false}));this.rain.frustumCulled=false;scene.add(this.rain);
    const geo=new PlaneGeometry(1,1),material=new MeshBasicMaterial({color:0x93aba2,transparent:true,opacity:.12,depthWrite:false});
    for(const [x,z,w,d]of [[5,9,3,1.2],[-8,14,2,3],[18,9,4,1.7],[-13,-14,1.4,4],[0,24,1,2]]){const p=new Mesh(geo,material);p.rotation.x=-Math.PI/2;p.rotation.z=x;p.position.set(x,.055,z);p.scale.set(w,d,1);scene.add(p);this.puddles.push(p);}
  }
  update(dt:number,player:Vector3,time:number):void {
    // Camera-local volume; suppress rain inside roof footprints, including individual drops.
    this.rain.position.set(player.x,0,player.z);
    for(let i=0;i<700;i++){
      const j=i*6;this.drops[j+1]-=dt*13;if(this.drops[j+1]<0)this.drops[j+1]=14;
      const x=player.x+this.drops[j],z=player.z+this.drops[j+2];
      const roof=(x>-2.5&&x<22.5&&z>-26.5&&z<-9.5)||(x>-3.5&&x<13.5&&z>-4&&z<8)||(x>23.5&&x<28.5&&z>-8.5&&z<-3.5);
      this.drops[j+3]=this.drops[j]-.04;this.drops[j+4]=this.drops[j+1]-.45;this.drops[j+5]=this.drops[j+2];
      if(roof&&this.drops[j+1]<4.7){this.drops[j+3]=this.drops[j];this.drops[j+4]=this.drops[j+1];}
    }
    this.geometry.attributes.position.needsUpdate=true;
    if(this.puddles[0])(this.puddles[0].material as MeshBasicMaterial).opacity=.11+Math.sin(time*2)*.025;
  }
  dispose():void {this.scene.remove(this.rain);this.geometry.dispose();(this.rain.material as LineBasicMaterial).dispose();if(this.puddles[0]){this.puddles[0].geometry.dispose();(this.puddles[0].material as MeshBasicMaterial).dispose();}this.puddles.forEach(p=>this.scene.remove(p));}
}
