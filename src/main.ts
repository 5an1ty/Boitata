import './style.css';
import { Game } from './core/Game';
const root=document.querySelector<HTMLElement>('#app')!;
let game:Game|undefined;
function launch(start=false):void {
 try {game?.dispose();root.replaceChildren();game=new Game(root);game.onReset=()=>launch(true);if(start)game.start();}
 catch(error){console.error('Falha ao iniciar BOITATÁ:',error);root.replaceChildren();const panel=document.createElement('div');panel.className='fatal';const title=document.createElement('h1');title.textContent='SINAL PERDIDO';const text=document.createElement('p');text.textContent='Não foi possível iniciar o WebGL. Verifique a aceleração gráfica do navegador e tente novamente.';const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=()=>launch();panel.append(title,text,retry);root.append(panel);}
}
launch();
