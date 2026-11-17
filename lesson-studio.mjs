import {fmt} from './lessons.mjs';
import {drawScene} from './scene.mjs';
import {preferredCamera,refinedLessons,updatedCovers} from './studio-finish.mjs';
import {extensionBounds} from './extension-scene.mjs';
import {walkLessons,walkStages} from './probability-lab.mjs';

export const accents=['#79a990','#72aeb5','#83a8c9','#d1a672','#99b87f'];
export const chapterRoutes=['#khao-sat','#tich-phan','#oxyz','#toan-10-11','#xac-suat'];
const fixedFrames=new WeakMap();
const discreteLessons=new Set([15,72,73]);

export function initialState(lesson){
  const state=Object.fromEntries(lesson.controls.map(({key,value})=>[key,value]));
  if(lesson.conditions)state.conditions=lesson.conditions;
  return state;
}

export function sceneOptions(lesson){
  if(lesson.approvedExpansion&&!fixedFrames.has(lesson)){
    const defaults=initialState(lesson);
    const scenarios=[defaults,...lesson.controls.flatMap(c=>[c.min,c.max].map(value=>({...defaults,[c.key]:value})))];
    fixedFrames.set(lesson,extensionBounds(scenarios.map(state=>lesson.scene(state.x,state))));
  }else if(lesson.scene&&lesson.group!==4&&!fixedFrames.has(lesson)){
    const c=lesson.controls.find(c=>c.key==='x');
    const values=Array.from({length:13},(_,i)=>c.min+(c.max-c.min)*i/12);
    fixedFrames.set(lesson,extensionBounds((lesson.id===66?[...values,...values.map(x=>-x),c.value]:[...values,c.value]).map(x=>lesson.scene(x))));
  }
  return {id:lesson.id,approvedExpansion:lesson.approvedExpansion,discrete:lesson.discrete,accent:accents[lesson.group],bounds:fixedFrames.get(lesson),xMax:lesson.controls[0].max};
}

export function snapControl(control,value){
  const {min,max,step}=control;
  const clamped=Math.min(max,Math.max(min,value));
  if(clamped===max)return max;
  return Math.min(max,Number((min+Math.round((clamped-min)/step)*step).toFixed(12)));
}

function fitCover(source,canvas,fill){
  const w=source.width,h=source.height;
  const pixels=source.getContext('2d').getImageData(0,0,w,h).data;
  let left=w,right=0,top=h,bottom=0;
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      if(pixels[(y*w+x)*4+3]<45)continue;
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
  }
  if(right<=left||bottom<=top)return;
  const width=right-left+1,height=bottom-top+1;
  const ratio=Math.min(canvas.width*fill/width,canvas.height*fill/height);
  const context=canvas.getContext('2d');
  const dw=width*ratio,dh=height*ratio;
  context.imageSmoothingQuality='high';
  context.drawImage(source,left,top,width,height,(canvas.width-dw)/2,(canvas.height-dh)/2,dw,dh);
}

let coverObserver;
let coverFrame=0;
let pendingCovers=[];

export function mountCovers(root,lessons){
  coverObserver?.disconnect();
  if(coverFrame)cancelAnimationFrame(coverFrame);
  coverFrame=0;pendingCovers=[];
  const source=document.createElement('canvas');
  source.getContext('2d',{willReadFrequently:true});
  function renderCovers(){
    for(let i=0;i<3&&pendingCovers.length;i++){
      const cover=pendingCovers.shift();
      if(!cover.isConnected||cover.clientWidth<2)continue;
      const lesson=lessons[Number(cover.dataset.cover)-1];
      const state=initialState(lesson);
      const canvas=document.createElement('canvas');
      canvas.setAttribute('aria-hidden','true');
      cover.append(canvas);
      let probability=null;
      if(lesson.group===4){
        probability={id:lesson.id,progress:1,counts:walkLessons.has(lesson.id)?walkStages(lesson.id,state.x).at(-1):null};
      }
      const dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(cover.clientWidth*dpr);
      canvas.height=Math.round(cover.clientHeight*dpr);
      const refined=refinedLessons.has(lesson.id),updated=updatedCovers.has(lesson.id);
      const [yaw,elevation]=lesson.approvedExpansion||refined?preferredCamera(lesson.id):lesson.camera??[-.36,null];
      const options=refined?{id:lesson.id,approvedExpansion:lesson.approvedExpansion,accent:accents[lesson.group]}:sceneOptions(lesson);
      drawScene(source,lesson.mode,state,yaw,null,lesson.scene,.88,elevation,-1,probability,{
        ...options,isolatedPreview:refined,thumbnail:true,axisLetters:updated&&lesson.group===2,resolution:[640,360]
      });
      fitCover(source,canvas,updated?.92:refined?.88:.78);
    }
    coverFrame=pendingCovers.length?requestAnimationFrame(renderCovers):0;
  }
  coverObserver=new IntersectionObserver(entries=>{
    for(const {target,isIntersecting} of entries){
      if(!isIntersecting)continue;
      coverObserver.unobserve(target);
      pendingCovers.push(target);
    }
    if(pendingCovers.length&&!coverFrame)coverFrame=requestAnimationFrame(renderCovers);
  },{rootMargin:'230px 0px'});
  root.querySelectorAll('[data-cover]').forEach(cover=>coverObserver.observe(cover));
}

