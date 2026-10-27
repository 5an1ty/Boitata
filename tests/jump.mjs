import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.route('**/jump-test',r=>r.fulfill({contentType:'text/html',body:'<canvas></canvas>'}));await page.goto('http://localhost:5173/jump-test');
 const result=await page.evaluate(async()=>{
  const {PerspectiveCamera,Vector3}=await import('/node_modules/.vite/deps/three.js');
  const {InputManager}=await import('/src/input/InputManager.ts'),{PlayerController}=await import('/src/player/PlayerController.ts'),{CameraController}=await import('/src/player/CameraController.ts'),{CollisionSystem}=await import('/src/systems/CollisionSystem.ts');
  const input=new InputManager(document.querySelector('canvas'));input.enabled=true;
  const key=(repeat=false)=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',repeat,cancelable:true}));
  const heights=[];
  for(const fps of [30,60,120]){
   const player=new PlayerController(new CameraController(new PerspectiveCamera()),new CollisionSystem());input.reset();key();let max=0;
   for(let i=0;i<fps*2;i++){if(i===Math.floor(fps*.2))key();else if(i>0)key(true);player.update(input,1/fps);max=Math.max(max,player.position.y);}
   if(player.position.y!==1.65)throw Error('Não pousou ou repetiu salto ao segurar');heights.push(max);
  }
  const collision=new CollisionSystem();collision.add(new Vector3(5,2.3,15),new Vector3(3,.2,3));
  const player=new PlayerController(new CameraController(new PerspectiveCamera()),collision);input.reset();key();let max=0;
  for(let i=0;i<120;i++){player.update(input,1/60);max=Math.max(max,player.position.y);if(collision.blocked(player.position,.28))throw Error('Atravessou teto');}
  if(max>2.05||player.position.y!==1.65)throw Error('Colisão vertical falhou');
  input.enabled=false;key();if(input.consumeJump())throw Error('Salto durante pausa');input.enabled=true;key();input.reset();if(input.consumeJump())throw Error('Salto acumulado após reset');input.dispose();return {heights,ceilingMax:max};
 });assert(result.heights.every(y=>y>2.4&&y<2.56));console.log('PASS: Espaço, 30/60/120 FPS, sem salto duplo/repetição, teto, pouso e reset/pausa.',result);
}finally{await browser.close();}
