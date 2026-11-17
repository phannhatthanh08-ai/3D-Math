import {drawQuanExperiment,drawQuanGame} from './o-an-quan-scene.mjs';
import {drawCircularRace,drawConference,drawSteelInspection} from './probability-objects.mjs';
import {liftThroughOpening} from './scene-mechanics.mjs';
import {tossHeight} from './scene-motion.mjs';
import {fmt} from './lessons.mjs';
import {shade} from './scene-material.mjs';
import {cardName,walkPlace} from './probability-lab.mjs';

const teal='#56b9ad', mint='#a7d0ad', amber='#e9b76c', red='#dd7363', cream='#f3e4be', blue='#79a8ce', ink='#294b45', dark='#163b34';
const colors=[amber,teal,blue,'#c5a8d8','#ed8d72','#a9c774'];
const TAU=2*Math.PI;
const series=n=>Array.from({length:n},(_,i)=>i);
const ring=(r,x,y,z,n=32)=>series(n).map(i=>[x+r*Math.cos(i*TAU/n),y+r*Math.sin(i*TAU/n),z]);
const quad=(x,y,z,w,d)=>[[x-w/2,y-d/2,z],[x+w/2,y-d/2,z],[x+w/2,y+d/2,z],[x-w/2,y+d/2,z]];
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);
const links=[[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]];
const grid=(i,width,step=.7)=>[(i%width-(width-1)/2)*step,(Math.floor(i/width)-1)*step];

