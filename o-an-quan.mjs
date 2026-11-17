export const quanPits=[5,11];
export const playerPits=[[0,1,2,3,4],[10,9,8,7,6]];
const isQuan=id=>id>=50;
const next=(index,direction)=>(index+direction+12)%12;
const own=(state)=>playerPits[state.player];

export function newQuanGame(){
  let seed=0;
  return {
    pits:Array.from({length:12},(_,i)=>quanPits.includes(i)?[50+quanPits.indexOf(i)]:Array.from({length:5},()=>seed++)),
    banks:[[],[]],hand:[],handPit:null,debt:[0,0],player:0,finished:false
  };
}

export function quanScore(state,player){
  return state.banks[player].reduce((total,seed)=>total+(isQuan(seed)?10:1),state.debt[player]);
}

export function quanMove(state,index,direction){
  if(state.finished||!own(state).includes(index)||!state.pits[index].length||![1,-1].includes(direction))return [];
  const frames=[];
  const send=(kind,pit,message,action)=>{
    const before=state;
    state={...state,pits:state.pits.map(p=>p.slice()),banks:state.banks.map(b=>b.slice()),hand:state.hand.slice(),debt:state.debt.slice()};
    const moving=action(state)??[];
    frames.push({kind,pit,fromPit:before.handPit,direction,message,before,after:state,moving});
  };
  const name=pit=>quanPits.includes(pit)?'ô quan '+(pit===5?'phải':'trái'):'ô '+(pit<=4?pit+1:11-pit)+' của '+(pit<=4?'A':'B');
  const pickup=pit=>send('pickup',pit,'Bốc quân ở '+name(pit)+'.',s=>{
    s.handPit=pit;
    s.hand=s.pits[pit].splice(0);
    return s.hand;
  });
  let at=index;
  for(;;){
    pickup(at);
    while(state.hand.length){
      at=next(at,direction);
      send('drop',at,'Rải 1 quân vào '+name(at)+'.',s=>{
        s.handPit=at;
        const seed=s.hand.shift();
        s.pits[at].push(seed);
        return [seed];
      });
    }
    const adjacent=next(at,direction);
    if(state.pits[adjacent].length){
      if(quanPits.includes(adjacent))break;
      at=adjacent;
      continue;
    }
    at=next(adjacent,direction);
    while(state.pits[at].length){
      const captured=at;
      send('capture',captured,'Qua một ô trống, ăn '+name(captured)+'.',s=>{
        s.handPit=captured;
        const seeds=s.pits[captured].splice(0);
        s.banks[s.player].push(...seeds);
        return seeds;
      });
      if(quanPits.every(pit=>state.pits[pit].every(seed=>!isQuan(seed))))break;
      const gap=next(at,direction);
      if(state.pits[gap].length)break;
      at=next(gap,direction);
    }
    break;
  }
  const settle=()=>send('finish',null,'Hết ván. Mỗi bên thu quân dân còn lại bên mình.',s=>{
    s.finished=true;
    s.handPit=null;
    return playerPits.flatMap((pits,player)=>pits.flatMap(p=>{
      const seeds=s.pits[p].splice(0);
      s.banks[player].push(...seeds);
      return seeds;
    }));
  });
  if(quanPits.every(pit=>state.pits[pit].every(seed=>!isQuan(seed)))){settle();return frames;}
  const other=1-state.player;
  send('turn',null,'Đến lượt người '+(other?'B':'A')+'.',s=>{s.player=other;s.handPit=null;});
  if(own(state).some(p=>state.pits[p].length))return frames;
  const savings=state.banks.flat().filter(seed=>!isQuan(seed)).length;
  if(savings<5){
    if(playerPits[1-state.player].some(p=>state.pits[p].length)){
      send('turn',null,'Thiếu quân dân để bày lại. Lượt trở về người '+(other?'A':'B')+'.',s=>{s.player=1-s.player;});
    }else settle();
    return frames;
  }
  for(const pit of own(state)){
    send('refill',pit,'Bày lại 1 quân dân vào '+name(pit)+'.',s=>{
      const current=s.player,ownIndex=s.banks[current].findIndex(seed=>!isQuan(seed));
      const lender=ownIndex<0?1-current:current;
      if(lender!==current){s.debt[current]--;s.debt[lender]++;}
      const index=s.banks[lender].findIndex(seed=>!isQuan(seed));
      const [seed]=s.banks[lender].splice(index,1);
      s.pits[pit].push(seed);
      return [seed];
    });
  }
  return frames;
}

const experimentSeeds=Array.from({length:8},(_,i)=>i);

export function drawWithReplacement(n,rng=Math.random){
  const slots=Array.from({length:n},()=>Math.floor(rng()*experimentSeeds.length));
  const view=slots.map(slot=>slot<2);
  return {view,success:view.some(Boolean),detail:{slots}};
}

const ease=t=>t*t*(3-2*t);
export const drawObservation=.48;

export function replacementFrame(slots,progress=1){
  const slot=slots?.at(-1);
  const moving=slot!==undefined&&progress>0&&progress<1;
  const phase=progress<drawObservation?'lift':progress<.63?'observe':'return';
  const observed=Math.max(0,(slots?.length??0)-Number(progress<drawObservation&&slot!==undefined));
  return {
    resting:experimentSeeds.filter(seed=>!moving||seed!==slot),
    slot:moving?slot:null,phase,
    travel:phase==='lift'?ease(progress/drawObservation):phase==='return'?1-ease((progress-.63)/.37):1,
    observations:slots?.slice(0,observed)??[]
  };
}
