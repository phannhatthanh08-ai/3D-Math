import {playerPits,quanPits,replacementFrame} from './o-an-quan.mjs';

const TAU=Math.PI*2;
const red='#cb6453',green='#56acac',cream='#f3dcae',wood='#986b45';
const ring=(x,y,z,rx,ry=rx)=>Array.from({length:28},(_,i)=>[x+rx*Math.cos(i*TAU/28),y+ry*Math.sin(i*TAU/28),z]);
const lineRing=(api,x,y,z,rx,ry,color,width=1)=>api.loop(ring(x,y,z,rx,ry),color,width);
export function pitPosition(i){
  if(i===5||i===11)return [i===5?4.46:-4.46,0];
  return i<5?[(i-2)*1.47,.93]:[(8-i)*1.47,-.93];
}
function drawBoard(api,active,game){
  const {add,loft,loop,flush,line}=api;
  // Inlay the recessed bowls into a wooden board. Each patch runs from the lip to the flat deck.
  const contour=(z,k)=>Array.from({length:40},(_,i)=>{
    const a=i*TAU/40,c=Math.cos(a);
    return [(3.38*Math.sign(c)+2.03*c)*k,2.02*Math.sin(a)*k,z];
  });
  const boardTop=contour(.286,1),boardRim=contour(.218,1.013);
  for(const [a,b] of [[contour(-.165,.96),contour(-.096,1.014)],[contour(-.096,1.014),boardRim],[boardRim,boardTop]]){
    loft(a,b,wood,{finish:'wood'});
  }
  add(boardTop,'#a67b50');
  loop(boardTop,'#e0b983',1);
  for(let j=0;j<7;j++){
    const y=-1.81+j*.075;
    line([-3.83,y,.29],[3.65,y+.026,.29],j%2?'#5638299c':'#ce9e689c',.7);
    line([-3.65,-y,.29],[3.83,-y-.023,.29],j%2?'#5638299c':'#ce9e689c',.7);
  }
  flush();
  for(let i=0;i<12;i++){
    const [x,y]=pitPosition(i),large=quanPits.includes(i),rx=large?.76:.624,ry=large?1.32:.67;
    const floor=ring(x,y,.066,rx*.79,ry*.79),mid=ring(x,y,.145,rx*.91,ry*.9),lip=ring(x,y,.298,rx,ry);
    const chosen=active===i;
    add(floor,chosen?'#365b54':'#553c2b');
    loft(floor,mid,chosen?'#536d55':'#705035');
    loft(mid,lip,chosen?'#66856c':'#795335');
    loop(lip,chosen?'#eeedbf':'#d7ac78',chosen?2.1:1.15);
    lineRing(api,x,y,.299,rx+.044,ry+.058,'#e4c18b73',.8);
  }
  if(game)line([-3.45,0,.306],[3.45,0,.306],'#deb77b9c',1.1);
  flush();
}
function stone(api,position,id,experiment=false){
  const color=experiment?(id<2?red:green):id===50?'#b9c8c4':id===51?'#af794c':['#bfb5a2','#9dad9f','#c8a482','#bcb3a5'][id%4];
  api.dot(position,experiment?.149:id>=50?.255:.123,color,.055);
}
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const ease=t=>t*t*(3-2*t);
const handCenter=pit=>[...pitPosition(pit),1.04];

function gameStones(state){
  const positions=new Map();
  state.pits.forEach((pile,i)=>{
    const [x,y]=pitPosition(i),normal=pile.filter(id=>id<50),wide=quanPits.includes(i);
    normal.forEach((seed,j)=>{
      const angle=(j%9)*TAU/9+Math.floor(j/9)*.27;
      positions.set(seed,[x+(wide?.45:.385)*Math.cos(angle),y+(wide?.64:.385)*Math.sin(angle),.191+Math.floor(j/9)*.201]);
    });
    pile.filter(id=>id>=50).forEach(seed=>positions.set(seed,[x,y,.33]));
  });
  state.banks.forEach((pile,i)=>pile.forEach((seed,j)=>{
    const k=Math.floor(j/18);
    positions.set(seed,[(j%9-4)*.34,(i?-1:1)*(2.25+.28*(Math.floor(j/9)%2)),.13+k*.231+(seed>=50?.13:0)]);
  }));
  if(state.hand.length){
    const [x,y,z]=handCenter(state.handPit);
    state.hand.forEach((seed,i)=>{
      const theta=(i%7)*TAU/7,r=i%7===0?0:.30;
      positions.set(seed,[x+r*Math.cos(theta),y+r*Math.sin(theta),z+.207*Math.floor(i/7)]);
    });
  }
  return positions;
}
function liftedPoint(from,to,t,height){
  const vertical=(a,b,u)=>[a[0],a[1],a[2]+(b[2]-a[2])*u];
  if(t<.28)return vertical(from,[from[0],from[1],height],t/.28);
  if(t>.72)return vertical([to[0],to[1],height],to,(t-.72)/.28);
  return from.map((v,i)=>i===2?height:v+(to[i]-v)*(t-.28)/.44);
}

