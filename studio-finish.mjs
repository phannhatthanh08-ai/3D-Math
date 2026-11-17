import {shade,panelPaint} from './scene-material.mjs';

const hex=/^#[\da-f]{6}$/i;
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const unit=v=>{const d=Math.hypot(...v);return d>1e-8?v.map(n=>n/d):[0,0,1];};
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const key=unit([-.5,-.48,.85]);
const fill=unit([.8,.42,.3]);
const rim=unit([.23,.87,.49]);
const profiles={
  steel:[.52,.36,.46], brass:[.58,.37,.39], iron:[.22,.51,.12],
  glass:[.05,.18,.63], water:[.03,.22,.53], enamel:[.05,.31,.28],
  rubber:[.01,.76,.04], stone:[.01,.88,.04], wood:[.015,.61,.08],
  paper:[0,.90,.03], tile:[.03,.35,.34], display:[0,.56,.05]
};
const rawSteel=new Set(['#91a5a6','#9da5a1','#8daead','#566464']);
const rawStone=new Set(['#a69a88','#a69783']);
const rawGlass=new Set(['#83c7cf','#5abed2','#54bcbd','#47a4b7']);
const darkGreys=new Set(['#263e3e','#203e42','#294b45']);
export function finishFor(color,kind,alpha=1){
  if(kind==='water')return 'water';
  if(alpha<.66&&rawGlass.has(color))return 'glass';
  if(rawSteel.has(color))return 'steel';
  if(rawStone.has(color))return 'stone';
  if(color==='#98724e'||color==='#a47751')return 'wood';
  if(color==='#e8b469'&&kind!=='panel')return 'brass';
  if(darkGreys.has(color))return kind==='tube'?'iron':'rubber';
  return 'enamel';
}

export function surfaceNormal(points){
  const anchor=points[0];
  let x=0,y=0,z=0;
  for(let i=1;i+1<points.length;i++){
    const [a,b,c]=sub(points[i],anchor),[d,e,f]=sub(points[i+1],anchor);
    x+=b*f-c*e; y+=c*d-a*f; z+=a*e-b*d;
  }
  return unit([x,y,z]);
}

export function studioLight(points,color,finish,view,norm=null){
  if(!hex.test(color)||points.length<3)return color;
  const [metal,rough,coat]=profiles[finish]??profiles.enamel;
  const eye=view.slice(3),half=view.slice(0,3);
  let n=norm??surfaceNormal(points);
  if((finish==='glass'||finish==='water')&&dot(n,eye)<0)n=n.map(x=>-x);
  const sun=Math.max(0,dot(n,key)),bounce=Math.max(0,dot(n,fill));
  const ground=Math.max(0,-n[2]),skylight=Math.max(0,n[2]);
  const glancing=1-Math.abs(dot(n,eye));
  const sheen=coat*Math.max(0,dot(n,half))**(9+68*(1-rough)**2);
  const reflective=finish==='glass'||finish==='water';
  const fresnel=(reflective?.31:.105)*glancing**3;
  const rimlight=Math.max(0,dot(n,rim))**5*(.08+metal*.12);
  const ambient=.54+.11*skylight+.07*ground;
  return shade(color,ambient+sun*(.34-metal*.11)+bounce*.12,
    clamp(sun**2*.105+rimlight+sheen+fresnel,0,.76));
}

export function studioPaint(ctx,points,color,finish){
  if(!hex.test(color)||points.length<3||finish==='flat')return color;
  if(finish!=='glass'&&finish!=='steel'&&finish!=='brass'&&finish!=='water')return panelPaint(ctx,points,color);
  let min=Infinity,max=-Infinity,top=Infinity,bottom=-Infinity;
  for(const [x,y] of points){min=Math.min(x,min);max=Math.max(x,max);top=Math.min(y,top);bottom=Math.max(y,bottom);}
  if((max-min)*(bottom-top)<270)return color;
  const grad=ctx.createLinearGradient(min,top,max,bottom);
  if(finish==='glass'||finish==='water'){
    grad.addColorStop(0,shade(color,1,.26));
    grad.addColorStop(.20,shade(color,1,.07));
    grad.addColorStop(.49,color);
    grad.addColorStop(.63,shade(color,1,.15));
    grad.addColorStop(.81,color);
    grad.addColorStop(1,shade(color,.81));
  }else{
    grad.addColorStop(0,shade(color,1,.28));
    grad.addColorStop(.22,color);
    grad.addColorStop(.45,shade(color,.81));
    grad.addColorStop(.62,shade(color,1,.13));
    grad.addColorStop(.78,color);
    grad.addColorStop(1,shade(color,.82));
  }
  return grad;
}

