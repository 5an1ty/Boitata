import {CanvasTexture, MeshLambertMaterial, NearestFilter, RepeatWrapping, SRGBColorSpace} from 'three';
export type Surface='concrete'|'paint'|'metal'|'tile'|'wood'|'glass'|'rubber'|'ceramic'|'packaging';
/** Original, deterministic 128px textures. Owned only by the station. */
export class StationMaterials {
  private maps=new Map<Surface,CanvasTexture>();
  private materials=new Map<string,MeshLambertMaterial>();
  get(kind:Surface,color:number):MeshLambertMaterial{
    const key=`${kind}:${color}`;let material=this.materials.get(key);
    if(!material){material=new MeshLambertMaterial({color,map:this.texture(kind),flatShading:true});this.materials.set(key,material);}return material;
  }
  private texture(kind:Surface):CanvasTexture{
    const found=this.maps.get(kind);if(found)return found;
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d')!;
    let seed=137;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      let v=228+Math.sin(x*.085+Math.cos(y*.09))*5+Math.cos(y*.14)*4+random()*7;
      if(kind==='wood')v-=35*(.5+.5*Math.sin(x*.8+Math.sin(y*.07)));
      if(kind==='metal')v-=x%32<1?18:0;
      if(kind==='ceramic'||kind==='packaging')v=244+random()*5;
      if(kind==='glass')v=130+random()*45+Math.sin(x*.15+y*.02)*25;
      if(kind==='rubber')v=110+random()*35-(y%12<3?35:0);
      if(kind==='tile'&&(x%32<1||y%32<1))v=158;
      c.fillStyle=`rgb(${v},${v},${v*.94})`;c.fillRect(x,y,1,1);
    }
    // Chipped coating, water streaks and small rust/moss islands.
    for(let i=0;i<(kind==='ceramic'||kind==='packaging'?0:38);i++){
      const x=random()*128,y=random()*128;
      c.fillStyle=kind==='metal'||kind==='paint'?'rgba(92,45,20,.18)':'rgba(32,43,24,.08)';
      c.fillRect(x,y,1+random()*5,kind==='glass'?8+random()*30:1+random()*8);
    }
    if(kind==='concrete')for(let i=0;i<2;i++){
      c.strokeStyle='rgba(35,38,30,.18)';c.beginPath();let x=random()*128,y=random()*128;c.moveTo(x,y);for(let j=0;j<5;j++){x+=random()*10-5;y+=random()*9;c.lineTo(x,y);}c.stroke();
    }
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.magFilter=texture.minFilter=NearestFilter;texture.wrapS=texture.wrapT=RepeatWrapping;texture.generateMipmaps=false;this.maps.set(kind,texture);return texture;
  }
  dispose():void{this.materials.forEach(m=>m.dispose());this.maps.forEach(t=>t.dispose());}
}
