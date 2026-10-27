import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage();await page.route('**/free-test',r=>r.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://localhost:5173/free-test');
console.log(await page.evaluate(async()=>{
 const {Scene,PerspectiveCamera,WebGLRenderer,Vector3}=await import('/node_modules/.vite/deps/three.js');
 const {GameWorld}=await import('/src/world/GameWorld.ts'),{CollisionSystem}=await import('/src/systems/CollisionSystem.ts'),{GraphicsSettings}=await import('/src/systems/GraphicsSettings.ts'),{ChapterOne}=await import('/src/story/ChapterOne.ts'),{validateSave}=await import('/src/story/SaveManager.ts');
 const {CampaignManager}=await import('/src/campaign/CampaignManager.ts'),{CreatureEncounter}=await import('/src/creature/CreatureEncounter.ts'),{CHAPTERS}=await import('/src/data/campaign.ts'),{validCampaign}=await import('/src/campaign/CampaignSave.ts');
 localStorage.clear();const root=document.querySelector('#root'),scene=new Scene(),camera=new PerspectiveCamera(),renderer=new WebGLRenderer(),graphics=new GraphicsSettings(renderer),world=new GameWorld(scene,new CollisionSystem()),chapter=new ChapterOne(world,root,graphics,()=>{}),creature=new CreatureEncounter(world,root,()=>{}),campaign=new CampaignManager(chapter,world,creature,scene,camera,root,()=>{});
 const assert=(value,message)=>{if(!value)throw Error(message);};
 const use=(p,target,label)=>{const position=new Vector3(...p),direction=new Vector3(...target).sub(position).normalize(),object=chapter.interaction.find(position,direction);assert(object?.label.includes(label),`Alvo ${label}: ${object?.label}`);return object.use(position);};
 chapter.start();for(let i=0;i<20;i++)chapter.dialogue.advance();
 use([15.8,1.65,-10.8],[15.8,1,-11.3],'GAVETA');assert(chapter.flags.has('drawer')&&!chapter.objectives.facts.has('counter'),'Gaveta ainda exige balcão');
 use([15.8,1.65,-10.8],[15.8,1.45,-11.12],'CHAVE');world.station.doors[2].use(new Vector3(7,1.65,-19));use([7,1.65,-22],[7,1.05,-24],'FUSÍVEL');
 use([28,1.65,-14],[28,1.2,-15],'ABASTECIMENTO');assert(chapter.inventory.has('logFuel'),'Coleta anterior ao capítulo bloqueada');
 use([25,1.65,-14.5],[25,1.4,-16.4],'GERADOR');chapter.installFuse();[2,1,3].forEach(n=>chapter.pressSwitch(n));assert(chapter.puzzles.has('generator')&&!chapter.inventory.has('note'),'Gerador exige anotação');
 for(let i=0;i<120;i++){world.update(.05,new Vector3(25,1.65,-14.5),28);chapter.update(.05,new Vector3(25,1.65,-14.5),new Vector3(0,0,-1));}
 use([14,1.65,-10.8],[14,1.65,-11.5],'CÂMERA');for(let i=0;i<150;i++)chapter.update(.05,new Vector3(14,1.65,-10.8),new Vector3(0,0,-1));chapter.ui.overlay.querySelector('button').click();for(let i=0;i<20;i++){chapter.dialogue.advance();chapter.dialogue.update(1);}
 const save=chapter.saves.load();assert(save&&validateSave(save)&&save.chapter===2,'Save sem leituras opcionais rejeitado: '+localStorage.getItem('boitata-save-v1'));assert(!save.objectives.includes('counter')&&!save.objectives.includes('note'),'Leituras foram concluídas artificialmente');
 const restored=new ChapterOne(new GameWorld(new Scene(),new CollisionSystem()),document.createElement('div'),graphics,()=>{});assert(restored.flags.has('ending')&&!restored.inventory.has('note'),'Reload sem anotação falhou');restored.dispose();
 for(const [id,p,t]of [['TRANSPORTE',[45,1.65,43.5],[45,1.4,45.3]],['GRAVAÇÃO',[39,1.65,43.5],[39,1.4,45.3]],['FOTOGRAFIA',[33,1.65,43.5],[33,1.4,45.3]]])use(p,t,id);
 assert(['transport','recording','burnPhoto'].every(id=>chapter.inventory.has(id)),'Ordem livre das evidências bloqueada');
 campaign.chapters.ready=true;campaign.chapters.current=3;for(const [id]of CHAPTERS[2].objectives)campaign.chapters.completed.add(`2.${id}`);
 world.interactions.find(i=>i.position.x===20&&i.position.z===44).use(new Vector3(20,1.65,42.5));
 const selects=chapter.ui.overlay.querySelectorAll('select');['153.40','12','REDE'].forEach((v,i)=>selects[i].value=v);[...chapter.ui.overlay.querySelectorAll('button')].find(b=>b.textContent==='Verificar e rearmar').click();assert(campaign.flags.has('transmitter')&&!chapter.inventory.has('transmitterManual'),'Transmissor exige leitura');
 const data={version:1,chapter:4,completed:[...CHAPTERS[2].objectives.map(([id])=>`2.${id}`),...CHAPTERS[3].objectives.map(([id])=>`3.${id}`),'4.return','4.equipment','4.evidence'],flags:['transmitter','payload','forestRelay'],checkpoint:'final',ending:null,seconds:1};assert(validCampaign(data),'Save ainda exige relé da estrada primeiro');
 globalThis.freeFixture={scene,camera,renderer};
 return 'PASS: gaveta direta, coleta antecipada/invertida, gerador e transmissor sem leitura obrigatória, final/reload sem objetivos opcionais e relés em ordem livre.';
}));
await page.evaluate(async()=>{const T=await import('/node_modules/.vite/deps/three.js');const {scene,camera,renderer}=globalThis.freeFixture;document.querySelector('#root').hidden=true;scene.add(new T.AmbientLight(0xe3debd,.65));const lamp=new T.PointLight(0xffffff,5,6,2);lamp.position.set(17.8,2.1,-10.6);scene.add(lamp);camera.aspect=16/9;camera.position.copy(lamp.position);camera.lookAt(17.8,1.455,-11.65);camera.updateProjectionMatrix();renderer.setSize(960,540);renderer.domElement.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;image-rendering:pixelated';document.body.append(renderer.domElement);renderer.render(scene,camera);});
await page.screenshot({path:'docs/station-remaster/counter-document.png'});
}finally{await browser.close();}