// Flattened corners catch highlights on machined pieces, plastic cases and tile edges.
export function bevelBox(x,y,z,w,d,h){
  if(Math.min(w,d,h)<=1e-6)return null;
  const bevel=Math.min(.045,w*.095,d*.095,h*.22);
  const ring=(a,b,r,t)=>[
    [-a+r,-b], [a-r,-b], [a,-b+r], [a,b-r],
    [a-r,b], [-a+r,b], [-a,b-r], [-a,-b+r]
  ].map(([u,v])=>[x+u,y+v,t]);
  const a=w/2,b=d/2;
  return [
    ring(a-bevel,b-bevel,bevel*.38,z),
    ring(a,b,bevel,z+bevel),
    ring(a,b,bevel,z+h-bevel),
    ring(a-bevel,b-bevel,bevel*.38,z+h)
  ];
}

export function paintStudio(ctx,w,h,id,vertical,panY){
  const analytic=[93,94,96,98,99,100,101,102,112,113,120,133,136,143,145,146].includes(id);
  const outdoor=[92,107,111,114,124,128,131,134,135,137].includes(id);
  const sky=outdoor?'#657c87':analytic?'#24363c':'#30444a';
  const floor=outdoor?'#747b69':analytic?'#3d4c4d':'#4e5351';
  const horizon=Math.max(.03,Math.min(.49,.39-vertical*.42+panY/h*.14));
  const backdrop=ctx.createLinearGradient(0,0,0,h);
  backdrop.addColorStop(0,shade(sky,.62));
  backdrop.addColorStop(horizon,shade(sky,1,.23));
  backdrop.addColorStop(Math.min(.69,horizon+.18),floor);
  backdrop.addColorStop(1,shade(floor,.48));
  ctx.fillStyle=backdrop;ctx.fillRect(0,0,w,h);
  const wash=ctx.createRadialGradient(w*.31,h*.13,0,w*.31,h*.13,Math.max(w,h)*.90);
  wash.addColorStop(0,outdoor?'#fff1cc5e':'#e9ecdd40');
  wash.addColorStop(.58,'#fff3d80b');
  wash.addColorStop(1,'#101c2359');
  ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);
  return h*horizon*.86;
}

const textured=new Set(['wood','stone','steel','rubber','tile','paper']);
const offset=(p,q,k)=>[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k];
const grain=(i,salt)=>((Math.imul(i+11,2654435761)^(Math.imul(salt+29,1597334677)))>>>8)%1021/1021;
export function studioTexture(ctx,points,finish){
  if(points.length!==4||!textured.has(finish))return;
  const [a,b,c,d]=points;
  const len=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  const width=(len(a,b)+len(c,d))/2,height=(len(a,d)+len(b,c))/2;
  if(Math.min(width,height)<12||width*height<1650)return;
  ctx.save();ctx.clip();
  if(finish==='wood'||finish==='steel'||finish==='paper'){
    const count=Math.min(36,Math.ceil(width/4));
    for(let i=0;i<count;i++){
      const u=(i+.12+grain(i,3)*.75)/count;
      const p=offset(a,b,u),q=offset(d,c,u);
      ctx.beginPath();ctx.moveTo(...p);
      ctx.lineTo(...offset(p,q,.67+grain(i,7)*.33));
      ctx.lineWidth=finish==='wood'?1:.55;
      ctx.strokeStyle=i%3===0?'#fff8d322':finish==='wood'?'#32231838':'#18323824';
      ctx.stroke();
    }
  }else{
    const count=Math.min(84,Math.floor(width*height/180));
    for(let i=0;i<count;i++){
      const u=grain(i,17),v=grain(i,5);
      const p=offset(offset(a,b,u),offset(d,c,u),v),r=.4+grain(i,9)*.78;
      ctx.fillStyle=i%3===0?'#f9f8d729':'#101c1e33';
      ctx.fillRect(p[0],p[1],r,r*.6);
    }
  }
  ctx.restore();
}

const lessonRange=(start,end)=>Array.from({length:end-start+1},(_,i)=>start+i);
export const updatedCovers=new Set([
  6,7,11,12,15,16,17,18,34,35,...lessonRange(43,50),63,75,...lessonRange(79,91),103,104,...lessonRange(107,147)
]);
export const refinedLessons=new Set([...updatedCovers,...lessonRange(92,106)]);

export function preferredCamera(id){
  if(id===81)return [.06,.70];
  if(id===85||id===110)return [Math.PI-.20,.39];
  if([11,12,15,16,17,44,45,46,47,48,49,50,82,89,139,142,144].includes(id))return [.23,.43];
  if([79,80,83,84,86,88,90,91,147].includes(id))return [.18,.74];
  if([18,43,63,103,104,121,123,124].includes(id))return [.46,.58];
  if(id===115)return [Math.PI-.32,.57];
  if(id===119)return [-.46,.63];
  if([75,95,97,108,117,121,125,126,129,130].includes(id))return [.48,.51];
  if(id===92)return [.33,.66];
  if(id===128)return [-.29,.77];
  if(id===137)return [Math.PI-.19,.63];
  if([93,94,96,98,99,100,101,102,120].includes(id))return [.075,.19];
  if([111,112].includes(id))return [.15,.25];
  if([113,114,135,136,138,140,143,145,146].includes(id))return [-.22,.81];
  if([105,107,115,116,118,132].includes(id))return [.27,.62];
  if([127,131,134].includes(id))return [.19,.47];
  return [-.31,.49];
}
