import {shade} from './scene-material.mjs';

const TAU=2*Math.PI;
const each=n=>Array.from({length:n},(_,i)=>i);
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);
const clamp=t=>Math.max(0,Math.min(1,t));
const polar=(radius,a,z)=>[radius*Math.cos(a),radius*Math.sin(a),z];
const circle=(r,z,n=48)=>each(n).map(i=>polar(r,TAU*i/n,z));

function transformed(origin,yaw,k=1){
  const c=Math.cos(yaw),s=Math.sin(yaw);
  return ([x,y,z])=>[origin[0]+k*(x*c-y*s),origin[1]+k*(x*s+y*c),origin[2]+k*z];
}

function slab(api,at,x,y,z,length,width,height,color){
  const rim=h=>[[x-length/2,y-width/2,h],[x+length/2,y-width/2,h],
    [x+length/2,y+width/2,h],[x-length/2,y+width/2,h]].map(at);
  const bottom=rim(z),top=rim(z+height);
  api.loft(bottom,top,color);api.add(top,shade(color,1,.12),shade(color,.68),.6);
}

export function racePose(index,n,progress){
  const angle=TAU*index/n;
  const t=clamp(progress), along=t>=.86?1:ease(t/.86);
  const approach=t<=.72?0:ease(clamp((t-.72)/.28));
  return {angle:angle*along,radius:lerp(4.23,3.52,approach),travel:angle*4.06*along};
}

function drawCar(api,position,yaw,size,paint,number,travel){
  const at=transformed(position,yaw,size);
  const {loft,add,tube,line,mark}=api;
  const nose=(length,z,width)=>[[length[0],-width,z],[length[1],-width*.78,z],
    [length[1]+.09,0,z],[length[1],width*.78,z],[length[0],width,z],[-.58,0,z]];
  const lower=nose([-.49,.52],.13,.29).map(at),upper=nose([-.5,.54],.29,.28).map(at);
  loft(lower,upper,paint);
  add(upper,shade(paint,1,.20),'#e8dfc290',.62);
  const glazing=nose([-.30,.12],.302,.215).map(([x,y,z],i)=>at([i===5?-.43:x,y,z]));
  const canopy=[[-.32,-.15,.445],[.035,-.15,.445],[.105,0,.445],
    [.035,.15,.445],[-.32,.15,.445],[-.38,0,.445]].map(at);
  loft(glazing,canopy,'#3a5967');
  add(canopy,'#263c46','#d0d8ce',.6);
  for(const y of [-.15,.15]){
    line(at([-.31,y,.451]),at([.04,y,.451]),'#d4e2db',.62);
    line(at([.06,y,.422]),at([.2,y,.305]),'#aac7cf',.72);
  }
  slab(api,at,-.52,0,.335,.08,.65,.035,'#343735');
  for(const y of [-.23,.23]){
    tube(at([-.5,y,.27]),at([-.53,y,.34]),.019*size,'#3d443d');
    line(at([.52,y,.26]),at([.57,y*.57,.27]),'#f9edc7',1.55);
    line(at([-.54,y,.24]),at([-.51,y*.77,.25]),'#f58364',1.75);
    for(const x of [-.355,.353]){
      const side=Math.sign(y),hub=side*.304;
      tube(at([x,side*.226,.14]),at([x,hub,.14]),.139*size,'#242b2c');
      tube(at([x,hub,.14]),at([x,hub+side*.008,.14]),.079*size,'#849396');
      const angle=-travel/(.139*size);
      line(at([x,hub+side*.014,.14]),at([x+.071*Math.cos(angle),hub+side*.014,.14+.071*Math.sin(angle)]),'#e3d9c5',1);
    }
  }
  mark(number,at([.32,0,.31]),.28*size,'#fff5d8');
}

