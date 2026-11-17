import {drawFoldingBox,drawClearanceTruck,liftThroughOpening,urnBallStates,clipSolidFace,swingAngle} from './scene-mechanics.mjs';
import {bounceHeight,tossHeight,dieRoll} from './scene-motion.mjs';
import {drawAircraft,drawGlassJar,drawBalloon,drawAnt,drawFlange,drawFoldingRim} from './scene-details.mjs';
import {drawProbability} from './probability-scene.mjs';
import {beadPaint,panelPaint,shade,surfaceColor,tubeRings} from './scene-material.mjs';
import {paintEnvironment,groundGridColor,paintCastShadows} from './scene-environment.mjs';
import {bevelBox,finishFor,paintStudio,studioLight,studioPaint,studioTexture} from './studio-finish.mjs';
import {drawExtension} from './extension-scene.mjs';
import {kingCounts,fmt} from './lessons.mjs';
import {urnLayout} from './probability-lab.mjs';
const TAU=2*Math.PI;
const green='#579984', pale='#9dccaf', light='#d6eed9', gold='#edbc6d', ink='#344f47', dark='#245648', water='#54bcbd';
const row = n => Array.from({length:n},(_,i)=>i);
const ring=(r,z,n=36,ry=r)=>row(n).map(i=>[r*Math.cos(i*TAU/n),ry*Math.sin(i*TAU/n),z]);
const square=(x,y,z)=>[[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]];
const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);

export function plotScene(canvas,lesson,state) {
  const chart=lesson.plot;
  const c=canvas.getContext('2d');
  const [w,h]=prepare(canvas,c);
  const pts=row(101).map(i=>{const x=chart.min+(chart.max-chart.min)*i/100;return [x,chart.fn(x)];});
  const lo=Math.min(...pts.map(p=>p[1])), hi=Math.max(...pts.map(p=>p[1]));
  const pad=(hi-lo||1)*.1, l=54,r=w-23,t=53,b=h-53;
  const sx=x=>l+(r-l)*(x-chart.min)/(chart.max-chart.min);
  const sy=y=>b-(b-t)*(y-lo+pad)/(hi-lo+2*pad);
  c.font='12px Inter, system-ui';c.fillStyle=light;
  c.fillText(chart.yLabel,16,32);
  c.textAlign='right';
  for(const i of row(5)) {
    const y=lo+(hi-lo)*i/4,p=sy(y);
    c.lineWidth=1;c.strokeStyle='#65837766';
    c.beginPath();c.moveTo(l,p);c.lineTo(r,p);c.stroke();
    c.fillText(fmt(Number(y.toFixed(1))),l-8,p+4);
  }
  for(const i of row(5)) {
    const x=chart.min+(chart.max-chart.min)*i/4;
    c.textAlign='center';c.fillText(fmt(Number(x.toFixed(1))),sx(x),b+13);
  }
  c.textAlign='right';c.fillText(chart.label,r,h-15);
  c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(sx(x),sy(y)):c.moveTo(sx(x),sy(y)));
  c.strokeStyle='#a3e6bf';c.lineWidth=2.7;c.stroke();
  const xx=sx(state.x),yy=sy(chart.fn(state.x));
  c.strokeStyle=gold;c.lineWidth=1;c.setLineDash([3,4]);
  c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,b);c.stroke();c.setLineDash([]);
  c.beginPath();c.arc(xx,yy,5,0,TAU);c.fillStyle=gold;c.fill();
}

