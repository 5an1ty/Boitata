import {chromium} from 'playwright-core';
const phase=process.argv[2]??'after';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage({viewport:{width:1280,height:720}});await page.route('**/station-capture',route=>route.fulfill({contentType:'text/html',body:'<html><body style="margin:0"></body></html>'}));await page.goto('http://localhost:5173/station-capture');
for(const [name,pos,target] of [['exterior',[1,2.3,16],[5,2,-4]],['interior',[7,1.8,-11],[14,1.7,-18]],['generator',[28,2,-14],[25,1,-18]],['workshop',[13,1.8,-21],[13,1,-25]]]){
const stats=await page.evaluate(async({pos,target,phase})=>{
 const T=await import('/node_modules/.vite/deps/three.js');const {GasStation}=await import('/src/world/GasStation.ts');const {WorldAssets}=await import('/src/world/WorldAssets.ts');const {CollisionSystem}=await import('/src/systems/CollisionSystem.ts');
 const scene=new T.Scene();scene.background=new T.Color(0x081015);scene.fog=new T.Fog(0x081015,18,60);scene.add(new T.AmbientLight(0x869487,.55));const station=new GasStation(new WorldAssets(new CollisionSystem()));scene.add(station.group);
 // Fixed comparison rig: identical positions, intensities and colors in both captures.
 if(phase!=='lighting')station.lights.forEach((l,i)=>{l.color.setHex([0xc7e4ce,0xc7d3ac,0x91b4a5][i]);l.intensity=[34,28,18][i];});
 const camera=new T.PerspectiveCamera(68,1280/720,.08,90);camera.position.fromArray(pos);camera.lookAt(...target);
 const renderer=new T.WebGLRenderer({antialias:false});renderer.setSize(640,360);renderer.domElement.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:999999;image-rendering:pixelated';document.body.append(renderer.domElement);renderer.render(scene,camera);return renderer.info.render;
},{pos,target,phase});await page.screenshot({path:`docs/station-remaster/${phase}-${name}.png`});console.log(name,stats);await page.reload();
}
}finally{await browser.close();}
