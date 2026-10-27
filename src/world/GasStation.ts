import { Group, PointLight, Vector3 } from 'three';
import { StationVisuals } from './StationVisuals';
import type { WorldAssets } from './WorldAssets';
import { WorldDoor, type WorldInteraction } from './WorldInteraction';
export class GasStation {
  readonly group=new Group();
  readonly visuals:StationVisuals;
  readonly doors:WorldDoor[]=[];
  readonly interactions:WorldInteraction[]=[];
  readonly lights:PointLight[]=[];
  constructor(a:WorldAssets){
    const g=this.group,b=a.box.bind(a,g),label=a.label.bind(a,g);
    b(8,.015,-5,29,.03,33,0x474c42,false);
    // Forecourt: open approaches from the road at z=9 and z=-7.
    b(5,4.4,2,17,.35,12,0x414c44);b(5,4.13,8,17,.35,.2,0x9e9d72,false);
    label('POSTO ÚLTIMA PARADA',5,4.4,8.12,11,'#e5cc85').scale.y=.3;
    for(const x of [-2,12])for(const z of [-2,6])b(x,2.1,z,.28,4.2,.28,0x878d78);
    for(const x of [2,8]){
      b(x,.18,2,2,.36,2.5,0x797c6b);b(x,1.15,2,.85,1.7,.65,0x9a3e2d);b(x,1.65,2.35,.7,.55,.05,0xbcbda3,false);
      label('LITROS\n0000',x,1.65,2.39,.6);b(x+.55,1.1,2,.12,1.5,.12,0x161f1b);b(x+.48,1.8,2,.35,.1,.12,0x161f1b,false);
    }
    for(const x of [0,10])b(x,4.06,2,2,.08,.2,0xd6e1bf,false);
    // Convenience store x=-2..22, z=-20..-10. All rear rooms have doors.
    b(10,1.6,-26,24,3.2,.25,0x5d6859);b(-2,1.6,-18,.25,3.2,16,0x687260);b(22,1.6,-18,.25,3.2,16,0x687260);
    b(2,1.6,-10,8,3.2,.25,0x6f7764);b(15,1.6,-10,14,3.2,.25,0x6f7764);b(7,2.95,-10,2,.5,.25,0x6f7764);
    b(10,3.3,-18,24.5,.25,16.5,0x2b3d32);label('CONVENIÊNCIA · 24 HORAS',10,2.7,-9.84,9);
    this.door(a,7,-10,'PORTA DE VIDRO',true,2);
    // Rear wall split around four doorways, with a wide central shop aisle.
    for(const [cx,name] of [[1,'BANHEIRO'],[7,'DEPÓSITO'],[13,'OFICINA'],[19,'SALA ELÉTRICA']] as const){
      b(cx-1.95,1.6,-20,2.1,3.2,.2,0x5a6655);b(cx+1.95,1.6,-20,2.1,3.2,.2,0x5a6655);b(cx,2.95,-20,1.8,.5,.2,0x5a6655);
      this.door(a,cx,-20,name);label(name,cx,2.72,-19.85,2.4);
    }
    for(const x of [4,10,16])b(x,1.6,-23,.2,3.2,6,0x596650);
    b(17,.65,-12,6,1.3,1.1,0x706746);b(17,1.35,-12,6.1,.12,1.2,0x394637);
    b(15,1.62,-12,.65,.45,.5,0x92967e);b(15,1.92,-12,.5,.18,.35,0x192b25,false);label('CAIXA',15,1.7,-11.72,.55);
    b(19,1.53,-12,.5,.2,.3,0x202b23,false);b(19,1.7,-12,.55,.12,.12,0x26332a,false); // phone
    for(const x of [1,11]){
      for(const z of [-14,-17]){
        b(x,.9,z,2,1.8,.7,0x535d44);for(const y of [.6,1.2,1.7]){b(x,y,z,2.1,.08,.8,0xa1a080,false);
          for(let i=0;i<5;i++)b(x-.8+i*.4,y+.18,z+.26,.22,.3,.22,[0x9a6545,0xb2ad71,0x6b8463][i%3],false);
        }
      }
    }
    for(const x of [18,20]){b(x,1.25,-18,1.7,2.5,1,0xa9b4a2);b(x,1.4,-17.46,1.45,1.9,.04,0x35584b,false);label('GELADOS',x,2.2,-17.42,1.3);}
    b(-1,2.15,-12,.8,.65,.6,0x454938,false);b(-1,2.15,-11.68,.65,.45,.04,0x66867c,false);label('SEM SINAL',-1,2.15,-11.64,.6);
    b(17,1.55,-12,.65,.3,.25,0x6f6950,false);label('AM 319',17,1.6,-11.84,.6);
    b(10,2.6,-19.83,.65,.65,.08,0xb9b49a,false);label('02 : 17',10,2.6,-19.77,.6);
    for(let i=0;i<4;i++){const paper=b(16+i*.45,1.425,-11.7,.35,.01,.25,0xc9c6a0,false);paper.rotation.y=i*.5;}
    this.interactions.push({position:new Vector3(17,1.4,-11.5),label:'LER DOCUMENTOS',use:()=> 'Registro de 2004: manter a passagem da floresta livre. Antena de comunicação na clareira.'});
    // Bathroom: toilet, sink, mirror, pipe.
    b(0,.35,-24,.8,.7,1,0xb4b9a2);b(0,.9,-24.4,.8,.9,.25,0xb4b9a2);b(2.5,1,-24.8,1,1,.6,0xa4ad95);b(2.5,1.95,-25.8,1,1,.04,0x617b71,false);
    // Stock room: crates and shelves leave a central aisle.
    for(const z of [-22,-24.8]){b(4.8,.7,z,1.3,1.4,1.2,0x736744);b(9,.9,z,1.1,1.8,1.1,0x62674c);}
    label('ÓLEO · 2004',9,1.2,-21.4,.9);
    // Workshop: workbench, tools, tires.
    b(13,.85,-25,4,1.7,1.1,0x615b40);for(let i=0;i<6;i++)b(11.6+i*.5,1.85,-25,.1,.12,.6,0x92998a,false);
    for(let i=0;i<3;i++)b(15,.3+i*.35,-22,1,.3,1,0x1f2923);
    // Electrical room: cabinets and conduit, safely accessible.
    b(20.5,1.4,-24,1.3,2.8,1,0x3f5148);label('ALTA TENSÃO',20.5,1.8,-23.46,1.15,'#d2b874');for(let i=0;i<5;i++)b(20.2+i*.13,1.3,-23.44,.07,.1,.03,0xad7d4c,false);
    b(17.2,1.1,-25.5,.8,2.2,.3,0x4d6455);
    // External generator and open tool shelter.
    b(25,.65,-18,2,1.3,3,0x586449);b(25,1.6,-18,.15,.7,.15,0x354033);label('GERADOR',25,1.1,-16.45,1.6);
    b(26,2.5,-6,5,.2,5,0x465044);for(const x of [24,28])b(x,1.2,-8,.14,2.4,.14,0x75775d);b(26,1.2,-8.4,4.5,2.4,.15,0x5c634b);b(26,.7,-7.6,3,1.4,.8,0x6a6247);for(let i=0;i<4;i++)b(24.8+i*.7,1.5,-7.5,.12,.12,.6,0x929d86,false);
    this.vehicle(a,17,4,false);this.vehicle(a,-5,-3,true);
    // Closed gate has an interaction and is never a permanent campaign barrier.
    this.door(a,25,0,'PORTÃO DO PÁTIO',false,3);
    label('TRILHA → ANTENA',3,1.6,15,3);b(3,.7,15,.14,1.4,.14,0x737057);
    const fluorescent=new PointLight(0xe5bd83,34,24,2);fluorescent.position.set(5,3.9,1);this.lights.push(fluorescent);
    const shop=new PointLight(0xb9d8d5,28,22,2);shop.position.set(9,2.9,-15);this.lights.push(shop);
    const back=new PointLight(0x91b4a5,18,18,2);back.position.set(13,2.6,-23);this.lights.push(back);g.add(...this.lights);
    this.visuals=new StationVisuals(g,a,this.doors);
  }
  private door(a:WorldAssets,x:number,z:number,name:string,glass=false,width=1.8):void{const door=new WorldDoor(this.group,a,a.collisions,x,z,name,glass,width);this.doors.push(door);this.interactions.push(door);}
  vehicle(a:WorldAssets,x:number,z:number,truck:boolean):void {
    const b=a.box.bind(a,this.group),length=truck?7:4;
    b(x,.7,z,2.4,1,length,truck?0x64634a:0x75816d);b(x,1.5,z+length*.27,2.2,1.4,1.9,truck?0x786c4c:0x667a6d);
    b(x,1.7,z+length*.27+1,1.85,.65,.04,0x263e39,false);
    if(truck)b(x,1.9,z-1.5,2.5,2.6,4,0x5d604d);
    for(const dx of [-1.2,1.2])for(const dz of [-length*.32,length*.32])b(x+dx,.45,z+dz,.35,.85,.85,0x19241e);
    for(const dx of [-.8,.8])b(x+dx,.85,z+length/2+.04,.4,.25,.06,0xc4b586,false);
  }
}
