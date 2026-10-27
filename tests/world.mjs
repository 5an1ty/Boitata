import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.GAME_URL??'http://127.0.0.1:5173');
 await page.getByRole('button',{name:'Configurações',exact:true}).click();await page.getByLabel('Distância de renderização').selectOption('28');await page.locator('select').first().selectOption('Baixo');await page.getByRole('button',{name:'← Voltar'}).click();await page.getByRole('button',{name:/Novo jogo/}).click();for(let i=0;i<14;i++)await page.keyboard.press('e');await page.keyboard.press('f');assert.match(await page.locator('.lamp-status').innerText(),/DESLIGADA/);await page.keyboard.press('Escape');await page.getByRole('button',{name:'Retomar jogo'}).waitFor();
 const result=await page.evaluate(async()=>{
   const {Scene,Vector3,PerspectiveCamera,WebGLRenderer}=await import('/node_modules/.vite/deps/three.js');
   const {GameWorld}=await import('/src/world/GameWorld.ts'),{CollisionSystem}=await import('/src/systems/CollisionSystem.ts');
   const scene=new Scene(),collisions=new CollisionSystem(),world=new GameWorld(scene,collisions),p=new Vector3(0,1.65,13);
   function go(x,z){const steps=Math.ceil(Math.hypot(x-p.x,z-p.z)/.09);for(let i=0;i<steps;i++){world.forest.update(p,28);collisions.move(p,(x-p.x)/(steps-i),(z-p.z)/(steps-i));}if(Math.hypot(x-p.x,z-p.z)>.05)throw new Error(`Rota bloqueada: destino ${x},${z}; posição ${p.x},${p.z}`);}
   go(5,13);go(5,-8);go(7,-8);
   const entrance=world.station.doors[0];collisions.move(p,0,-4);if(p.z<-9.65)throw new Error('Porta fechada atravessada');p.set(7,1.65,-8);entrance.use(p);go(7,-12);go(7,-19);
   go(5,-19);world.station.doors[1].use(p);go(2.5,-19);go(1,-23);go(2.5,-19);go(5,-19);go(7,-19);
   for(const [i,x]of [[2,7],[3,13]]){go(x,-19);world.station.doors[i].use(p);go(x,-23);go(x,-19);}
   go(14.5,-19);go(14.5,-18);world.station.doors[4].use(p);go(18,-18);go(19,-23);go(18,-18);go(14.5,-18);go(14.5,-19);
   go(7,-19);go(7,-8);entrance.use(p);if(entrance.open)throw new Error('Porta não fechou');
   go(5,-8);go(5,13);go(-12,13);go(0,13);go(0,39);go(18,39);go(18,42);
   const gate=world.station.doors.at(-1);const gateBlocked=collisions.blocked(new Vector3(25,1.65,0),.28);gate.use(new Vector3(25,1.65,2));if(!gateBlocked||collisions.blocked(new Vector3(25,1.65,0),.28))throw new Error('Estado do portão incorreto');
   // Solid props: pumps, vehicles, shop furniture, rear wall and a streamed tree trunk.
   for(const [x,z]of [[2,2],[17,4],[-5,-3],[17,-12],[10,-26]])if(!collisions.blocked(new Vector3(x,1.65,z),.28))throw new Error(`Colisão ausente ${x},${z}`);
   const before=world.forest.active.size;world.forest.update(new Vector3(-55,1.65,-55),28);const after=world.forest.active.size;
   if(after>=before)throw new Error('Setores distantes não descarregaram');world.forest.update(new Vector3(0,1.65,13),48);
   const tree=collisions.solids.find(b=>b.min.y===0&&b.max.y>5);if(!tree||!collisions.blocked(new Vector3((tree.min.x+tree.max.x)/2,1.65,(tree.min.z+tree.max.z)/2),.28))throw new Error('Árvore sem colisão');
   const renderer=new WebGLRenderer({antialias:false});renderer.setSize(422,195);const camera=new PerspectiveCamera(68,422/195,.08,48);camera.position.set(0,1.65,13);camera.lookAt(5,1.7,-10);scene.add(camera);
   const times=[];let maxCalls=0;for(let i=0;i<35;i++){const t=performance.now();world.update(1/30,camera.position,28);renderer.render(scene,camera);renderer.getContext().finish();times.push(performance.now()-t);maxCalls=Math.max(maxCalls,renderer.info.render.calls);}
   times.sort((a,b)=>a-b);const metrics={medianMs:times[17],p95Ms:times[33],drawCalls:maxCalls,triangles:renderer.info.render.triangles};
   world.dispose();renderer.dispose();return {routes:'loja, quatro cômodos, rodovia, trilha e clareira',sectors:{before,after},metrics};
 });console.log(JSON.stringify(result,null,2));
 const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));await mp.goto(process.env.GAME_URL??'http://127.0.0.1:5173');await mp.getByRole('button',{name:/Novo jogo/}).click();await mp.locator('.subtitles').waitFor({state:'visible'});await mp.getByRole('button',{name:'Avançar · E',exact:true}).tap();for(let i=0;i<14;i++)await mp.keyboard.press('e');await mp.locator('.subtitles').waitFor({state:'hidden'});await mp.locator('.joystick').waitFor({state:'visible'});
 const cdp=await mobile.newCDPSession(mp),joy=await mp.locator('.joystick').boundingBox();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:joy.x+joy.width/2,y:joy.y+joy.height/2,id:1},{x:550,y:130,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:joy.x+joy.width/2,y:joy.y+15,id:1},{x:600,y:150,id:2}]});await mp.waitForTimeout(300);assert.match(await mp.locator('.joystick span').getAttribute('style'),/translate/);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await mp.getByRole('button',{name:'Pausar',exact:true}).dispatchEvent('pointerdown',{pointerId:3});await mp.getByRole('button',{name:'Retomar jogo'}).waitFor();await mp.setViewportSize({width:390,height:844});assert(await mp.getByText('Gire o aparelho').isVisible());assert.deepEqual(errors,[]);console.log('PASS: rotas, colisões, portas/portão, setores, desktop e mobile (dois toques CDP). Sem erros JS.');
} finally {await browser.close();}