export function quanGamePose(state,event,progress=1){
  const after=gameStones(state);
  if(!event||progress===1)return after;
  const before=gameStones(event.before);
  const moving=new Set(event.moving);
  if(event.kind==='drop'){
    const released=event.moving[0],from=handCenter(event.fromPit),to=handCenter(event.pit);
    const flight=Math.min(1,progress/.62),fall=Math.max(0,(progress-.62)/.38);
    const hand=mix(from,to,ease(flight));
    hand[2]+=.12*Math.sin(Math.PI*flight);
    for(const id of event.before.hand){
      const origin=before.get(id),target=after.get(id);
      // The held group travels together to the next pit. Only one seed descends there.
      const aligned=id===released?[target[0],target[1],to[2]]:target;
      const offset=mix(origin.map((v,i)=>v-from[i]),aligned.map((v,i)=>v-to[i]),ease(flight));
      const at=hand.map((v,i)=>v+offset[i]);
      after.set(id,id===released?mix(at,target,fall*fall):at);
    }
  }else for(const [id,to] of after){
    if(!moving.has(id))continue;
    const from=before.get(id);
    const travel=event.kind==='capture'?Math.max(0,(progress-.39)/.61):progress;
    after.set(id,liftedPoint(from,to,ease(travel),Math.max(from[2],to[2])+.26));
  }
  return after;
}

function traceHop(api,from,to,t,color){
  const a=[...pitPosition(from),.48],b=[...pitPosition(to),.48];
  const at=mix(a,b,t),[dx,dy]=b.map((v,i)=>v-a[i]),length=Math.hypot(dx,dy);
  if(length<1e-8||t<=0)return;
  const rear=at.map((v,i)=>v-(b[i]-a[i])*Math.min(.15,t*.72));
  const rx=-dy/length*.105,ry=dx/length*.105;
  api.line(a,at,color,1.9);
  api.line([rear[0]+rx,rear[1]+ry,rear[2]],at,color,1.55);
  api.line([rear[0]-rx,rear[1]-ry,rear[2]],at,color,1.55);
}

export function drawQuanGame(api,{state,event,progress=1,selected}){
  const isDrop=event?.kind==='drop',isCapture=event?.kind==='capture';
  const before=event?.before??state;
  const visible=event&&progress<1?before:state;
  const active=isDrop&&progress<.62?event.fromPit:event?.pit??selected;
  drawBoard(api,active,true);
  if(!event&&selected!==null&&selected!==undefined){
    traceHop(api,selected,(selected+1)%12,.73,'#b8efba');
    traceHop(api,selected,(selected+11)%12,.73,'#f1c58c');
  }
  if(isDrop)traceHop(api,event.fromPit,event.pit,Math.min(1,progress/.62),'#ffe3a5');
  if(isCapture){
    const gap=(event.fromPit+event.direction+12)%12;
    traceHop(api,event.fromPit,gap,Math.min(1,progress/.18),'#eec583');
    traceHop(api,gap,event.pit,Math.max(0,Math.min(1,(progress-.18)/.21)),'#eec583');
  }
  for(const [id,point] of quanGamePose(state,event,progress))stone(api,point,id);
  for(const [i,pile] of visible.pits.entries()){
    const [x,y]=pitPosition(i);
    const at=[x,y+.47,.36];
    api.mark(String(pile.length),at,.30,cream);
    if(!event&&!state.finished&&playerPits[state.player].includes(i)&&pile.length)api.hotspot(i,[x,y,.45],.62);
  }
}

export function drawQuanExperiment(api,result){
  const index=2,[x,y]=pitPosition(index);
  drawBoard(api,index,false);
  const at=i=>{
    const a=i*TAU/8;
    return [x+.417*Math.cos(a),y+.422*Math.sin(a),.122+.149];
  };
  const frame=replacementFrame(result?.detail?.slots,result?.progress??1);
  for(const seed of frame.resting)stone(api,at(seed),seed,true);
  if(frame.slot!==null){
    const from=at(frame.slot),to=[from[0],from[1],1.20];
    stone(api,mix(from,to,frame.travel),frame.slot,true);
  }
  // Flat counters retain the draw history while every physical pebble returns to the source pit.
  for(const [i,slot] of frame.observations.entries()){
    const px=(i%6-2.5)*.58,py=-2.38-.38*Math.floor(i/6);
    const base=ring(px,py,.015,.21,.15),top=ring(px,py,.079,.21,.15);
    api.loft(base,top,slot<2?red:green);
    api.add(top,slot<2?red:green,cream,.7);
  }
  api.labels.push(['Ô rút · '+(frame.resting.filter(id=>id<2).length)+' đỏ, '+(frame.resting.filter(id=>id>=2).length)+' xanh',[x,y,.64],cream]);
  if(frame.observations.length)api.labels.push(['Dấu ghi kết quả · '+frame.observations.length+' lượt',[0,-2.4,.41],cream]);
}
