const row=n=>Array.from({length:n},(_,i)=>i);
const TAU=2*Math.PI;

export function drawAircraft(api,anchor,second,time=0){
  const {add,loft,tube,line}=api;
  const at=([u,v,w])=>second?[anchor[0]+v,anchor[1]-u,anchor[2]+w]:[anchor[0]+u,anchor[1]+v,anchor[2]+w];
  const face=(points,color,stroke=null)=>add(points.map(at),color,stroke,.62);
  const stripe=second?'#b15436':'#2b6964';
  const shell='#e2dfcd';
  const circle=(u,ry,rz)=>row(12).map(i=>at([u,ry*Math.cos(i*TAU/12),rz*Math.sin(i*TAU/12)]));
  const body=[[-.79,.021,.028],[-.5,.072,.083],[-.15,.13,.147],[.25,.139,.153],[.52,.105,.118],[.69,.038,.053]];
  for(let i=1;i<body.length;i++)loft(circle(...body[i-1]),circle(...body[i]),shell);
  for(const side of [-1,1]){
    const wing=[[.12,side*.09,-.025],[-.07,side*.64,.025],[-.26,side*.67,.025],[-.29,side*.11,-.055]];
    loft(wing.map(at),wing.map(([u,v,z])=>at([u,v,z+.035])),'#babdaf');
    face(wing.map(([u,v,z])=>[u,v,z+.036]),shell,stripe);
    face([[-.49,0,.015],[-.65,side*.31,.045],[-.76,side*.29,.051],[-.79,0,.019]],shell,stripe);
    face([[.31,side*.11,.107],[.13,side*.106,.223],[-.13,side*.095,.207],[-.22,side*.123,.107]],'#416168','#bed5cb');
    line(at([-.52,side*.067,-.018]),at([.44,side*.121,-.024]),stripe,1.7);
  }
  for(const side of [-1,1]){
    const panel=[[.039,side*.22,.032],[-.087,side*.55,.072],[-.23,side*.61,.061],[-.20,side*.20,.027]];
    face(panel,'#c2c6b9');
    line(at([-.23,side*.61,.064]),at([-.29,side*.43,.055]),'#9daea8',.7);
    tube(at([-.22,side*.62,.06]),at([-.18,side*.64,.064]),.024,side<0?'#db7058':'#91caaa');
  }
  face([[-.39,0,.06],[-.67,0,.38],[-.79,0,.39],[-.78,0,.02]],stripe,'#e3dfc7');
  face([[-.13,-.092,.207],[.13,-.106,.223],[.13,.106,.223],[-.13,.092,.207]],'#587375');
  tube(at([.66,0,0]),at([.75,0,0]),.04,'#808d89');
  const angle=time*53;
  const blade=[0,.245*Math.cos(angle),.245*Math.sin(angle)];
  line(at([.74,-blade[1],-blade[2]]),at([.74,blade[1],blade[2]]),'#fff9e7ac',1.25);
  if(time)line(at([.741,blade[2],-blade[1]]),at([.741,-blade[2],blade[1]]),'#e8f3e955',1.05);
}

export function drawGlassJar(api,x,y,z,selected){
  const {add,loft,loop,line}=api;
  const ring=(r,h)=>row(28).map(i=>[x+r*Math.cos(i*TAU/28),y+r*Math.sin(i*TAU/28),z+h]);
  const base=ring(1.0,.10),foot=ring(1.07,.25),shoulder=ring(1.07,1.52),neck=ring(.98,1.71);
  loft(base,foot,'#8fa9a2');
  add(foot,'#727a62');
  loft(foot,shoulder,'#b4d9ce',{alpha:.17,glass:true});
  loft(shoulder,neck,'#cadfd7',{alpha:.31,glass:true});
  loop(foot,'#cde9d2a0',1.2);
  const opening=ring(.91,1.705);
  loft(opening,neck,'#87aaa7',{alpha:.63,glass:true});
  loop(opening,'#d7eee6',.78);
  loop(neck,selected?'#ffe0a0':'#f4deb0',selected?2:1.1);
  for(const i of [3,4,13,14,22,23])line(foot[i],shoulder[i],i%2?'#ccede266':'#f0fff18a',1.25);
  return neck;
}

export function drawBalloon(api,position,size,paint='#b57152'){
  const {add,loft,tube,box}=api;
  const [x,y,z]=position;
  const at=(t,a)=>[x+size*t[1]*Math.cos(a),y+size*t[1]*Math.sin(a),z+size*t[0]];
  const profile=[[.17,.17],[.28,.29],[.43,.63],[.66,.83],[.94,.89],[1.21,.71],[1.40,.42],[1.46,0]];
  const paintBands=[paint,'#e2be84',paint,'#d7ae78'];
  const seamCount=24;
  for(let j=0;j<seamCount;j++){
    const a=j*TAU/seamCount,b=(j+1)*TAU/seamCount;
    for(let i=0;i<profile.length-1;i++){
      const low=profile[i],high=profile[i+1];
      const l=at(low,a),r=at(low,b),u=at(high,b),v=at(high,a);
      add([l,r,u,v],i===3?'#dfd6a8':paintBands[j%paintBands.length],'#412e3027',.53);
    }
  }
  box(x,y,z-.31*size,.53*size,.43*size,.29*size,'#8c6347',true);
  for(const side of [-1,1])for(const dir of [-1,1]){
    tube([x+side*.23*size,y+dir*.19*size,z-.022*size],
         [x+side*.145*size,y+dir*.13*size,z+.18*size],.016*size,'#baa47c');
  }
  tube([x,y,z+.021*size],[x,y,z+.123*size],.049*size,'#9d9c84');
}

export function drawAnt(api,p,size){
  const {dot,tube}=api;
  const at=(x,y,z)=>[p[0]+x*size,p[1]+y*size,p[2]+z*size];
  const body='#784c42',leg='#a37257';
  dot(at(-.20,0,0),.17*size,body,.15);
  dot(at(.03,0,0),.105*size,body,.16);
  dot(at(.21,0,0),.117*size,'#956550',.17);
  for(const side of [-1,1]){
    for(let i=0;i<3;i++){
      const x=(i-1)*.115;
      const joint=at(x,side*.21,.075);
      tube(at(x,side*.04,0),joint,.022*size,leg);
      tube(joint,at(x+.09,side*.38,-.02),.017*size,leg);
    }
    tube(at(.26,side*.05,.02),at(.42,side*.15,.12),.016*size,leg);
  }
}

export function drawFlange(api,at,axis,radius){
  const {tube,dot}=api;
  const offset=delta=>at.map((v,i)=>v+(i===axis?delta:0));
  tube(offset(-.026),offset(.026),radius,'#a7aca0');
  const free=[0,1,2].filter(i=>i!==axis);
  for(let i=0;i<6;i++){
    const t=i*TAU/6;
    const p=offset(.031);
    p[free[0]]+=radius*.71*Math.cos(t);
    p[free[1]]+=radius*.71*Math.sin(t);
    dot(p,.017,'#d1c6a9',.045);
  }
}

export function drawFoldingRim(api,polygon,thickness,material){
  const {loft,loop}=api;
  const mid=polygon[0].map((_,axis)=>polygon.reduce((sum,p)=>sum+p[axis],0)/polygon.length);
  const outer=polygon.map(p=>{
    const d=Math.hypot(p[0]-mid[0],p[1]-mid[1]);
    if(!d)return p;
    return [p[0]+thickness*(p[0]-mid[0])/d,p[1]+thickness*(p[1]-mid[1])/d,p[2]];
  });
  loft(polygon,outer,material);
  loop(outer,'#dddbc3',.85);
}
