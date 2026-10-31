import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/neo-capture',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"></body>'}));await page.goto('http://localhost:5173/neo-capture');
 await page.evaluate(async()=>{
  const T=await import('/node_modules/.vite/deps/three.js'),{SceneManager}=await import('/src/core/SceneManager.ts'),{NeoPSXPipeline}=await import('/src/rendering/NeoPSXPipeline.ts'),{settings,SettingsStore}=await import('/src/systems/SettingsStore.ts');
  const world=new SceneManager(),renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setSize(960,540);renderer.domElement.style.cssText='width:100vw;height:100vh';document.body.append(renderer.domElement);world.camera.aspect=16/9;world.camera.updateProjectionMatrix();
  const pipeline=new NeoPSXPipeline(renderer,world.scene,world.camera);const {SurfaceLibrary}=await import('/src/rendering/SurfaceLibrary.ts');globalThis.neo={T,world,renderer,pipeline,settings,SettingsStore,SurfaceLibrary};
 });
 for(const [name,pos,target]of [['exterior',[1,2.3,16],[5,2,-4]],['interior',[7,1.8,-11],[14,1.7,-18]],['forest',[0,1.8,32],[6,4,40]]]){
  await page.evaluate(({pos,target})=>{const n=globalThis.neo;n.world.camera.position.fromArray(pos);n.world.camera.lookAt(...target);n.world.environment.update(0,n.world.camera.position,48);n.settings.set('psx',true);n.pipeline.render(0);},{pos,target});await page.screenshot({path:`docs/neo-psx/${name}.png`});
  if(name==='interior'){await page.evaluate(()=>{const n=globalThis.neo;n.settings.set('psx',false);n.pipeline.render(0);});await page.screenshot({path:'docs/neo-psx/interior-base.png'});} 
 }
 const checks=await page.evaluate(()=>{
  const n=globalThis.neo,gl=n.renderer.getContext(),pixels=new Uint8Array(960*540*4);
  const hash=()=>{n.pipeline.render(0);gl.readPixels(0,0,960,540,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let h=0;for(let i=0;i<pixels.length;i++)h=(Math.imul(h,31)+pixels[i])>>>0;return h;};
  const changes={};for(const key of ['grain','dither','grading','chromatic','vignette','distortion','antialias']){n.settings.set(key,0);const off=hash();n.settings.set(key,1);changes[key]=off!==hash();n.settings.set(key,0);}
  n.settings.set('psx',false);const bypass=hash();n.settings.set('psx',true);const active=hash();n.renderer.setSize(422,195);n.pipeline.render(0);const size=n.pipeline.composer.readBuffer.width===422&&n.pipeline.composer.readBuffer.height===195;
  // Bloom must react to an HDR emissive source, not ordinary diffuse surfaces.
  const glow=new n.T.Mesh(new n.T.SphereGeometry(.3,12,8),new n.T.MeshBasicMaterial({color:new n.T.Color(5,3,1)}));glow.position.copy(n.world.camera.position).add(n.world.camera.getWorldDirection(new n.T.Vector3()).multiplyScalar(3));n.world.scene.add(glow);n.renderer.setSize(960,540);n.settings.set('bloom',0);const bloomOff=hash();n.settings.set('bloom',.5);changes.bloom=bloomOff!==hash();
  const lib=new n.SurfaceLibrary(),metal=lib.get('metal',0x808080),soil=lib.get('soil',0x808080);const materials=metal.isMeshStandardMaterial&&metal.metalness>0&&soil.roughness>metal.roughness&&metal.map.colorSpace===n.T.SRGBColorSpace&&metal.roughnessMap.colorSpace===n.T.NoColorSpace;lib.dispose();
  n.settings.set('bloom',90);n.settings.set('grain',-2);const saved=new n.SettingsStore();const persisted=saved.value.bloom===.5&&saved.value.grain===0;
  const shadows=n.world.flashlight.shadow.map!==null;
  const target=n.pipeline.composer.readBuffer;let disposed=false;target.addEventListener('dispose',()=>disposed=true);n.pipeline.dispose();n.world.environment.dispose();n.renderer.dispose();return {changes,size,disposed,bypass,active,materials,persisted,shadows};
 });assert(Object.values(checks.changes).every(Boolean),JSON.stringify(checks));assert(checks.size&&checks.disposed&&checks.materials&&checks.persisted&&checks.shadows);assert.deepEqual(errors,[]);console.log('PASS Neo-PSX: shaders, efeitos independentes, bloom HDR, resize, descarte e capturas.',checks);
}finally{await browser.close();}
