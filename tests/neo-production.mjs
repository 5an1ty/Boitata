import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const root=resolve('dist'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local');if(!url.pathname.startsWith('/Boitata/'))throw Error();const path=resolve(root,'.'+url.pathname.slice(8)+(url.pathname.endsWith('/')?'index.html':''));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',types[extname(path)]??'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/Boitata/`;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [width,height,mobile]of [[1280,720,false],[960,540,true],[844,390,true],[800,360,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});await context.addInitScript(()=>localStorage.setItem('boitata-settings-v1',JSON.stringify({version:1,values:{quality:'Baixo',resolution:.4,psx:true}})));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});await page.goto(base);
  await page.getByRole('button',{name:'Configurações',exact:true}).click();
  for(const name of ['Granulação','Dithering','Color grading','Aberração cromática','Vinheta','Distorção de lente','Bloom','Anti-aliasing']){const slider=page.getByRole('slider',{name,exact:true});await slider.evaluate(el=>{el.value='.2';el.dispatchEvent(new Event('input',{bubbles:true}));});}
  assert(await page.locator('.settings-scroll').evaluate(el=>el.scrollHeight>el.clientHeight));
  const values=await page.evaluate(()=>JSON.parse(localStorage.getItem('boitata-settings-v1')).values);for(const key of ['grain','dither','grading','chromatic','vignette','distortion','bloom','antialias'])assert.equal(values[key],.2);
  await page.getByLabel('Efeito PSX',{exact:true}).uncheck();await page.getByLabel('Efeito PSX',{exact:true}).check();await page.getByLabel('Reduzir flashes',{exact:true}).check();await page.getByRole('button',{name:'← Voltar',exact:true}).click();await page.getByRole('button',{name:'Novo jogo',exact:true}).click();await page.locator('.subtitles').waitFor({state:'visible'});await page.waitForTimeout(600);
  assert.equal(await page.locator('canvas').count(),1);assert(await page.locator('canvas').evaluate(c=>c.getContext('webgl2')!==null));assert.deepEqual(errors,[]);console.log(`PASS produção Neo-PSX ${width}x${height}: preferências antigas, oito controles, bypass, acessibilidade, início e assets em subpasta sem erro de shader.`);await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
