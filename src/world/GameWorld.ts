import { Group, InstancedMesh, Material, MeshBasicMaterial, PointLight, Vector3, type Scene } from 'three';
import type { CollisionSystem } from '../systems/CollisionSystem';
import { WorldAssets } from './WorldAssets';
import { GasStation } from './GasStation';
import { ForestSectors } from './ForestSectors';
import { Atmosphere } from './Atmosphere';
import type { WorldInteraction } from './WorldInteraction';
export class GameWorld {
  readonly assets:WorldAssets;
  readonly station:GasStation;
  readonly forest:ForestSectors;
  readonly atmosphere:Atmosphere;
  readonly group=new Group();
  readonly signPosition=new Vector3(-7,1.5,11);
  readonly interactions:WorldInteraction[];
  creatureThreat=0;
  powerTarget=1;
  powerLevel=1;
  blackoutTime=-1;
  private time=0;
  private readonly beacon=new PointLight(0x72996b,7,16,2);
  constructor(private readonly scene:Scene,collisions:CollisionSystem){
    this.assets=new WorldAssets(collisions);const a=this.assets,b=a.box.bind(a,this.group),label=a.label.bind(a,this.group);
    const ground=b(0,-.12,0,120,.24,120,0x747d56,false);const material=a.material(0x747d56).clone();material.map=a.groundTexture();ground.material=material;
    b(-12,.015,0,7,.03,120,0x252f2b,false);for(const x of [-16.2,-7.8])b(x,.01,0,1.4,.02,120,0x66664d,false);
    for(let z=-56;z<58;z+=6){b(-12,.04,z,.12,.015,2.2,0xaca37a,false);for(const x of [-15.3,-8.7])b(x,.04,z,.1,.015,5.5,0x93967f,false);
      b(-12+Math.sin(z)*2,.05,z,.03,.01,1.8,0x111c16,false);}
    for(const z of [-40,-5,30]){b(-17,.75,z,.14,1.5,.14,0x6c735b);label(`BR-319\nKM ${147+Math.floor(z/10)}`,-17,1.7,z,1.8);}
    b(-7,.8,11,.15,1.6,.15,0x7a7d67);label('BR-319\nMANAUS · 147 km',-7,1.8,11.1,2.5);
    // Mud, two road access lanes, and a continuous trail to the clearing.
    for(const z of [11,-7])b(-4,.025,z,10,.03,4,0x555740,false);
    for(let z=18;z<40;z+=3)b(Math.sin(z)*.3,.025,z,3.2,.025,3.3,0x655c3e,false);
    b(9,.025,39,20,.025,3.2,0x655c3e,false);b(18,.02,43,16,.03,15,0x55583b,false);
    for(let i=0;i<9;i++)b(-7+Math.sin(i)*.5,.035,19+i*3,.7,.03,1.4,0x35432c,false);
    this.station=new GasStation(a);scene.add(this.station.group);this.station.vehicle(a,-17,32,true);
    // Communication installation, guy lines, and a small cabinet in the clearing.
    b(18,6,44,.35,12,.35,0x798474);for(const x of [16,20]){const beam=b(x,3,44,.12,6.5,.12,0x667260,false);beam.rotation.z=(x-18)*.17;}
    for(let y=2;y<11;y+=1.3)b(18,y,44,2.2,.1,.1,0x7d8976,false);
    b(20,.8,44,1.4,1.6,1,0x57685b);label('RETRANSMISSORA\nBR-319 · 2004',20,1.1,44.54,1.3);
    const red=b(18,12.2,44,.22,.22,.22,0xcc583d,false);red.material=new MeshBasicMaterial({color:0xcc583d});
    this.beacon.position.set(18,2,42);this.group.add(this.beacon);
    for(let i=0;i<14;i++){const glow=b(10+Math.sin(i*3.8)*6,.6+(i%3)*.4,34+i*.8,.06,.06,.06,0x99af64,false);glow.material=new MeshBasicMaterial({color:i%4===0?0x90cad0:0x92b069});}
    a.batch(this.group);a.batch(this.station.group);scene.add(this.group);this.forest=new ForestSectors(scene,a);this.atmosphere=new Atmosphere(scene);
    this.interactions=[...this.station.interactions,{position:this.signPosition,label:'LER PLACA',use:()=> 'BR-319. Manaus, 147 km. Trecho fictício ao sul de Manaus.'},{position:new Vector3(20,1.3,44),label:'EXAMINAR RETRANSMISSORA',use:()=> 'Retransmissora de comunicação. Sem campanha ou transmissão disponível nesta etapa.'}];
    this.forest.update(new Vector3(0,1.65,13),48);
  }
  findInteraction(position:Vector3,direction:Vector3):WorldInteraction|undefined {
    let nearest:WorldInteraction|undefined,min=2.8;
    for(const item of this.interactions){const offset=item.position.clone().sub(position),distance=offset.length();if(distance<min&&direction.dot(offset.normalize())>.65){nearest=item;min=distance;}}
    return nearest;
  }
  update(dt:number,player:Vector3,distance:number):void {
    this.time+=dt;this.forest.update(player,distance);this.atmosphere.update(dt,player,this.time);
    this.powerLevel += Math.sign(this.powerTarget-this.powerLevel)*Math.min(Math.abs(this.powerTarget-this.powerLevel),dt*.18);
    if(this.blackoutTime>=0)this.blackoutTime+=dt;
    this.station.lights[0].intensity=32+Math.sin(this.time*7)*1.5;
    this.station.lights[1].intensity=Math.sin(this.time*2.7)>.96?4:27+Math.sin(this.time*3)*1.5;
    this.beacon.intensity=(5+Math.sin(this.time*.8)*2)*(1+this.creatureThreat*Math.sin(this.time*12)*.4);
    this.station.lights.forEach((light,i)=>{const blackout=this.blackoutTime<0?1:Math.max(0,1-Math.max(0,this.blackoutTime-i*1.4)/2);light.intensity*=this.powerLevel*blackout;});
  }
  dispose():void {
    this.forest.dispose();this.atmosphere.dispose();this.station.doors.forEach(d=>d.dispose());
    const materials=new Set<Material>();
    for(const group of [this.group,this.station.group])group.traverse(o=>{if(o instanceof InstancedMesh)o.dispose();if('material'in o&&o.material instanceof Material)materials.add(o.material);});materials.forEach(m=>m.dispose());
    this.assets.dispose();this.scene.remove(this.group,this.station.group);this.station.lights.forEach(l=>l.dispose());this.beacon.dispose();
  }
}
