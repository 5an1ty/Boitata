import {chromium} from 'playwright-core';
const phase='interior-v2';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage({viewport:{width:1280,height:720}});await page.route('**/station-capture',route=>route.fulfill({contentType:'text/html',body:'<html><body style="margin:0"></body></html>'}));await page.goto('http://localhost:5173/station-capture');
for(const [name,pos,target] of [['layout',[7,2,-12],[9,1.8,-22]],['shelves',[8.5,1.7,-12],[11,1.2,-14]],['bathroom',[1.7,1.5,-22.5],[.3,.7,-24]],['ledger',[29.3,1.8,-13],[28,1.05,-15]]]){
const stats=await page.evaluate(async({pos,target,phase})=>{
 const T=await import('/node_modules/.vite/deps/three.js');const {GasStation}=await import('/src/world/GasStation.ts');const {WorldAssets}=await import('/src/world/WorldAssets.ts');const {CollisionSystem}=await import('/src/systems/CollisionSystem.ts');
 const scene=new T.Scene();scene.background=new T.Color(0x081015);scene.fog=new T.Fog(0x081015,18,60);scene.add(new T.AmbientLight(0x869487,.55));const assets=new WorldAssets(new CollisionSystem()),station=new GasStation(assets);const {CampaignWorld}=await import('/src/campaign/CampaignWorld.ts');new CampaignWorld({assets,station},{inventory:{has:()=>false}},(label,position,use)=>({label,position,use}),()=>'',()=>'');scene.add(station.group);
 // Fixed comparison rig: identical positions, intensities and colors in both captures.
 if(false)station.lights.forEach((l,i)=>{l.color.setHex([0xc7e4ce,0xc7d3ac,0x91b4a5][i]);l.intensity=[34,28,18][i];});
 const camera=new T.PerspectiveCamera(68,1280/720,.08,90);camera.position.fromArray(pos);camera.lookAt(...target);const inspectionLight=new T.PointLight(0xe3debd,8,8,2);inspectionLight.position.copy(camera.position);scene.add(inspectionLight);
 const renderer=new T.WebGLRenderer({antialias:false});renderer.setSize(640,360);renderer.domElement.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:999999;image-rendering:pixelated';document.body.append(renderer.domElement);renderer.render(scene,camera);return renderer.info.render;
},{pos,target,phase});await page.screenshot({path:`docs/station-remaster/${phase}-${name}.png`});console.log(name,stats);await page.reload();
}
}finally{await browser.close();}