export function drawProbability(id,state,result,api){
  const {add,box,loft,line,dot,loop,tube,labels,flush,mark,hotspot,glow}=api;
  const x=state.x;
  const view=result?.view;
  const detail=result?.detail;
  const progress=result?.progress??1;
  const lift=Math.sin(progress*Math.PI);
  const targets=new Set(result?.targets??[]);
  const hints=new Set(result?.hints??[]);
  const hasFlight=progress<1;
  function strokePath(points,color,width){
    points.slice(1).forEach((point,i)=>line(points[i],point,color,width));
  }
  function trail(from,to,t,color){
    if(t<=0)return;
    strokePath(series(8).map(i=>{
      const u=Math.max(0,t-(7-i)*.038);
      return from.map((v,k)=>lerp(v,to[k],ease(u))+(k===2?Math.sin(u*Math.PI)*.9:0));
    }),color,1.75);
  }
  function ripple(px,py,z,t,r,color){
    if(t<0||t>=1)return;
    const rim=ring(r*(.48+t*.9),px,py,z,27);
    add(rim.concat([rim[0]]),null,color,1.4,0,1-t,.14);
  }
  function platform(w=10,d=5,color='#315a4b'){
    box(0,0,-.23,w+.16,d+.16,.12,'#473b2e');
    box(0,0,-.11,w,d,.1,color);
    const trim=quad(0,0,-.005,w-.21,d-.21);
    loop(trim,'#dec19383',.95);
    for(const point of trim)dot([point[0]*.97,point[1]*.94,.012],.037,'#dac093');
    flush();
  }
  function disk(px,py,z,r,h,color){
    const low=ring(r,px,py,z),high=ring(r,px,py,z+h);
    loft(low,high,color);add(high,shade(color,1,.10),'#e3f4df75',.8);
  }
  function tray(px,py,w,d,h=.5,color=teal){
    const low=quad(px,py,.035,w*.96,d*.94),top=quad(px,py,h,w,d);
    box(px,py,-.016,w*.98,d*.96,.06,'#66533d');
    add(low,shade(color,.48),mint,.6);loft(low,top,color,{alpha:.34,edges:true,glass:true});
    loop(top,'#e2dfbb',1.25);
    loop(quad(px,py,.085,w*.962,d*.952),'#d3e4c479',.65);
    for(const [i,p] of low.entries())line(p,top[i],'#e7ffe88f',1.2);
    flush();
  }
  function label(text,point,color=cream){labels.push([text,point,color]);}
  function fruit([x,y,z],radius,color,leaf='#7aab67'){
    dot([x,y,z],radius,color,.035);
    const tip=[x+.06*radius,y,z+radius*1.17];
    line([x,y,z+radius*.91],tip,'#927051',1);
    add([tip,[x+.66*radius,y-.15*radius,z+radius*1.20],
      [x+.99*radius,y+.03*radius,z+radius*1.25],[x+.56*radius,y+.19*radius,z+radius*1.23]],leaf,null,1,0,1,.06);
  }
  function book([x,y,z],w,d,h,color){
    box(x,y,z,w,d,h,'#d8d1b5');
    box(x-w*.465,y,z,w*.09,d*1.027,h*1.03,color);
    box(x,y,z+h,w*1.035,d*1.02,.026,color);
    for(const dy of [-.23,0,.23])line([x-w*.405,y+dy*d,z+h+.029],[x-w*.15,y+dy*d,z+h+.029],'#c2cdb799',.7);
  }
  if(id===22||id===78){
    const n=id===22?8:5;
    const cells=result?.counts;
    const path=result?.path??[];
    const start=id===22?27:12;
    const size=7/n;
    const center=i=>[(i%n-(n-1)/2)*size,(Math.floor(i/n)-(n-1)/2)*size,.07];
    const max=Math.max(1,...(cells??[]));
    platform(7.65,7.65,'#72543e');
    loop(quad(0,0,.038,7.29,7.29),'#e0c198',1.15);
    for(let i=0;i<n*n;i++){
      const p=center(i);
      const target=targets.has(i),hint=hints.has(i),base=i===start?'#ad895e':(i%n+Math.floor(i/n))%2?'#365c4f':'#a0ac91';
      add(quad(p[0],p[1],.04,size*.985,size*.985),hint?'#9ae2a6':target?'#b2cd83':base,hint?'#efffd8':target?'#e2f9ad':'#133e35',target?1.1:.6);
      if(cells?.[i])disk(p[0],p[1],.06,size*(.08+.33*Math.sqrt(cells[i]/max)),.025,i===start?amber:'#6acad0');
      if(target){
        hotspot(i,p,size*.48);
        mark(walkPlace(id,i),[p[0],p[1],.12],size*.29,'#143629');
      }

    }
    for(let j=1;j<path.length;j++){
      const from=center(path[j-1]),to=center(path[j]),t=j===path.length-1?progress:1;
      line([from[0],from[1],.31],[lerp(from[0],to[0],t),lerp(from[1],to[1],t),.31],'#ffe49e',2.6);
    }
    const from=center(path.at(-2)??start),to=center(path.at(-1)??start);
    const [px,py]=to.map((v,i)=>lerp(from[i],v,ease(progress)));
    const jump=path.length>1?tossHeight(progress,id===22?.14:.67):0;
    glow([px,py,.075],.38,'#10281c',.72,0,.50);
    disk(px,py,.09+jump,.25,.108,cream);
    disk(px,py,.2+jump,.175,.075,'#c49963');
    const baseZ=.27+jump;
    const turned=[[.175,0],[.14,.06],[.123,.14],[.16,.225],[.168,.28]];
    for(let i=1;i<turned.length;i++){
      const [r,z]=turned[i-1],[q,h]=turned[i];
      loft(ring(r,px,py,baseZ+z,18),ring(q,px,py,baseZ+h,18),i===1?'#c7a677':cream);
    }
    if(id===22){
      disk(px,py,.49+jump,.18,.11,cream);
      tube([px,py,.57+jump],[px,py,.87+jump],.06,amber);
      tube([px-.134,py,.745+jump],[px+.134,py,.745+jump],.048,amber);
    }else{
      const profile=y=>[[px-.17,y,.47+jump],[px+.085,y,.46+jump],[px+.2,y,.72+jump],
        [px+.01,y,.92+jump],[px-.09,y,.75+jump],[px-.27,y,.63+jump]];
      const front=profile(py-.095),back=profile(py+.095);
      loft(front,back,'#e4c899');add(front,cream,amber,.7);add(back,cream,amber,.7);
      dot([px-.068,py-.104,.756+jump],.024,ink,1.1);
      dot([px-.068,py+.104,.756+jump],.024,ink,.06);
      line([px-.21,py-.101,.635+jump],[px-.085,py-.101,.655+jump],'#9f7856',.8);
    }
    label(id===22?'Quân vua':'Quân mã',[px,py,.90+jump]);
    label(id===22?'Ô đích d4':'Ô đích c3',center(start),amber);
    if(cells)label(fmt(cells[start])+' đường về ô xuất phát',center(start),amber);
    return;
  }
  if(id===79){
    const pts=[[-3,0],[-1,2.1],[-1,-2.1],[1.6,2.05],[3,0]];
    const path=result?.path??[],counts=result?.counts;
    disk(0,0,-.14,4.65,.16,'#286d71');flush();
    for(const [a,b,r] of [[-2.5,1.7,.8],[2,.4,.91],[.3,-1.6,.74],[1.2,2.7,.58]]){
      loop(ring(r,a,b,.035,28),'#9cd4cd4d',.8);
      loop(ring(r*.7,a,b,.04,26),'#b6e2d833',.67);
    }
    for(const [a,b] of links)line([...pts[a],.19],[...pts[b],.19],mint,1.6);
    for(let i=1;i<path.length;i++){
      const from=pts[path[i-1]],to=pts[path[i]],t=i===path.length-1?ease(progress):1;
      line([...from,.29],[lerp(from[0],to[0],t),lerp(from[1],to[1],t),.29],amber,2.8);
    }
    pts.forEach(([px,py],i)=>{
      const shape=ring(.67,px,py,.24,30);
      shape.splice(2,4,[px+.12,py+.08,.24]);
      const target=targets.has(i),color=hints.has(i)?'#9cdc97':target?'#c4db7d':i===0||i===4?'#9bb96e':'#579d6d';
      loft(shape.map(([x,y])=>[x,y,.157]),shape,color);
      add(shape,color,target?'#f1ffb4':mint,target?1.8:.9);
      for(const [dx,dy] of [[.44,.31],[-.38,.33],[-.44,-.23],[.24,-.43]])line([px,py,.24],[px+dx,py+dy,.24],mint,.74);
      if(counts?.[i])disk(px,py,.25,.12+.28*Math.sqrt(counts[i]/Math.max(...counts)),.036,i===4?amber:'#64bda0');
      if(target)hotspot(i,[px,py,.27],.66);
      if((path.at(-1)??0)!==i||(path.length>1&&progress<.8))mark('ABCDE'[i],[px-.13,py,.37],.32,'#163a2c');
      label('Lá '+'ABCDE'[i]+(counts?' · '+fmt(counts[i])+' đường':''),[px,py,.48],i===4?amber:cream);
    });
    const from=pts[path.at(-2)??0],to=pts[path.at(-1)??0];
    const [px,py]=to.map((v,i)=>lerp(from[i],v,ease(progress))),jump=path.length>1?tossHeight(progress,1):0;
    const angle=Math.atan2(to[1]-from[1],to[0]-from[0])-Math.PI/2;
    const pose=(x,y,z)=>[px+x*Math.cos(angle)+y*Math.sin(angle),py-x*Math.sin(angle)+y*Math.cos(angle),z+jump];
    if(path.length>1){
      ripple(from[0],from[1],.052,progress,.84,'#a5d6d0');
      ripple(to[0],to[1],.062,(progress-.65)/.36,.96,'#d2eee0');
    }
    glow([px,py,.29],.38,'#173d29',.64*(1-jump*.55),0,.45);
    for(const side of [-1,1]){
      const thigh=pose(side*(.23+jump*.12),.11,.36);
      const rear=pose(side*.30,.35+jump*.21,.29);
      tube(pose(side*.12,.04,.43),thigh,.096,'#73aa69');
      tube(thigh,rear,.064,'#91c471');
      tube(pose(side*.15,-.12,.44),pose(side*.23,-.29,.29),.04,'#95b970');
      for(const toe of [-.055,0,.055])tube(rear,pose(side*.30+toe,.43+jump*.21,.28),.012,'#aac780');
    }
    dot(pose(0,.069,.43),.29,'#70a766',.18);
    dot(pose(0,-.13,.53),.23,'#a0c875',.22);
    for(const side of [-1,1]){
      dot(pose(side*.15,-.21,.665),.106,'#cbdf85',.35);
      dot(pose(side*.15,-.26,.69),.041,ink,.49);
    }
    return;
  }
  if(id===76||id===88){
    const tickets=id===88,n=tickets?20:state.conditions?.total??30,cols=tickets?7:10;
    platform(9.5,6.1);
    tray(0,.95,tickets?7.7:7.9,3.25,.75);
    if(tickets){
      box(0,-2.05,-.014,3.24,1.04,.078,'#447363');
      loop(quad(0,-2.05,.069,3.12,.93),'#dec698',1);
    }
    const inventory=series(n).map(slot=>({slot,marked:slot<x}));
    const removed=(view??[]).map(marked=>inventory.splice(inventory.findLastIndex(item=>item.marked===marked),1)[0]);
    const point=slot=>{
      const [a,b]=grid(slot,cols,tickets?.82:.62);
      return [a,b+1.01,tickets?.075:.311];
    };
    const color=marked=>marked?(tickets?amber:teal):(tickets?teal:amber);
    const draw=(at,marked)=>{
      if(tickets){
        const [x,y,z]=at;
        box(x,y,z,.58,.49,.08,color(marked));
        line([x-.19,y-.03,z+.09],[x+.19,y-.03,z+.09],cream,.72);
        for(const offset of [-.095,.095])line([x-.20,y+offset,z+.087],[x+.09,y+offset,z+.087],'#f0e8cb91',.62);
      }else{
        const [x,y,z]=at;
        dot(at,.26,color(marked),.025);
        const arc=ring(.156,x-.028,y+.015,z+.138,14);
        for(let j=0;j<5;j++)line(arc[j],arc[j+1],marked?'#d8e9d8a9':'#f3c98994',.65);
      }
    };
    for(const item of inventory)draw(point(item.slot),item.marked);
    for(const [i,item] of removed.entries()){
      const destination=[i*.78-.39,-2.05,tickets?.018:.26];
      const t=i===removed.length-1?progress:1;
      draw(liftThroughOpening(point(item.slot),destination,.75+(tickets?.15:.29),t),item.marked);
    }
    const left=inventory.filter(item=>item.marked).length;
    label(tickets?left+' phiếu trúng trong '+inventory.length+' phiếu':left+' bi xanh trong '+inventory.length+' viên',[0,1,.89]);
    if(removed.length)label('Kết quả lượt vừa thử',[0,-2.05,.58]);
    return;
  }
  if(id===77){
    platform(9.1,4.45,'#3d5a4c');
    const radius=.71;
    for(let i=0;i<4;i++){
      const a=(i-1.5)*1.82;
      const face=view?.[i];
      const flipping=i===view?.length-1&&progress<1;
      const landing=face===false?Math.PI:0;
      const angle=flipping?(2*TAU+landing)*(1-(1-progress)**1.15):landing;
      const half=.085;
      const clearance=radius*Math.abs(Math.sin(angle))+half*Math.abs(Math.cos(angle));
      const rise=flipping?tossHeight(progress,1.03):0;
      const z0=.013+clearance+rise;
      glow([a,0,.035],.89,'#0b261e',.65*(1-rise*.46),0,.46);
      if(face!==undefined&&i===view.length-1)ripple(a,0,.034,(progress-.86)/.14,.86,'#f6e1a4');
      const coinRing=(r,z,x0=a,y0=0)=>{
        return ring(r,x0,y0,z,40).map(([x,y,h])=>[
          x,y*Math.cos(angle)-h*Math.sin(angle),z0+y*Math.sin(angle)+h*Math.cos(angle)
        ]);
      };
      const bottom=coinRing(radius,-half),top=coinRing(radius,half);
      loft(bottom,top,'#b98e4d');add(top,'#dcb26c',cream,.8);add(bottom,'#a59e80',cream,.7);
      for(let j=0;j<40;j+=2)line(bottom[j],top[j],'#ffe8be80',.6);
      loop(coinRing(.57,.09),cream,.85);
      loop(coinRing(.57,-.09),cream,.85);
      loop(coinRing(.30,.092),cream,1.55);
      for(const offset of [-.18,0,.18]){
        const glyph=coinRing(.048,.095,a+offset,.026);
        loop(glyph,'#876237',.78);
      }
      for(const [dx,dy] of [[0,.25],[0,-.25],[.25,0],[-.25,0]])add(coinRing(.081,-.092,a+dx,dy),cream);
      const color=face===undefined||flipping?'#beaa76':face?amber:blue;
      label(face===undefined?'Đồng '+(i+1):face?'Ngửa':'Sấp',[a,0,.52+rise],color);
    }
    return;
  }
  if(id===80){drawCircularRace(x,result,api);return;}
  if(id===91){drawConference(x,result,api);return;}
  if(id===81){
    if(result?.game)drawQuanGame(api,result.game);
    else drawQuanExperiment(api,result);
    return;
  }
  if(id===82){
    platform(10,5.05,'#625743');
    const counts=[0,0,0,0],stacks=[.185,.94,1.70],caseWood='#a47750';
    box(0,-.77,0,9.14,.14,2.53,'#715336');
    for(let i=0;i<5;i++)box((i-2)*2.25,.14,0,.12,1.86,2.52,caseWood);
    for(const level of [.04,.81,1.57,2.44])box(0,.14,level,9.17,1.86,.13,caseWood);
    for(const cx of [-3.375,-1.125,1.125,3.375]){
      box(cx,1.113,2.42,.70,.075,.14,'#536b61');
      mark(String(Math.round(cx/2.25+2.5)),[cx,1.18,2.51],.24,'#f1dfbd');
    }
    for(const [i,j] of (detail?.shelves??[]).entries()){
      const k=counts[j]++;
      const t=i===detail.shelves.length-1?progress:1;
      const origin=[(i%12-5.5)*.57,1.82+Math.floor(i/12)*.47,.07];
      const end=[(j-1.5)*2.25-.81+k%6*.32,.15,stacks[Math.floor(k/6)]];
      const approach=[end[0],1.44,end[2]];
      const rise=t<.70?t/.70:1;
      const pos=t<.70?liftThroughOpening(origin,approach,Math.max(end[2]+.32,.7),rise):approach.map((v,k)=>lerp(v,end[k],ease((t-.70)/.30)));
      book(pos,.25,.58,.59,colors[i%colors.length]);
    }
    for(let i=0;i<4;i++)label('Ngăn '+(i+1)+(detail?' · '+counts[i]+' sách':''),[(i-1.5)*2.25,1.12,2.72],i===0?amber:cream);
    for(let i=detail?.shelves.length??0;i<x;i++)book([(i%12-5.5)*.57,1.82+Math.floor(i/12)*.47,.07],.44,.4,.17,colors[i%6]);
    return;
  }
  if(id===83){
    platform(10,5.6);
    for(const [j,px] of [-2.55,2.55].entries()){
      const color=j?teal:amber;
      tray(px,.52,3.95,2.85,.54,color);
      const share=j?100-x:x;
      const n=share?Math.max(1,Math.round(share/10)):0;
      for(let i=0;i<n;i++){
        if(detail&&((j===0)===detail.farm)&&i===0)continue;
        const [a,b]=grid(i,4,.72);
        fruit([px+a,.94+b,.36],.307,j?'#cb863b':'#e1a151');
      }
      label('Trại '+(j?'B':'A')+' · '+(j?100-x:x)+'%',[px,.7,1.1],color);
    }
    disk(0,-2.12,.04,.72,.15,'#596d59');
    loop(ring(.64,0,-2.12,.196),cream,.7);
    if(detail){
      const px=detail.farm?-2.55:2.55;
      loop(quad(px,.52,.58,3.99,2.89),cream,1.6);
      line([px,0,.45],[0,-2.1,.42],amber,2);
      const t=view?1:progress;
      const [a,b]=grid(0,4,.72);
      const pos=liftThroughOpening([px+a,.94+b,.36],[0,-2.12,.49],.92,t);
      if(!view&&hasFlight)trail([px,0,.44],[0,-2.1,.44],progress,'#ffe0a966');
      if(view)glow([0,-2.12,.2],.97,view[0]?'#e2f3a9':'#f6a47d',.52,0,.45);
      fruit(pos,.307,view?.[0]===false?'#bc794a':'#eab45d');
      label(view?view[0]?'Cam loại I':'Cam loại khác':'Chọn từ trại '+(detail.farm?'A':'B'),pos);
    }
    return;
  }
  if(id===84){
    platform(10.5,5.4);
    const cards=detail?.cards;
    for(let i=0;i<x;i++){
      const row=Math.floor(i/6),n=Math.min(6,x-row*6),px=(i%6-(n-1)/2)*1.36,py=row?1.12:-1.05;
      const card=cards?.[i],ace=card%13===0, revealed=card!==undefined;
      const turning=i===cards?.length-1&&hasFlight;
      const angle=turning?Math.PI*(1-ease(progress)):revealed?0:Math.PI;
      const visible=revealed&&(!turning||progress>=.5);
      const rise=(turning?.28*lift:0)+.5*Math.abs(Math.sin(angle));
      const color=ace?amber:cream;
      const bend=(u,v,z)=>[px+u*Math.cos(angle)+z*Math.sin(angle),py+v,.065+rise+z*Math.cos(angle)-u*Math.sin(angle)];
      const plane=(w,d,z)=>[bend(-w/2,-d/2,z),bend(w/2,-d/2,z),bend(w/2,d/2,z),bend(-w/2,d/2,z)];
      const bottom=plane(1,1.6,-.029),top=plane(1,1.6,.029);
      loft(bottom,top,'#aeb7ab');add(bottom,teal);add(top,color);
      loop(plane(.82,1.35,visible?.032:-.033),visible?ink:mint,.85);
      if(visible){
        const suit=Math.floor(card/13);
        mark(cardName(card),bend(0,0,.04),.34,suit===1||suit===2?'#8a2e28':dark);
        if(ace)glow([px,py,.045],.91,'#e5c080',.4,0,.46);
      }else{
        const face=-.035;
        add([bend(0,-.36,face),bend(.24,0,face),bend(0,.36,face),bend(-.24,0,face)],mint);
      }
    }
    label(cards?'Đã lật '+cards.length+'/'+x+' lá · vàng là lá Át':'Tay bài · '+x+' lá úp',[0,-2,.56]);
    return;
  }
  if(id===85){
    box(0,.3,1,9,.38,3.65,ink);
    for(let i=0;i<17;i++){
      const row=Math.floor(i/6),px=(i%6-2.5)*1.29,z=1.65+row*1.05;
      const failed=view?.[i],center=[px,.03,z];
      disk(px,1.34,.02,.19,.06,ink);
      const active=i===view?.length-1&&hasFlight;
      const known=active&&progress<.48?undefined:failed;
      tube([px,.28,z],[px,-.047,z],.15,'#9b9274');
      for(const offset of [.027,.089,.144])tube([px,.15-offset,z],[px,.168-offset,z],.159,'#b8a373');
      for(const edge of [-.09,.09])line([px+edge,-.182,z-.07],[px+edge*.47,-.182,z+.087],'#eed7a6',.68);
      if(known===false)glow(center,.64,'#ffc978',active?.66*progress:.67,3.2);
      else if(active)glow(center,.55,'#b7eacc',lift*.7,3.2);
      dot(center,.22+(active?.035*lift:0),known?'#4f625d':known===false?'#ffe19a':'#9aaf9e',4);
      if(known){
        line([px-.14,-.015,z-.15],[px+.14,-.015,z+.15],red,1.8);
        line([px-.14,-.015,z+.15],[px+.14,-.015,z-.15],red,1.8);
      }
    }
    for(const px of [-3.6,3.6]){
      tube([px,.3,0],[px,.3,1.15],.11,ink);
      box(px,.3,-.07,.63,.91,.11,'#6b7869');
    }
    loop([[-4.18,.1,1.17],[4.18,.1,1.17],[4.18,.1,4.42],[-4.18,.1,4.42]],'#a5b697',1.2);
    label('17 bóng đèn',[0,.2,4.8]);
    return;
  }
  if(id===86){
    for(const a of [-3.7,3.7])for(const b of [-1.7,1.7])box(a,b,0,.38,.38,.38,'#8d6549');
    box(0,0,.34,9.4,4.74,.23,'#407e56');flush();
    const w=9.3,d=4.6;
    for(const y of [-d/2,d/2])box(0,y,.52,w,.28,.2,'#a47a56');
    for(const j of [-w/2,w/2])box(j,0,.52,.25,d,.2,'#a47a56');
    for(const a of [-w/2,0,w/2])for(const b of [-d/2,d/2])disk(a,b,.61,.26,.04,dark);
    const selected=new Set(detail?.numbers??[]);
    series(9).forEach(i=>{const [a,b]=grid(i,5,.88),n=i+1;colorBall(n,a,b+.64,selected.has(n));});
    function colorBall(n,a,b,picked){
      const index=detail?.numbers.indexOf(n)??-1;
      const t=index===selected.size-1?progress:1;
      const pos=picked?liftThroughOpening([a,b,.85],[(index-(x-1)/2)*.81,-1.42,.85],1.50,t):[a,b,.85];
      if(picked&&t<1){
        trail([a,b,.79],[(index-(x-1)/2)*.81,-1.42,.79],t,'#e9e6a779');
        glow([pos[0],pos[1],.6],.37,'#10362b',.7,0,.46);
      }
      const billiard=['#d2a347','#3d6295','#a74f3e','#745a8d','#d38344','#4f865f','#85493a','#344443','#bda154'];
      dot(pos,.29,billiard[n-1],.18);
      const numeral=[pos[0],pos[1],pos[2]+.035];
      dot(numeral,.115,'#efe8cc',.86);
      mark(String(n),numeral,.26,dark);
      if(picked)label('Bi '+n,pos,n%2===0?amber:teal);
    }
    return;
  }
  if(id===87){
    platform(10,5);
    for(const [i,px] of [-2.53,2.53].entries()){
      disk(px,0,.03,.94,.17,'#796549');
      tube([px,0,.2],[px,0,2.8],.19,'#ae8159');
      for(const d of [-1,1])tube([px,0,1.56],[px+d*.63,.04,2.42],.12,'#9d6a48');
      for(const [dx,dy,z,r] of [[-.57,.16,2.4,.56],[.58,.17,2.42,.54],[0,-.23,2.52,.69],[.03,.18,3.02,.56]]){
        const from=[px+dx*.51,0,z-.48],tip=[px+dx,dy,z+.10];
        tube(from,tip,.059,'#887153');
        dot([px+dx,dy,z],r,'#689364',.26);
        for(const [a,b,h] of [[-.43,-.24,.28],[.24,-.26,.21],[.02,.08,.45]]){
          dot([px+dx+a*r,dy+b*r,z+h*r],r*.51,'#81ab6d',.32);
        }
      }
      const active=i===view?.length-1&&hasFlight;
      if(active)glow([px,-.12,2.53],1.12,'#d3efab',lift*.59,.68);
      if(view?.[i]&&(!active||progress>.25))for(const [a,b,c] of [[-.5,-.6,2.58],[.46,-.55,2.6],[.03,-.54,3],[-.28,-.65,2.29],[.29,-.64,2.26]]){
        const size=active?.185*ease((progress-.25)/.75):.185;
        fruit([px+a,-b,c],size,'#c85f48','#81ab66');
      }
      label('Cây '+(i?'B':'A')+' · '+(i?x:state.conditions?.a??75)+'%',[px,0,3.69]);
    }
    return;
  }
  if(id===89){drawSteelInspection(result,api);return;}
  if(id===90){
    const pts=ring(3.5,0,0,.21,6);
    disk(0,0,-.08,3.8,.2,'#355e4d');flush();
    for(let i=0;i<x;i++)disk((i-(x-1)/2)*.63,-4.16,.07,.22,.065,colors[i]);
    for(let i=0;i<6;i++){
      const from=pts[i],to=pts[(i+1)%6];
      const colored=(view?.length??0)-Number(progress<.78);
      const conflict=i<colored&&(i+1)%6<colored&&view[i]===view[(i+1)%6];
      tube(from,to,conflict?.085:.041,conflict?red:mint);
      const selected=i===view?.length-1&&hasFlight;
      const pigment=colors[view?.[i]]??cream;
      const [px,py,pz]=from;
      disk(px,py,.131,.39,.08,'#688f74');
      mark(String(i+1),[px*.77,py*.77,.26],.22,'#f1e6b8');
      if(selected){
        const pick=view[i];
        const start=[(pick-(x-1)/2)*.63,-4.16,.21];
        const end=[px,py,pz+.15];
        trail(start,end,progress,'#f5deb080');
        const painted=start.map((a,k)=>lerp(a,end[k],ease(progress))+(k===2?lift*.9:0));
        const tip=painted;
        tube(tip,[tip[0]-.15,tip[1],tip[2]+.28],.065,'#b9aba0');
        tube([tip[0]-.15,tip[1],tip[2]+.28],[tip[0]-.40,tip[1],tip[2]+.68],.047,'#b99b70');
        dot(tip,.104,pigment,.08);
        if(progress>.7)ripple(px,py,.26,(progress-.7)/.31,.34,pigment);
      }
      dot([px,py,pz+.12],.28,selected&&progress<.78?cream:pigment,1);
      if(conflict){
        const mid=from.map((v,k)=>(v+to[k])/2);
        glow(mid,.62,red,.37);
        label('Cạnh '+(i+1)+' trùng màu',mid,red);
      }
    }
  }
}
