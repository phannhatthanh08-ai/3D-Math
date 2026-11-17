import {drawBalloon} from './scene-details.mjs';
import {drawProfileHardware,drawArchStructure,drawObjectAttachments} from './extension-components.mjs';
import {drawFoldingBox} from './scene-mechanics.mjs';
import {fmt} from './lessons.mjs';
import {shade} from './scene-material.mjs';

const gold='#edbc6d', green='#579984', light='#d6eed9', pale='#9dccaf', dark='#245648', water='#54bcbd';
const finishes=[
  ['#b8cecd',[25,47,58,59]],
  ['#c3ad81',[31,40,42,43,65,70,74]],
  ['#9eaaa0',[26,34,36,37,38,53,57,60,67,71]],
  ['#ac8b60',[29,45,48,50,64]],
  ['#aea58e',[28,30,39,54,68,69,75]]
];
const colors=['#edbc6d','#54bcbd','#8cb3e2','#ca9bd4','#ee926d','#b4d287'];
const ring=(r,z,n=48)=>Array.from({length:n},(_,i)=>[r*Math.cos(i*2*Math.PI/n),r*Math.sin(i*2*Math.PI/n),z]);
const rect=(x,y,z)=>[[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]];

function profileSlice(profile,horizontal,x){
  const base=ring(profile.radius(x),x);
  return horizontal?base.map(([u,v,z])=>[z,u,v+profile.radius(0)]):base;
}

function coordinates(model){
  const {lathe,horizontal,arch,blocks=[],edges=[],dots=[],panels=[],balls=[],lofts=[],rods=[],network,board}=model;
  const points=[...dots,...edges.flatMap(e=>[e.from,e.to]),...panels.flatMap(p=>p.points),
    ...lofts.flatMap(p=>[...p.bottom,...p.top]),...rods.flatMap(r=>[r.from,r.to])];
  if(model.screen)points.push(...model.screen.points,
    ...model.screen.grid.flatMap(e=>[e.from,e.to]),...model.screen.strokes.flatMap(e=>[e.from,e.to]));
  for(const shell of model.shells??[])for(const ring of shell.rings)for(const point of ring)points.push(point);
  for(const point of model.framePoints??[])points.push(point);
  for(const b of blocks)points.push([b.x-b.w/2,b.y-b.d/2,b.z],[b.x+b.w/2,b.y+b.d/2,b.z+b.h]);
  for(const b of balls)points.push(b.at.map(n=>n-b.r),b.at.map(n=>n+b.r));
  const solid=lathe??horizontal;
  if(solid){
    const length=horizontal?solid.length:solid.height;
    for(let i=0;i<=24;i++){
      const x=length*i/24,r=solid.radius(x);
      if(horizontal)points.push([x,-r,solid.radius(0)-r],[x,r,solid.radius(0)+r]);
      else points.push([-r,-r,x],[r,r,x]);
    }
  }
  if(arch){
    for(let i=0;i<=28;i++){
      const t=i/14-1;
      points.push([t*arch.width/2,-arch.depth/2,0],[t*arch.width/2,arch.depth/2,arch.profile(t)]);
    }
  }
  if(network)points.push(...network.points);
  if(board)points.push([-board.size/2,-board.size/2,0],[board.size/2,board.size/2,0]);
  if(model.axes)points.push(model.origin??[0,0,0]);
  if(model.tokens||model.boards||!points.length)points.push([-5,-3,0],[5,3,1]);
  return points;
}

export function extensionBounds(models){
  const points=models.flatMap(coordinates);
  const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity];
  for(const p of points)for(let k=0;k<3;k++){
    low[k]=Math.min(low[k],p[k]);high[k]=Math.max(high[k],p[k]);
  }
  return {low,high};
}

