import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});await page.goto(process.env.GAME_URL??'http://127.0.0.1:5173');
 const result=await page.evaluate(async()=>{
  const {Scene,Vector3,WebGLRenderer}=await import('/node_modules/.vite/deps/three.js');
  const {GameWorld}=await import('/src/world/GameWorld.ts'),{CollisionSystem}=await import('/src/systems/CollisionSystem.ts'),{ChapterOne}=await import('/src/story/ChapterOne.ts'),{GraphicsSettings}=await import('/src/systems/GraphicsSettings.ts'),{SaveManager,validateSave}=await import('/src/story/SaveManager.ts');
  localStorage.removeItem(SaveManager.key);const root=document.createElement('div');root.id='chapter-test';root.style.cssText='position:fixed;inset:0;z-index:100';document.body.append(root);
  const collisions=new CollisionSystem(),world=new GameWorld(new Scene(),collisions),renderer=new WebGLRenderer(),graphics=new GraphicsSettings(renderer),messages=[];const chapter=new ChapterOne(world,root,graphics,m=>messages.push(m));
  const p=new Vector3(5,1.65,15),direction=new Vector3(0,0,-1);chapter.start();for(let i=0;i<20;i++)chapter.dialogue.advance();
  const tick=(dt=.05)=>{world.update(dt,p,28);chapter.update(dt,p,direction);};
  const aim=(x,y,z)=>{direction.set(x,y,z).sub(p).normalize();tick(0);};
  const interact=(x,y,z,label)=>{aim(x,y,z);const item=chapter.interaction.find(p,direction);if(!item||!item.label.includes(label))throw new Error(`Raycast incorreto: ${label}, recebido ${item?.label} em ${p.toArray()}`);chapter.interact();};
  function go(x,z){const steps=Math.ceil(Math.hypot(x-p.x,z-p.z)/.1);for(let i=0;i<steps;i++){world.forest.update(p,28);collisions.move(p,(x-p.x)/(steps-i),(z-p.z)/(steps-i));tick(.01);}if(Math.hypot(x-p.x,z-p.z)>.05)throw new Error(`Caminho bloqueado: ${x},${z}; ${p.toArray()}`);}
  if(chapter.objectives.completed.length)throw new Error('Objetivo concluído sem ação');
  const depot=world.station.doors[2];if(!depot.use(new Vector3(7,1.65,-19)).includes('Trancado')||depot.open)throw new Error('Depósito sem trava');
  if(chapter.interaction.find(new Vector3(10,1.65,-28),new Vector3(0,0,1)))throw new Error('Interação atravessa parede');
  go(5,-8);go(7,-8);interact(7,1.4,-10,'VIDRO');go(7,-10.8);go(17.8,-10.8);interact(17.8,1.45,-11.3,'BALCÃO');go(15.8,-10.8);interact(15.8,1,-11.3,'GAVETA');interact(15.8,1.45,-11.12,'Chave'.toUpperCase());
  go(19.5,-10.8);interact(19.5,1.5,-11.3,'FITA');go(7,-10.8);go(7,-19);interact(7,1.4,-20,'DEPÓSITO');go(7,-22);interact(7,1.05,-24,'FUSÍVEL');interact(5.5,1.5,-22,'FOTOGRAFIAS');go(7,-19);go(14.5,-19);go(14.5,-18);interact(16,1.4,-18,'ELÉTRICA');go(18,-18);go(19,-21);interact(19,1.4,-22,'ANOTAÇÃO');go(20,-21);go(20,-22.7);go(18,-22.7);go(18,-23.5);interact(17.4,1.2,-24,'REGISTRO');go(18,-22.7);go(20,-22.7);go(20,-21);go(19,-21);go(18,-18);go(14.5,-18);go(14.5,-19);go(7,-19);go(7,-8);go(23,-8);go(23,-13);go(25,-13);go(25,-14.5);
  interact(25,1.4,-16.4,'GERADOR');
  globalThis.chapterFixture={chapter,world,p,direction,tick,go,interact,messages,SaveManager,validateSave,renderer,graphics};
  return {beforePuzzle:chapter.objectives.completed,inventory:[...chapter.inventory.items.keys()]};
 });console.log(result);
 const panel=page.locator('#chapter-test .chapter-overlay');await panel.getByRole('button',{name:'Instalar fusível',exact:true}).click();await panel.getByRole('button',{name:'Interruptor 3',exact:true}).click();assert.match(await page.locator('#chapter-test .chapter-overlay').innerText(),/aguardando/);
 await panel.getByRole('button',{name:'Consultar anotação',exact:true}).click();await panel.getByRole('button',{name:'Interruptor 2',exact:true}).click();await panel.getByRole('button',{name:'Interruptor 1',exact:true}).click();await panel.getByRole('button',{name:'Interruptor 3',exact:true}).click();
 const finished=await page.evaluate(()=>{
  const f=globalThis.chapterFixture,{chapter:c}=f;if(!c.puzzles.has('generator'))throw new Error('Puzzle não resolveu');for(let i=0;i<120;i++)f.tick(.05);
  f.go(25,-13);f.go(23,-13);f.go(23,-8);f.go(7,-8);f.go(7,-10.8);f.go(14,-10.8);f.interact(14,1.65,-11.5,'CÂMERA');
  if(c.objectives.facts.has('camera'))throw new Error('Câmera completou por aproximação');c.ui.overlay.querySelector('button').click();if(c.objectives.facts.has('camera'))throw new Error('Gravação não respeitou o tempo mínimo');for(let i=0;i<150;i++)f.tick(.05);return {objectives:c.objectives.completed,events:[...c.horror.executed]};
 });console.log(finished);await panel.getByRole('button',{name:'Encerrar gravação',exact:true}).click();
 const saved=await page.evaluate(()=>{
  const f=globalThis.chapterFixture,c=f.chapter;for(let i=0;i<8;i++)c.dialogue.advance();for(let i=0;i<120;i++)f.tick(.05);
  if(!c.objectives.finished||!c.flags.has('ending'))throw new Error('Capítulo não terminou');const save=c.saves.load();if(!save||save.chapter!==2||save.events.length!==6)throw new Error('Save final incompleto');
  const count=c.horror.executed.size;for(let i=0;i<100;i++)f.tick(.05);if(c.horror.executed.size!==count)throw new Error('Sustos repetidos');
  const invalid=structuredClone(save);invalid.version=99;if(f.validateSave(invalid))throw new Error('Versão incompatível aceita');const prototypeItem=structuredClone(save);prototypeItem.items.toString='available';if(f.validateSave(prototypeItem))throw new Error('Identificador de protótipo aceito');const invalid2=structuredClone(save);invalid2.items.fuse='cheat';if(f.validateSave(invalid2))throw new Error('Item inválido aceito');
  localStorage.setItem(f.SaveManager.key,'{corrompido');if(c.saves.load()!==null||!c.saves.warning)throw new Error('Save corrompido não tratado');localStorage.setItem(f.SaveManager.key,JSON.stringify(save));
  const setItem=Storage.prototype.setItem;try{Storage.prototype.setItem=()=>{throw new DOMException('Quota','QuotaExceededError');};if(c.saves.save(save)||!c.saves.warning)throw new Error('Falha de armazenamento não tratada');}finally{Storage.prototype.setItem=setItem;}
  return save;
 });assert.equal(saved.chapter,2);assert.equal(saved.objectives.length,10);assert.equal(Object.keys(saved.items).length,8);assert(saved.events.includes('blackout'));
 await page.reload();await page.getByRole('button',{name:/Continuar/}).click();await page.waitForFunction(()=>document.querySelector('.objective')?.textContent?.includes('CAPÍTULO 2'));await page.locator('.subtitles').waitFor({state:'visible'});for(let i=0;i<6;i++)await page.keyboard.press('e');await page.locator('.subtitles').waitFor({state:'hidden'});
 await page.keyboard.press('i');await page.getByRole('button',{name:/Lanterna · disponível/}).click();assert.match(await page.locator('.item-description').innerText(),/alternado/);await page.getByRole('button',{name:'Fechar inventário',exact:true}).click();await page.keyboard.press('Escape');await page.getByRole('button',{name:/Retomar jogo/}).waitFor();
 const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});await mobile.addInitScript(save=>localStorage.setItem('boitata-save-v1',JSON.stringify(save)),saved);const mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));await mp.goto(process.env.GAME_URL??'http://127.0.0.1:5173');await mp.getByRole('button',{name:/Continuar/}).click();await mp.locator('.subtitles').waitFor({state:'visible'});for(let i=0;i<6;i++)await mp.keyboard.press('e');await mp.locator('.subtitles').waitFor({state:'hidden'});await mp.getByRole('button',{name:'I · INVENTÁRIO',exact:true}).tap();await mp.getByRole('button',{name:/Anotação do funcionário/}).tap();assert.match(await mp.locator('.item-description').innerText(),/2 → 1 → 3/);await mp.getByRole('button',{name:'Fechar inventário',exact:true}).tap();await mp.locator('.joystick').waitFor({state:'visible'});assert.deepEqual(errors,[]);console.log('PASS: capítulo completo por raycast e rotas com colisão, inventário, puzzle incorreto/correto, 10 objetivos, 6 eventos, save/load/corrupção, final e mobile.');
}finally{await browser.close();}