export function drawCircularRace(n,result,api){
  const {add,line,loop,labels,mark,flush}=api;
  const radius=3.52,cap=4.77,inside=2.98;
  const turns=96;
  for(let i=0;i<turns;i++){
    const a=i*TAU/turns,b=(i+1)*TAU/turns;
    const patch=(r,s,z,color)=>add([polar(r,a,z),polar(s,a,z),polar(s,b,z),polar(r,b,z)],color);
    patch(inside,cap,.026,i%5?'#475054':'#495257');
    patch(cap-.067,cap,.067,i%6<3?'#a64d39':'#e7dcc2');
    patch(inside,inside+.068,.066,i%6<3?'#a64d39':'#e7dcc2');
    const outerA=polar(cap,a,.026),outerB=polar(cap,b,.026);
    add([outerA,outerB,polar(cap,b,-.13),polar(cap,a,-.13)],'#343e40');
  }
  add(circle(inside-.015,.038,96),'#577357','#647d5e',.62);
  flush();
  loop(circle(4.65,.041,96),'#e9e4d1',1.02);
  for(let i=0;i<turns;i+=3)line(polar(3.88,i*TAU/turns,.041),polar(3.88,(i+1)*TAU/turns,.041),'#d6d5be',1.1);
  const slotSize=Math.min(1.04,TAU*radius/n*.83);
  const destination=result?.detail?.position;
  for(let j=0;j<n;j++){
    const a=TAU*j/n,at=transformed(polar(radius,a,.055),a+Math.PI/2);
    const w=.35, h=slotSize*.47,col=j===0?'#ffdda9':j===destination?'#93e5ec':j===1||j===n-1?'#f0c477':'#e0dfcb';
    const points=[[-h,-w,0],[h,-w,0],[h,w,0],[-h,w,0]].map(at);
    loop(points,col,j===0||j===destination?1.75:1.03);
    mark(String(j+1),at([-h*.81,0,.006]),n>15?.18:.245,col);
  }
  for(let r=0;r<6;r++)for(let offset=0;offset<2;offset++){
    const p=3.93+r*.105, y=-.11+offset*.11;
    add([[p,y,.053],[p+.105,y,.053],[p+.105,y+.11,.053],[p,y+.11,.053]],
      (r+offset)%2?'#e8e2cb':'#272f34');
  }
  flush();
  const k=Math.min(.99,TAU*radius/n/1.39);
  const a=polar(radius,0,.033);
  drawCar(api,a,Math.PI/2,k,'#cc633f','A',0);
  labels.push(['Tay đua A · Vị trí 1',[a[0],a[1],.60],'#edb48a']);
  if(destination!==undefined){
    const {radius,angle,travel}=racePose(destination,n,result.progress??1);
    const b=polar(radius,angle,.033);
    drawCar(api,b,angle+Math.PI/2,k,'#3b9eb2','B',travel);
    labels.push(['Tay đua B · Vị trí '+(destination+1),[b[0],b[1],.60],'#8bdee9']);
  }
}

function chair(api,a,k,selected){
  const at=transformed(polar(3.35,a,0),a+Math.PI,k);
  const metal='#65757a',cloth=selected?'#4d837f':'#544e62';
  for(const x of [-.33,.31])for(const y of [-.295,.295]){
    api.tube(at([x*1.12,y*1.12,.03]),at([x,y,.58]),.037*k,metal);
  }
  slab(api,at,0,0,.52,.83,.76,.13,cloth);
  for(const y of [-.31,.31])api.tube(at([-.33,y,.55]),at([-.46,y,1.18]),.043*k,metal);
  slab(api,at,-.44,0,.91,.14,.75,.36,cloth);
  return at;
}