function prepare(canvas,c,resolution) {
  const [w,h]=resolution??[canvas.clientWidth,canvas.clientHeight];
  const d=resolution?1:Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(w*d)) canvas.width=Math.round(w*d);
  if(canvas.height!==Math.round(h*d)) canvas.height=Math.round(h*d);
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
  return [w,h];
}
export function drawScene(canvas,mode,s,yaw,sample=null,extension=null,zoom=1,elevation=null,selectedLabel=-1,probability=null,options={}) {
  const c=canvas.getContext('2d');
  const settings=s.conditions;
  const measure=Boolean(options.measure);
  const [W,H]=measure?[canvas.clientWidth,canvas.clientHeight]:prepare(canvas,c,options.resolution);
  if(!W||!H) return;
  const studio=Boolean(options.approvedExpansion);
  const stadium=mode==='stadium';
  const probabilityId=probability?.id;
  const nativeProbability=probability&&probabilityId<=91;
  const tallLab=[20,23,85].includes(probabilityId);
  const angle=elevation??(stadium?.61:.49);
  const vertical=Math.sin(angle), up=Math.cos(angle);
  const margin=options.thumbnail?3:24;
  const probabilityFit=Math.min(W/11.7,(H-margin)/(tallLab?7.7:4.6+4.8*vertical));
  const fit=stadium?Math.min(W/14.5,(H-margin)/(5.75+vertical*3)):
    nativeProbability?probabilityFit:Math.min(W/12.1,(H-margin)/(6.5+3.4*vertical));
  const scale=fit*zoom;
  const ce=Math.cos(yaw),se=Math.sin(yaw);
  const viewDirection=[up*se,up*ce,vertical];
  const halfVector=[viewDirection[0]-.42,viewDirection[1]-.49,viewDirection[2]+.76];
  const view=[...halfVector.map(n=>n/Math.hypot(...halfVector)),...viewDirection];
  const rest=stadium?.58:tallLab?.72:nativeProbability?.55:.68;
  const base=H*(.5+(rest-.5)*zoom);
  const a=[0,0,0];
  const [panX,panY]=options.pan??[0,0];
  const crop=zoom>1.8||Math.abs(panX)>W*.2||Math.abs(panY)>H*.2;
  const fill=options.fill;
  const motion=options.motion;
  const animatedX=motion?.key==='x'?motion.raw:s.x;
  const project=([x,y,z])=>{
    const v=x*se+y*ce;
    const depth=up*v+vertical*z;
    const perspective=studio&&!options.orthographic&&angle<1.2?38/(38-depth):1;
    return [W/2+panX+scale*perspective*(x*ce-y*se),base+panY+scale*perspective*(vertical*v-up*z),depth];
  };
  const bounds={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};
  const handles=options.registerHandle?new Map():null;
  const handle=(key,point)=>handles?.set(key,point);
  const featurePaths=[],coordinatePoints=[];
  function feature(kind,points,closed=false){
    if(kind===options.feature&&points.length>1)featurePaths.push({points,closed});
  }
  function coordinate(label,point,actual,projected,actualProjection=[actual[0],actual[1],0]){
    if(!options.projection||measure||options.thumbnail)return;
    coordinatePoints.push({label,actual,projected:actualProjection});
    if(actual.some((n,k)=>Math.abs(n-actualProjection[k])>1e-8)){
      featurePaths.push({points:[point,projected],dashed:true});
      dot(projected,.077,'#bfefff',10);
    }
    dot(point,.094,'#f8d388',10);
    mark(label,[point[0],point[1],point[2]+.16],.31,'#fff0c8');
  }
  let collect=Boolean(options.measure||options.registerHandle);
  let faces=[];
  const batches=[],shadows=[];
  const floorY=measure||(studio||options.isolatedPreview)&&options.thumbnail?0:studio?paintStudio(c,W,H,options.id,vertical,panY):paintEnvironment(c,W,H,vertical,options.id??probabilityId,panY,yaw);
  const shadowPoint=([x,y,z])=>project([x+Math.max(0,z)*.50,y+Math.max(0,z)*.58,0]).slice(0,2);
  function shadowFor(points,round){
    if(round){
      const [x,y]=shadowPoint(points[0]);
      const radius=round*scale;
      shadows.push({ellipse:[x,y,radius,Math.max(.6,radius*vertical)]});
    }else{
      shadows.push({polygon:points.map(shadowPoint)});
    }
  }
  function add(points,fill,stroke,width=1,round=0,alpha=1,extra=0,finish=null) {
    const pp=points.map(project);
    if(collect){
      const r=round*scale;
      for(const [x,y] of pp){
        bounds.left=Math.min(bounds.left,x-r);
        bounds.top=Math.min(bounds.top,y-r);
        bounds.right=Math.max(bounds.right,x+r);
        bounds.bottom=Math.max(bounds.bottom,y+r);
      }
    }
    if(measure)return;
    if(crop){
      const pad=round*scale+Math.max(2,width);
      if(pp.every(([x])=>x<-pad)||pp.every(([x])=>x>W+pad)||
        pp.every(([,y])=>y<-pad)||pp.every(([,y])=>y>H+pad))return;
    }
    if(!((studio||options.isolatedPreview)&&options.thumbnail)&&options.id!==128&&alpha>=.7&&fill?.length===7&&(round?round*scale>2.25:points.length>=3)&&points.some(p=>p[2]>.06)){
      shadowFor(points,round);
    }
    const depth=pp.reduce((sum,p)=>sum+p[2],0)/pp.length;
    faces.push({d:depth+extra,paint:()=>{
      c.globalAlpha=alpha;
      c.beginPath();
      if(round)c.arc(pp[0][0],pp[0][1],round*scale,0,TAU);
      else{
        c.moveTo(pp[0][0],pp[0][1]);
        for(const p of pp.slice(1))c.lineTo(p[0],p[1]);
        if(fill)c.closePath();
      }
      if(fill){
        c.fillStyle=round?beadPaint(c,pp[0][0],pp[0][1],round*scale,fill):finish?studioPaint(c,pp,fill,finish):panelPaint(c,pp,fill);
        c.fill();
        if(finish&&!round&&!options.thumbnail){
          studioTexture(c,pp,finish);
          if(stroke){
            c.beginPath();c.moveTo(pp[0][0],pp[0][1]);
            for(const [x,y] of pp.slice(1))c.lineTo(x,y);
            c.closePath();
          }
        }
      }
      if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}
      c.globalAlpha=1;
    }});
  }
  function glow(point,r,color,alpha=.6,extra=0,flatten=1){
    if(measure)return;
    const [px,py,depth]=project(point);
    const size=r*scale;
    if(size<.45||alpha<=0)return;
    faces.push({d:depth+extra,paint:()=>{
      c.save();c.translate(px,py);c.scale(1,flatten);
      const light=c.createRadialGradient(0,0,0,0,0,size);
      light.addColorStop(0,color);
      light.addColorStop(1,color+'00');
      c.fillStyle=light;c.globalAlpha=alpha;
      c.beginPath();c.arc(0,0,size,0,TAU);c.fill();c.restore();
    }});
  }
  function mark(text,point,size,fill){
    if(measure)return;
    const [px,py,depth]=project(point);
    faces.push({d:depth+1.1,paint:()=>{
      c.save();c.font='750 '+Math.max(8,Math.min(19,size*scale))+'px system-ui';
      c.textBaseline='middle';c.textAlign='center';c.fillStyle=fill;
      c.fillText(text,px,py);c.restore();
    }});
  }
  function flush(){if(faces.length)batches.push(faces.sort((a,b)=>a.d-b.d));faces=[];}
  function line(a,b,color=light,width=1.6){add([a,b],null,color,width,0,1,.028);}
  function dot(p,r,color=gold,extra=0){add([p],color,null,1,r,1,extra);}
  function loop(points,color,width=1){
    points.forEach((point,i)=>line(point,points[(i+1)%points.length],color,width));
  }
  const shellPlane=kind=>!options.cutaway?null:kind==='longitudinal'?
    ([,y])=>y*(ce<0?-1:1):([x,y])=>x*se+y*ce;
  function renderShellFace(points,color,alpha=1,kind='vertical'){
    const visible=clipSolidFace(points,shellPlane(kind));
    if(visible.length>=3)add(visible,measure?null:surfaceColor(points,color,alpha<.65,view),null,1,0,alpha);
  }
  function loft(A,B,color,{alpha=1,edges=false,glass=alpha<.65,shell=null,finish=null}={}) {
    const plane=shell?shellPlane(shell):null;
    for(let i=0;i<A.length;i++){
      const j=(i+1)%A.length;
      const face=[A[i],A[j],B[j],B[i]];
      const visible=clipSolidFace(face,plane);
      if(visible.length>=3){
        const material=studio?(finish??finishFor(color,'loft',alpha)):null;
        const shade=measure?null:studio?studioLight(face,color,material,view):surfaceColor(face,color,glass,view);
        add(visible,shade,edges?'#d6f3df50':null,.58,0,alpha,0,material);
      }
    }
  }
  function studioFace(points,color,alpha=1,finish=null,stroke=null,fragment=false){
    const material=finish??finishFor(color,'panel',alpha);
    const shaded=measure?null:studioLight(points,color,material,view);
    if(fragment&&alpha>=.7&&points.length>10&&points.every(p=>Math.abs(p[2]-points[0][2])<1e-6)){
      const center=points[0].map((_,i)=>points.reduce((sum,p)=>sum+p[i],0)/points.length);
      for(let i=0;i<points.length;i++){
        add([center,points[i],points[(i+1)%points.length]],shaded,null,1,0,alpha,0,'flat');
      }
    }else add(points,shaded,stroke,1,0,alpha,0,material);
  }
  function tube(from,to,radius,color,finish=null){
    const rings=tubeRings(from,to,radius,studio&&radius*scale>6?20:12);
    if(!rings)return;
    const material=studio?(finish??finishFor(color,'tube')):null;
    loft(...rings,color,{finish:material});
    if(material){
      studioFace([...rings[0]].reverse(),color,1,material);
      studioFace(rings[1],color,1,material);
    }else{
      add(rings[0],shade(color,.75));
      add(rings[1],shade(color,1,.15));
    }
  }
  function studioBox(x,y,z,w,d,h,color,alpha,open,finish){
    const material=finish??finishFor(color,'block',alpha);
    const rings=bevelBox(x,y,z,w,d,h);
    if(!rings)return;
    // Tiny repeated parts use a single extrusion at preview resolution.
    const tiers=Math.min(w,d,h)*scale<3?[square(w/2,d/2,0),square(w/2,d/2,h)].map(r=>r.map(([u,v,t])=>[x+u,y+v,z+t])):rings;
    for(let i=1;i<tiers.length;i++)loft(tiers[i-1],tiers[i],color,{alpha,finish:material});
    studioFace([...tiers[0]].reverse(),color,alpha,material);
    if(!open)studioFace(tiers.at(-1),color,alpha,material);
  }
  function section(points,color=gold){
    feature('slice',points,true);
    add(points,shade(color,.86,.1),'#fff0c8',1.25,0,.83,.07);
    const count=Math.floor(points.length/8);
    const mid=points[0].map((_,k)=>points.reduce((sum,p)=>sum+p[k],0)/points.length);
    if(points.length===3){
      for(let i=1;i<7;i++){
        const t=i/7;
        add([mix(points[0],points[1],t),mix(points[0],points[2],t)],null,'#fff3d180',.65,0,1,.17);
      }
    }else if(points.length>4){
      for(let i=0;i<points.length/2;i+=Math.max(1,count))add([points[i],points[(i+Math.floor(points.length/2))%points.length]],null,'#fff3d16b',.7,0,1,.17);
      dot(mid,.045,'#fff4d6',.18);
    }else{
      for(let i=1;i<7;i++){
        const t=i/7;
        add([mix(points[0],points[3],t),mix(points[1],points[2],t)],null,'#fff3d180',.65,0,1,.17);
      }
    }
  }
  function waterSurface(points){
    // Reflection streaks are drawn between matched points on opposite banks.
    feature('slice',points,true);
    add(points,studio?'#4794a1':'#4199a7',studio?'#c8edf1':'#baedeb',1.18,0,.82,.04,studio?'water':null);
    const middle=points[0].map((_,axis)=>points.reduce((sum,p)=>sum+p[axis],0)/points.length);
    const lifted=(p,k)=>[p[0],p[1],p[2]+k];
    if(points.length===4){
      for(const t of [.15,.26,.52,.79]){
        const left=mix(points[0],points[3],t),right=mix(points[1],points[2],t);
        line(lifted(mix(left,right,.13),.009),lifted(mix(left,right,.68),.009),'#d6f5e965',.75);
      }
    }else{
      for(let i=0;i<points.length;i+=5){
        const point=points[i],next=points[(i+2)%points.length];
        line(lifted(mix(middle,point,.76),.008),lifted(mix(middle,next,.81),.008),'#e2fff082',.7);
      }
    }
  }
  let coordinateFrame;
  function axes(origin,tips){
    coordinateFrame={origin,tips};
    const colors=['#f0b071','#84d0aa','#80c9df'];
    tips.forEach((tip,index)=>{
      const color=colors[index];
      line(origin,tip,'#192f2b',3.15);
      line(origin,tip,color,1.6);
      const length=Math.hypot(...tip.map((n,i)=>n-origin[i]));
      if(length>.24)tube(mix(origin,tip,1-.22/length),tip,.035,color);
    });
  }
  function drawAxisLetters(){
    if(!coordinateFrame)return;
    const origin=project(coordinateFrame.origin);
    const colors=['#ffe9b5','#a8f2cc','#a6e6ff'];
    const points=coordinateFrame.tips.map((tip,index)=>{
      const [x,y]=project(tip);
      const dx=x-origin[0],dy=y-origin[1],length=Math.hypot(dx,dy);
      if(length<25)return [x+16,y-14,colors[index]];
      return [x+dx*11/length,y+dy*11/length,colors[index]];
    });
    points.push([origin[0]-9,origin[1]+12,'#f0fff4']);
    const placed=[];
    c.save();
    c.font=options.thumbnail?'700 italic 13px Georgia, serif':'700 italic 14px Georgia, serif';
    c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
    for(const [i,[px,py,color]] of points.entries()){
      const x=Math.max(10,Math.min(W-10,px));
      let y=Math.max(12,Math.min(H-12,py));
      while(placed.some(([lx,ly])=>Math.abs(lx-x)<15&&Math.abs(ly-y)<15)&&y+16<=H-12)y+=16;
      placed.push([x,y]);
      c.strokeStyle='#0d2b23';c.lineWidth=2.7;
      c.strokeText('xyzO'[i],x,y);
      c.fillStyle=color;c.fillText('xyzO'[i],x,y);
    }
    c.restore();
  }
  function revolve(z0,z1,fn,color,opt={},n=21,offset=[0,0]){
    const rings=row(n+1).map(i=>{const z=z0+(z1-z0)*i/n;return ring(fn(z),z,48).map(([x,y,z])=>[x+offset[0],y+offset[1],z]);});
    for(let i=0;i<n;i++) loft(rings[i],rings[i+1],color,opt);
  }
  function box(x,y,z,w,d,h,color=green,open=false){
    const level=k=>square(w/2,d/2,z+k).map(([u,v,i])=>[u+x,v+y,i]);
    loft(level(0),level(h),color,{edges:true});
    add(level(0),shade(color,.62));
    if(!open)add(level(h),shade(color,1,.12));
    loop(level(h),'#d6f3df5c',.8);
  }
  const labels=[];
  if(!options.thumbnail&&!measure){
    const restore=collect;collect=false;
    c.save();
    c.translate(W/2+panX,base+panY+fit*.29);
    c.scale(1,Math.max(.21,vertical*.76));
    const radius=Math.min(W*.48,fit*(stadium?7.4:6.2))*Math.min(zoom,1.22);
    const shadow=c.createRadialGradient(0,0,0,0,0,radius);
    shadow.addColorStop(0,studio?'#1420235c':'#101d1688');
    shadow.addColorStop(.62,studio?'#1a243329':'#14281a45');
    shadow.addColorStop(1,'#071e1700');
    c.fillStyle=shadow;
    c.beginPath();c.arc(0,0,radius,0,TAU);c.fill();c.restore();
    for(let k=-7;k<=7;k++) {
      const color=studio?(options.id>=122&&options.id<=131?'#b7d9da35':'#bac6bd16'):groundGridColor(options.id??probabilityId,k%5===0);
      add([[-7,k,0],[7,k,0]],null,color,.65);
      add([[k,-7,0],[k,7,0]],null,color,.65);
    }
    flush();collect=restore;
  }
  const progress=probability?.progress??1;
  if(nativeProbability&&(probabilityId>=76||probabilityId===22)){
    const points=[];
    function hotspot(at,point,r){
      const [x,y]=project(point);
      if(y>4&&y<H)points.push([at,x,y,Math.max(11,r*scale)]);
    }
    drawProbability(probabilityId,s,probability,{add,box,loft,line,dot,loop,tube,labels,flush,mark,hotspot,glow});
    if(!measure)probability.registerTargets?.(points);
  }else if(extension){
    const track=options.approvedExpansion&&motion?.key&&!options.discrete?.includes(motion.key);
    const visualState=track?{...s,[motion.key]:motion.raw}:s;
    const visualX=options.id===66?swingAngle(s.x,options.mechanism??0):visualState.x;
    drawExtension(extension(visualX,visualState,{...options,probability}),options.approvedExpansion?null:sample,{add,loft,renderShellFace,line,dot,labels,tube,section,waterSurface,axes,loop,box,flush,glow,handle,feature,coordinate,studioFace,studioBox,mark},{...options,conditions:settings,viewSide:ce<0?-1:1});
  } else if(mode==='stadium') {
    const segments=96;
    handle('x',[4.19,2.7,1.94]);
    const bowl=(x,z,y)=>ring(x,z,segments,y);
    add(bowl(6.35,0,4.65),'#3e5143','#a1ae7e');
    add(bowl(6.10,.045,4.4),'#adac88','#ddd0aa');
    add(bowl(5.77,.09,4.08),'#58674f');
    add(bowl(4.1,.11,2.44),'#485b47');
    flush();
    add(square(3.68,1.98,.13),'#375d37');
    flush();
    for(let i=0;i<10;i++) {
      const x=-3.54+i*.708;
      add([[x,-1.88,.14],[x+.708,-1.88,.14],[x+.708,1.88,.14],[x,1.88,.14]],i%2?'#466d3b':'#5d8342');
    }
    flush();
    const pitch=(x,y)=>[x,y,.152];
    const bound=square(3.43,1.77,.152);
    bound.forEach((p,i)=>line(p,bound[(i+1)%4],'#f2efd6',1.15));
    line(pitch(0,-1.77),pitch(0,1.77),'#f2efd6',1.1);
    const mid=ring(.56,.152,48);
    mid.forEach((p,i)=>line(p,mid[(i+1)%48],'#f2efd6',1));
    for(const side of [-1,1]){
      const end=3.43*side, boxBack=2.65*side;
      for(const [depth,width] of [[boxBack,.91],[3.12*side,.43]]){
        line(pitch(end,-width),pitch(depth,-width),'#f2efd6',1);
        line(pitch(depth,-width),pitch(depth,width),'#f2efd6',1);
        line(pitch(depth,width),pitch(end,width),'#f2efd6',1);
      }
      const post=x=>[end,x,.43];
      line(pitch(end,-.27),post(-.27),'#ffffff',1);
      line(post(-.27),post(.27),'#ffffff',1);
      line(post(.27),pitch(end,.27),'#ffffff',1);
      const goalBack=end+.21*side;
      for(const y of [-.27,.27]){
        line(post(y),[goalBack,y,.36],'#d9ded0',.75);
        line([goalBack,y,.36],[goalBack,y,.155],'#d9ded0',.75);
      }
      for(let i=0;i<7;i++){
        const y=-.27+i*.09;
        line([goalBack,y,.36],[goalBack,y,.157],'#e1e8d792',.58);
      }
    }
    flush();

    const occupancy=Math.max(0,1-(settings?s.x*settings.drop/settings.seats:s.x/400));
    feature('audience',bowl(5.54,1.51,3.80),true);
    const palette=['#f2ad50','#e7bf81','#fff0cc','#d68641','#e8dcb3'];
    for(let j=0;j<9;j++){
      const z=.22+j*.142, x=3.91+j*.207, y=2.2+j*.207;
      const across=bowl(x,z,y), outer=bowl(x+.224,z,y+.224), front=bowl(x,z-.13,y);
      for(let i=0;i<segments;i++){
        const k=(i+1)%segments;
        const aisle=i%8===0;
        const riser=[front[i],front[k],across[k],across[i]];
        add(riser,surfaceColor(riser,'#c4bca7',true));
        add([across[i],across[k],outer[k],outer[i]],aisle?'#c7bfa0':j%2?'#476451':'#3f5946');
        if(aisle)continue;
        for(let seat=0;seat<3;seat++){
          const angle=(i+(seat+.5)/3)*TAU/segments;
          const x0=(x+.13)*Math.cos(angle),y0=(y+.13)*Math.sin(angle);
          const order=((i*89+j*157+seat*263+i*j*23+seat*i*7)%1009)/1009;
          if(order>=occupancy){
            dot([x0,y0,z+.024],.032,'#618268');
            continue;
          }
          dot([x0,y0,z+.066],.036,palette[(i+j+seat)%palette.length],.02);
          if(scale>35)dot([x0,y0,z+.108],.024,'#fae1ac',.03);
        }
      }
    }
    const foot=bowl(5.84,.105,4.16), frame=bowl(5.84,1.12,4.16);
    const rim=bowl(5.96,1.53,4.25), innerRim=bowl(5.58,1.49,3.88);
    for(let i=0;i<segments;i++){
      const k=(i+1)%segments;
      const pillar=i%4===0;
      add([foot[i],foot[k],frame[k],frame[i]],pillar?'#b4ac90':i%4===1?'#5e7061':'#768177');
      const concrete=[frame[i],frame[k],rim[k],rim[i]];
      add(concrete,surfaceColor(concrete,pillar?'#a79e84':'#c4bda1',true));
      add([rim[i],rim[k],innerRim[k],innerRim[i]],'#d8cbb1','#efe5cc',.65);
      if(!pillar&&i%4!==3){
        const bottom=mix(foot[i],frame[i],.43), top=mix(foot[i],frame[i],.7);
        const endBottom=mix(foot[k],frame[k],.43), endTop=mix(foot[k],frame[k],.7);
        add([mix(bottom,endBottom,.14),mix(bottom,endBottom,.83),mix(top,endTop,.83),mix(top,endTop,.14)],
          i%3===0?'#b39f67':'#718a74',null,1,0,.96,.12);
      }
    }
    const support=bowl(5.91,2.3,4.23), canopy=bowl(5.05,2.12,3.40);
    for(let i=52;i<89;i++){
      const k=i+1;
      add([support[i],support[k],canopy[k],canopy[i]],i%7===0?'#d7c6a9':'#b9b9a5','#e4d9bf',.52);
      if(i%4===0){
        line(rim[i],support[i],'#ead6aa',1.5);
        line(rim[i],canopy[Math.min(89,i+3)],'#cbbb9b',.9);
        line(support[i],canopy[i],'#f5dfba',.95);
      }
      if(i%6===0)dot(canopy[i],.048,'#ffe1a3',.16);
    }
  } else if(mode==='tank'||mode==='cone'||mode==='tower'||mode==='hourglass'||mode==='football') {
    let z0=0,Ht=4.8,rad=z=>1,title='Lát cắt',cut=2,shell=pale;
    if(mode==='tank') {
      const volume=settings?.capacity??72;
      const rr=s.x,hh=Math.max(0,volume/rr**2-2*rr/3);
      const k=.165*Math.cbrt(72/volume);
      const r=rr*k;Ht=(hh+rr)*k;cut=hh*k;
      handle('x',[r,0,cut]);
      feature('radius',[[0,0,cut],[r,0,cut]]);feature('height',[[r,0,0],[r,0,cut]]);
      rad=z=>z<=cut?r:Math.sqrt(Math.max(0,r*r-(z-cut)**2));title='Nắp bán cầu';
      revolve(0,cut,()=>r,'#8aa5a4',{shell:'vertical'},12);
      revolve(cut,Ht,rad,'#c5ad7e',{shell:'vertical'},16);
      for(const z of [.035,cut*.48,cut]){
        loft(ring(r*1.018,z,36),ring(r*1.018,z+.035,36),'#b0bdb0');
        loop(ring(r*1.018,z+.035,36),'#e2e7d4',.68);
      }
      box(0,0,-.29,r*2.63,r*2.58,.065,'#4e655c');
      for(const [x,y] of [[1,0],[-1,0],[0,.85],[0,-.85]]){
        tube([x*r,y*r,-.224],[x*r,y*r,.12],.057,'#86a6a4');
      }
      const cap=[0,0,Ht];
      tube(cap,[0,0,Ht+.135],.042,'#d9c9a7');
      drawFlange({tube,dot},cap,2,.117);
      if(cut>.19){
        const x=r+.12,y=.12,z=cut*.49;
        tube([r*.95,y,z],[x+.34,y,z],.047,'#9eaa9f');
        drawFlange({tube,dot},[x+.15,y,z],0,.083);
      }
    }
    if(mode==='cone') {
      const height=settings?.height??4,radius=settings?.radius??2;
      const k=Math.min(4/height,3.7/radius),r=radius*k,pour=Math.min(.38,r*.25);
      Ht=height*k;rad=z=>r*z/Ht;cut=animatedX*k;shell=green;title='Mặt nước';
      handle('q',[pour,0,Ht+.39]);
      revolve(0,cut,rad,'#49acbb',{alpha:.82},18);
      for(let i=0;i<3;i++){
        const a=i*TAU/3;
        tube([(r+.18)*Math.cos(a),(r+.18)*Math.sin(a),0],[r*.92*Math.cos(a),r*.92*Math.sin(a),Ht*.9],.045,'#75958d');
      }
      drawFoldingRim({loft,loop},ring(r,Ht,56),.058,'#a4baba');
      tube([r+.22,0,Ht+.62],[pour,0,Ht+.62],.065,'#a6beba');
      tube([pour,0,Ht+.62],[pour,0,Ht+.39],.065,'#a6beba');
      if(motion?.pump&&s.q>0){
        const time=motion.time;
        for(let i=0;i<7;i++){
          const p=(time*2.9+i/7)%1;
          dot([pour,0,Ht+.4-(Ht+.4-cut)*p],.042,water,11);
        }
        for(let i=0;i<2;i++){
          const p=(time*1.6+i/2)%1;
          if(rad(cut)>pour+.05)loop(ring(.04+(rad(cut)-pour-.05)*p,cut+.016,25).map(([x,y,z])=>[x+pour,y,z]),'#e0ffef88',.7);
        }
      }
    }
    if(mode==='tower') {
      const {height,waist,rMin,rBase}=settings??{height:120,waist:80,rMin:15,rBase:20};
      const radius=z=>Math.sqrt(rMin**2+(rBase**2-rMin**2)*((z-waist)/waist)**2);
      const factor=Math.min(5.2/height,2.45/Math.max(radius(0),radius(height)));
      Ht=height*factor;rad=z=>radius(z/factor)*factor;cut=s.x*factor;title='Lát cắt ngang';shell='#aaa89a';
    }
    if(mode==='hourglass') {
      const totalTime=settings?.time??20,flow=settings?.flow??13,accel=settings?.accel??.2;
      const volume=t=>flow*t+accel*t*t/2;
      const fraction=Math.max(0,Math.min(1,volume(animatedX)/volume(totalTime)));
      Ht=6;rad=z=>.91*Math.sqrt(Math.abs(z-3));cut=3+2*Math.sqrt(1-fraction);title='Mặt cát còn lại';
      const bottom=3-Math.sqrt(9-4*fraction);
      if(bottom>0){revolve(0,bottom,rad,gold,{alpha:.86},12);add(ring(rad(bottom),bottom),gold,null,1,0,.72);}
      if(cut>3)revolve(3,cut,rad,gold,{alpha:.88},12);
      for(const z of [0,5.89]){
        loft(ring(1.92,z),ring(1.92,z+.11),'#825b42');
        add(ring(1.92,z+.11),'#967556');
      }
      for(const x of [-1.75,1.75])for(const y of [-.45,.45])tube([x,y,0],[x,y,6],.055,'#b89a6b');
      loft(ring(.21,2.93,28),ring(.21,3.07,28),'#a5bfbb',{alpha:.54});
      for(const z of [.13,5.86])drawFoldingRim({loft,loop},ring(rad(z),z,42),.039,'#98a7a1');
      if(motion&&s.x<totalTime){
        for(let i=0;i<9;i++){
          const phase=(motion.time*2.1+i/9)%1;
          const u=motion.direction===-1?1-phase:phase;
          dot([Math.sin(i*5.13)*u*.046,Math.cos(i*5.13)*u*.052,3+(bottom-3)*u],.023,gold,11);
        }
      }
    }
    if(mode==='football') {
      const axis=settings?.axis??14,b=settings?.radius??8.5;
      const long=Math.min(4.7,2.05*axis/b),wide=Math.min(1.72,4.7*b/axis);
      const move=([x,y,z])=>[(z-2.8)*long/2.8,y,x+2.05];
      const radius=z=>wide*Math.sqrt(Math.max(0,1-((z-2.8)/2.8)**2));
      const rings=row(29).map(i=>ring(radius(i*.2),i*.2).map(move));
      for(let i=0;i<rings.length-1;i++)loft(rings[i],rings[i+1],'#a8704c',{alpha:fill?.27:.55,edges:i%4===0,shell:'longitudinal'});
      const pos=(s.x/axis+1)*2.8;
      handle('x',move([radius(pos),0,pos]));
      if(fill&&pos>0){
        for(let i=0;i<18;i++){
          const a=pos*i/18,b=pos*(i+1)/18;
          loft(ring(radius(a),a,36).map(move),ring(radius(b),b,36).map(move),water,{alpha:.67});
        }
      }
      const seam=row(22).map(i=>{
        const z=1.76+i*.09;
        return move([radius(z)+.015,0,z]);
      });
      seam.slice(1).forEach((p,i)=>line(seam[i],p,'#f1dfca',1.05));
      for(let i=2;i<seam.length-2;i+=3){
        const p=seam[i];line([p[0],p[1]-.12,p[2]],[p[0],p[1]+.12,p[2]],'#fff0d2',1.36);
      }
      for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
        const at=z=>move([(radius(z)+.012)*Math.cos(a),(radius(z)+.012)*Math.sin(a),z]);
        for(let i=1;i<=22;i++)line(at((i-1)*5.6/22),at(i*5.6/22),'#cf9e75a3',.62);
      }
      section(ring(radius(pos),pos,56).map(move));
      feature('radius',[move([0,0,pos]),move([radius(pos),0,pos])]);
      line([-4.8,0,2.05],[4.8,0,2.05],light,1.1);
      labels.push(['Lát cắt đĩa',move([wide+.16,0,pos]),gold]);
    } else if(mode==='tank') {
      labels.push([title,[0,0,Ht+.35],gold]);
    } else {
      if(fill&&mode==='tower'&&cut>0)revolve(0,cut,rad,water,{alpha:.65},18);
      revolve(z0,Ht,rad,shell,{alpha:mode==='tower'?(fill?.27:.55):.32,edges:true,shell:'vertical'},24);
      if(mode==='tower'){
        for(const z of [.04,Ht-.04])drawFoldingRim({loft,loop},ring(rad(z),z,48),.037,'#a19b87');
        for(let j=1;j<6;j++){
          const z=Ht*j/6;
          loop(ring(rad(z)+.004,z,52),'#c9c1aa7a',.76);
        }
        for(let i=0;i<10;i++){
          const a=i*TAU/10;
          tube([2.31*Math.cos(a),2.31*Math.sin(a),-.21],[2.08*Math.cos(a),2.08*Math.sin(a),.26],.035,'#a2b2a0');
        }
      }
      if(mode==='cone'){if(cut>0)waterSurface(ring(rad(cut),cut,56));}
      else section(ring(rad(cut),cut,56));
      feature('radius',[[0,0,cut],[rad(cut),0,cut]]);
      feature('height',[[0,0,mode==='hourglass'?3:0],[0,0,cut]]);
      handle('x',[rad(cut),0,cut]);
      labels.push([title,[rad(cut),-.1,cut+.25],gold]);
    }
  } else if(mode==='box'||mode==='lantern') {
    const a=s.x,volume=settings?.volume??8,area=settings?.area??1536;
    const hh=mode==='box'?volume/a**2:area/(6*a);
    const k=mode==='box'?.64*Math.cbrt(8/volume):Math.min(.193,5/hh,5/a);
    if(mode==='box'){
      handle('x',drawFoldingBox({add,line,loft},k*a,k*a,k*hh,options.mechanism??1));
    }else{
      const R=k*a,H=k*hh;
      const bottom=ring(R,0,6),top=ring(R,H,6);
      loft(bottom,top,'#e69151',{alpha:.58,edges:true});
      add(bottom,'#78573c');add(top,gold,light,1.2,0,.78);
      drawFoldingRim({loft,loop},top,.038,'#b89163');
      drawFoldingRim({loft,loop},bottom,.038,'#b89163');
      for(let i=0;i<6;i++)tube(bottom[i],top[i],.025,'#c5834f');
      for(const z of [.045,H-.045])loop(ring(R,z,6),'#f6c892',1.45);
      glow([0,0,H*.57],.76,'#eec175',.37,1);
    }
    if(mode==='lantern')handle('x',[k*a/2,k*a/2,k*hh]);
    const [left,right]=mode==='box'?square(k*a/2,k*a/2,0):ring(k*a,0,6);
    feature('width',[left,right]);feature('height',[left,[left[0],left[1],k*hh]]);
    labels.push([mode==='box'?'Đáy vuông':'Đáy lục giác',[0,0,k*hh+.38],gold]);
  } else if(mode==='arch'||mode==='vault') {
    const half=mode==='arch'?(settings?.halfWidth??6):(settings?.width??20)/2;
    const height=mode==='arch'?(settings?.height??4):s.x;
    const oldHeight=settings?.oldHeight??8;
    const scaling=settings?(mode==='arch'?Math.min(4.9/half,4.8/height):Math.min(4.9/half,8.2/(settings.length/2),5.25/(oldHeight*2.5))):null;
    const widthScale=scaling===null?4.9:half*scaling;
    const hScale=scaling===null?(mode==='arch'?.94:.34):scaling;
    const depth=mode==='arch'?2.35:settings?scaling*settings.length/2:4.1;
    const shape=(u,y)=>[u*widthScale,y,height*(1-u*u)*hScale];
    box(0,0,-.16,2*widthScale+.2,2*depth,.16,mode==='arch'?'#4b4e48':'#647068');
    const dY=depth;
    if(mode==='arch'){
      for(let i=0;i<13;i++){
        const y=-dY+(i+.32)*2*dY/13;
        line([0,y,.012],[0,y+.13,.012],'#eee5b8',.85);
      }
      for(const x of [-widthScale*.95,widthScale*.95])line([x,-dY,.015],[x,dY,.015],'#b9c7ae',1.2);
    }
    for(const i of row(34)){
      const u=i/17-1,v=(i+1)/17-1;
      const face=[shape(u,-dY),shape(u,dY),shape(v,dY),shape(v,-dY)];
      const cladding=mode==='arch'?'#b7a991':i%2?'#bcc7bc':'#96a9a5';
      renderShellFace(face,cladding,mode==='arch'?.52:.49,'longitudinal');
      if(i%2===0)line(shape(u,-dY),shape(u,dY),'#ebefe69c',.8);
    }
    for(const [index,y] of [-dY,-dY*.5,0,dY*.5,dY].entries()){
      for(let i=0;i<34;i++){
        const from=shape(i/17-1,y),to=shape((i+1)/17-1,y);
        line(from,to,index===0||index===4?'#a6dfd7':'#e0d6b9a8',index===0||index===4?1.9:1.05);
      }
      if(mode==='vault'){
        const foot=.12;
        for(const side of [-1,1]){
          box(side*widthScale,y,-.06,.21,.28,.26,'#b9a486');
          for(let i=0;i<5;i++){
            const u=side*(.17+i*.156),v=u+side*.144;
            const a=shape(u,y),b=shape(v,y);
            line([a[0],y,Math.max(0,a[2]-foot)],b,'#d4c0a0',1.09);
          }
        }
      }
    }
    if(mode==='arch'){
      const width=s.x*2*widthScale/half, vehicleHeight=Math.max(0,height*(1-(s.x/half)**2)*hScale);
      const position=options.mechanism??.5, travel=(.5-position)*(2*dY+3.2);
      const front=drawClearanceTruck({add,box,tube,line},width,vehicleHeight,travel,1.04,travel);
      const corners=square(width/2,vehicleHeight/2,0).map(([x,z])=>[x,front,z+vehicleHeight/2]);
      loop(corners,'#fff0ba',1.12);
      handle('x',[width/2,front,vehicleHeight]);
      feature('width',[[-width/2,front,vehicleHeight],[width/2,front,vehicleHeight]]);
      feature('height',[[width/2,front,0],[width/2,front,vehicleHeight]]);
    }
    else {
      const u=s.s/half, [X,,Z]=shape(u,0);
      handle('x',shape(0,-dY));handle('s',[X,0,Z]);
      if(fill){
        const old=(t,y)=>[t*widthScale,y,oldHeight*(1-t*t)*hScale];
        for(let i=0;i<28;i++){
          const l=i/14-1,r=(i+1)/14-1;
          for(const y of [-dY,dY])add([old(l,y),old(r,y),shape(r,y),shape(l,y)],'#60d4bf',null,1,0,.57);
          for(const y of [-dY,dY])line(old(l,y),old(r,y),'#e1e9bc',.86);
        }
        labels.push(['Vòm ban đầu · đỉnh '+fmt(oldHeight)+' m',[0,dY,oldHeight*hScale],pale]);
      }
      section([[X,-dY,0],[X,dY,0],[X,dY,Z],[X,-dY,Z]]);
      const visibleBank=ce<0?-dY:dY;
      flush();
      line([X,visibleBank,0],[X,visibleBank,Z],'#ffe8aa',1.65);
      if(!options.thumbnail)mark('h '+fmt(Number((Z/hScale).toFixed(2)))+' m',[X+.18,visibleBank,Z*.49],.25,'#ffe8aa');
      feature('height',[[X,-dY,0],[X,-dY,Z]]);
      labels.push(['Lát cắt',[X,0,Z+.34],gold]);
    }
  } else if(mode==='tent') {
    const {height,length,width}=settings??{height:1.2,length:2.1,width:1.95};
    const k=Math.min(4.5/height,8.4/length,7.6/width);
    const hz=height*k, wide=length*k/2, deep=width*k/2;
    for(const i of row(20)){
      const r=i/20,r2=(i+1)/20;
      loft(square(wide*Math.sqrt(1-r),deep*Math.sqrt(1-r),hz*r),
        square(wide*Math.sqrt(1-r2),deep*Math.sqrt(1-r2),hz*r2),'#c4ad7c',{alpha:.67,edges:i%4===0,shell:'vertical'});
    }
    const f=Math.max(0,Math.min(1,s.x/height));
    handle('x',[wide*Math.sqrt(1-f),0,hz*f]);
    if(fill&&f>0){
      for(let i=0;i<16;i++){
        const u=f*i/16,v=f*(i+1)/16;
        loft(square(wide*Math.sqrt(1-u),deep*Math.sqrt(1-u),hz*u),square(wide*Math.sqrt(1-v),deep*Math.sqrt(1-v),hz*v),water,{alpha:.54});
      }
    }
    for(const y of [-1,1])for(const x of [-1,1]){
      const foot=[x*wide,y*deep,0],tip=[x*wide*1.11,y*deep*1.09,0];
      const anchor=[x*wide*.91,y*deep*.91,hz*(1-.91**2)];
      tube(anchor,tip,.018,'#b99563');
      tube([tip[0],tip[1],-.067],[tip[0],tip[1],.062],.027,'#9d9f85');
      line(foot,tip,'#bba47a',.64);
      const edge=row(19).map(i=>[x*wide*Math.sqrt(1-i/18),y*deep*Math.sqrt(1-i/18),hz*i/18]);
      edge.slice(1).forEach((p,i)=>line(edge[i],p,'#d7e7cf',1.1));
    }
    const cross=square(wide*Math.sqrt(1-f),deep*Math.sqrt(1-f),hz*f);
    section(cross);
    for(const point of cross){
      const ground=[point[0],point[1],0];
      if(f>0&&f<1){
        for(let i=0;i<6;i++)line(mix(ground,point,i/6),mix(ground,point,(i+.54)/6),'#ffe5ad82',.75);
      }
    }
    feature('height',[[0,0,0],[0,0,hz*f]]);
    labels.push(['Lát ngang',[0,0,hz*f+.33],gold]);
  } else if(mode==='aircraft'||mode==='pipe'||mode==='balloons'||mode==='ants') {
    if(mode==='aircraft'&&!settings)axes([-3.84,0,0],[[5.45,0,0],[-3.84,4.2,0],[-3.84,0,4.9]]);
    else if(mode!=='aircraft'&&mode!=='balloons')axes(a,[[5.5,0,0],[0,5,0],[0,0,5.9]]);
    function sphere(x,y,z,r,col){revolve(z-r,z+r,k=>Math.sqrt(Math.max(0,r*r-(k-z)**2)),col,{alpha:.44,edges:true,shell:'vertical'},14,[x,y]);}
    if(mode==='aircraft') {
      let A,B;
      if(settings){
        const duration=(options.xMax??90)/60,end=Math.max(settings.speedA*duration,settings.bx),shift=end/2,t=animatedX/60;
        const k=Math.min(9.4/end,3.2/Math.max(settings.by,Math.abs(settings.by-duration*settings.speedB)),4.35/Math.max(settings.az,settings.bz));
        const projectAir=(x,y,z)=>[(x-shift)*k,y*k,z*k];
        const axis=projectAir(0,0,0);
        axes(axis,[[5.45,0,0],[axis[0],4.2,0],[axis[0],0,4.9]]);
        A=projectAir(settings.speedA*t,0,settings.az);B=projectAir(settings.bx,settings.by-settings.speedB*t,settings.bz);
        line(projectAir(0,0,settings.az),projectAir(settings.speedA*duration,0,settings.az),water,2);
        line(projectAir(settings.bx,settings.by,settings.bz),projectAir(settings.bx,settings.by-settings.speedB*duration,settings.bz),pale,2);
      }else{
        A=[(animatedX-12)*.32,0,.96];B=[0,(6-animatedX/2)*.32,1.6];
        line([-3.84,0,.96],[3.84,0,.96],water,2);
        line([0,1.92,1.6],[0,-1.92,1.6],pale,2);
      }
      const minutes=animatedX;
      const actualA=[(settings?.speedA??60)*minutes/60,0,settings?.az??3];
      const actualB=[settings?.bx??12,(settings?.by??6)-(settings?.speedB??30)*minutes/60,settings?.bz??5];
      coordinate('A',A,actualA,[A[0],A[1],0]);coordinate('B',B,actualB,[B[0],B[1],0]);
      feature('distance',[A,B]);
      line(A,B,gold,2.6);
      if(!options.thumbnail){
        const gap=Math.hypot(...actualA.map((v,i)=>v-actualB[i]));
        mark(fmt(Number(gap.toFixed(2)))+' km',mix(A,B,.5).map((v,i)=>v+(i===2?.35:0)),.28,'#ffe5a5');
      }
      handle('x',A);
      for(const [i,p] of [A,B].entries()){
        drawAircraft({add,loft,tube,line},p,Boolean(i),motion?.time);
        if(!options.projection)for(let j=0;j<5;j++){
          const low=p[2]*j/5;
          line([p[0],p[1],low],[p[0],p[1],low+p[2]*.10],'#d7e8dc82',.85);
        }
        glow([p[0],p[1],.02],.47,'#0a2521',.67,0,.55);
        labels.push([i?'B':'A',[p[0],p[1],p[2]+.33],i?gold:water]);
      }
    }
    if(mode==='pipe') {
      const c=settings?.center??4,r=settings?.radius??3,offset=settings?.offset??8;
      const k=settings?Math.min(5.15/(c+r)/1.3,4.6/offset):1.72/3;
      const center=c*k,Z=s.x*k,intersects=Math.abs(s.x-c)<=r;
      const X=intersects?-Math.sqrt(Math.max(0,r*r-(s.x-c)**2))*k:4.5;
      sphere(0,0,center,r*k,pale);
      const leg=Math.max(.025,center-r*k*.77);
      for(const x of [-r*k*.66,r*k*.66])box(x,0,.025,.32,1.22,leg,'#647e74');
      loop(ring(r*k+.004,center,38),'#c2eee0ab',1.05);
      const entry=[-offset*k,0,Z];
      const mount=Math.max(.06,Z*.39);
      for(const x of [entry[0]+.18,entry[0]*.66]){
        box(x,0,.009,.23,.72,.085,'#b4a691');
        tube([x,0,.085],[x,0,Math.max(.12,Z-.08)],.038,'#6b8178');
        tube([x,-mount*.21,.103],[x,0,Math.max(.12,Z-.08)],.02,'#87958b');
      }
      tube(entry,[X,0,Z],.077,'#d3a56e');
      drawFlange({tube,dot},[entry[0]+.15,0,Z],0,.126);
      if(intersects&&X-entry[0]>.32)drawFlange({tube,dot},[X-.16,0,Z],0,.118);
      coordinate('I',[0,0,center],[0,0,c],[0,0,0]);
      coordinate('A',entry,[-offset,0,s.x],[-offset*k,0,0]);
      feature('radius',[[0,0,center],[r*k,0,center]]);
      if(intersects){
        coordinate('P',[X,0,Z],[X/k,0,s.x],[X,0,0]);
        feature('distance',[entry,[X,0,Z]]);
      }
      handle('x',[intersects?X:-2,0,Z]);
      if(intersects){
        const P=[X,0,Z],R=[0,0,center];
        const crossRadius=Math.abs(X);
        if(crossRadius>.025)loop(ring(crossRadius,Z,36),'#92e5d8b0',1.38);
        line(R,P,'#d4edd28e',1.18);
        dot(P,.13,gold,10);
        if(!options.thumbnail)mark(fmt(Number(((X-entry[0])/k).toFixed(2)))+' m',mix(entry,P,.50).map((v,i)=>v+(i===2?.31:0)),.27,'#ffe5a5');
        labels.push(['Điểm chạm đầu tiên',P,gold]);
      }
    }
    if(mode==='balloons') {
      const radius=Math.sqrt(5);
      const zones=settings?[[settings.center1,settings.offset1,settings.radius1,water],[settings.center2,-settings.offset2,settings.radius2,pale]]:[[4,1,radius,water],[9,-1,radius,pale]];
      const start=Math.min(0,...zones.map(([t,,r])=>t-r));
      const end=settings?Math.max(...zones.map(([t,,r])=>t+r))+2:14;
      const middle=settings?(end+start)/2:7;
      const k=settings?Math.min(9.6/(end-start),2.2/Math.max(...zones.map(([, ,r])=>r)),2.7/Math.max(...zones.map(([,b,r])=>Math.abs(b)+r))):.72;
      const cast=t=>(t-middle)*k;
      const x=cast(s.x),z=2.6,ground=z-2*k;
      axes([cast(0),0,ground],[[5.5,0,ground],[cast(0),4.4,ground],[cast(0),0,5.9]]);
      coordinate('B',[x,0,z],[s.x,0,2],[x,0,ground]);
      line([cast(start),0,z],[cast(end),0,z],'#abd8cc',1.15);
      for(const [index,[t,b,r,color]] of zones.entries()){
        coordinate(index===0?'I₁':'I₂',[cast(t),b*k,z],[t,b,2],[cast(t),b*k,ground]);
        feature('distance',[[x,0,z],[cast(t),b*k,z]]);
        sphere(cast(t),b*k,z,r*k,color);
        if(Math.abs(b)<=r){
          const reach=Math.sqrt(r*r-b*b);
          line([cast(t-reach),0,z],[cast(t+reach),0,z],color,2.6);
        }
      }
      drawBalloon({add,loft,tube,box},[x,0,z],.58,'#b76b56');
      handle('x',[x,0,z+.45]);
      labels.push(['Khí cầu',[x,0,z+.83],gold]);
    }
    if(mode==='ants') {
      const center=settings?.center??4,r=s.x/100,vec=settings?[settings.vx,settings.vy,settings.vz]:[1,2,2];
      const height=center-r;
      const k=settings?Math.min(5.45/(center+r),4.5/Math.max(height,Math.abs(height*vec[0]/vec[2]),Math.abs(height*vec[1]/vec[2]))):1;
      const z=height*k;
      sphere(0,0,center*k,r*k,pale);
      const A=[0,0,z],B=[-z*vec[0]/vec[2],-z*vec[1]/vec[2],0];
      handle('x',A);
      coordinate('A',A,[0,0,height],[0,0,0]);
      coordinate('B',B,[-height*vec[0]/vec[2],-height*vec[1]/vec[2],0],B);
      feature('distance',[A,B]);
      line(A,B,gold,2);
      drawAnt({dot,tube},A,.24);drawAnt({dot,tube},B,.28);
      labels.push(['Kiến trên bóng',[0,0,z+.44],gold]);
    }
  } else if(mode==='bounce') {
    const release=settings?.height??55.8;
    const unit=4.85/Math.max(55.8,release), towerHeight=55.8*unit;
    const width=towerHeight*.205, storey=towerHeight/8;
    const center=z=>-.85+.58*z/Math.max(towerHeight,.1);
    const floor=(radius,z)=>ring(radius,z,32).map(([x,y,z])=>[x+center(z),y,z]);
    const stone='#d3c2a3';
    loft(floor(width*1.13,0),floor(width*1.10,storey*.29),stone);
    for(let store=0;store<8;store++){
      const z=store*storey,r=width*(1-store*.018);
      const lower=z+storey*.19,upper=z+storey*.86;
      loft(floor(r*.82,lower),floor(r*.79,upper),'#786e5e');
      loft(floor(r*1.04,z),floor(r*1.04,lower),stone);
      loft(floor(r,upper),floor(r*.98,z+storey),stone);
      for(let i=0;i<12;i++){
        const a=i*TAU/12;
        const column=h=>[center(h)+r*Math.cos(a),r*Math.sin(a),h];
        tube(column(lower),column(upper),Math.max(.003,width*.043),'#d9cab2');
        for(let j=0;j<4;j++){
          const rib=t=>[center(upper)+r*Math.cos(a+t*TAU/12),r*Math.sin(a+t*TAU/12),upper-storey*.20+storey*.2*Math.sin(t*Math.PI)];
          line(rib(j/4),rib((j+1)/4),'#e1d0b3',.9);
        }
      }
    }
    add(floor(width*.81,towerHeight),'#a19177');
    if(width>.18)for(let i=0;i<12;i++){
      const a=i*TAU/12,p=[center(towerHeight)+width*.78*Math.cos(a),width*.78*Math.sin(a),towerHeight];
      tube(p,[p[0],p[1],p[2]+storey*.20],.019,'#cfbf9f');
    }
    box(.52,0,-.066,5.3,2.55,.065,'#6f7462');
    const q=(settings?.bounce??10)/100;
    const height=k=>release*unit*q**k;
    const show=release*unit*bounceHeight(animatedX,q);
    line([2,0,0],[2,0,height(0)],'#9ad8cf',1.25);
    glow([2,0,.02],.34,'#0b251d',.6,0,.5);
    dot([2,0,.16+show],.16,'#bd6043',12);
    handle('x',[2,0,.16+show]);
    feature('height',[[2,0,0],[2,0,show]]);
    if(motion&&show<.12)glow([2,0,.02],.34,'#704331',.45*(1-show/.12),.1,.5);
    labels.push(['Bóng',[2,0,Math.max(.32,show+.31)],gold]);
    if(s.x>0) line([2,0,height(s.x)],[3.9,0,height(s.x)],gold,2);
  } else if(mode==='wheel') {
    const center=settings?.center??20, radius=settings?.radius??10;
    const k=5.2/(center+radius),z=center*k,r=radius*k;
    box(0,0,-.19,6.2,3.2,.18,'#4b6b58');
    const theta=TAU*(animatedX-(settings?.phase??1))/(settings?.period??10);
    const wheelRing=(radius,y)=>row(64).map(i=>[radius*Math.cos(i*TAU/64),y,z+radius*Math.sin(i*TAU/64)]);
    for(const y of [-.23,.23]){
      loop(wheelRing(r,y),'#ece3cc',2.5);
      loop(wheelRing(r*.91,y),'#7c958b',1);
    }
    const cabinScale=Math.min(1,r/1.35);
    for(const i of row(12)){
      const t=theta+i*TAU/12, p=[r*Math.cos(t),0,z+r*Math.sin(t)];
      const rim=y=>[p[0],y,p[2]];
      for(const y of [-.23,.23])line([0,y,z],rim(y),'#acb9ad',1.05);
      line(rim(-.23),rim(.23),'#e8dec6',1.5);
      const q=cabinScale, body=i===0?'#e9b54f':'#769795';
      // The cabin pivots on its axle and stays upright throughout the rotation.
      box(p[0],0,p[2]-.28*q,.37*q,.45*q,.28*q,body);
      box(p[0],0,p[2]-.03*q,.43*q,.5*q,.064*q,'#cbd2c1');
      for(const y of [-.228*q,.228*q]){
        add([[p[0]-.15*q,y,p[2]-.18*q],[p[0]+.15*q,y,p[2]-.18*q],
          [p[0]+.15*q,y,p[2]-.06*q],[p[0]-.15*q,y,p[2]-.06*q]],'#344f51','#e1ddc6',.65);
        line([p[0],y,p[2]-.18*q],[p[0],y,p[2]-.06*q],'#b7c5b6',.75);
      }
      if(i===0){
        glow(p,.37,'#f4cf85',.43,1);
        handle('x',p);
        feature('radius',[[0,0,z],p]);
        feature('height',[[p[0],0,0],p]);
        labels.push(['Cabin',[p[0],0,p[2]+.37],gold]);
      }
    }
    for(const y of [-.77,.77])for(const x of [-1.45,1.45]){
      tube([x,y,0],[0,0,z],.097,'#9eac9d');
      box(x,y,-.01,.47,.43,.14,'#b0a58d');
    }
    tube([0,-.35,z],[0,.35,z],.19,'#b5b9a6');
    for(const y of [-.79,.79]){
      const lower=[-1.44,y,.11],upper=[1.44,y,.11];
      tube(lower,upper,.044,'#a6b3a7');
      tube(lower,[.71,y*.45,z*.52],.035,'#9eaa9d');
    }
  } else if(mode==='antenna') {
    const roof=settings?.roof??20,k=settings?Math.min(.093,5.2/(roof+35)):.093;
    box(-1.48,0,0,2.96,3.1,roof*k,'#a87960');
    box(-1.48,0,roof*k,3.07,3.21,.054,'#b4a68b');
    for(const side of [-1,1]){
      const y=1.48*side,z=roof*k+.055;
      tube([-2.9,y,z+.21],[-.12,y,z+.21],.023,'#9aafa1');
      for(let i=0;i<=5;i++){
        const x=-2.9+2.78*i/5;
        tube([x,y,z],[x,y,z+.22],.023,'#9aafa1');
      }
    }
    for(let i=1;i<=4;i++)for(let j=1;j<=4;j++){
      const z=i*.19*roof*k,x=-j*.58,y=j*.6-1.51;
      add([[x-.11,-1.557,z],[x+.11,-1.557,z],[x+.11,-1.557,z+.19],[x-.11,-1.557,z+.19]],
        '#b5d8b980','#c8e4bd55',.55,0,1,.08);
      add([[.006,y-.13,z],[.006,y+.13,z],[.006,y+.13,z+.19],[.006,y-.13,z+.19]],
        '#9ebc9c88','#b8d9bc55',.5,0,1,.09);
    }
    const T=[0,0,(roof+s.h)*k], H0=[0,0,0], A=[s.x*k,0,0];
    tube([0,0,roof*k],T,.042,'#c5d7c4');
    for(const side of [-1,1]){
      const w=Math.min(.39,s.h*k*.42),z=T[2]-w*.86;
      tube([0,0,z],[side*.22,0,z],.021,'#8e9f93');
      box(side*.22,0,z-.3*w,.092,.074,w,'#e3ded1');
    }
    box(A[0],0,-.025,.31,.28,.06,'#b6aa8c');
    drawFlange({tube,dot},[0,0,roof*k],2,.105);
    tube([A[0]-.04,0,.02],[A[0]+.04,0,.105],.025,'#8b9a91');
    line(T,A,gold,2.8);line(H0,A,pale,1);dot(A,.13,gold);
    handle('x',A);handle('h',T);
    feature('height',[H0,T]);feature('distance',[A,T]);
    labels.push(['Đỉnh T',[0,0,T[2]+.25]],['Neo A',[A[0],0,.22],gold]);
  } else if(mode==='pyramid') {
    const e=settings?.edge??230,k=.027*230/e,z=Math.sqrt(Math.max(0,e**2-s.x**2/2))*k, d=s.x/2*k;
    const base=square(d,d,0),S=[0,0,z],M=[d,0,0],ratio=z*z/(z*z+d*d);
    const F=mix(S,M,ratio);
    base.forEach((p,i)=>add([p,base[(i+1)%4],S],i%2?'#b7a688':'#a8977c','#e2cead',.9,0,.65));
    for(let i=1;i<12;i++){
      const t=i/12;loop(base.map(p=>mix(p,S,t)),'#dfca9d83',.78);
    }
    tube(a,F,.075,'#bd9665');
    line(a,F,gold,2.3);line(a,M,light,1);dot(F,.13,gold,10);
    for(const t of [.22,.47,.72]){
      const at=mix(a,F,t);
      line([at[0],-.16,at[2]],[at[0],.16,at[2]],'#cde8da',.95);
    }
    handle('x',M);
    feature('height',[a,S]);
    const alpha=Math.atan2(F[2],F[0]),arc=Math.min(.7,Math.hypot(F[2],F[0])*.74);
    feature('angle',row(17).map(i=>[arc*Math.cos(alpha*i/16),0,arc*Math.sin(alpha*i/16)]));
    labels.push(['H',[F[0],0,F[2]+.26],gold],['S',[0,0,z+.27]]);
  } else if(mode==='basketball') {
    box(0,0,-.18,9,5.1,.12,'#2c5247');
    box(0,0,-.06,8.7,4.8,.06,'#a88056');flush();
    for(let row=0;row<12;row++){
      const ay=-2.4+row*.4, by=ay+.4;
      add([[-4.35,ay,.007],[4.35,ay,.007],[4.35,by,.007],[-4.35,by,.007]],row%2?'#b48761':'#ab7e57');
      for(let col=0;col<6;col++){
        const x=-4.26+col*1.43+(row%3)*.17;
        line([x,ay,.012],[x,by,.012],'#f0c79755',.65);
      }
      line([-4.35,ay,.012],[4.35,ay,.012],'#744f395e',.68);
    }
    add([[2.17,-.77,.016],[4.14,-.77,.016],[4.14,.77,.016],[2.17,.77,.016]],'#719273');
    loop([[2.17,-.77,.024],[4.14,-.77,.024],[4.14,.77,.024],[2.17,.77,.024]],'#f7eed8',.95);
    box(3.5,0,3.3,.12,1.6,1.15,'#88b3ad');
    loop([[3.428,-.37,3.37],[3.428,.37,3.37],[3.428,.37,3.97],[3.428,-.37,3.97]],'#f7eed8',1.25);
    tube([3.55,0,0],[3.55,0,4.3],.055,'#b8d8c7');
    loop(square(4.13,2.24,.02),'#e9eed1',.9);
    loop(ring(.73,.03,36),'#e9eed1',.9);
    line([0,-2.24,.025],[0,2.24,.025],'#e9eed1',.9);
    const hoop=ring(.38,3.3,24).map(([x,y,z])=>[x+3.02,y,z]);
    loop(hoop,'#dd8e59',2.2);
    tube([3.37,0,3.3],[3.495,0,3.3],.043,'#bc794f');
    const net=ring(.25,2.95,24).map(([x,y,z])=>[x+3.02,y,z]);
    for(let i=0;i<24;i+=2){
      line(hoop[i],net[(i+1)%24],'#d9dfc496',.62);
      line(hoop[i],net[(i+23)%24],'#d9dfc496',.62);
    }
    for(let i=0;i<24;i+=3){
      const p=hoop[i],lower=mix(p,[3.02,0,2.88],.35);
      line(p,[lower[0],lower[1],3.0],'#e1e9d4a8',.65);
    }
    const count=s.n;
    for(let i=0;i<count;i++){
      const p=[-4+i*(8/Math.max(1,count-1)),-2.83,.2];
      const revealed=sample?sample.length-Number(progress<.78&&probability?.step===sample.length):0;
      dot(p,.16,i<revealed?(sample[i]?'#a6d29b':'#d57568'):i===count-1?gold:'#75968a',20);
    }
    const shot=sample?.at(-1);
    const flight=t=>{
      const misses=sample&&!shot;
      if(t>.78){
        const fall=(t-.78)/.22;
        return [3.02+(misses?-1.44:.18)*fall,misses?1.13*fall:0,3.3+(misses?.32:.02)-1.23*fall**2];
      }
      const reach=t/.78;
      return [-3.65+6.67*reach,0,1.4+(1.9+(misses?.32:.02))*reach+tossHeight(reach,1.93)];
    };
    const t=sample?(probability?.step===sample.length?progress:1):.04;
    for(let i=0;i<14;i++)if(i/14<=t||!sample)line(flight(i/14),flight((i+.52)/14),'#ffe6b19c',1);
    const ball=flight(t);
    glow([ball[0],ball[1],.035],.63,'#372b19',.65,0,.4);
    dot(ball,.24,'#e49348',10);
    const [px,py,bz]=ball;
    line([px-.18,py-.05,bz+.02],[px+.17,py-.05,bz+.1],'#783f23',1.06);
    if(sample&&t>.8)glow([3.02,0,3.3],.58,shot?'#d4f2a5':'#ef9878',Math.max(0,1-(t-.8)*4)*.55,8);
    labels.push([sample?sample.filter(Boolean).length+' cú vào rổ / '+(settings?.target??5)+' cần đạt':'Lượt cần xét: '+count,[0,-2.83,.36],gold]);
  } else if(mode==='circuit') {
    box(0,0,-.14,9.6,5.35,.15,'#254d43');flush();
    for(const px of [-4.32,4.32])for(const y of [-2.28,2.28])dot([px,y,.07],.12,'#c0bea0',1);
    for(let i=0;i<8;i++)line([-3.82+i*1.09,-2.04,.025],[-3.82+i*1.09,2.04,.025],'#c2dcbb26',.7);
    for(let b=0;b<3;b++){
      const y=(b-1)*1.56;
      const branch=sample?.[b];
      const tested=branch?.length===2;
      const conducting=tested&&branch.every(Boolean);
      const wire=tested?(conducting?'#b8ef9e':'#92675a'):'#c89c63';
      for(const [start,end] of [[-3.5,-2.13],[-1.17,1.17],[2.13,3.5]])tube([start,y,.22],[end,y,.22],.036,wire);
      if(conducting){
        for(const px of [-2.9,0,2.9])dot([px,y,.27],.108,'#d3f0a6',2);
        if(b===sample.length-1)dot([-3.1+6.2*progress,y,.4],.14,'#e0ffb9',3);
      }
      for(let j=0;j<2;j++){
        const good=sample?.[b]?.[j];
        const px=(2*j-1)*1.65;
        const active=probability?.step===b*2+j+1&&progress<1;
        const signal=active&&progress<.57?undefined:good;
        const color=signal===false?'#a06a5c':signal?'#79bf8c':'#83a798';
        if(signal===false){
          for(const side of [-1,1])tube([px+side*.12,y,.22],[px+side*.49,y,.22],.14,color);
        }else{
          tube([px-.49,y,.22],[px+.49,y,.22],.14,color);
          for(const q of [-.24,-.055,.21])tube([px+q-.021,y,.22],[px+q+.021,y,.22],.145,'#b6aa83');
        }
        if(active){
          glow([px,y,.59],.72,'#9df6d4',.72*Math.sin(progress*Math.PI),1.6);
          const scan=px-.45+progress*.9;
          line([scan,y-.35,.61],[scan,y+.35,.61],'#ddfff2',1.5);
        }
        if(signal!==undefined){
          dot([px,y,.69],.16,signal?'#b3edab':'#f18d78',2);
          mark(signal?'✓':'×',[px,y,.69],.28,'#173b31');
        }
      }
    }
    for(const x of [-3.5,3.5])line([x,-1.56,.1],[x,1.56,.1],gold,2);
    const networkOn=sample?.some(branch=>branch.length===2&&branch.every(Boolean));
    tube([3.5,1.58,.19],[4.12,1.58,.19],.06,gold);
    if(networkOn)glow([4.25,1.58,.34],.8,'#eff6a2',.6,2.8);
    dot([4.25,1.58,.34],.28,networkOn?'#f5ed97':'#67837d',3);
    for(let b=0;b<3;b++)labels.push(['Nhánh '+(b+1),[-3.5,(b-1)*1.56,.45]]);
    labels.push([networkOn?'Mạch đang thông':'Đèn đầu ra',[4.25,1.58,.34],gold]);
  } else if(mode==='chess') {
    const counts=kingCounts(s.x),max=Math.max(...counts);
    box(0,0,-.17,8,8,.16,ink);
    for(let i=0;i<64;i++){
      const x=i%8-3.5,y=Math.floor(i/8)-3.5;
      box(x,y,0,.995,.995,.022,i===27?gold:((i%8+Math.floor(i/8))%2?pale:green));
      if(counts[i]) dot([x,y,.06],.06+.2*Math.sqrt(counts[i]/max),i===27?dark:ink,1);
    }
    labels.push(['d4 · '+fmt(counts[27])+' đường',[0,0,4.75],gold]);
  } else if(mode==='target') {
    box(0,.17,.94,5.3,.31,4.6,'#795f48');
    box(0,.1,1,5,.23,4.35,'#467669');
    for(const x of [-2,2]){
      tube([x,.13,0],[x,.13,1.57],.095,'#d4c6a0');
      tube([x,.13,.68],[x,1.3,.02],.062,'#8c997c');
    }
    const palette=['#d4e7d3','#719885','#446e5b','#e7d9a7',gold];
    for(let i=0;i<5;i++){
      const r=1.92-i*.34;const circle=ring(r,0,48).map(([u,v])=>[u,-.19-.008*i,3.15+v]);
      add(circle,palette[i],ink,.6,0,1,10+i);
    }
    for(const x of [-2,2]){
      line([x,0,0],[x,0,1.5],pale,3);
      box(x,.13,-.04,.43,.57,.11,'#a4997b');
      tube([x,0,4.44],[x,-.32,4.44],.049,'#cec0a3');
    }
    for(const [score,r] of [[10,.24],[9,.52],[8,.86]]){
      for(const side of [-1,1])mark(String(score),[side*r,-.27,3.14],.15,'#384338');
    }
    if(sample) sample.forEach((score,i)=>{
      const phi=.55+i*TAU/3;
      const r=score===10?.1:score===9?.44:.92;
      const at=[r*Math.cos(phi),-.35,3.15+r*Math.sin(phi)];
      const flying=i===sample.length-1&&probability?.step===sample.length&&progress<1;
      const center=flying?mix([-3.6,-3,1.47],at,progress):at;
      if(flying){
        const tail=mix([-3.6,-3,1.47],at,Math.max(0,progress-.13));
        line(tail,center,'#ffeec7',2);
        dot(center,.12,gold,28);
        if(progress>.72)glow(at,.5,'#f7dd9b',(1-progress)*2,29);
      }else{
        dot(at,.11,ink,28);
        mark(String(i+1),[at[0],at[1],at[2]+.16],.22,'#f6f1da');
      }
    });
    if(probability?.medal!==undefined){
      const mx=3.3,z=1.09+.42*Math.sin(progress*Math.PI);
      box(mx,0,.03,1.38,1.21,.72,'#315a4b');
      const medalColor=probability.medal?'#f5c16b':'#9ba7a0';
      tube([mx,-.08,z],[mx,.23,z],.37,medalColor);
      mark(probability.medal?'★':'×',[mx,-.1,z],.44,'#263c33');
      labels.push([probability.medal?'Có huy chương vàng':'Không có huy chương vàng',[mx,0,z],medalColor]);
    }
    if(!sample)labels.push(['Ba lượt bắn',[0,0,5.69],gold]);
  } else if(mode==='urn') {
    const receiver=sample?.receiver;
    const {bins,moving}=urnBallStates(urnLayout(s),receiver,sample?.transferred??[],sample?.green,progress);
    const ballColor=green=>green?'#35a99d':'#ab722b';
    const ballPoint=(jar,slot)=>{
      const index=slot%7,layer=Math.floor(slot/7);
      const angle=(index-1)*TAU/6+layer*.42;
      const radial=index?.54:0;
      return [(jar-1)*3.3+radial*Math.cos(angle),radial*Math.sin(angle),.455+layer*.41];
    };
    box(0,.48,-.18,10.5,6.05,.16,'#70513c');
    const pad=square(4.85,1.26,-.012).map(([x,y,z])=>[x,y-.19,z]);
    add(pad,'#687875','#a0a391',.85);
    flush();
    for(const [i,balls] of bins.entries()){
      const X=(i-1)*3.3;
      drawGlassJar({add,loft,loop,line},X,0,0,i===receiver);
      for(const ball of balls)dot(ballPoint(i,ball.slot),.205,ballColor(ball.green));
      const greens=balls.filter(ball=>ball.green).length;
      mark(['I','II','III'][i],[X,.97,.23],.37,'#f7e9c7');
      if(i===receiver)glow([X,0,.19],1.45,'#ffd594',.18);
      labels.push([['Hộp I','Hộp II','Hộp III'][i]+' · '+greens+' xanh, '+(balls.length-greens)+' nâu',[X,0,2.72]]);
    }
    const dx=0,dy=2.48,die=sample?.die;
    const rolling=probability?.step===1&&progress<1;
    const t=rolling?progress:1,half=.40;
    const {rotate,clearance}=dieRoll(t,die,half);
    const hop=t<.63?tossHeight(t/.63,.64):tossHeight((t-.63)/.37,.14);
    const center=[dx-1.24*(1-t)**2,dy-.36*(1-t)**2,clearance+hop];
    const transform=point=>rotate(point).map((n,i)=>n+center[i]);
    const sides=[
      ([u,v,w])=>[u,v,w],([u,v,w])=>[w,u,v],([u,v,w])=>[v,w,u],
      ([u,v,w])=>[u,-w,v],([u,v,w])=>[-w,v,u],([u,v,w])=>[v,u,-w]
    ];
    const pairs=[[[0,0]],[[-1,-1],[1,1]],[[-1,-1],[0,0],[1,1]],
      [[-1,-1],[-1,1],[1,-1],[1,1]],[[-1,-1],[-1,1],[0,0],[1,-1],[1,1]],
      [[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]];
    for(const [i,orient] of sides.entries()){
      const onFace=(u,v,w)=>transform(orient([u,v,w]));
      const face=square(half,half,half).map(p=>onFace(...p));
      const front=project(onFace(0,0,half))[2]>project(center)[2]+.012;
      add(face,surfaceColor(face,'#eee0bd',true),'#eee9d5',.8);
      if(front)for(const [u,v] of pairs[i]){
        const pip=ring(.05,half+.008,12).map(([x,y,z])=>onFace(x+u*.22,y+v*.22,z));
        add(pip,'#242723',null,1,0,1,.025);
      }
    }
    if(die&&!rolling)labels.push(['Xúc xắc '+die,[dx,dy,1.1],gold]);
    glow([center[0],center[1],.02],.64,'#211a11',.65*(1-hop*.52),0,.5);
    if(moving){
      const {ball,from,to,destination}=moving;
      const start=ballPoint(from,ball.slot);
      const end=to===null?[(from-1)*3.3,-1.63,.205]:ballPoint(to,destination.slot);
      const point=liftThroughOpening(start,end,2.00,progress);
      dot(point,.205,ballColor(ball.green),.035);
      if(to===null)labels.push([ball.green?'Bi rút ra màu xanh':'Bi rút ra màu nâu',point,ballColor(ball.green)]);
    }
  }
  flush();
  if(measure){
    options.measure(Object.fromEntries(Object.entries(bounds).map(([key,value])=>[key,value-(key==='left'||key==='right'?W:H)/2])));
    return labels;
  }
  paintCastShadows(c,shadows,W,H,floorY);
  for(const batch of batches)for(const face of batch)face.paint();
  if(options.registerHandle){
    const at=handles.get(options.variable)??handles.get('x')??labels[0]?.[1];
    const projected=at?project(at):[(bounds.left+bounds.right)/2,(bounds.top+bounds.bottom)/2];
    options.registerHandle(projected);
  }
  const selected=labels[selectedLabel];
  if(selected){
    const [,point,color=light]=selected;
    const [x,y]=project(point);
    if(x>=7&&x<=W-7&&y>=7&&y<=H-7){
      c.beginPath();c.arc(x,y,5,0,TAU);
      c.strokeStyle='#102c24';c.lineWidth=4;c.stroke();
      c.strokeStyle=color;c.lineWidth=2;c.stroke();
    }
  }
  if(!options.thumbnail){
    for(const {points,closed,dashed} of featurePaths){
      c.save();c.beginPath();
      for(const [i,point] of points.entries()){
        const [x,y]=project(point);
        if(i)c.lineTo(x,y);else c.moveTo(x,y);
      }
      if(closed)c.closePath();
      c.lineWidth=dashed?1.6:3.1;c.lineJoin='round';c.lineCap='round';
      c.strokeStyle=dashed?'#dbf7ff':'#fff0a9';
      c.shadowColor='#0a261d';c.shadowBlur=6;
      if(dashed)c.setLineDash([5,4]);
      c.stroke();c.restore();
    }
    options.registerCoordinates?.(coordinatePoints);
  }
  if(!options.thumbnail||options.axisLetters)drawAxisLetters();
  return labels;
}
