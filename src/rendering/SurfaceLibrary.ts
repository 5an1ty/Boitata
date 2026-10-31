import {CanvasTexture, MeshStandardMaterial, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace} from 'three';
export type Surface='concrete'|'paint'|'metal'|'tile'|'wood'|'glass'|'rubber'|'ceramic'|'packaging'|'asphalt'|'soil'|'mud'|'plastic';
/** Original, deterministic 256px textures. Shared per library owner; usable in every environment. */
export class SurfaceLibrary {
  private maps=new Map<Surface,CanvasTexture>();
  private dataMaps=new Map<Surface,CanvasTexture>();
  private materials=new Map<string,MeshStandardMaterial>();
  get(kind:Surface,color:number):MeshStandardMaterial{
    const key=`${kind}:${color}`;let material=this.materials.get(key);
    if(!material){const roughness={concrete:.94,paint:.68,metal:.48,tile:.48,wood:.78,glass:.24,rubber:.96,ceramic:.25,packaging:.7,asphalt:.92,soil:1,mud:.48,plastic:.52}[kind];
      const map=this.texture(kind);let data=this.dataMaps.get(kind);if(!data){data=map.clone();data.colorSpace=NoColorSpace;data.needsUpdate=true;this.dataMaps.set(kind,data);}
      material=new MeshStandardMaterial({color,map,roughness,metalness:kind==='metal'?.45:0,roughnessMap:data,bumpMap:data,bumpScale:kind==='glass'||kind==='ceramic'?.002:kind==='asphalt'?.025:.012,flatShading:false});this.materials.set(key,material);}return material;
  }
  private texture(kind:Surface):CanvasTexture{
    const found=this.maps.get(kind);if(found)return found;
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;
    let seed=137;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      let v=228+Math.sin(x*.085+Math.cos(y*.09))*5+Math.cos(y*.14)*4+random()*7;
      if(kind==='asphalt')v=175+random()*70;
      if(kind==='soil'||kind==='mud')v=195+Math.sin(x*.13)*Math.cos(y*.15)*18+random()*25;
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
      const x=random()*256,y=random()*256;
      c.fillStyle=kind==='metal'||kind==='paint'?'rgba(92,45,20,.18)':'rgba(32,43,24,.08)';
      c.fillRect(x,y,1+random()*5,kind==='glass'?8+random()*30:1+random()*8);
    }
    if(kind==='concrete')for(let i=0;i<2;i++){
      c.strokeStyle='rgba(35,38,30,.18)';c.beginPath();let x=random()*256,y=random()*256;c.moveTo(x,y);for(let j=0;j<5;j++){x+=random()*10-5;y+=random()*9;c.lineTo(x,y);}c.stroke();
    }
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.magFilter=LinearFilter;texture.minFilter=LinearMipmapLinearFilter;texture.wrapS=texture.wrapT=RepeatWrapping;texture.generateMipmaps=true;this.maps.set(kind,texture);return texture;
  }
  dispose():void{this.materials.forEach(m=>m.dispose());this.maps.forEach(t=>t.dispose());this.dataMaps.forEach(t=>t.dispose());}
}
