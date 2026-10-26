import {Group,Mesh,MeshBasicMaterial,BoxGeometry,Vector3} from 'three';
import type {GameWorld} from '../world/GameWorld';
import type {ChapterOne} from '../story/ChapterOne';
import type {WorldInteraction} from '../world/WorldInteraction';
import type {ItemId} from '../data/chapter1';
export class CampaignWorld {
 readonly group=new Group();readonly pickups=new Map<ItemId,Mesh>();readonly clock013:Mesh;readonly clock2347:Mesh;readonly needle:Mesh;readonly dashboard=new Group();readonly eyes=new Group();
 constructor(world:GameWorld,chapter:ChapterOne,register:(label:string,position:Vector3,use:(position:Vector3)=>string)=>WorldInteraction,pick:(id:ItemId)=>string,action:(id:string,p:Vector3)=>string){
  const a=world.assets,g=this.group,b=a.box.bind(a,g),label=a.label.bind(a,g);
  // Three accessible archive bays and their connecting path, reserved before forest generation.
  b(37,.02,40,24,.04,5,0x5c5c40,false);b(39,-.01,44,18,.06,9,0x555e4c,false);
  b(39,1.6,48,18,3.2,.2,0x52614e);for(const x of [30,36,42,48])b(x,1.6,44,.2,3.2,8,0x52614e);b(39,3.3,44,18.5,.2,8.5,0x35473a);
  for(const [x,title]of [[33,'ARQUIVO FOTOGRÁFICO'],[39,'ÁUDIO / REGISTROS'],[45,'LOGÍSTICA']] as const){b(x,.65,46,3,1.3,1.1,0x6b6349);const sign=label(title,x,2.5,38,4.8);sign.rotation.y=Math.PI;}
  b(27.5,1.2,39,3,2.4,.5,0x4b5b46);label('ABRIGO / PAINEL',27.5,1.8,38.7,2.7).rotation.y=Math.PI;
  b(28,.9,36,.14,1.8,.14,0x8a8e70);label('ARQUIVOS →',28,1.8,36,3).rotation.y=Math.PI;
  for(const [id,x,y,z]of [['burnPhoto',33,1.4,45.3],['recording',39,1.4,45.3],['transport',45,1.4,45.3],['transmitterManual',26,1.4,36],['logAsh',38,1.2,51],['logFuel',28,1.2,-15],['logWitness',1.9,1.6,-24.4]] as [ItemId,number,number,number][]){
   const mesh=a.box(new Group(),x,y,z,.4,.15,.3,id==='recording'?0x544735:0xd0c49e,false);g.add(mesh);this.pickups.set(id,mesh);
   const pickup=register(`COLETAR ${id==='burnPhoto'?'FOTOGRAFIA DA QUEIMADA':id==='recording'?'GRAVAÇÃO':id==='transport'?'REGISTRO DE TRANSPORTE':id==='transmitterManual'?'MANUAL DO TRANSMISSOR':id==='logAsh'?'DIÁRIO DAS CINZAS':id==='logFuel'?'LIVRO DE ABASTECIMENTO':'BILHETE DA TESTEMUNHA'}`,new Vector3(x,y,z),()=>pick(id));Object.defineProperty(pickup,'enabled',{get:()=>!chapter.inventory.has(id)});
  }
  const points:[string,string,Vector3][]=[
   ['truck','EXAMINAR CAMINHÃO',new Vector3(-15.6,1.4,32)],['truckRadio','SINTONIZAR RÁDIO DO CAMINHÃO',new Vector3(-15.6,1.6,34.5)],
   ['explore','EXAMINAR ARQUIVOS DA INSTALAÇÃO',new Vector3(29,1.5,37)],['link','COMPARAR AS TRÊS EVIDÊNCIAS',new Vector3(30.5,1.5,39.5)],
   ['cover','ABRIGAR-SE / APAGAR LANTERNA',new Vector3(27.5,1.4,38.6)],['equipment','OPERAR TRANSMISSOR DO POSTO',new Vector3(23,1.4,-13)],
   ['roadRelay','DESLIGAR RELÉ DA RODOVIA',new Vector3(-6,1.4,18)],['forestRelay','DESLIGAR RELÉ DA TRILHA',new Vector3(.6,1.4,28)],['car','ENTRAR NO CARRO / FUGIR',new Vector3(18.5,1.4,5)]
  ];
  for(const [id,name,p]of points){register(name,p,position=>action(id,position));if(['explore','link','equipment','roadRelay','forestRelay'].includes(id)){b(p.x,p.y-.5,p.z,.6,1.3,.4,0x526551);label(name.replace('OPERAR ','').slice(0,28),p.x,p.y+.5,p.z+.23,2.4);}}
  this.needle=b(23,1.65,-12.75,.07,.35,.04,0xd7b36a,false);
  this.clock013=label('00 : 13',10,2.6,-19.70,.65);this.clock013.visible=false;this.clock2347=label('23 : 47',10,2.6,-19.68,.65);this.clock2347.visible=false;
  const dash=a.box(this.dashboard,0,-.6,-1.2,1.9,.4,.7,0x28362b,false);dash.material=a.material(0x28362b);this.dashboard.visible=false;
  for(const x of [-.25,.25]){const eye=new Mesh(new BoxGeometry(.1,.1,.1),new MeshBasicMaterial({color:0xffcf76}));eye.position.set(x,1.9,27);this.eyes.add(eye);}this.eyes.position.x=2;this.eyes.visible=false;g.add(this.eyes);world.station.group.add(g);
 }
 sync(chapter:ChapterOne,stage:number):void {for(const [id,mesh]of this.pickups)mesh.visible=!chapter.inventory.has(id);this.clock013.visible=stage===4&&!this.clock2347.visible;}
}