function person(api,at,k,color,seated,phase,initial){
  const {tube,dot,mark}=api;
  const hip=[-.03,0,lerp(1.01,.66,seated)],shoulder=[.01,0,hip[2]+.38],head=[.04,0,shoulder[2]+.225];
  tube(at(hip),at(shoulder),.162*k,color);
  tube(at([head[0],0,head[2]-.17]),at([head[0],0,head[2]-.09]),.061*k,'#bc9474');
  dot(at(head),.123*k,'#d8ad85',.045);
  dot(at([head[0]-.022,0,head[2]+.064]),.108*k,'#443832',.034);
  for(const side of [-1,1]){
    const stride=Math.sin(phase)*side*(1-seated);
    const knee=[lerp(-.03+.15*stride,.34,seated),side*.09,lerp(.48,.58,seated)];
    const ankle=[lerp(.26*stride,.38,seated),side*.11,.096+.10*Math.max(0,stride)];
    tube(at([hip[0],side*.08,hip[2]]),at(knee),.07*k,'#3e4858');
    tube(at(knee),at(ankle),.055*k,'#3e4858');
    tube(at(ankle),at([ankle[0]+.15,ankle[1],ankle[2]-.012]),.059*k,'#3a3834');
    const elbow=[.10,side*.19,hip[2]+.10], hand=[lerp(.08-.15*stride,.36,seated),side*.158,hip[2]+.02+.16*seated];
    tube(at([.01,side*.155,shoulder[2]-.055]),at(elbow),.057*k,color);
    tube(at(elbow),at(hand),.044*k,color);
    dot(at(hand),.040*k,'#d3a680',.035);
  }
  if(initial)mark(initial,at([.21,0,hip[2]+.30]),.235*k,'#fff1ca');
}

export function drawConference(n,result,api){
  const {add,tube,labels,loop,flush}=api;
  const top=2.49,tabletop=1.01,turns=60;
  for(const angle of [0,TAU/3,TAU*2/3]){
    tube(polar(.22,angle,tabletop-.15),polar(1.43,angle,.11),.123,'#655447');
    tube(polar(1.24,angle,.105),polar(1.55,angle,.105),.08,'#534c42');
  }
  flush();
  for(let i=0;i<turns;i++){
    const a=i*TAU/turns,b=(i+1)*TAU/turns;
    const r=t=>polar(top,t,tabletop);
    const lower=t=>polar(top,t,tabletop-.13);
    add([r(a),r(b),lower(b),lower(a)],i%5?'#81583d':'#906349');
  }
  const boundary=circle(top,tabletop,turns);
  const boardWidth=top/9;
  for(let i=0;i<18;i++){
    const lo=-top+i*boardWidth,hi=lo+boardWidth;
    const outer=boundary.filter(p=>p[1]>lo&&p[1]<hi);
    const xAt=y=>Math.sqrt(Math.max(0,top*top-y*y));
    outer.push([-xAt(lo),lo,tabletop],[xAt(lo),lo,tabletop],[-xAt(hi),hi,tabletop],[xAt(hi),hi,tabletop]);
    const mid=(lo+hi)/2;
    outer.sort((a,b)=>Math.atan2(a[1]-mid,a[0])-Math.atan2(b[1]-mid,b[0]));
    add(outer,['#ba8a5e','#bf9265','#bb8c60','#c4996b'][i%4]);
  }
  loop(circle(2.41,tabletop+.006,60),'#dbb082',1.35);
  const selected=result?.detail?.position;
  const k=Math.min(1,TAU*3.35/n*.78);
  for(let j=0;j<n;j++){
    const a=j*TAU/n;
    const at=chair(api,a,k,j===0||j===selected);
    const paper=transformed(polar(2.16,a,tabletop+.008),a+Math.PI,k);
    slab(api,paper,0,0,0,.28,.40,.012,'#e5d9bf');
    api.mark(String(j+1),paper([0,0,.024]),.205*k,'#45382c');
    if(j===0){
      person(api,at,k,'#388b91',1,0,'A');
      labels.push(['Người A · Ghế 1',at([0,0,1.5]),'#8bdee9']);
    }else if(j===selected){
      const p=result.progress??1;
      const t=ease(clamp(p/.72)), initialAngle=a-.77;
      const theta=lerp(initialAngle,a,t);
      const seat=ease(clamp((p-.77)/.23));
      const r=lerp(4.38,3.35,ease(clamp((p-.59)/.28)));
      const pose=transformed(polar(r,theta,0),theta+lerp(Math.PI/2,Math.PI,ease(clamp((p-.60)/.22))),k);
      person(api,pose,k,'#ba704b',seat,t*TAU*2.4,'B');
      labels.push(['Người B · Ghế '+(j+1),pose([0,0,1.6]),'#edb48a']);
    }
  }
}

export const steelBarLength=2.45;
export function steelInspection(step,t){
  const x=step===1?lerp(-4.02,-1.23,t):step===2?lerp(-1.23,3.79,t):-4.02;
  return {x,scanning:step===2&&Math.abs(x)<steelBarLength/2,
    complete:step===2&&x>=steelBarLength/2};
}

