import {drawScene} from './scene.mjs';
import {newQuanGame,playerPits,quanMove,quanScore} from './o-an-quan.mjs';

export function mountQuanGame(panel){
  const canvas=panel.querySelector('canvas');
  const status=panel.querySelector('[role=status]');
  const choices=panel.querySelector('.quan-pit-buttons');
  const directions=Array.from(panel.querySelectorAll('[data-quan-direction]'));
  const scores=Array.from(panel.querySelectorAll('.quan-scores output'));
  const speed=panel.querySelector('select');
  const hand=panel.querySelector('[data-quan-hand]');
  let state=newQuanGame(),selected=null,frameId=0,activeEvent=null,progress=1,hitPoints=[];
  const redraw=()=>{
    if(panel.hidden||!canvas.clientWidth)return;
    drawScene(canvas,'extension',{x:0},.06,null,null,1,.77,-1,{
      id:81,game:{state,event:activeEvent,progress,selected},registerTargets:points=>{hitPoints=points;}
    },{id:81,approvedExpansion:true,orthographic:true});
  };
  const buttons=Array.from({length:5},(_,i)=>{
    const button=document.createElement('button');
    button.type='button';button.className='outline';
    button.addEventListener('click',()=>select(playerPits[state.player][i]));
    choices.append(button);return button;
  });
  function display(message){
    const shown=activeEvent?.before??state;
    for(const [player,output] of scores.entries())output.textContent=(player===0?'A':'B')+' · '+quanScore(shown,player)+' điểm';
    hand.textContent=shown.hand.length?'Đang cầm '+shown.hand.length+' quân':'';
    hand.hidden=!shown.hand.length;
    if(message)status.textContent=message;
    for(const [i,button] of buttons.entries()){
      const pit=playerPits[shown.player][i],count=shown.pits[pit].length;
      button.textContent=(i+1)+' · '+count;
      button.setAttribute('aria-label','Ô '+(i+1)+' của '+(shown.player?'B':'A')+', '+count+' quân');
      button.setAttribute('aria-pressed',String(selected===pit));
      button.disabled=Boolean(activeEvent)||state.finished||count===0;
    }
    for(const direction of directions)direction.disabled=Boolean(activeEvent)||state.finished||selected===null;
    canvas.setAttribute('aria-label','Bàn ô ăn quan. '+status.textContent);
    redraw();
  }
  function select(pit){
    if(state.finished||activeEvent||!playerPits[state.player].includes(pit)||!state.pits[pit].length)return;
    selected=pit;
    display('Đã chọn ô '+(playerPits[state.player].indexOf(pit)+1)+'. Chọn chiều rải.');
  }
  function play(direction){
    const frames=quanMove(state,selected,direction);
    if(!frames.length||activeEvent)return;
    selected=null;
    const finish=()=>{
      state=frames.at(-1).after;
      activeEvent=null;progress=1;frameId=0;
      const delta=quanScore(state,0)-quanScore(state,1);
      display(state.finished?(delta?'Người '+(delta>0?'A':'B')+' thắng.':'Hai bên hòa.'):
        'Lượt người '+(state.player?'B':'A')+'. Chọn ô dân có quân.');
    };
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
    let index=0,start=null;
    function advance(){
      activeEvent=frames[index];state=activeEvent.after;progress=0;
      display(activeEvent.message);
    }
    function tick(now){
      start??=now;
      const base=activeEvent.kind==='drop'?430:activeEvent.kind==='capture'?680:activeEvent.kind==='turn'?210:440;
      progress=Math.min(1,(now-start)/(base/Number(speed.value)));
      redraw();
      if(progress===1){
        index++;
        if(index>=frames.length){finish();return;}
        start=now;advance();
      }
      frameId=requestAnimationFrame(tick);
    }
    advance();frameId=requestAnimationFrame(tick);
  }
  for(const direction of directions)direction.addEventListener('click',()=>play(Number(direction.dataset.quanDirection)));
  panel.querySelector('[data-quan-reset]').addEventListener('click',()=>{
    cancelAnimationFrame(frameId);frameId=0;activeEvent=null;progress=1;selected=null;state=newQuanGame();
    display('Lượt người A. Chọn ô dân có quân.');
  });
  canvas.addEventListener('click',event=>{
    const rect=canvas.getBoundingClientRect();
    const x=event.clientX-rect.left,y=event.clientY-rect.top;
    const target=hitPoints.map(([id,a,b,r])=>[id,Math.hypot(a-x,b-y),r])
      .filter(([,distance,r])=>distance<=r).sort((a,b)=>a[1]-b[1])[0];
    if(target)select(target[0]);
  });
  new ResizeObserver(redraw).observe(canvas);
  return ()=>display(status.textContent||'Lượt người A. Chọn ô dân có quân.');
}
