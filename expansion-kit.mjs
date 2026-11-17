import {fmt} from './lessons.mjs';

export const C=(label,unit,min,max,step,value,key='x')=>({key,label,unit,min,max,step,value});
export const M=(label,value,unit='')=>({label,value,unit});
export const edge=(from,to,color,width)=>({from,to,color,width});
export const rod=(from,to,radius,color)=>({from,to,radius,color});
export const label=(text,at,color)=>({text,at,color});
export const measure=(from,to,text,color,offset)=>({from,to,text,color,offset});
export const block=(x,y,z,w,d,h,color,alpha)=>({x,y,z,w,d,h,color,alpha});
export const panel=(points,color,alpha,extra={})=>({points,color,alpha,...extra});
export const shell=(rings,color,alpha=.86,extra={})=>({rings,color,alpha,...extra});
export const sample=(min,max,count,fn)=>Array.from({length:count+1},(_,i)=>fn(min+(max-min)*i/count,i));
export const ring=(r,z,cx=0,cy=0,n=36)=>sample(0,2*Math.PI,n-1,(_,i)=>[cx+r*Math.cos(i*2*Math.PI/n),cy+r*Math.sin(i*2*Math.PI/n),z]);
export const rect=(w,d,z=0,x=0,y=0)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>[x+u*w/2,y+v*d/2,z]);
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,k)=>a.map(v=>v*k);
export const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
export const cross=([a,b,c],[x,y,z])=>[b*z-c*y,c*x-a*z,a*y-b*x];
export const mix=(a,b,t)=>add(a,mul(sub(b,a),t));
export const norm=a=>Math.hypot(...a);
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export const radians=d=>d*Math.PI/180;
export const degrees=r=>r*180/Math.PI;
export const metal='#91a5a6', gold='#e8b469', glass='#83c7cf', green='#588e68', stone='#a69a88', ink='#263e3e', cream='#ead8aa', red='#c87262', blue='#649cc0';
export function trace(points,color,width=1.8){return points.slice(1).map((to,i)=>edge(points[i],to,color,width));}
export function integral(fn,a,b,count=120){
  let total=0;
  const h=(b-a)/count;
  for(let i=0;i<=count;i++)total+=(i===0||i===count?1:i%2?4:2)*fn(a+i*h);
  return total*h/3;
}
export function bisect(fn,a,b){
  const sign=Math.sign(fn(a));
  if(!sign)return a;
  if(!fn(b))return b;
  for(let i=0;i<44;i++){
    const mid=(a+b)/2;
    if(Math.sign(fn(mid))===sign)a=mid;
    else b=mid;
  }
  return (a+b)/2;
}
export function lesson(group,title,tag,prompt,controls,result,formula,knowledge,steps,scene,extra={}){
  const list=Array.isArray(controls)?controls:[controls];
  const defaults=Object.fromEntries(list.map(c=>[c.key,c.value]));
  const {practice:variants=[],section,features,attempt,distribution,event,discrete,experimentMetric,projectionLabel,camera,cutaway=false,focusMetric=0}=extra;
  const [main]=list;
  const movable=list.filter(c=>c.max>c.min);
  const alternative=(c,phase)=>{
    const value=c.min+(c.max-c.min)*phase;
    let index=Math.round((value-c.min)/c.step);
    if(Math.abs(c.min+index*c.step-c.value)<1e-9)index+=c.value+c.step<=c.max?1:-1;
    return Number(clamp(c.min+index*c.step,c.min,c.max).toFixed(8));
  };
  const readings=result(defaults);
  const selections=[
    {changes:{[main.key]:alternative(main,.36)},index:focusMetric},
    {changes:Object.fromEntries(movable.map(c=>[c.key,alternative(c,.68)])),index:readings.length>1?(focusMetric===0?1:0):focusMetric}
  ];
  const practice=selections.map((fallback,i)=>{
    const {changes,index,question,explanation}={...fallback,...variants[i]};
    const state={...defaults,...changes};
    const {label,value,unit}=result(state)[index];
    const givens=list.map(c=>c.label+' = '+fmt(state[c.key])+(c.unit?' '+c.unit:''));
    return {question:question??'Tính '+label.toLowerCase()+'.',answer:value,unit,
      explanation:explanation??'Với '+givens.join(', ')+', áp dụng '+formula[0]+' và các bước trong lời giải để được '+fmt(value)+(unit?' '+unit:'')+'.',
      tolerance:.0051,digits:['cách','người','ghế','chiếc','viên','mã','đơn','điểm','lát','bánh','răng','nghiệm','lần'].includes(unit)?0:2,
      givens,model:{parameters:state,metric:index},first:knowledge,expression:formula.join(' · ')
    };
  });
  return {group,title,tag,prompt,controls:list,result,formula,knowledge,
    steps:steps.map(([title,text])=>({title,text})),practice:practice[0],extraPractice:practice.slice(1),
    extension:true,approvedExpansion:true,mode:'extension',focusMetric,section,features,cutaway,discrete,projectionLabel,camera,
    scene:(x,state,options)=>scene({...defaults,...state,x},options??{}),
    sample:attempt,distribution,event,experimentMetric
  };
}