export function drawSteelInspection(result,api){
  const {box,line,tube,add,dot,mark,labels,glow,flush,loop}=api;
  const step=result?.step??0, progress=result?.progress??1;
  const {x,scanning,complete}=steelInspection(step,progress);
  const shell='#527685',rails='#465155',rod='#9aa9ad';
  for(const a of [-3.9,3.9])for(const y of [-.81,.81]){
    box(a,y,.018,.50,.47,.095,'#525e61');
    box(a,y,.11,.22,.23,.43,shell);
  }
  for(const y of [-1.02,1.02]){
    box(0,y,.38,9.12,.26,.32,rails);
    line([-4.55,y,.698],[4.55,y,.698],'#a6a6a0',1.1);
  }
  for(const a of each(17).map(i=>(i-8)*.54)){
    tube([a,-.90,.67],[a,.90,.67],.132,rod);
    const angle=x/.132;
    line([a+.131*Math.sin(angle),-.85,.67+.131*Math.cos(angle)],
      [a+.131*Math.sin(angle),.85,.67+.131*Math.cos(angle)],'#c6d0cd',1.04);
  }
  flush();
  for(const y of [-1.08,1.08]){
    box(0,y,.63,1.28,.64,1.88,shell);
    box(0,y,.64,1.39,.72,.16,'#50606a');
    for(const a of [-.49,.49])line([a,y*1.30,.89],[a,y*1.30,2.36],'#819ca5',1.03);
  }
  box(0,0,2.47,1.32,2.76,.46,'#587b8a');
  box(0,0,2.30,.94,1.66,.19,'#314950');
  for(const y of [-.43,0,.43]){
    tube([0,y,2.28],[0,y,2.45],.105,'#a8a966');
  }
  const z=.804;
  box(.05,1.38,1.78,.91,.096,.52,'#263e44');
  box(-.44,1.386,1.43,.29,.108,.22,'#cab078');
  tube([-.44,1.44,1.54],[-.44,1.495,1.54],.073,'#b4483c');
  for(const x of [-.58,.58]){
    add([[x-.055,1.41,.78],[x+.035,1.41,.78],[x+.12,1.41,.90],[x+.03,1.41,.90]],'#dcb46b',null,1,0,1,.042);
  }
  if(step>0){
    const defect=result.view?.[0],flag=result.view?.[1];
    box(x,0,z,steelBarLength,.62,.25,'#a4aaab');
    line([x-steelBarLength/2+.035,-.281,z+.253],[x+steelBarLength/2-.035,-.281,z+.253],'#e5ecea',1.03);
    if(defect){
      const scar=[[x-.17,-.25,z+.262],[x+.06,-.13,z+.262],[x-.015,.013,z+.262],[x+.20,.25,z+.262]];
      scar.slice(1).forEach((p,i)=>line(scar[i],p,'#55463f',1.55));
    }
    if(scanning){
      add([[0,-.62,2.29],[0,.62,2.29],[0,.38,z+.257],[0,-.38,z+.257]],'#77ffe3',null,1,0,.31,.035);
      line([0,-.31,z+.258],[0,.31,z+.258],'#b7fff0',2);
    }
    const color=complete?(flag?'#f9966e':'#a0e3a8'):'#f5c77c';
    mark(complete?(flag?'LỖI':'OK'):scanning?'ĐO':'CHỜ',[.05,1.445,2.05],.19,color);
    glow([.34,1.43,2.63],.28,color,.40,1);
    dot([.34,1.43,2.63],.061,color,.10);
    labels.push([complete?(flag?'Máy báo lỗi':'Máy không báo lỗi'):scanning?'Đầu dò đang quét':'Đưa thanh thép vào máy',[0,1.25,3.03],color]);
  }else mark('CHỜ',[.05,1.445,2.05],.19,'#e9c183');
  loop([[-.48,-.62,2.468],[.48,-.62,2.468],[.48,.62,2.468],[-.48,.62,2.468]],'#9db1b6',.84);
}