export function makeCurve(lesson,state,key,index){
  const control=lesson.controls.find(c=>c.key===key);
  const discrete=discreteLessons.has(lesson.id)||lesson.discrete?.includes(key);
  const n=discrete?Math.round((control.max-control.min)/control.step):140;
  const points=Array.from({length:n+1},(_,i)=>{
    const x=discrete?snapControl(control,control.min+i*control.step):control.min+(control.max-control.min)*(n?i/n:0);
    return [x,lesson.result({...state,[key]:x})[index].value];
  });
  const values=points.map(([,y])=>y).filter(Number.isFinite);
  const lo=values.length?Math.min(...values):0,hi=values.length?Math.max(...values):1;
  const padding=(hi-lo||Math.max(1,Math.abs(lo)*.16))*.11;
  return {control,discrete,points,min:lo-padding,max:hi+padding};
}

function graphNumber(n){
  return Math.abs(n)>=1e7||(Math.abs(n)>0&&Math.abs(n)<.0001)?
    n.toExponential(1):fmt(Number(n.toPrecision(4)));
}

export function drawParameterGraph(canvas,curve,current,baseline,accent){
  const context=canvas.getContext('2d');
  const width=canvas.clientWidth,height=canvas.clientHeight;
  if(width<100||height<95)return null;
  const dpr=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(width*dpr))canvas.width=Math.round(width*dpr);
  if(canvas.height!==Math.round(height*dpr))canvas.height=Math.round(height*dpr);
  context.setTransform(dpr,0,0,dpr,0,0);
  context.clearRect(0,0,width,height);
  const {control,points,discrete,min,max}=curve;
  const left=width<360?50:65,right=width-18,top=22,bottom=height-31;
  const sx=x=>control.min===control.max?(left+right)/2:left+(right-left)*(x-control.min)/(control.max-control.min);
  const sy=y=>bottom-(bottom-top)*(y-min)/(max-min);
  context.font='11px system-ui';
  context.textAlign='right';
  context.lineWidth=1;
  for(let i=0;i<=4;i++){
    const y=min+(max-min)*i/4,py=sy(y);
    context.fillStyle='#b5d0c6';
    context.fillText(graphNumber(y),left-7,py+4,left-8);
    context.strokeStyle='#a5c9bc43';context.beginPath();
    context.moveTo(left,py);context.lineTo(right,py);context.stroke();
  }
  const ticks=control.min===control.max?1:width<360?3:5;
  context.textAlign='center';
  for(let i=0;i<ticks;i++){
    const raw=control.min+(control.max-control.min)*(ticks>1?i/(ticks-1):0);
    const x=discrete?snapControl(control,raw):raw;
    context.fillStyle='#b5d0c6';
    context.fillText(graphNumber(x),sx(x),bottom+17);
  }
  if(discrete){
    context.fillStyle=accent;
    for(const [x,y] of points){
      if(!Number.isFinite(y))continue;
      context.beginPath();context.arc(sx(x),sy(y),3.55,0,2*Math.PI);context.fill();
    }
  }else{
    let active=false;
    context.beginPath();
    for(const [x,y] of points){
      if(!Number.isFinite(y)){active=false;continue;}
      if(active)context.lineTo(sx(x),sy(y));
      else context.moveTo(sx(x),sy(y));
      active=true;
    }
    context.strokeStyle=accent;context.lineWidth=2.6;context.stroke();
  }
  function point([x,y],color){
    if(!Number.isFinite(y))return;
    const px=sx(x),py=sy(y);
    context.beginPath();context.setLineDash([4,4]);
    context.strokeStyle=color;context.lineWidth=1;context.moveTo(px,bottom);context.lineTo(px,py);context.stroke();
    context.setLineDash([]);context.beginPath();context.arc(px,py,5.5,0,2*Math.PI);
    context.fillStyle=color;context.fill();context.strokeStyle='#11342d';context.stroke();
  }
  if(baseline)point(baseline,'#8ad5d8');
  point(current,'#ffe3a4');
  return {left,right,top,bottom};
}