export function drawExtension(model,sample,api,options={}){
  const {add,loft,renderShellFace,line,dot,labels,tube,section,waterSurface,axes,loop,box,flush,glow,handle,feature,coordinate,studioFace,studioBox,mark}=api;
  const {lathe,horizontal,arch,blocks=[],edges=[],dots=[],panels=[],balls=[],lofts=[],rods=[],network,board}=model;
  const {low,high}=options.bounds??extensionBounds([model]);
  const origin=model.origin??[0,0,0];
  const solid=lathe??horizontal;
  const length=solid?(horizontal?solid.length:solid.height):0;
  const slice=x=>profileSlice(solid,Boolean(horizontal),x);
  const center=[0,1].map(k=>(low[k]+high[k])/2);
  const size=Math.min(9.5/Math.max(1,Math.hypot(high[0]-low[0],high[1]-low[1])),5.02/Math.max(1,high[2]-low[2]));
  const normalize=([x,y,z])=>[(x-center[0])*size,(y-center[1])*size,(z-low[2])*size];
  const face=(vs,color,outline=null,alpha=1)=>add(vs.map(normalize),color,outline,1,0,alpha);
  const join=(A,B,color=green,alpha=1,edges=false,shell=null,finish=null)=>loft(A.map(normalize),B.map(normalize),color,{alpha,edges,shell,finish});
  const segment=(a,b,color=gold,width=2)=>line(normalize(a),normalize(b),color,width);
  const marker=(at,r=.12,color=gold)=>dot(normalize(at),r,color,9);
  function controlPoint(point){handle?.('x',normalize(point));}
  const reference=dots.at(-1)??edges[0]?.to??lofts.at(-1)?.top[0]??(blocks[0]?[blocks[0].x,blocks[0].y,blocks[0].z+blocks[0].h]:null);
  const alignHandle=at=>{
    const side=options.viewSide??1;
    return model.screen?[at[0]*side,at[1]*side,at[2]]:at;
  };
  if(model.handle??reference)controlPoint(alignHandle(model.handle??reference));
  for(const [key,point] of Object.entries(model.handles??{}))handle(key,normalize(alignHandle(point)));
  const makeBox=(at,w,d,h,color,open=false)=>box(...normalize(at),w*size,d*size,h*size,color,open);
  const rod=(a,b,radius,color)=>tube(normalize(a),normalize(b),radius,color);
  const align=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
  const sceneId=options.id;
  const geometry={face,join,segment,rod,makeBox,marker,size};
  function markFeature(name,points){feature(name,points.map(normalize));}

  const tint=finishes.find(([,ids])=>ids.includes(sceneId))?.[0]??options.accent??green;
  const wood='#937057', metal='#8daead', stone='#8e9d93';
  function linePath(points,color,width){
    points.slice(1).forEach((p,i)=>segment(points[i],p,color,width));
  }
  function floor(x,y,z,w,d,color){
    makeBox([x,y,z-.11/size],w,d,.1/size,color);
    flush();
  }
  const foundation=options.approvedExpansion?blocks.filter(b=>b.z+b.h<=low[2]+.32/size&&b.w*b.d*size*size>8):[];
  for(const b of foundation){
    studioBox(...normalize([b.x,b.y,b.z]),b.w*size,b.d*size,b.h*size,b.color??tint,b.alpha??1,b.open,b.finish);
  }
  if(foundation.length)flush();
  if(model.axes){
    const width=Math.max(.8,(high[0]-low[0])*.96),depth=Math.max(.8,(high[1]-low[1])*.96);
    const base=model.origin?.[2]??0;
    face(rect(width/2,depth/2,base).map(([x,y,z])=>[x+center[0],y+center[1],z]),'#77b8b417','#6caea557',.44);
    flush();
  }
  for(const p of panels.filter(item=>item.ground)){
    if(p.water)waterSurface(p.points.map(normalize));
    else face(p.points,p.color,null,p.alpha??1);
  }
  if(panels.some(p=>p.ground))flush();

  if(model.axes){
    const span=Math.max(1,...high.map((n,i)=>n-low[i]));
    const tips=origin.map((_,k)=>origin.map((value,i)=>i===k?Math.max(high[i],value+span*.42):value));
    axes(normalize(origin),tips.map(normalize));
    if(options.projection){
      const endpointFirst=sceneId===51;
      const source=model.coordinates?.map(p=>p.at)??(sceneId===59?[origin,[0,0,lathe.cut]]:
        endpointFirst?[edges[0].from,edges[0].to]:
        sceneId===63?[edges[0].from,edges[0].to,edges[1].to]:
        [52,53,56,60,61].includes(sceneId)?(sceneId===53?[edges[0].from,...dots]:dots):
        [edges[0]?.from,...dots,edges[0]?.to].filter(Boolean));
      const names=model.coordinates?.map(p=>p.text)??(({52:['P','A','B','C'],59:['I','M'],60:['M','B'],61:['I','H'],63:['S','A','B']})[sceneId]??['A','B','C','D']);
      const unique=source.filter((point,i)=>source.findIndex(p=>p.every((n,k)=>n===point[k]))===i);
      unique.slice(0,model.coordinates?.length??4).forEach(point=>{
        const i=source.indexOf(point);
        const entry=model.coordinates?.[i],target=entry?.projection??[point[0],point[1],origin[2]];
        coordinate(names[i],normalize(point),entry?.actual??point.map((n,k)=>n-origin[k]),
          normalize(target),entry?.projectedActual??target.map((n,k)=>n-origin[k]));
      });
    }
    if(sceneId===59)markFeature('distance',[origin,[0,0,lathe.cut]]);
    else{
      const matches=sceneId===52?edges:sceneId===56||sceneId===60?edges.slice(1):sceneId===63?edges.slice(0,2):edges.slice(0,1);
      for(const e of matches)markFeature('distance',[e.from,e.to]);
    }
  }
  if(solid){
    drawProfileHardware(sceneId,solid,Boolean(horizontal),geometry);
    const faces=Array.from({length:25},(_,i)=>slice(length*i/24));
    const shell=solid.color??tint, wallAxis=horizontal?'longitudinal':'vertical';
    const partial=options.fill&&solid.cut!==undefined&&!solid.fill;
    const profileOpacity=[44,45,49,50].includes(sceneId)&&!options.cutaway?.68:.44;
    if(partial&&solid.cut>0){
      let prev=slice(0);
      for(let i=1;i<=18;i++){
        const next=slice(solid.cut*i/18);
        join(prev,next,water,.64);
        prev=next;
      }
      face(slice(0),water,null,.52);
    }
    const vessels=[34,36,37,38,41,47,48,50,59,67];
    if(vessels.includes(sceneId)){
      const axes=horizontal?[1,2]:[0,1], axisCenter=horizontal?solid.radius(0):0;
      const wall=.045/size;
      const outside=faces.map((rim,index)=>{
        const radius=solid.radius(length*index/(faces.length-1));
        const factor=radius>1e-9?1+wall/radius:1;
        return rim.map(p=>{
          const q=[...p];
          q[axes[0]]*=factor;
          q[axes[1]]=axisCenter+(q[axes[1]]-axisCenter)*factor;
          return q;
        });
      });
      const transparent=[34,41,59].includes(sceneId);
      const alpha=transparent?.23:options.fill?.22:.54;
      for(let i=1;i<faces.length;i++)join(outside[i-1],outside[i],shell,alpha,false,wallAxis);
      for(const i of [0,faces.length-1]){
        join(faces[i],outside[i],shell,.87,false,wallAxis);
        loop(outside[i].map(normalize),'#ede4c3ac',1.1);
      }
    }else for(let i=1;i<faces.length;i++)join(faces[i-1],faces[i],shell,solid.closed?.92:options.fill?.24:profileOpacity,false,wallAxis);
    if(solid.closed){for(const cap of [faces[0],faces.at(-1)])renderShellFace(cap.map(normalize),shell,.92,wallAxis);}
    if([26,36,38,45,48,50,67].includes(sceneId)){
      const bands=sceneId===50?[.10,.30,.70,.90]:sceneId===45?[.08,.17,.92]:[.08,.92];
      for(const t of bands){
        const rim=slice(length*t);
        loop(rim.map(normalize),sceneId===50?'#dfb780':'#c0d9d0',1.15);
        join(rim,slice(length*(t+.018)),sceneId===50?'#5e5144':metal,.88);
      }
    }
    if([38,67].includes(sceneId)){
      for(const t of [.21,.79]){
        const r=solid.radius(0);
        makeBox([length*t,0,-r*.15],length*.085,r*1.22,r*.52,metal);
      }
    }
    for(const rim of [faces[0],faces.at(-1)])loop(rim.map(normalize),'#e9e1c29e',1);
    if([34,36,37,38,67].includes(sceneId)){
      for(const at of [.035,.94]){
        join(slice(length*at),slice(length*(at+.027)),metal,.92);
        loop(slice(length*(at+.027)).map(normalize),'#ebdec1bb',1);
      }
    }
    if(!solid.closed&&![44,45,47,48,49,50].includes(sceneId)){
      for(let i=6;i<faces.length-1;i+=6)loop(faces[i].map(normalize),'#c2edce3c',.8);
    }
    if(solid.cut!==undefined){
      if(solid.fill&&solid.cut>0){
        let prev=slice(0);
        for(let i=1;i<=14;i++){const next=slice(solid.cut*i/14);join(prev,next,water,.65);prev=next;}
      }
      if(solid.fill){
        if(solid.cut>0)waterSurface(slice(solid.cut).map(normalize));
        if(sceneId===34&&options.motion?.pump){
          rod([0,0,length+.25/size],[solid.radius(length)+.2/size,0,length+.25/size],.045,metal);
          for(let i=0;i<7;i++){
            const t=(options.motion.time*2.4+i/7)%1;
            dot(normalize([0,0,length+.25/size-(length+.25/size-solid.cut)*t*t]),.031,water);
          }
        }
      }else section(slice(solid.cut).map(normalize));
      const at=horizontal?[solid.cut,0,solid.radius(0)+solid.radius(solid.cut)]:[solid.radius(solid.cut),0,solid.cut];
      markFeature('radius',[horizontal?[solid.cut,0,solid.radius(0)]:[0,0,solid.cut],at]);
      controlPoint(at);
      labels.push([solid.fill?'Mặt nước':'Lát cắt đang xét',normalize(at),solid.fill?water:gold]);
      if([34,44,45,46,47,48,49,50].includes(sceneId)){
        const radius=solid.radius(solid.cut),center=[0,0,solid.cut],rim=[radius,0,solid.cut];
        const color=solid.fill?'#aff7ec':'#ffdfa2';
        flush();
        segment(center,rim,color,1.65);
        marker(rim,.047,color);
        if(!options.thumbnail&&radius>0)mark('r '+fmt(Number(radius.toFixed(2)))+' '+(solid.unit??'m'),normalize([radius*.68,0,solid.cut+.12/size]),.26,color);
      }
    }
  }
  if(arch){
    drawArchStructure(sceneId,arch,geometry);
    const vertex=(u,y)=>[u*arch.width/2,y,arch.profile(u)];
    const d=arch.depth/2;
    for(let i=0;i<28;i++){
      const u=i/14-1,v=(i+1)/14-1;
      const active=options.fill&&arch.cut!==undefined&&u<arch.cut;
      const end=active?Math.min(v,arch.cut):v;
      const cladding=sceneId===43?(i%4===0?'#cbb984':'#a0b59e'):tint;
      renderShellFace([vertex(u,-d),vertex(v,-d),vertex(v,d),vertex(u,d)].map(normalize),cladding,
        sceneId===43?.69:i%4===0?.59:.38,'longitudinal');
      if(active){
        face([vertex(u,-d),vertex(end,-d),vertex(end,d),vertex(u,d)],water,null,.49);
        for(const y of [-d,d])face([[u*arch.width/2,y,0],[end*arch.width/2,y,0],vertex(end,y),vertex(u,y)],water,null,.53);
      }
      if(i%4===0)linePath([vertex(u,-d),vertex(u,d)],'#e5e2c3a8',1.05);
      for(const y of [-d*.5,0,d*.5])segment(vertex(u,y),vertex(v,y),'#eee3c56b',.65);
      for(const y of [-d,d])segment(vertex(u,y),vertex(v,y),pale,1);
    }
    face(rect(arch.width/2,d,0),dark,pale,.6);
    if(arch.cut!==undefined){
      const u=arch.cut,x=u*arch.width/2;
      section([[x,-d,0],[x,d,0],vertex(u,d),vertex(u,-d)].map(normalize));
      controlPoint(vertex(u,0));
      markFeature('radius',[[x,0,0],vertex(u,0)]);
      if([43,75].includes(sceneId)){
        const y=d+.17/size,height=arch.profile(u);
        const a=[x,y,0],b=[x,y,height];
        flush();segment(a,b,'#ffe8b0',1.65);
        if(!options.thumbnail)mark('h '+fmt(Number(height.toFixed(2)))+' m',normalize([x+.28/size,y,height*.54+.05/size]),.25,'#ffe8b0');
      }
      labels.push(['Lát cắt đang xét',normalize(vertex(u,0)),gold]);
    }
  }
  for(const p of panels){
    if(p.ground)continue;
    if(p.onlyCutaway&&!options.cutaway||p.hideCutaway&&options.cutaway)continue;
    if(sceneId===35&&p.highlight){
      const [a,b,c,d]=p.points;
      const deck=panels[0].points;
      for(const side of [[deck[0],deck[1]],[deck[3],deck[2]]]){
        const [low,high]=side,outer=point=>[point[0],point[1]+Math.sign(point[1])*.14/size,point[2]-.16/size];
        face([low,high,outer(high),outer(low)],'#ada990','#d5c7a8',.91);
      }
      for(const [left,right] of [[a,b],[d,c]]){
        face([[left[0],left[1],0],left,right],'#499bac','#b2ddd9',.55);
      }
      face([[a[0],a[1],0],[d[0],d[1],0],d,a],'#438f9c','#9dcac5',.62);
      waterSurface(p.points.map(normalize));
      const depth=Math.max(0,a[2]);
      const left=[a[0],a[1]-.26/size,0],right=[a[0],a[1]-.26/size,depth];
      segment(left,right,'#aff3eb',1.7);
      if(!options.thumbnail)mark('h '+fmt(Number(depth.toFixed(2)))+' m',normalize([left[0]-.18/size,left[1],depth*.58]),.25,'#aff3eb');
      if(options.motion?.pump){
        const offset=.27/size,z=a[2]+.63/size;
        rod([a[0]-offset,0,z],[a[0]+offset,0,z],.055,metal);
        for(let i=0;i<6;i++){
          const t=(options.motion.time*2.8+i/6)%1;
          dot(normalize([a[0]+offset,0,z-(z-a[2])*t*t]),.026,water);
        }
      }
      controlPoint(b);
    }else if(p.water)waterSurface(p.points.map(normalize));
    else if(p.highlight){
      section(p.points.map(normalize),p.color??water);
      markFeature('slice',p.points.concat([p.points[0]]));
    }
    else if(options.approvedExpansion&&(p.finish||p.alpha>=.7&&p.outline!==false))studioFace(p.points.map(normalize),p.color??tint,p.alpha??.95,p.finish,p.outline||null);
    else face(p.points,p.color??tint,p.outline===false?null:p.outline??'#c6edd4aa',p.alpha??.46);
  }
  for(const b of blocks){
    if(options.approvedExpansion){
      if(foundation.includes(b))continue;
      studioBox(...normalize([b.x,b.y,b.z]),b.w*size,b.d*size,b.h*size,b.color??tint,b.alpha??(b.open?.56:1),b.open,b.finish);
      continue;
    }
    const palette=sceneId===29?wood:[25,54].includes(sceneId)?metal:tint;
    const level=z=>rect(b.w/2,b.d/2,z).map(([x,y,z])=>[x+b.x,y+b.y,z]);
    if(sceneId===31){
      const at=drawFoldingBox(api,b.w,b.d,b.h,options.mechanism??1,normalize);
      handle('x',at);
      markFeature('height',[level(b.z)[1],level(b.z+b.h)[1]]);
      continue;
    }
    join(level(b.z),level(b.z+b.h),b.color??palette,b.alpha??(b.open ? .58 : .93),true,'vertical');
    loop(level(b.z+b.h).map(normalize),'#d5f3db88',.95);
    face(level(b.z),dark,light,.65);
    if(!b.open)face(level(b.z+b.h),shade(b.color??palette,1,.11),light,b.alpha??.94);
    if(b.open&&b.h>0){
      const lower=level(b.z),upper=level(b.z+b.h);
      for(const [i,p] of lower.entries())segment(p,upper[i],'#f3dfbcad',.85);
    }
  }
  for(const f of model.shells??[]){
    if(f.onlyCutaway&&!options.cutaway||f.hideCutaway&&options.cutaway)continue;
    const {rings,color,alpha,closed=true}=f;
    for(let i=1;i<rings.length;i++)join(rings[i-1],rings[i],color,alpha,false,f.cut?'vertical':null,f.finish);
    if(closed){
      if(options.approvedExpansion){
        studioFace([...rings[0]].reverse().map(normalize),color,alpha,f.finish);
        studioFace(rings.at(-1).map(normalize),color,alpha,f.finish,null,f.finish==='steel'||f.finish==='enamel');
      }else{
        face(rings[0],shade(color,.88),null,alpha);face(rings.at(-1),shade(color,1,.12),null,alpha);
      }
    }
  }
  for(const f of lofts){
    const material=f.color??([64,68].includes(sceneId)?wood:sceneId===69?'#ad6653':tint);
    join(f.bottom,f.top,material,.83,true,'vertical');face(f.bottom,dark,light,.65);renderShellFace(f.top.map(normalize),shade(material,1,.22),.76);
    if(sceneId===64){
      for(let i=1;i<10;i++)loop(f.bottom.map((p,k)=>normalize(align(p,f.top[k],i/10))),'#f6ddb0a3',.85);
    }
    if([65,69,70,74].includes(sceneId)){
      for(let i=0;i<f.bottom.length;i++){
        segment(f.bottom[i],f.top[i],'#f2ddaf',1.25);
        segment(f.top[i],f.top[(i+1)%f.top.length],'#e2d3ab',.8);
      }
    }
  }
  for(const {at,r,color,alpha} of balls){
    let prev;
    for(let i=0;i<=18;i++){
      const z=r*(i/9-1);
      const vertices=ring(Math.sqrt(Math.max(0,r*r-z*z)),z).map(p=>p.map((v,k)=>v+at[k]));
      if(prev)join(prev,vertices,color??green,alpha??(color?.length?1:.53),false,'vertical');
      prev=vertices;
    }
  }
  if(sceneId===25){
    const b=blocks[0];
    const corners=rect(b.w*.494,b.d*.494,b.z+b.h);
    waterSurface(corners.map(normalize));
    join(rect(b.w*.494,b.d*.494,b.z),corners,'#47a4b7',.26);
  }
  if(sceneId===27){
    const at=dots[0],r=.095,table=lathe.radius(0),top=lathe.height;
    markFeature('radius',[[0,0,top],[table,0,top]]);
    markFeature('height',[[0,0,top],at]);
    makeBox([0,0,at[2]],r*3,r*3,r*.5,stone);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6,b=a+Math.PI/6;
      face([at,[table*Math.cos(a),table*Math.sin(a),top+.005],[table*Math.cos(b),table*Math.sin(b),top+.005]],'#e3c776',null,.13);
    }
    glow(normalize(at),.49,'#fce2a0',.65,4);
  }
  if(sceneId===32){
    const [a,b,c]=edges;
    for(const e of [a,b,c,edges[3]]){
      const from=e.from,to=e.to;
      if(Math.hypot(...from.map((v,k)=>v-to[k]))<1e-6)continue;
      for(let i=0;i<=4;i++){
        const p=align(from,to,i/4);
        rod(p,[p[0],p[1],p[2]+.22/size],.035,wood);
      }
      for(const z of [.10/size,.20/size])rod(from.map((p,k)=>p+(k===2?z:0)),to.map((p,k)=>p+(k===2?z:0)),.021,wood);
    }
  }
  if(sceneId===30){
    const [first]=rods;
    if(first)markFeature('distance',[first.from,first.to]);
    markFeature('height',[[0,0,0],dots[0]]);
  }
  if(sceneId===33){
    for(const {from,to} of edges)markFeature('distance',[from,to]);
    const [sx,sy]=dots[0],land=dots[2][0],depth=-sy;
    floor(land/2,.35*depth,0,land,.7*depth,'#56856d');
    const rowing=Math.hypot(dots[1][0]-sx,depth)/(options.conditions?.rowSpeed??3);
    const walking=(land-dots[1][0])/(options.conditions?.walkSpeed??5);
    const elapsed=(rowing+walking)*(options.mechanism??0);
    const rowProgress=Math.min(1,elapsed/rowing);
    const boat=align(dots[0],dots[1],rowProgress);
    const angle=Math.atan2(depth,dots[1][0]-sx);
    const w=Math.min(.37/size,depth*.23),l=w*2.2;
    const local=(u,v,z)=>[boat[0]+u*Math.cos(angle)-v*Math.sin(angle),boat[1]+u*Math.sin(angle)+v*Math.cos(angle),z];
    const hull=[[l,0],[l*.35,w],[-l*.65,w*.67],[-l,0],[-l*.65,-w*.67],[l*.35,-w]];
    join(hull.map(([u,v])=>local(u*.78,v*.71,.018)),hull.map(([u,v])=>local(u,v,w*.47)),wood);
    for(const u of [-.37,0,.41])rod(local(u*l,-w*.68,w*.34),local(u*l,w*.68,w*.34),.038,'#c3a277');
    for(const v of [-1,1]){
      const stroke=Math.sin(rowProgress*Math.PI*16)*w*.47;
      rod(local(-w*.26,0,w*.86),local(stroke,w*1.66*v,w*.06),.025,'#cdc08d');
    }
    const walkingProgress=walking>0?Math.max(0,(elapsed-rowing)/walking):0;
    const at=elapsed>rowing?align(dots[1],dots[2],walkingProgress):local(0,0,w*.49);
    const z=at[2], height=.73/size;
    const stride=elapsed>rowing?Math.sin(walkingProgress*Math.PI*20)*height*.26:0;
    rod([at[0],at[1],z+height*.34],[at[0],at[1],z+height*.77],.079,'#dba16c');
    dot(normalize([at[0],at[1],z+height*.91]),.084,'#dec6a4');
    for(const side of [-1,1])rod([at[0],at[1],z+height*.37],[at[0]+side*stride,at[1]+side*.1/size,z+height*.04],.032,wood);
    if(rowProgress>0&&rowProgress<1){
      for(const side of [-1,1])segment(local(-l*.78,side*w*.75,.015),local(-l*1.7,side*w*1.35,.015),'#c0e9dfab',1.15);
    }
  }
  if(sceneId===51){
    const {from,to}=edges[0],dx=to[0]-from[0],dy=to[1]-from[1],span=Math.hypot(dx,dy);
    const normal=[-dy/span,dx/span],w=.52;
    const at=(p,u)=>[p[0]+normal[0]*u*w,p[1]+normal[1]*u*w,p[2]+u*u*.43];
    const profile=p=>[-1,-.7,-.35,0,.35,.7,1].map(u=>at(p,u));
    const upper=profile(from),lower=profile(to);
    for(let i=1;i<upper.length;i++)face([upper[i-1],upper[i],lower[i],lower[i-1]],i%2?'#77c4c9':'#5eaaaf','#acdcd9',.86);
    for(const side of [-1,1])rod(at(from,side),at(to,side),.043,metal);
    for(const t of [.18,.36,.54,.72,.90]){
      const middle=align(from,to,t),a=at(middle,-1),b=at(middle,1);
      const underside=p=>[p[0],p[1],Math.max(0,p[2]-.51)];
      rod(underside(a),underside(b),.031,'#6e8988');
    }
    for(const t of [0,.31,.64]){
      const p=align(from,to,t);
      rod([p[0],p[1],0],p,.07,stone);
    }
    const progress=options.mechanism??0,position=align(from,to,progress*progress);
    const radius=Math.min(.19/size,w*.64),z=position[2]+.085/size;
    const float=(r,h)=>ring(r,h,24).map(([x,y,z])=>[x+position[0],y+position[1],z]);
    join(float(radius*.87,z),float(radius,z+radius*.44),'#e49d55');
    join(float(radius,z+radius*.44),float(radius*.87,z+radius*.80),'#eac46e');
    join(float(radius*.43,z+radius*.13),float(radius*.52,z+radius*.72),'#d88347');
    loop(float(radius*.74,z+radius*.79).map(normalize),'#ecce997a',1);
    if(progress>.85){
      const splash=(progress-.85)/.15;
      loop(ring(radius*(1+splash*2),.018,22).map(([x,y,z])=>normalize([x+to[0],y+to[1],z])),'#ceeee6ad',1);
    }
  }
  if(sceneId===52){
    const [p,...anchors]=dots;
    const shadeRing=ring(.48,p[2]-.5,24).map(([x,y,z])=>[p[0]+x,p[1]+y,z]);
    const cap=ring(.20,p[2],24).map(([x,y,z])=>[p[0]+x,p[1]+y,z]);
    join(shadeRing,cap,'#d6ac73',.95);
    face(shadeRing,'#f3d298');
    glow(normalize([p[0],p[1],p[2]-.51]),.63,'#f2d492',.5,1);
    face(anchors,'#81aaa3','#9ec2b7',.49);
    for(const e of edges)rod(e.from,e.to,.029,'#ded5ae');
  }
  if(sceneId===53){
    for(const e of edges.slice(1))rod(e.from,e.to,.065,metal);
    for(const z of [.08,edges[0].to[2]*.53]){
      for(const x of [0,4])rod([x,0,z],[x,3,z],.041,metal);
      for(const y of [0,3])rod([0,y,z],[4,y,z],.041,metal);
    }
  }
  if(sceneId===54){
    const shell=blocks[0];
    for(let i=1;i<=7;i++){
      const z=shell.h*i/8;
      const level=rect(4,3,z).map(normalize);
      loop(level,'#afc4c193',.98);
    }
    for(const x of [-4,4])for(const y of [-3,3])rod([x,y,0],[x,y,shell.h],.037,metal);
  }
  if(sceneId===55){
    const [from,to]=dots,progress=options.mechanism??0;
    const p=align(from,to,progress);
    const angle=Math.atan2(to[1]-from[1],to[0]-from[0]);
    const body=(u,v,w)=>[p[0]+(u*Math.cos(angle)-v*Math.sin(angle))/size,
      p[1]+(u*Math.sin(angle)+v*Math.cos(angle))/size,p[2]+w/size];
    const bodyColor='#408ba1';
    rod(body(-.24,0,.09),body(.16,0,.13),.119,bodyColor);
    face([body(-.21,-.041,.105),body(-.50,-.116,.145),body(-.50,.114,.145),body(-.21,.041,.105)],'#568e94');
    rod(body(-.11,0,.007),body(.135,0,.071),.068,'#bb7c52');
    dot(normalize(body(.23,0,.17)),.106,'#3f7f99');
    rod(body(.29,0,.17),body(.59,0,.13),.028,'#dfae68');
    const flap=Math.sin(progress*(2*Math.PI)*4)*.13*(1-progress);
    for(const side of [-1,1]){
      face([body(.12,side*.075,.14),body(-.04,side*.41,.13+flap),
        body(-.31,side*.42,.07+flap),body(-.19,side*.11,.04)],'#287d92','#70b9ba');
      dot(normalize(body(.27,side*.075,.20)),.023,'#dad7b1');
    }
    if(progress>.87){
      const fade=(progress-.87)/.13;
      loop(ring((.18+.43*fade)/size,.021,24).map(([x,y,z])=>normalize([x+to[0],y+to[1],z])),'#9cfff1b4',1.24);
    }
  }
  if(sceneId===56)for(const [i,p] of dots.entries()){
    drawBalloon(api,normalize(p),.56,i?'#b47655':'#558c96');
  }
  if([57,60,63,66,71].includes(sceneId)){
    for(const [i,e] of edges.entries()){
      const main=sceneId!==63||i<2;
      if(main)rod(e.from,e.to,sceneId===66&&i<2?.034:.059,i===0&&[57,60].includes(sceneId)?gold:metal);
    }
  }
  if(sceneId===58)glow(normalize(dots[0]),.64,'#f4d17c',.55,7);
  if(sceneId===62){
    const {from,to}=edges[0];
    rod(from,to,.04,'#e4bb75');
    for(let i=1;i<=8;i++){
      const p=align(from,to,i/9);
      dot(normalize(p),.034,'#f7e2aa',2);
    }
  }
  if(options.motion&&[58,62].includes(sceneId)){
    const {from,to}=edges[0];
    const t=options.motion.time*.58%1;
    const head=align(from,to,t);
    const tail=align(from,to,Math.max(0,t-.14));
    const color=sceneId===58||sceneId===62?'#ffe3a1':'#cef6ed';
    segment(tail,head,color,2.5);
    dot(normalize(head),.067,color,7);
    glow(normalize(head),.38,color,.66,6);
  }
  for(const [i,{from,to,color,width}] of edges.entries()){
    const contrast=([51,57,60,62,63,66].includes(sceneId)&&i>0)?'#c4e0d39c':gold;
    segment(from,to,color??contrast,width??(i===0?2.25:1.2));
  }
  drawObjectAttachments(sceneId,model,geometry);
  for(const r of rods)tube(normalize(r.from),normalize(r.to),Math.max(.021,r.radius*size),r.color??gold,r.finish);
  for(const p of dots)marker(p);
  for(const lamp of model.lamps??[]){
    dot(normalize(lamp.at),lamp.r*.29,lamp.color,.12);
    glow(normalize(lamp.at),lamp.r,lamp.color,.72,.13);
  }
  if(network){
    for(const [a,b] of network.edges)segment(network.points[a],network.points[b],pale,1.4);
    const max=Math.max(1,...network.values);
    network.points.forEach((p,i)=>{
      const v=network.values[i];
      const color=network.colors?colors[(sample?.[i]??v-1)%colors.length]:v?gold:green;
      marker(p,.13+.15*Math.sqrt(v/max),color);
      if(network.labels[i]) {
        const q=normalize(p);q[2]+=.43;
        labels.push([network.labels[i]+(network.edges.length?' · '+fmt(v):''),q]);
      }
    });
  }
  if(board){
    const {size:n,values,start}=board,max=Math.max(1,...values);
    for(let i=0;i<n*n;i++){
      const x=i%n-n/2+.5,y=Math.floor(i/n)-n/2+.5;
      const vertices=rect(.49,.49,.01).map(([u,v,z])=>[u+x,v+y,z]);
      face(vertices,i===start?gold:(i%n+Math.floor(i/n))%2?pale:dark,'#213e32');
      if(values[i])marker([x,y,.025],.06+.19*Math.sqrt(values[i]/max),i===start?dark:gold);
    }
  }
  function showTokens(spec,dy,z,useSample){
    const {count,marked,kind,label}=spec;
    const floor=rect(3.95,1.23,z-.09).map(([x,y,h])=>[x,y+dy+.7,h]);
    add(floor,'#1c4739','#83bba282',1.15);
    for(let i=0;i<floor.length;i++)line(floor[i],floor[(i+1)%floor.length],'#aad7bb62',1);
    const n=Math.min(count,36);
    const cols=Math.min(10,n);
    for(let i=0;i<n;i++){
      const x=(i%cols-(cols-1)/2)*.72,y=Math.floor(i/cols)*.68+dy;
      const color=useSample?(sample[i]?gold:water):i<marked?gold:water;
      if(kind==='ball')dot([x,y,z+.1],.19,color,3);
      else {
        if(sceneId===72){
          box(x,y,z-.02,.66,.61,.15,i<marked?'#558f8b':'#547683');
          add(rect(.31,.28,z+.14).map(([a,b,c])=>[a+x,b+y,c]),i<marked?'#79c4b1':'#77abb7');
          for(const [dx,dy,side] of [[-.13,-.09,-1],[.15,.12,1]]){
            const c=i<marked?'#e2b182':'#c4d5bd';
            add([[x+dx-.10,y+dy,z+.157],[x+dx+.15,y+dy,z+.157],[x+dx+.10,y+dy+.039,z+.157],
                 [x+dx,y+dy+.105*side,z+.157]],c);
          }
          for(const edge of [-.29,.29])line([x-.31,y+edge,z+.146],[x+.31,y+edge,z+.146],'#d4e7cf',.6);
          continue;
        }
        if(sceneId===73){
          if(i<marked){
            box(x,y,z,.54,.52,.10,'#e3d8b9');
            box(x,y,z+.097,.55,.53,.035,i%2?'#426d7b':'#aa7758');
            for(let j=0;j<4;j++)line([x-.19,y-.17+j*.11,z+.136],[x-.11,y-.17+j*.11,z+.136],light,.87);
          }else{
            tube([x,y-.21,z+.064],[x,y+.22,z+.064],.045,i%2?'#507b91':'#986e56');
            tube([x,y+.23,z+.064],[x,y+.30,z+.064],.025,'#c8bda5');
            line([x-.035,y-.19,z+.10],[x-.035,y-.039,z+.10],pale,.9);
          }
          continue;
        }
        const vertices=(kind==='coin'?ring(.24,z+.06,16):rect(.21,.24,z+.06)).map(([u,v,w])=>[u+x,v+y,w]);
        const bottom=vertices.map(([x,y,w])=>[x,y,w-.12]);
        loft(bottom,vertices,color,{edges:kind!=='coin'});
        add(vertices,shade(color,1,.13),'#d4efd9b8',.65);
      }
    }
    if(label)labels.push([label,[0,dy-.65,z+.25],light]);
  }
  if(model.tokens)showTokens(model.tokens,2.4,.12,false);
  if(model.boards)model.boards.forEach((spec,i)=>showTokens(spec,i*2.25,.13,false));
  if(sample&&!network?.colors)showTokens({count:sample.length,marked:0,label:'Kết quả lượt thử gần nhất',kind:'coin'},-3.3,.27,true);
  for(const label of model.labels??[])labels.push([label.text,normalize(label.at),label.color]);
  if(model.note)labels.push([model.note,[0,-2,3.9],light]);
  if(model.dimensions?.length){
    flush();
    for(const {from,to,text,color='#ffe2a2',offset=[0,0,0]} of model.dimensions){
      const a=from.map((v,i)=>v+offset[i]),b=to.map((v,i)=>v+offset[i]);
      const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);
      if(len<1e-8)continue;
      const cross=[-d[1],d[0],0];
      if(Math.hypot(...cross)<1e-8)cross[0]=len;
      const tail=cross.map(v=>v*.081/(size*Math.hypot(...cross)));
      segment(a,b,color,1.65);
      for(const [point,end] of [[a,from],[b,to]]){
        segment(point.map((v,i)=>v-tail[i]),point.map((v,i)=>v+tail[i]),color,1.35);
        if(Math.hypot(...offset)>1e-8)segment(end,point,color+'70',.8);
      }
      if(!options.thumbnail&&text){
        const mid=align(a,b,.5).map((v,i)=>v+tail[i]*1.4+(i===2?.135/size:0));
        mark(text,normalize(mid),.37,color);
      }
    }
  }
  if(model.surfaceMarks?.length){
    flush();
    for(const {text,at,color} of model.surfaceMarks)mark(text,normalize(at),options.thumbnail?.18:.23,color);
  }
  if(model.screen){
    // Keep the graph and its grid on the visible face of the display.
    const {depth,grid,strokes,points,regions,readings}=model.screen;
    const side=options.viewSide??1;
    const plot=([x,,z])=>[x*side,depth*side,z];
    flush();
    for(const region of regions)face(region.points.map(plot),region.color);
    flush();
    for(const group of [grid,strokes]){
      for(const {from,to,color,width} of group)segment(plot(from),plot(to),color,width);
      flush();
    }
    points.forEach((at,i)=>marker(plot(at),i===0?.105:.075,i===0?'#f8d488':'#f0e8cc'));
    if(!options.thumbnail){
      for(const {text,at,color} of readings)mark(text,normalize(plot(at)),.22,color);
    }
  }
}
